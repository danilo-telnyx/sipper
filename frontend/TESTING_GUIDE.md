# SIPPER Frontend - Authentication Testing Guide

## Prerequisites

1. **Backend API Running:** Ensure the backend is running at http://localhost:8000
2. **Frontend Dev Server:** Run `npm run dev` in the frontend directory
3. **Browser:** Open http://localhost:3000 in your browser

## Test Scenarios

### 1. Registration Flow

**Steps:**
1. Navigate to http://localhost:3000 (should redirect to /login)
2. Click "Register" link at bottom
3. Fill in the form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Organization: "Test Organization" (optional)
   - Password: "Test@1234"
   - Confirm Password: "Test@1234"

**Expected Results:**
- ✅ Password strength meter shows "strong" (green)
- ✅ Form validation prevents submission with invalid data
- ✅ Eye icon toggles password visibility
- ✅ "Create account" button shows spinner during submission
- ✅ Success toast appears
- ✅ Automatically redirected to /dashboard
- ✅ User info appears in header

**Error Cases to Test:**
- Short password → Shows validation error
- Mismatched passwords → Shows "Passwords don't match"
- Invalid email → Shows "Invalid email address"
- Missing required fields → Shows field-specific errors

### 2. Login Flow

**Steps:**
1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: "test@example.com"
   - Password: "Test@1234"
3. Check "Remember me" checkbox
4. Click "Login"

**Expected Results:**
- ✅ Email field pre-filled if remembered from before
- ✅ Password toggle works
- ✅ Login button shows spinner
- ✅ Success toast appears
- ✅ Redirected to /dashboard
- ✅ Email saved in localStorage (check DevTools → Application → Local Storage)

**Error Cases to Test:**
- Wrong password → Shows error toast
- Non-existent email → Shows error toast
- Empty fields → Shows validation errors

### 3. Protected Routes

**Steps:**
1. Logout (click user menu → Logout)
2. Manually navigate to http://localhost:3000/dashboard

**Expected Results:**
- ✅ Automatically redirected to /login
- ✅ After login, redirected back to /dashboard

### 4. Token Refresh

**Steps:**
1. Login successfully
2. Open DevTools → Network tab
3. Wait 15+ minutes (or manually expire token in backend)
4. Make any action (navigate to another page)

**Expected Results:**
- ✅ Auto-refresh request sent to /api/auth/refresh
- ✅ New token received
- ✅ Original request retried with new token
- ✅ User stays logged in

### 5. Session Timeout

**Steps:**
1. Login successfully
2. Don't interact with the page for 30+ minutes
3. Try to navigate or perform any action

**Expected Results:**
- ✅ Automatically logged out
- ✅ Redirected to login page
- ✅ Toast message about session timeout (optional)

### 6. Navigation & Layout

**Desktop:**
1. Login and navigate to different pages
2. Check sidebar highlights active page
3. Click user menu → check options

**Mobile:**
1. Resize browser to mobile width (< 1024px)
2. Check hamburger menu appears
3. Click hamburger → sidebar slides in
4. Click outside → sidebar closes
5. Navigate → sidebar auto-closes

**Expected Results:**
- ✅ Sidebar always visible on desktop
- ✅ Hamburger menu on mobile
- ✅ Active route highlighted in sidebar
- ✅ User dropdown shows name, email, role
- ✅ Logout option in dropdown
- ✅ Organization Settings visible for org-admin
- ✅ Users page visible for admin/org-admin only

### 7. Role-Based Access

**Test with different user roles:**

**Regular User:**
- ✅ Can access: Dashboard, Credentials, Test Runner, Test Results
- ❌ Cannot access: Users, Organization (shows access denied)

**Org Admin:**
- ✅ Can access: All pages including Users and Organization

### 8. Remember Me

**Steps:**
1. Login with "Remember me" checked
2. Close browser completely
3. Reopen browser and go to http://localhost:3000/login

**Expected Results:**
- ✅ Email field pre-filled
- ✅ Remember me checkbox checked

**Without Remember Me:**
1. Login without "Remember me"
2. Close browser
3. Reopen and go to login

**Expected Results:**
- ✅ Email field empty
- ✅ Remember me unchecked

### 9. Password Strength Indicator

**Steps:**
1. Go to registration page
2. Type different passwords:
   - "test" → Weak (red)
   - "testpass" → Fair (orange)
   - "TestPass1" → Good (yellow)
   - "Test@1234" → Strong (green)

**Expected Results:**
- ✅ Strength bar updates in real-time
- ✅ Color changes based on strength
- ✅ Label shows weak/fair/good/strong

### 10. Error Handling

**Network Errors:**
1. Stop the backend API
2. Try to login

**Expected Results:**
- ✅ Error toast with network error message
- ✅ Button returns to normal state
- ✅ Form remains filled

**401 Unauthorized:**
1. Manually corrupt the token in localStorage
2. Navigate to any page

**Expected Results:**
- ✅ Automatic logout
- ✅ Redirect to login
- ✅ Token removed from storage

## DevTools Checklist

### Console
- ✅ No errors or warnings
- ✅ No infinite re-render loops
- ✅ Clean component lifecycle

### Network
- ✅ Auth token in Authorization header
- ✅ Refresh token call on 401
- ✅ Proper request/response formats
- ✅ No unnecessary duplicate requests

### Application → Local Storage
- ✅ `sipper-auth` contains user, token, refreshToken
- ✅ `sipper-remembered-email` when remember me checked
- ✅ Token cleared on logout

### Performance
- ✅ Fast initial load
- ✅ Smooth animations
- ✅ No janky scrolling

## Accessibility Testing

### Keyboard Navigation
- ✅ Tab through all form fields
- ✅ Enter key submits forms
- ✅ Escape closes dropdowns/menus
- ✅ Arrow keys navigate dropdowns

### Screen Reader
- ✅ Form labels announced
- ✅ Error messages announced
- ✅ Loading states announced
- ✅ Navigation structure makes sense

### Visual
- ✅ Good contrast ratios
- ✅ Focus indicators visible
- ✅ Text readable at all sizes
- ✅ Icons have text alternatives

## Mobile Testing

### Devices to Test
- iPhone (Safari)
- Android (Chrome)
- Tablet (iPad)

### Checks
- ✅ Touch targets large enough (44x44px min)
- ✅ Text readable without zoom
- ✅ No horizontal scrolling
- ✅ Hamburger menu works smoothly
- ✅ Forms work with mobile keyboard

## Performance Metrics

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

## Common Issues & Solutions

### Issue: Token refresh loop
**Solution:** Check backend refresh endpoint returns correct format

### Issue: 401 errors after login
**Solution:** Verify token format matches backend expectations

### Issue: Session timeout too aggressive
**Solution:** Adjust SESSION_TIMEOUT in AuthContext.tsx

### Issue: Remember me not working
**Solution:** Check localStorage permissions in browser

### Issue: Mobile menu not closing
**Solution:** Verify event handlers and backdrop click

## Automated Testing (Future)

```bash
# Example Playwright test
npx playwright test auth.spec.ts
```

**Coverage:**
- Login flow
- Registration flow
- Protected routes
- Token refresh
- Session timeout
- Logout

---

**Testing Status:** Ready for manual testing
**Estimated Time:** 30-45 minutes for full test suite
**Critical Path:** Register → Login → Navigate → Logout
