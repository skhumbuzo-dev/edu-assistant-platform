# 🚂 RAILWAY DEPLOYMENT - BACKEND

Your backend is ready to deploy to Railway. This is the easiest platform for Node.js apps.

---

## ✅ What You'll Get

- ✅ Backend API running (Port 3001)
- ✅ SQLite database included
- ✅ SSL/HTTPS included
- ✅ Auto-deploys on GitHub push
- ✅ Free tier available

---

## 🚀 Deploy to Railway in 2 Minutes

### Step 1: Open Railway

```
👉 https://railway.app
```

### Step 2: Create New Project

1. **Click:** "New Project"
2. **Select:** "Deploy from GitHub"
3. **Authorize:** Railway to access GitHub
4. **Select Repository:** `skhumbuzo-dev/edu-assistant-platform`
5. **Click:** "Deploy"

---

### Step 3: Configure Backend

Railway will auto-detect Node.js. Set working directory:

1. **Click:** Project → Settings
2. **Set Working Directory:** `backend`
3. **Save**

---

### Step 4: Add Environment Variables

1. **Click:** Variables tab
2. **Add:**
   ```
   NODE_ENV           = production
   JWT_SECRET         = UEFptTzxzZATdBjhxiB/0cRxsUzZebXblX/jxoGN2pI=
   PORT               = 3001
   DATABASE_URL       = ./eduassist.db
   FRONTEND_URL       = https://your-frontend.vercel.app
   ```

3. **Save**

---

### Step 5: Deployment

Railway will automatically:
1. ✅ Install dependencies
2. ✅ Build (if needed)
3. ✅ Start Node server
4. ✅ Generate public URL

**Expected time:** 1-2 minutes

---

## 🎉 Your Backend is Live!

After deployment, you'll get:

```
Public URL: https://your-project.railway.app
API URL:    https://your-project.railway.app/api
```

---

## 🔗 Connect Frontend to Backend

Now that backend is deployed:

1. **Go to:** Vercel Dashboard
2. **Select:** Your project
3. **Settings → Environment Variables**
4. **Update:**
   ```
   VITE_API_URL = https://your-project.railway.app/api
   ```
5. **Save** (auto-redeploy)

---

## ✅ Test Connection

After both are deployed:

1. **Open:** https://your-frontend.vercel.app
2. **Open Console:** F12
3. **Test API call:** Should work now
4. **Try Login:** 
   - Email: test@example.com
   - Password: test
   - (Use mock data or register)

---

## 📊 Monitoring

In Railway Dashboard:

- **Logs:** See real-time backend logs
- **Metrics:** CPU, memory usage
- **Database:** Manage SQLite
- **Deployments:** Revert to previous versions

---

## 💡 Pro Tips

1. **Auto-deploy:** Push to GitHub → auto-deploys
2. **View logs:** Click "Logs" tab
3. **Restart:** Click "Restart" if needed
4. **Scale:** Increase resources if needed (paid)

---

## 🔧 Environment Variables Reference

Your backend needs these:

| Variable | Value | Required |
|----------|-------|----------|
| NODE_ENV | production | ✅ |
| JWT_SECRET | (your secret) | ✅ |
| PORT | 3001 | ✅ |
| DATABASE_URL | ./eduassist.db | ✅ |
| FRONTEND_URL | (vercel URL) | ✓ CORS |

---

## 🛠️ Troubleshooting

### Build Fails
- Check logs in Railway
- Verify working directory is `backend`
- Ensure package.json exists in backend/

### App Won't Start
- Check NODE_ENV and JWT_SECRET are set
- Verify database file permissions
- Check logs for error messages

### API Not Responding
- Verify PORT env variable
- Check public URL is correct
- CORS might need adjustment

---

## 📱 Test Your API

After deployment, test endpoints:

```bash
# Health check
curl https://your-project.railway.app/api/health

# Should return:
# {"ok":true,"message":"Backend + DB are running"}
```

---

## 🎯 Full Integration Checklist

- [ ] Backend deployed to Railway ✓
- [ ] Frontend deployed to Vercel ✓
- [ ] VITE_API_URL updated to Railway URL
- [ ] Frontend redeployed (auto)
- [ ] API calls working
- [ ] Database initialized
- [ ] Logs look healthy
- [ ] No errors in browser console

---

## 📊 Your Deployment URLs

```
Frontend:  https://your-project.vercel.app
Backend:   https://your-project.railway.app
API:       https://your-project.railway.app/api
```

---

## 🎉 You're Done!

Your full EduAssist app is now live! 🚀

- ✅ Frontend on Vercel
- ✅ Backend on Railway
- ✅ Connected and working
- ✅ Auto-deploys on code push
- ✅ Production ready

---

**Share your app URL:** https://your-project.vercel.app

Enjoy! 🎊
