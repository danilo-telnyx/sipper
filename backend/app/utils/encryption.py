"""Credential encryption utilities using Fernet (symmetric encryption)."""
from cryptography.fernet import Fernet
from app.config import settings


def get_cipher() -> Fernet:
    """Get Fernet cipher instance."""
    # Ensure key is 32 bytes, URL-safe base64 encoded
    key = settings.encryption_key.encode()
    return Fernet(key)


def encrypt_credential(plaintext: str) -> bytes:
    """Encrypt credential password."""
    cipher = get_cipher()
    return cipher.encrypt(plaintext.encode())


def decrypt_credential(encrypted: bytes) -> str:
    """Decrypt credential password."""
    cipher = get_cipher()
    return cipher.decrypt(encrypted).decode()
