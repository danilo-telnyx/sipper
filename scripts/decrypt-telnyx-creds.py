#!/usr/bin/env python3
"""
Decrypt Telnyx credentials from the database and export them for testing.
"""
import os
import sys
import psycopg2
from cryptography.fernet import Fernet

# Load environment variables
DB_USER = os.getenv('DB_USER', 'sipper')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME', 'sipper')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')

if not DB_PASSWORD:
    print("Error: DB_PASSWORD environment variable not set", file=sys.stderr)
    sys.exit(1)

if not ENCRYPTION_KEY:
    print("Error: ENCRYPTION_KEY environment variable not set", file=sys.stderr)
    sys.exit(1)

try:
    # Connect to database
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    
    cursor = conn.cursor()
    
    # Query for Telnyx credentials
    cursor.execute("""
        SELECT username, password_encrypted, sip_domain
        FROM sip_credentials
        WHERE sip_domain = 'sip.telnyx.com'
        LIMIT 1
    """)
    
    result = cursor.fetchone()
    
    if not result:
        print("Error: No Telnyx credentials found in database", file=sys.stderr)
        sys.exit(1)
    
    username, encrypted_password, domain = result
    
    # Decrypt password
    cipher = Fernet(ENCRYPTION_KEY.encode())
    decrypted_password = cipher.decrypt(bytes(encrypted_password)).decode()
    
    # Output as shell export statements
    print(f'export TELNYX_SIP_USERNAME="{username}"')
    print(f'export TELNYX_SIP_PASSWORD="{decrypted_password}"')
    print(f'export TELNYX_SIP_DOMAIN="{domain}"')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
