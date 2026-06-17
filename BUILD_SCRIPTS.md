# Production Build & Deployment Scripts

## Quick Start Scripts

### Frontend Build
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Backend Start
```bash
# Development (with nodemon)
cd backend
npm run dev

# Production
cd backend
NODE_ENV=production npm start
```

---

## Environment Configuration

### Development (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=EduAssist
```

### Production (.env.production)
```
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=EduAssist
```

---

## CI/CD Pipeline Example (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Build Frontend
      - name: Build frontend
        run: |
          npm install
          npm run build
      
      # Build Backend
      - name: Build backend
        run: |
          cd backend
          npm install
      
      # Deploy Frontend to Vercel
      - name: Deploy frontend
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
      
      # Deploy Backend (adjust based on your platform)
      - name: Deploy backend
        run: |
          # Add your backend deployment command here
          echo "Deploying backend..."
```

---

## Performance Optimization Notes

✅ **Already Implemented:**
- Tree-shaking enabled in Vite build
- Code splitting for React and React Router chunks
- Console statements removed in production
- Source maps disabled for smaller bundle size
- Terser minification enabled

---

## Production Readiness Checklist

Before deploying to production:
- [ ] All environment variables are set
- [ ] Database is backed up
- [ ] API URL is correct for production
- [ ] JWT_SECRET is strong and unique
- [ ] CORS is configured correctly
- [ ] Frontend build runs without errors
- [ ] Backend starts without errors
- [ ] Test API calls from frontend to backend
- [ ] Monitoring/logging is configured
- [ ] Error handling is in place

