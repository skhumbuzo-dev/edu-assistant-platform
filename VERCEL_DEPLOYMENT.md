# ⚡ VERCEL DEPLOYMENT GUIDE

## Quick Deploy to Vercel

Your EduAssist frontend is ready to deploy to Vercel. Follow these steps:

---

## 📋 Prerequisites

- GitHub account (required for Vercel)
- Git installed locally
- Your code pushed to a GitHub repository

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

```powershell
# Navigate to your project
cd c:\Users\nkaba\Downloads\eduAssist

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Production ready - deployment to Vercel"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR-USERNAME/eduassist.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. **Go to:** https://vercel.com
2. **Sign up** or **Log in** with GitHub account
3. **Click:** "New Project"
4. **Select:** Your `eduassist` repository
5. **Click:** Import

### Step 3: Configure Build Settings

When prompted:

| Setting | Value |
|---------|-------|
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

✅ **Vercel usually auto-detects these correctly!**

### Step 4: Set Environment Variables

In Vercel Dashboard:

1. **Go to:** Project → Settings → Environment Variables
2. **Add Variable:**
   ```
   Name: VITE_API_URL
   Value: https://your-backend-api.com/api
   
   (Update "your-backend-api.com" after backend is deployed)
   ```
3. **For Development:** Add same variable with `http://localhost:3001/api`
4. **Click:** Save

### Step 5: Deploy

1. **Click:** "Deploy"
2. **Wait:** ~2-3 minutes for build to complete
3. **Check:** Build logs for any errors
4. **Visit:** Your deployed site (https://your-project.vercel.app)

---

## 🔗 Your Vercel URLs

After deployment:

```
Production:  https://your-project.vercel.app
Preview:     https://your-project-git-main.vercel.app (auto-updated on push)
```

---

## ✅ Verify Deployment

1. **Frontend loads:** https://your-project.vercel.app ✓
2. **Check console:** No JavaScript errors
3. **Test API calls:** Should fail if backend not deployed yet (expected)
4. **Check build log:** Look for warnings/errors

---

## 🔧 Advanced: Vercel Configuration File

**Optional:** Create `vercel.json` for custom config:

```json
{
  "builds": [
    {
      "src": "vite.config.js",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 🛠️ Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Try locally: `npm run build`

### API Connection Issues
- Verify `VITE_API_URL` environment variable is set
- Check backend is deployed and accessible
- CORS might need configuration on backend

### Page Shows Blank
- Check browser console for errors
- Verify build output includes `dist/index.html`
- Clear browser cache (Ctrl+Shift+Del)

---

## 📱 Environment Variables Reference

For Vercel, you'll need:

```
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=EduAssist
```

**After Backend Deployment:**
```
VITE_API_URL=https://your-railway-backend.railway.app/api
```

---

## 🔄 Auto-Deploy Setup

Vercel automatically deploys on:
- Push to main branch
- Pull request (preview deployment)
- Manual redeploy from dashboard

---

## 📊 Expected Build Output

```
✓ 40 modules transformed
✓ dist/index.html
✓ dist/assets/index-*.js
✓ dist/assets/react-vendor-*.js
✓ Built in 1.15s
```

---

## 🎯 Next: Deploy Backend

After frontend is deployed to Vercel:

1. **Update** `VITE_API_URL` with backend URL
2. **Deploy backend** to Railway/Render
3. **Test API** connectivity from frontend
4. **Monitor** logs for errors

---

## 💡 Pro Tips

- **Enable Git integration:** Auto-deploy on push
- **Set up preview deployments:** Test before merging to main
- **Configure domains:** Custom domain support
- **Monitor builds:** Get Slack notifications
- **Use edge middleware:** For authentication/redirects

---

## ✅ Deployment Checklist

- [ ] GitHub account created
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Frontend URL accessible
- [ ] No build errors

---

**Ready to deploy? Start with Step 1 above!** 🚀
