"""Password hashing utilities using PBKDF2."""
import hashlib
import secrets
from base64 import b64encode, b64decode


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-SHA256."""
    # Generate a random salt
    salt = secrets.token_bytes(32)
    
    # Hash the password with PBKDF2
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        iterations=100000
    )
    
    # Combine salt and hash, then encode as base64
    storage = salt + pwd_hash
    return b64encode(storage).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        # Decode the stored password
        storage = b64decode(hashed_password.encode('utf-8'))
        
        # Extract salt (first 32 bytes) and hash (remaining bytes)
        salt = storage[:32]
        stored_hash = storage[32:]
        
        # Hash the provided password with the same salt
        pwd_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt,
            iterations=100000
        )
        
        # Compare hashes using constant-time comparison
        return secrets.compare_digest(pwd_hash, stored_hash)
    except Exception:
        return False
