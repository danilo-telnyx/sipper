# SIPPER Frontend - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Start Backend API
```bash
cd ~/Documents/projects/sipper/backend
# (start your backend server on port 8000)
```

### 2. Start Frontend
```bash
cd ~/Documents/projects/sipper/frontend
npm run dev
```
**Dev server:** http://localhost:3000

### 3. Test Authentication

**Register New User:**
1. Go to http://localhost:3000
2. Click "Register"
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: Test@1234 (watch the strength meter!)
   - Confirm Password: Test@1234
4. Click "Create account"
5. ✅ You should be logged in and redirected to dashboard

**Login:**
1. Go to http://localhost:3000/login
2. Enter credentials
3. Check "Remember me"
4. Click "Login"
5. ✅ Redirected to dashboard

---

## 📱 Features to Try

### Desktop
- [ ] Navigate between pages using sidebar
- [ ] Click user menu (top right) → see name, email, role
- [ ] Click "Logout"
- [ ] Try accessing /dashboard while logged out → redirects to login

### Mobile (resize browser < 1024px)
- [ ] Click hamburger menu (☰) → sidebar slides in
- [ ] Click outside → sidebar closes
- [ ] Navigate → sidebar auto-closes

### Forms
- [ ] Try invalid email → see error
- [ ] Try short password → see validation error
- [ ] Watch password strength meter update as you type
- [ ] Toggle password visibility with eye icon
- [ ] Submit form → see loading spinner

---

## 🔍 What's Been Built

**✅ Complete Auth System:**
- Login & Register pages with validation
- JWT token management with auto-refresh
- Protected routes with role-based access
- Session timeout (30 min inactivity)
- Remember me functionality
- Password strength indicator

**✅ Production-Ready Layout:**
- Responsive sidebar navigation
- Mobile hamburger menu
- User dropdown menu
- Organization settings (org-admin)
- Sticky header
- Active route highlighting

**✅ Developer Experience:**
- TypeScript typed
- Axios interceptors
- Error handling with toasts
- Loading states throughout
- Accessible (WCAG AA)
- Mobile-first responsive

---

## 📚 Documentation

- **`AUTH_SYSTEM_DOCS.md`** - Complete technical documentation
- **`TESTING_GUIDE.md`** - Comprehensive test scenarios
- **`COMPLETION_REPORT.md`** - Delivery report with all deliverables

---

## 🛠️ Troubleshooting

**Problem:** Frontend can't connect to backend
```bash
# Check if backend is running
curl http://localhost:8000/api/auth/me
```

**Problem:** Dev server not starting
```bash
# Reinstall dependencies
cd ~/Documents/projects/sipper/frontend
npm install
npm run dev
```

**Problem:** TypeScript errors
```bash
# Run type check
npm run type-check
```

**Problem:** Changes not reflecting
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear cache and reload

---

## ⚡ API Endpoints Used

```
POST   /api/auth/register    - Create new user
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user
POST   /api/auth/refresh     - Refresh JWT token
GET    /api/auth/me          - Get current user
```

---

## 📝 Environment Variables

`.env` file (already created):
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_VERSION=0.1.0
```

---

## ✨ Ready to Go!

Everything is set up and ready for testing. Just start both servers and navigate to http://localhost:3000.

**Status:** ✅ Complete & Production-Ready

For detailed testing instructions, see `TESTING_GUIDE.md`.
