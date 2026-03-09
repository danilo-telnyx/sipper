"""Credential encryption utilities using Fernet (symmetric encryption)."""
from cryptography.fernet import Fernet
from app.config import settings


def get_cipher() -> Fernet:
    """Get Fernet cipher instance."""
    # Ensure key is 32 bytes, URL-safe base64 encoded
    key = settings.encryption_key.encode()
    return Fernet(key)


def encrypt_credential(plaintext: str) -> str:
    """Encrypt credential password and return as string (for JSON storage)."""
    cipher = get_cipher()
    encrypted_bytes = cipher.encrypt(plaintext.encode())
    return encrypted_bytes.decode('ascii')  # Fernet returns URL-safe base64 (ASCII)


def decrypt_credential(encrypted: str | bytes) -> str:
    """Decrypt credential password (accepts string or bytes)."""
    cipher = get_cipher()
    if isinstance(encrypted, str):
        encrypted = encrypted.encode('ascii')
    return cipher.decrypt(encrypted).decode()
