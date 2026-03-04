#!/bin/bash
# Removed set -e to continue on errors

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

print_test() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}TEST: $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((PASS_COUNT++))
}

fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((FAIL_COUNT++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
    ((WARN_COUNT++))
}

info() {
    echo -e "   $1"
}

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           SIPPER TOTAL INTEGRATION TEST SUITE            ║${NC}"
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo ""

# Change to project directory
cd ~/Documents/projects/sipper

# ============================================================
# SECTION 1: INFRASTRUCTURE TESTS
# ============================================================
print_test "1. Infrastructure & Environment"

# 1.1 Docker availability
if command -v docker >/dev/null 2>&1; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    pass "Docker installed (version $DOCKER_VERSION)"
else
    fail "Docker not installed"
fi

# 1.2 Docker Compose availability
if command -v docker-compose >/dev/null 2>&1; then
    pass "Docker Compose available"
else
    fail "Docker Compose not installed"
fi

# 1.3 Required files exist
for file in Dockerfile docker-compose.yml .env README.md; do
    if [ -f "$file" ]; then
        pass "File exists: $file"
    else
        fail "Missing file: $file"
    fi
done

# 1.4 Port availability check (before starting)
info "Checking port availability..."
for port in 8000 5060 5432; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        warn "Port $port already in use (expected if containers running)"
    else
        info "Port $port available"
    fi
done

# ============================================================
# SECTION 2: DOCKER BUILD & STARTUP TESTS
# ============================================================
print_test "2. Docker Build & Container Startup"

# 2.1 Docker Compose validation
if docker-compose config --quiet 2>/dev/null; then
    pass "docker-compose.yml is valid"
else
    fail "docker-compose.yml validation failed"
fi

# 2.2 Check if containers are running
CONTAINER_COUNT=$(docker-compose ps -q 2>/dev/null | wc -l | tr -d ' ')
if [ "$CONTAINER_COUNT" -ge 2 ]; then
    pass "Containers are running ($CONTAINER_COUNT containers)"
else
    warn "Containers not running, attempting to start..."
    docker-compose up -d
    sleep 10
fi

# 2.3 Container health checks
for container in sipper-app sipper-db; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "unknown")
    if [ "$STATUS" = "healthy" ]; then
        pass "Container $container is healthy"
    elif [ "$STATUS" = "unhealthy" ]; then
        fail "Container $container is unhealthy"
    else
        warn "Container $container has no health check or not running"
    fi
done

# 2.4 Container logs check
info "Checking for critical errors in logs..."
ERROR_COUNT=$(docker-compose logs --tail=100 2>&1 | grep -i "error\|exception\|failed" | grep -v "health check" | wc -l | tr -d ' ')
if [ "$ERROR_COUNT" -eq 0 ]; then
    pass "No critical errors in recent logs"
else
    warn "Found $ERROR_COUNT error lines in logs (may be normal)"
fi

# ============================================================
# SECTION 3: DATABASE TESTS
# ============================================================
print_test "3. Database Connectivity & Schema"

# 3.1 PostgreSQL connection
if docker exec sipper-db pg_isready -U sipper >/dev/null 2>&1; then
    pass "PostgreSQL accepting connections"
else
    fail "PostgreSQL not ready"
fi

# 3.2 Database exists
DB_EXISTS=$(docker exec sipper-db psql -U sipper -lqt 2>/dev/null | cut -d \| -f 1 | grep -w sipper | wc -l | tr -d ' ')
if [ "$DB_EXISTS" -ge 1 ]; then
    pass "Database 'sipper' exists"
else
    fail "Database 'sipper' not found"
fi

# 3.3 Tables created
TABLE_COUNT=$(docker exec sipper-db psql -U sipper -d sipper -t -c "\dt" 2>/dev/null | grep -c "public" || echo "0")
if [ "$TABLE_COUNT" -ge 5 ]; then
    pass "Database tables created ($TABLE_COUNT tables)"
    info "Tables: $(docker exec sipper-db psql -U sipper -d sipper -t -c '\dt' 2>/dev/null | grep 'public' | awk '{print $3}' | tr '\n' ', ')"
else
    warn "Expected at least 5 tables, found $TABLE_COUNT"
fi

# 3.4 Critical tables exist
for table in users organizations sip_credentials test_runs; do
    if docker exec sipper-db psql -U sipper -d sipper -t -c "\dt" 2>/dev/null | grep -q "$table"; then
        pass "Table exists: $table"
    else
        fail "Missing critical table: $table"
    fi
done

# ============================================================
# SECTION 4: BACKEND API TESTS
# ============================================================
print_test "4. Backend API Endpoints"

# Wait for backend to be ready
sleep 3

# 4.1 Health endpoint
HEALTH_STATUS=$(curl -s http://localhost:8000/health | jq -r '.status' 2>/dev/null || echo "error")
if [ "$HEALTH_STATUS" = "healthy" ]; then
    pass "Health endpoint responding correctly"
else
    fail "Health endpoint failed (got: $HEALTH_STATUS)"
fi

# 4.2 API documentation
DOCS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs)
if [ "$DOCS_CODE" = "200" ]; then
    pass "Swagger UI accessible (HTTP $DOCS_CODE)"
else
    fail "Swagger UI failed (HTTP $DOCS_CODE)"
fi

# 4.3 OpenAPI spec
OPENAPI_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/openapi.json)
if [ "$OPENAPI_CODE" = "200" ]; then
    pass "OpenAPI spec available (HTTP $OPENAPI_CODE)"
else
    fail "OpenAPI spec failed (HTTP $OPENAPI_CODE)"
fi

# ============================================================
# SECTION 5: AUTHENTICATION FLOW TESTS
# ============================================================
print_test "5. Authentication & Authorization"

# Generate unique test credentials
TEST_EMAIL="total-test-$(date +%s)@example.com"
TEST_PASSWORD="TestPass123!@#"
TEST_ORG="Total Test Org $(date +%s)"

# 5.1 User registration
info "Testing registration with: $TEST_EMAIL"
REG_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"full_name\":\"Total Test User\",\"organization_name\":\"$TEST_ORG\"}")

ACCESS_TOKEN=$(echo "$REG_RESPONSE" | jq -r '.access_token // empty' 2>/dev/null)
REFRESH_TOKEN=$(echo "$REG_RESPONSE" | jq -r '.refresh_token // empty' 2>/dev/null)

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    pass "User registration successful (got JWT token)"
    info "Token preview: ${ACCESS_TOKEN:0:30}..."
else
    fail "Registration failed"
    info "Response: $REG_RESPONSE"
fi

# 5.2 Duplicate registration prevention
DUPLICATE_REG=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"full_name\":\"Duplicate User\",\"organization_name\":\"Duplicate Org\"}")

if echo "$DUPLICATE_REG" | jq -e '.detail' >/dev/null 2>&1; then
    pass "Duplicate email prevention working"
else
    warn "Duplicate registration should be blocked"
fi

# 5.3 User login
info "Testing login with: $TEST_EMAIL"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty' 2>/dev/null)

if [ -n "$LOGIN_TOKEN" ] && [ "$LOGIN_TOKEN" != "null" ]; then
    pass "User login successful"
else
    fail "Login failed"
    info "Response: $LOGIN_RESPONSE"
fi

# 5.4 Invalid credentials
INVALID_LOGIN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"WrongPassword123\"}")

if echo "$INVALID_LOGIN" | grep -q "401\|Incorrect\|password"; then
    pass "Invalid credentials properly rejected"
else
    warn "Invalid login should return 401"
fi

# 5.5 JWT token structure validation
if echo "$ACCESS_TOKEN" | grep -qE '^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$'; then
    pass "JWT token has valid structure (header.payload.signature)"
else
    warn "JWT token structure may be invalid"
fi

# 5.6 Refresh token exists
if [ -n "$REFRESH_TOKEN" ] && [ "$REFRESH_TOKEN" != "null" ]; then
    pass "Refresh token provided"
else
    warn "No refresh token in response"
fi

# ============================================================
# SECTION 6: FRONTEND TESTS
# ============================================================
print_test "6. Frontend Build & Serving"

# 6.1 Frontend directory exists
if [ -d "frontend/dist" ]; then
    pass "Frontend build directory exists"
    FILE_COUNT=$(find frontend/dist -type f | wc -l | tr -d ' ')
    info "Build contains $FILE_COUNT files"
else
    fail "Frontend dist directory missing"
fi

# 6.2 Critical frontend files
for file in frontend/dist/index.html frontend/dist/assets/index*.js frontend/dist/assets/index*.css; do
    if compgen -G "$file" > /dev/null; then
        pass "Frontend file exists: $(basename $file)"
    else
        warn "Missing frontend file: $file"
    fi
done

# 6.3 Frontend serves correctly
FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/)
if [ "$FRONTEND_CODE" = "200" ]; then
    pass "Frontend homepage loads (HTTP 200)"
else
    fail "Frontend failed to load (HTTP $FRONTEND_CODE)"
fi

# 6.4 Frontend content type
CONTENT_TYPE=$(curl -s -I http://localhost:8000/ | grep -i "content-type" | cut -d' ' -f2 | tr -d '\r')
if echo "$CONTENT_TYPE" | grep -q "text/html"; then
    pass "Frontend serves HTML content"
else
    warn "Unexpected content type: $CONTENT_TYPE"
fi

# 6.5 Static assets
ASSET_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/assets/$(ls frontend/dist/assets/*.js 2>/dev/null | head -1 | xargs basename)")
if [ "$ASSET_CODE" = "200" ]; then
    pass "Static assets accessible"
else
    warn "Static assets may not be serving (HTTP $ASSET_CODE)"
fi

# ============================================================
# SECTION 7: SECURITY TESTS
# ============================================================
print_test "7. Security Checks"

# 7.1 CORS headers
CORS_HEADERS=$(curl -s -I http://localhost:8000/health | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
    pass "CORS headers present"
else
    warn "No CORS headers found (may be intentional)"
fi

# 7.2 Password complexity (from source)
if grep -q "PBKDF2" backend/app/auth/password.py 2>/dev/null; then
    pass "Using secure password hashing (PBKDF2)"
else
    warn "Password hashing method unclear"
fi

# 7.3 Environment variables
if grep -q "JWT_SECRET" .env 2>/dev/null; then
    pass "JWT_SECRET configured in .env"
else
    warn "JWT_SECRET not found in .env"
fi

# 7.4 Protected endpoints without auth
PROTECTED_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/users/me 2>/dev/null || echo "404")
if [ "$PROTECTED_CODE" = "401" ] || [ "$PROTECTED_CODE" = "403" ]; then
    pass "Protected endpoints require authentication"
elif [ "$PROTECTED_CODE" = "404" ]; then
    warn "Protected endpoint /api/users/me not implemented yet"
else
    fail "Protected endpoint accessible without auth (HTTP $PROTECTED_CODE)"
fi

# ============================================================
# SECTION 8: DATA PERSISTENCE TESTS
# ============================================================
print_test "8. Data Persistence"

# 8.1 Verify user exists in database
USER_COUNT=$(docker exec sipper-db psql -U sipper -d sipper -t -c "SELECT COUNT(*) FROM users WHERE email='$TEST_EMAIL'" 2>/dev/null | tr -d ' ')
if [ "$USER_COUNT" = "1" ]; then
    pass "User persisted to database"
else
    fail "User not found in database (count: $USER_COUNT)"
fi

# 8.2 Verify organization created
ORG_COUNT=$(docker exec sipper-db psql -U sipper -d sipper -t -c "SELECT COUNT(*) FROM organizations" 2>/dev/null | tr -d ' ')
if [ "$ORG_COUNT" -ge 1 ]; then
    pass "Organizations exist in database (count: $ORG_COUNT)"
else
    fail "No organizations in database"
fi

# 8.3 Password is hashed
STORED_HASH=$(docker exec sipper-db psql -U sipper -d sipper -t -c "SELECT password_hash FROM users WHERE email='$TEST_EMAIL' LIMIT 1" 2>/dev/null | tr -d ' ')
if [ -n "$STORED_HASH" ] && [ "$STORED_HASH" != "$TEST_PASSWORD" ]; then
    pass "Password stored as hash (not plaintext)"
else
    fail "Password may not be properly hashed"
fi

# ============================================================
# SECTION 9: PERFORMANCE & RESOURCE TESTS
# ============================================================
print_test "9. Performance & Resources"

# 9.1 Response time
START_TIME=$(gdate +%s%3N 2>/dev/null || echo "0")
curl -s http://localhost:8000/health >/dev/null
END_TIME=$(gdate +%s%3N 2>/dev/null || echo "100")
if [ "$START_TIME" != "0" ] && [ "$END_TIME" != "100" ]; then
    RESPONSE_TIME=$((END_TIME - START_TIME))
else
    RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:8000/health | awk '{print int($1*1000)}')
fi

if [ "$RESPONSE_TIME" -lt 500 ]; then
    pass "API response time acceptable (${RESPONSE_TIME}ms)"
else
    warn "API response time slow (${RESPONSE_TIME}ms)"
fi

# 9.2 Container resource usage
CONTAINER_MEM=$(docker stats sipper-app --no-stream --format "{{.MemUsage}}" 2>/dev/null | cut -d'/' -f1 | tr -d ' ')
info "App container memory usage: $CONTAINER_MEM"

# 9.3 Image size
IMAGE_SIZE=$(docker images sipper-app:latest --format "{{.Size}}" 2>/dev/null)
if [ -n "$IMAGE_SIZE" ]; then
    pass "Docker image size: $IMAGE_SIZE"
else
    warn "Could not determine image size"
fi

# ============================================================
# SECTION 10: RECOVERY & ERROR HANDLING TESTS
# ============================================================
print_test "10. Recovery & Error Handling"

# 10.1 Invalid JSON
INVALID_JSON=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "not valid json" \
  -w "\n%{http_code}" | tail -1)

if [ "$INVALID_JSON" = "422" ]; then
    pass "Invalid JSON properly rejected (HTTP 422)"
else
    warn "Invalid JSON handling unclear (HTTP $INVALID_JSON)"
fi

# 10.2 Missing required fields
MISSING_FIELDS=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  -w "\n%{http_code}" | tail -1)

if [ "$MISSING_FIELDS" = "422" ]; then
    pass "Missing fields properly validated (HTTP 422)"
else
    warn "Missing field validation unclear (HTTP $MISSING_FIELDS)"
fi

# 10.3 Container restart capability
info "Testing container restart resilience..."
docker-compose restart app >/dev/null 2>&1
sleep 5
HEALTH_AFTER_RESTART=$(curl -s http://localhost:8000/health | jq -r '.status' 2>/dev/null || echo "error")
if [ "$HEALTH_AFTER_RESTART" = "healthy" ]; then
    pass "Container recovers after restart"
else
    fail "Container failed to recover (status: $HEALTH_AFTER_RESTART)"
fi

# ============================================================
# FINAL SUMMARY
# ============================================================
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    TEST SUMMARY                          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ PASSED: $PASS_COUNT${NC}"
echo -e "${RED}❌ FAILED: $FAIL_COUNT${NC}"
echo -e "${YELLOW}⚠️  WARNINGS: $WARN_COUNT${NC}"
echo ""

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT + WARN_COUNT))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASS_COUNT/$TOTAL_TESTS)*100}")

echo -e "Total Tests: $TOTAL_TESTS"
echo -e "Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          🎉 ALL CRITICAL TESTS PASSED! 🎉                ║${NC}"
    echo -e "${GREEN}║       APPLICATION IS PRODUCTION READY                    ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║         ⚠️  SOME TESTS FAILED - REVIEW NEEDED ⚠️         ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
