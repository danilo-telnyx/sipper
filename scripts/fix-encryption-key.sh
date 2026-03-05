#!/bin/bash
# Quick fix for Sipper encryption key issue (BUG-001)

set -e

echo "🔧 Fixing Sipper Encryption Key..."

cd ~/Documents/projects/sipper

# Generate a valid Fernet key
echo "Generating valid Fernet encryption key..."
NEW_KEY=$(docker exec sipper-app python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

echo "Generated key: $NEW_KEY"

# Backup current .env
cp .env .env.backup-$(date +%Y%m%d-%H%M%S)
echo "✓ Backed up .env file"

# Replace the encryption key
sed -i.tmp "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$NEW_KEY|" .env
rm .env.tmp 2>/dev/null || true
echo "✓ Updated ENCRYPTION_KEY in .env"

# Restart containers to apply changes
echo "Restarting containers..."
docker-compose restart app

echo "✓ Container restarted"

# Wait for health check
echo "Waiting for app to be healthy..."
sleep 5

# Test credential creation
echo ""
echo "Testing credential creation..."
TEST_EMAIL="fix-test-$(date +%s)@example.com"

# Register test user
REG_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123!\",\"full_name\":\"Fix Test\",\"organization_name\":\"Fix Test Org\"}")

TOKEN=$(echo "$REG_RESPONSE" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token"
  exit 1
fi

# Try creating a credential
CRED_RESPONSE=$(curl -s -X POST http://localhost:8000/api/credentials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Credential",
    "sip_domain": "sip.test.com",
    "username": "testuser",
    "password": "testpass123"
  }')

CRED_ID=$(echo "$CRED_RESPONSE" | jq -r '.id // empty')

if [ -n "$CRED_ID" ] && [ "$CRED_ID" != "null" ]; then
  echo "✅ SUCCESS! Credential created with ID: $CRED_ID"
  echo ""
  echo "Credential details:"
  echo "$CRED_RESPONSE" | jq '.'
else
  echo "❌ FAILED! Credential creation still failing"
  echo "Response: $CRED_RESPONSE"
  exit 1
fi

echo ""
echo "🎉 Encryption key fix complete and verified!"
echo ""
echo "Old .env backed up to: .env.backup-*"
echo "New encryption key configured and working"
