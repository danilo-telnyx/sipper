#!/bin/bash

# Test script for authentication flow
API_BASE="http://localhost:8000/api"

echo "Testing SIPPER Authentication Flow"
echo "===================================="
echo ""

# Test 1: Register a new user
echo "1. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@sipper.test",
    "password": "Test@1234",
    "name": "Test User",
    "organizationName": "Test Org"
  }')

echo "Register response: $REGISTER_RESPONSE"
echo ""

# Extract token from response
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Registration failed - no token received"
  exit 1
fi

echo "✅ Registration successful, token received"
echo ""

# Test 2: Get current user info
echo "2. Testing authenticated request (GET /auth/me)..."
ME_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Me response: $ME_RESPONSE"
echo ""

if echo "$ME_RESPONSE" | grep -q "test@sipper.test"; then
  echo "✅ Authenticated request successful"
else
  echo "❌ Authenticated request failed"
  exit 1
fi

# Test 3: Login with the same credentials
echo "3. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@sipper.test",
    "password": "Test@1234"
  }')

echo "Login response: $LOGIN_RESPONSE"
echo ""

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo "✅ Login successful"
else
  echo "❌ Login failed"
  exit 1
fi

# Test 4: Logout
echo "4. Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$API_BASE/auth/logout" \
  -H "Authorization: Bearer $TOKEN")

echo "Logout response: $LOGOUT_RESPONSE"
echo ""

if echo "$LOGOUT_RESPONSE" | grep -q "success"; then
  echo "✅ Logout successful"
else
  echo "❌ Logout failed"
fi

echo ""
echo "===================================="
echo "All authentication tests completed!"
echo "===================================="
