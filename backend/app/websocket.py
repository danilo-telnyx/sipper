"""WebSocket manager for real-time test updates."""
import asyncio
import json
from typing import Dict, Set
from uuid import UUID
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime


class ConnectionManager:
    """Manage WebSocket connections and broadcasts."""
    
    def __init__(self):
        # Map: test_run_id -> set of connected websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map: websocket -> user info
        self.connection_info: Dict[WebSocket, dict] = {}
        # Global connections (for system-wide events)
        self.global_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket, user_id: str, organization_id: str):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        
        # Store connection info
        self.connection_info[websocket] = {
            "user_id": user_id,
            "organization_id": organization_id,
            "connected_at": datetime.utcnow().isoformat()
        }
        
        # Add to global connections
        self.global_connections.add(websocket)
        
        print(f"✓ WebSocket connected: user={user_id}, org={organization_id}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        # Remove from all test subscriptions
        for test_id in list(self.active_connections.keys()):
            if websocket in self.active_connections[test_id]:
                self.active_connections[test_id].remove(websocket)
                if not self.active_connections[test_id]:
                    del self.active_connections[test_id]
        
        # Remove from global connections
        self.global_connections.discard(websocket)
        
        # Remove connection info
        if websocket in self.connection_info:
            info = self.connection_info.pop(websocket)
            print(f"✓ WebSocket disconnected: user={info.get('user_id')}")
    
    def subscribe_to_test(self, websocket: WebSocket, test_run_id: str):
        """Subscribe a connection to test updates."""
        if test_run_id not in self.active_connections:
            self.active_connections[test_run_id] = set()
        
        self.active_connections[test_run_id].add(websocket)
        print(f"✓ WebSocket subscribed to test: {test_run_id}")
    
    def unsubscribe_from_test(self, websocket: WebSocket, test_run_id: str):
        """Unsubscribe a connection from test updates."""
        if test_run_id in self.active_connections:
            self.active_connections[test_run_id].discard(websocket)
            if not self.active_connections[test_run_id]:
                del self.active_connections[test_run_id]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific connection."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"✗ Failed to send message to websocket: {e}")
    
    async def broadcast_to_test(self, test_run_id: str, message: dict, organization_id: str):
        """
        Broadcast a message to all connections subscribed to a test.
        Only sends to connections from the same organization.
        """
        if test_run_id not in self.active_connections:
            return
        
        disconnected = []
        for websocket in self.active_connections[test_run_id]:
            # Check organization access
            info = self.connection_info.get(websocket)
            if info and info.get("organization_id") == organization_id:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    print(f"✗ WebSocket send failed: {e}")
                    disconnected.append(websocket)
        
        # Clean up disconnected sockets
        for ws in disconnected:
            self.disconnect(ws)
    
    async def broadcast_global(self, message: dict):
        """Broadcast a message to all connected clients."""
        disconnected = []
        for websocket in self.global_connections:
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"✗ Global broadcast failed: {e}")
                disconnected.append(websocket)
        
        # Clean up disconnected sockets
        for ws in disconnected:
            self.disconnect(ws)
    
    def get_test_subscribers_count(self, test_run_id: str) -> int:
        """Get number of active subscribers for a test."""
        return len(self.active_connections.get(test_run_id, set()))
    
    def get_connection_count(self) -> int:
        """Get total number of active connections."""
        return len(self.global_connections)


# Global connection manager instance
manager = ConnectionManager()


async def send_test_progress(test_run_id: str, organization_id: str, progress: dict):
    """
    Send test progress update to subscribed clients.
    
    Args:
        test_run_id: Test run UUID
        organization_id: Organization UUID for access control
        progress: Progress data dictionary
    """
    message = {
        "event": "test:progress",
        "data": {
            "testId": test_run_id,
            "progress": progress.get("progress", 0),
            "status": progress.get("status"),
            "currentStep": progress.get("currentStep"),
            "logs": progress.get("logs", [])
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.broadcast_to_test(test_run_id, message, organization_id)


async def send_test_log(test_run_id: str, organization_id: str, log: dict):
    """Send test log entry to subscribed clients."""
    message = {
        "event": "test:log",
        "data": {
            "testId": test_run_id,
            "timestamp": log.get("timestamp", datetime.utcnow().isoformat()),
            "level": log.get("level", "info"),
            "message": log.get("message", "")
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.broadcast_to_test(test_run_id, message, organization_id)


async def send_test_completed(test_run_id: str, organization_id: str, result: dict):
    """Send test completion notification to subscribed clients."""
    message = {
        "event": "test:completed",
        "data": {
            "testId": test_run_id,
            "status": result.get("status", "completed"),
            "duration": result.get("duration"),
            "summary": result.get("summary")
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.broadcast_to_test(test_run_id, message, organization_id)


async def send_test_failed(test_run_id: str, organization_id: str, error: str):
    """Send test failure notification to subscribed clients."""
    message = {
        "event": "test:failed",
        "data": {
            "testId": test_run_id,
            "error": error
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.broadcast_to_test(test_run_id, message, organization_id)
