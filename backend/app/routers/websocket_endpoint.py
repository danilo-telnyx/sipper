"""WebSocket endpoint for real-time updates."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User
from app.websocket import manager
from app.auth.jwt import verify_token

router = APIRouter(tags=["WebSocket"])


async def get_current_user_ws(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current user from WebSocket query parameter token.
    
    WebSocket doesn't support headers, so token is passed as query param.
    """
    payload = verify_token(token)
    if not payload:
        raise ValueError("Invalid or expired token")
    user_id = payload.get("sub")
    
    if not user_id:
        raise ValueError("Invalid token")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise ValueError("User not found or inactive")
    
    return user


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for real-time test updates.
    
    Protocol:
    - Connect: ws://localhost:8000/api/ws?token=<jwt_token>
    - Client sends: {"action": "subscribe", "testId": "<test_run_id>"}
    - Client sends: {"action": "unsubscribe", "testId": "<test_run_id>"}
    - Server sends: {"event": "test:progress", "data": {...}}
    - Server sends: {"event": "test:completed", "data": {...}}
    - Server sends: {"event": "test:failed", "data": {...}}
    """
    
    # Authenticate
    try:
        user = await get_current_user_ws(token, db)
    except Exception as e:
        await websocket.close(code=1008, reason=f"Authentication failed: {str(e)}")
        return
    
    # Connect
    await manager.connect(websocket, str(user.id), str(user.organization_id))
    
    try:
        # Send welcome message
        await manager.send_personal_message({
            "event": "connected",
            "data": {
                "message": "Connected to SIPPER WebSocket",
                "userId": str(user.id)
            }
        }, websocket)
        
        # Message loop
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            action = data.get("action")
            
            if action == "subscribe":
                # Subscribe to test updates
                test_id = data.get("testId")
                if test_id:
                    manager.subscribe_to_test(websocket, test_id)
                    await manager.send_personal_message({
                        "event": "subscribed",
                        "data": {"testId": test_id}
                    }, websocket)
            
            elif action == "unsubscribe":
                # Unsubscribe from test updates
                test_id = data.get("testId")
                if test_id:
                    manager.unsubscribe_from_test(websocket, test_id)
                    await manager.send_personal_message({
                        "event": "unsubscribed",
                        "data": {"testId": test_id}
                    }, websocket)
            
            elif action == "ping":
                # Heartbeat
                await manager.send_personal_message({
                    "event": "pong",
                    "data": {"timestamp": data.get("timestamp")}
                }, websocket)
            
            else:
                # Unknown action
                await manager.send_personal_message({
                    "event": "error",
                    "data": {"message": f"Unknown action: {action}"}
                }, websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)
        await websocket.close(code=1011, reason="Internal server error")
