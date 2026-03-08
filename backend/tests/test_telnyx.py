"""Tests for Telnyx integration endpoints."""
import pytest
from unittest.mock import AsyncMock, patch
from httpx import Response

from app.routers.telnyx import TelnyxFetchRequest


@pytest.mark.asyncio
async def test_fetch_telnyx_credentials_success():
    """Test successful fetch of Telnyx SIP credentials."""
    from app.routers.telnyx import fetch_telnyx_credentials
    
    # Mock Telnyx API response
    mock_response_data = {
        "data": {
            "connection_name": "Production SIP Trunk",
            "sip_username": "user123456",
            "sip_password": "secret_password_123"
        }
    }
    
    # Create mock response
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mock_response_data
    
    # Mock httpx client
    with patch('app.routers.telnyx.httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
        
        request = TelnyxFetchRequest(
            connection_id="1234567890123456",
            api_key="KEY0123456789ABCDEF"
        )
        
        result = await fetch_telnyx_credentials(request)
        
        assert result.name == "Production SIP Trunk"
        assert result.username == "user123456"
        assert result.password == "secret_password_123"
        assert result.domain == "sip.telnyx.com"
        assert result.port == 5060
        assert result.transport == "UDP"
        assert result.proxy is None


@pytest.mark.asyncio
async def test_fetch_telnyx_credentials_invalid_api_key():
    """Test fetch with invalid API key returns 401."""
    from app.routers.telnyx import fetch_telnyx_credentials
    from fastapi import HTTPException
    
    # Mock 401 response
    mock_response = AsyncMock()
    mock_response.status_code = 401
    
    with patch('app.routers.telnyx.httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
        
        request = TelnyxFetchRequest(
            connection_id="1234567890123456",
            api_key="INVALID_KEY"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            await fetch_telnyx_credentials(request)
        
        assert exc_info.value.status_code == 401
        assert "Invalid Telnyx API key" in exc_info.value.detail


@pytest.mark.asyncio
async def test_fetch_telnyx_credentials_connection_not_found():
    """Test fetch with non-existent connection ID returns 404."""
    from app.routers.telnyx import fetch_telnyx_credentials
    from fastapi import HTTPException
    
    # Mock 404 response
    mock_response = AsyncMock()
    mock_response.status_code = 404
    
    with patch('app.routers.telnyx.httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
        
        request = TelnyxFetchRequest(
            connection_id="9999999999999999",
            api_key="KEY0123456789ABCDEF"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            await fetch_telnyx_credentials(request)
        
        assert exc_info.value.status_code == 404
        assert "Telnyx connection not found" in exc_info.value.detail


@pytest.mark.asyncio
async def test_fetch_telnyx_credentials_missing_sip_data():
    """Test fetch when SIP credentials are not available."""
    from app.routers.telnyx import fetch_telnyx_credentials
    from fastapi import HTTPException
    
    # Mock response without SIP credentials
    mock_response_data = {
        "data": {
            "connection_name": "Fax Connection",
            # Missing sip_username and sip_password
        }
    }
    
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mock_response_data
    
    with patch('app.routers.telnyx.httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
        
        request = TelnyxFetchRequest(
            connection_id="1234567890123456",
            api_key="KEY0123456789ABCDEF"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            await fetch_telnyx_credentials(request)
        
        assert exc_info.value.status_code == 422
        assert "SIP credentials not available" in exc_info.value.detail


@pytest.mark.asyncio
async def test_fetch_telnyx_credentials_timeout():
    """Test timeout handling."""
    from app.routers.telnyx import fetch_telnyx_credentials
    from fastapi import HTTPException
    import httpx
    
    with patch('app.routers.telnyx.httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            side_effect=httpx.TimeoutException("Request timed out")
        )
        
        request = TelnyxFetchRequest(
            connection_id="1234567890123456",
            api_key="KEY0123456789ABCDEF"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            await fetch_telnyx_credentials(request)
        
        assert exc_info.value.status_code == 504
        assert "timed out" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_fetch_telnyx_credentials_network_error():
    """Test network error handling."""
    from app.routers.telnyx import fetch_telnyx_credentials
    from fastapi import HTTPException
    import httpx
    
    with patch('app.routers.telnyx.httpx.AsyncClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            side_effect=httpx.RequestError("Connection failed")
        )
        
        request = TelnyxFetchRequest(
            connection_id="1234567890123456",
            api_key="KEY0123456789ABCDEF"
        )
        
        with pytest.raises(HTTPException) as exc_info:
            await fetch_telnyx_credentials(request)
        
        assert exc_info.value.status_code == 502
        assert "Failed to connect to Telnyx API" in exc_info.value.detail
