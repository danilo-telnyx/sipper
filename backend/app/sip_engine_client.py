"""Client for SIP Engine HTTP API."""
import httpx
from typing import Optional, Dict, Any
from app.schemas import TestType


class SIPEngineClient:
    """Client for communicating with the Node.js SIP Engine API."""
    
    def __init__(self, base_url: str = "http://127.0.0.1:5001"):
        self.base_url = base_url
        self.timeout = 30.0  # SIP tests can take time
    
    async def health_check(self) -> bool:
        """Check if SIP engine is running."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False
    
    async def run_test(
        self,
        test_type: str,
        credentials: Optional[Dict[str, Any]] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute a SIP test.
        
        Args:
            test_type: Type of test (options, register, call, auth, error)
            credentials: SIP credentials (username, password, host, domain, port)
            config: Additional test configuration
        
        Returns:
            Test result dictionary with messages, errors, violations, metrics
        
        Raises:
            Exception: If SIP engine is not reachable or test fails
        """
        # Check if engine is running
        if not await self.health_check():
            raise Exception("SIP Engine is not running. Start it with: cd backend/sip-engine && npm start")
        
        payload = {
            "testType": test_type,
            "credentials": credentials or {},
            "config": config or {}
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/test/run",
                json=payload
            )
            
            if response.status_code != 200:
                error_data = response.json()
                raise Exception(f"SIP test failed: {error_data.get('error', 'Unknown error')}")
            
            return response.json()


# Singleton instance
_sip_engine_client: Optional[SIPEngineClient] = None


def get_sip_engine_client() -> SIPEngineClient:
    """Get or create SIP engine client singleton."""
    global _sip_engine_client
    if _sip_engine_client is None:
        _sip_engine_client = SIPEngineClient()
    return _sip_engine_client
