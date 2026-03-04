# SIPPER Frontend Deployment Guide

## 🚀 Quick Start

### Development
```bash
cd ~/Documents/projects/sipper/frontend
npm install
npm run dev
```
Access: http://localhost:3002 (or next available port)

### Production Build
```bash
npm run build
npm run preview  # Preview production build locally
```

## 📦 Build Output

- **Location:** `dist/`
- **Size:** ~143 KB (46 KB gzipped)
- **Build time:** ~466ms

## 🔧 Environment Configuration

### Required Environment Variables

Create `.env.local` or `.env.production`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000

# Optional: Feature Flags
VITE_ENABLE_TELNYX_INTEGRATION=true
VITE_ENABLE_ANALYTICS=false
```

## 🌐 Deployment Options

### Option 1: Static Hosting (Recommended)

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**AWS S3 + CloudFront:**
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t sipper-frontend .
docker run -p 80:80 sipper-frontend
```

### Option 3: Traditional Server (Nginx)

```nginx
# /etc/nginx/sites-available/sipper

server {
    listen 80;
    server_name sipper.example.com;
    root /var/www/sipper;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Deploy:
```bash
npm run build
sudo cp -r dist/* /var/www/sipper/
sudo systemctl reload nginx
```

## 🔐 Security Checklist

- [ ] HTTPS enabled (SSL/TLS certificate)
- [ ] CORS configured properly on backend
- [ ] Environment variables secured (not in git)
- [ ] API rate limiting configured
- [ ] JWT tokens stored securely (httpOnly cookies)
- [ ] CSP headers configured
- [ ] No sensitive data in client-side code
- [ ] Password fields have autocomplete="off"

## 📊 Performance Optimization

### Already Implemented
- ✅ Code splitting (Vite)
- ✅ Tree shaking
- ✅ Minification
- ✅ Gzip compression
- ✅ Lazy loading (React Query)
- ✅ Optimistic updates

### Recommended Additions
- [ ] CDN for static assets
- [ ] Image optimization (if images added)
- [ ] Service worker for offline support
- [ ] Bundle size monitoring
- [ ] Performance monitoring (Sentry, LogRocket)

## 🧪 Pre-Deployment Testing

```bash
# 1. Run linter
npm run lint

# 2. Run type check
npm run type-check

# 3. Run tests (if available)
npm run test

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview

# 6. Check bundle size
npm run build -- --report
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API Connection Issues
- Check `VITE_API_BASE_URL` in environment
- Verify CORS settings on backend
- Check browser console for errors
- Test API endpoints directly with curl

### WebSocket Connection Fails
- Ensure `VITE_WS_URL` is correct
- Check firewall rules
- Verify backend WebSocket server is running
- Test with `wscat -c ws://your-backend:3000`

### Authentication Issues
- Clear browser localStorage
- Check token expiration
- Verify refresh token logic
- Test login endpoint directly

## 📈 Monitoring

### Key Metrics to Track
- Page load time
- Time to interactive
- API response times
- Error rate
- User engagement (credentials created/tested)

### Recommended Tools
- **Frontend Monitoring:** Sentry, LogRocket
- **Analytics:** Google Analytics, Plausible
- **Uptime:** UptimeRobot, Pingdom
- **Performance:** Lighthouse CI, WebPageTest

## 🔄 Updates & Maintenance

### Update Dependencies
```bash
# Check for outdated packages
npm outdated

# Update all dependencies (safe)
npm update

# Update major versions (review breaking changes)
npm install package@latest
```

### Database Migrations
Backend migrations should be run before deploying new frontend if schema changes.

### Feature Flags
Use environment variables to control feature rollout:
```env
VITE_ENABLE_NEW_FEATURE=false  # Set to true when ready
```

## 🆘 Support

- **Documentation:** See `CREDENTIALS_FEATURE.md`
- **Issues:** Check GitHub issues
- **API Docs:** Check backend API documentation
- **Contact:** [Your contact info]

---

**Last Updated:** 2026-03-04  
**Version:** 0.1.0
