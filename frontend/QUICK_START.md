# SIPPER Frontend - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Backend API running at `http://localhost:8080` (or update `.env`)

### Step 1: Install Dependencies
```bash
cd ~/Documents/projects/sipper/frontend
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` if your backend is on a different URL:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080
VITE_APP_VERSION=0.1.0
```

### Step 3: Start Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Step 4: Login or Register
- **Register**: Create a new account
- **Login**: Use your credentials

That's it! You're ready to start testing SIP endpoints.

---

## 📦 What You Get

- ✅ Modern React app with TypeScript
- ✅ Real-time test tracking (WebSocket)
- ✅ Responsive design (mobile-friendly)
- ✅ Accessible UI (WCAG compliant)
- ✅ Export test results (JSON/CSV)
- ✅ Role-based access control

---

## 🔑 First Steps After Login

1. **Add SIP Credentials**  
   Go to "Credentials" → Click "Add Credential" → Fill in your SIP account details

2. **Run Your First Test**  
   Go to "Test Runner" → Select a credential → Choose test type → Click "Run Test"

3. **View Results**  
   Watch real-time progress → See detailed results with RFC compliance → Export if needed

4. **Manage Users** (Admin only)  
   Go to "Users" → Add team members with appropriate roles

5. **Configure Organization** (Org-Admin only)  
   Go to "Organization" → Set notification email and retention policies

---

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production (output: dist/)
npm run preview      # Preview production build

# Code Quality
npm run lint         # Lint TypeScript code
npm run type-check   # Check TypeScript types
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Page components
│   ├── services/       # API + WebSocket
│   ├── store/          # State management
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities
│   └── types/          # TypeScript types
├── package.json
├── vite.config.ts
└── README.md          # Full documentation
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Check if backend is running
- Verify `.env` URLs are correct
- Check browser console for CORS errors

### "WebSocket connection failed"
- Ensure WebSocket endpoint is correct in `.env`
- Check if backend supports WebSocket connections
- Try refreshing the page

### "401 Unauthorized"
- You've been logged out
- Login again to get a new token

### "Port 3000 already in use"
- Kill the process using port 3000: `lsof -ti:3000 | xargs kill`
- Or change the port in `vite.config.ts`

---

## 📚 Full Documentation

- **README.md**: Comprehensive guide with all features
- **COMPONENT_STRUCTURE.md**: Architecture and component details
- **PROJECT_SUMMARY.md**: Technical specifications and metrics

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Docker
```bash
docker build -t sipper-frontend .
docker run -p 80:80 sipper-frontend
```

---

## 💡 Tips

1. **Use Chrome DevTools** for debugging (F12)
2. **Check Network tab** to see API requests
3. **Console tab** shows WebSocket events
4. **Mobile view**: Toggle device toolbar (Cmd+Shift+M)
5. **Accessibility**: Test with screen reader

---

## 🤝 Need Help?

- Check `README.md` for detailed documentation
- Review `COMPONENT_STRUCTURE.md` for architecture
- See `PROJECT_SUMMARY.md` for technical details

---

**Happy Testing! 🎉**
