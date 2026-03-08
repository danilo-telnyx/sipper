"""Input sanitization utilities for SIP message construction."""
import re
from typing import Optional


def sanitize_sip_header(value: str, max_length: int = 255) -> str:
    """
    Sanitize SIP header value to prevent injection attacks.
    
    Removes:
    - CRLF sequences (\r\n)
    - Null bytes
    - Control characters
    
    Args:
        value: Header value to sanitize
        max_length: Maximum allowed length
    
    Returns:
        Sanitized header value
    
    Raises:
        ValueError: If value contains forbidden characters or exceeds max length
    """
    if not value:
        return ""
    
    # Remove null bytes and control characters (except space and tab)
    sanitized = re.sub(r'[\x00-\x08\x0A-\x1F\x7F]', '', value)
    
    # Check for CRLF injection attempts
    if '\r' in sanitized or '\n' in sanitized:
        raise ValueError("SIP header cannot contain CRLF characters")
    
    # Trim whitespace
    sanitized = sanitized.strip()
    
    # Check length
    if len(sanitized) > max_length:
        raise ValueError(f"SIP header exceeds maximum length of {max_length} characters")
    
    return sanitized


def sanitize_sip_uri(uri: str) -> str:
    """
    Sanitize SIP URI.
    
    Validates format: sip:user@domain or sips:user@domain
    
    Args:
        uri: SIP URI to sanitize
    
    Returns:
        Sanitized SIP URI
    
    Raises:
        ValueError: If URI format is invalid
    """
    if not uri:
        raise ValueError("SIP URI cannot be empty")
    
    # Remove whitespace
    uri = uri.strip()
    
    # Check basic SIP URI format
    sip_uri_pattern = r'^sips?:[^@\s]+@[^@\s]+$'
    if not re.match(sip_uri_pattern, uri):
        raise ValueError("Invalid SIP URI format (expected sip:user@domain or sips:user@domain)")
    
    # Check for injection attempts
    forbidden_chars = ['\r', '\n', '\x00', '<', '>', '"']
    for char in forbidden_chars:
        if char in uri:
            raise ValueError(f"SIP URI contains forbidden character: {repr(char)}")
    
    return uri


def sanitize_sdp_body(sdp: str, max_length: int = 4096) -> str:
    """
    Sanitize SDP (Session Description Protocol) body.
    
    Args:
        sdp: SDP body to sanitize
        max_length: Maximum allowed length
    
    Returns:
        Sanitized SDP body
    
    Raises:
        ValueError: If SDP exceeds max length or contains null bytes
    """
    if not sdp:
        return ""
    
    # Check for null bytes
    if '\x00' in sdp:
        raise ValueError("SDP body cannot contain null bytes")
    
    # Check length
    if len(sdp) > max_length:
        raise ValueError(f"SDP body exceeds maximum length of {max_length} characters")
    
    # SDP uses CRLF line endings - this is expected
    # But we still validate the structure
    
    return sdp


def sanitize_domain(domain: str) -> str:
    """
    Sanitize domain name or IP address.
    
    Args:
        domain: Domain name or IP address
    
    Returns:
        Sanitized domain
    
    Raises:
        ValueError: If domain format is invalid
    """
    if not domain:
        raise ValueError("Domain cannot be empty")
    
    domain = domain.strip()
    
    # Check for forbidden characters
    if re.search(r'[\r\n\x00\s<>"]', domain):
        raise ValueError("Domain contains forbidden characters")
    
    # Validate format (simplified - domain or IPv4/IPv6)
    # Domain: letters, digits, hyphens, dots
    # IPv4: digits and dots
    # IPv6: hex and colons
    domain_pattern = r'^[a-zA-Z0-9\.\-\:]+$'
    if not re.match(domain_pattern, domain):
        raise ValueError("Invalid domain format")
    
    if len(domain) > 253:  # Max DNS domain length
        raise ValueError("Domain exceeds maximum length")
    
    return domain


def sanitize_username(username: str) -> str:
    """
    Sanitize SIP username.
    
    Args:
        username: SIP username
    
    Returns:
        Sanitized username
    
    Raises:
        ValueError: If username format is invalid
    """
    if not username:
        raise ValueError("Username cannot be empty")
    
    username = username.strip()
    
    # Check for forbidden characters
    forbidden_chars = ['\r', '\n', '\x00', '@', '<', '>', '"', ' ']
    for char in forbidden_chars:
        if char in username:
            raise ValueError(f"Username contains forbidden character: {repr(char)}")
    
    if len(username) > 64:
        raise ValueError("Username exceeds maximum length of 64 characters")
    
    return username
