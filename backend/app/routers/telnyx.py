"""Telnyx integration endpoints."""
import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel


router = APIRouter(prefix="/telnyx", tags=["Telnyx"])


class TelnyxFetchRequest(BaseModel):
    """Request to fetch SIP credentials from Telnyx."""
    connection_id: str
    api_key: str


class TelnyxCredentialResponse(BaseModel):
    """Telnyx SIP credential response."""
    name: str
    username: str
    password: str
    domain: str
    port: int
    transport: str
    proxy: str | None = None


@router.post("/fetch-credentials", response_model=TelnyxCredentialResponse)
async def fetch_telnyx_credentials(request: TelnyxFetchRequest):
    """
    Fetch SIP credentials from Telnyx API.
    
    Uses the Telnyx API v2 to retrieve SIP connection details.
    """
    headers = {
        "Authorization": f"Bearer {request.api_key}",
        "Content-Type": "application/json",
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # Fetch SIP connection details
            response = await client.get(
                f"https://api.telnyx.com/v2/sip_connections/{request.connection_id}",
                headers=headers,
                timeout=10.0,
            )
            
            if response.status_code == 401:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Telnyx API key"
                )
            
            if response.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Telnyx connection not found"
                )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Telnyx API error: {response.status_code}"
                )
            
            data = await response.json()
            connection = data.get("data", {})
            
            # Extract SIP credentials
            sip_username = connection.get("sip_username")
            sip_password = connection.get("sip_password")
            connection_name = connection.get("connection_name", "Telnyx SIP Connection")
            
            if not sip_username or not sip_password:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="SIP credentials not available for this connection. Ensure it's a SIP connection with credentials enabled."
                )
            
            # Telnyx SIP configuration
            return TelnyxCredentialResponse(
                name=connection_name,
                username=sip_username,
                password=sip_password,
                domain="sip.telnyx.com",
                port=5060,
                transport="UDP",
                proxy=None,
            )
    
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Telnyx API request timed out"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to connect to Telnyx API: {str(e)}"
        )
