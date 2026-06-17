# EduAssist Deployment Guide

## Pre-Deployment Checklist

### ✅ Completed Items
- [x] Environment variables externalized (removed hardcoded values)
- [x] JWT_SECRET secured (requires environment variable)
- [x] API endpoints use environment variables (VITE_API_URL)
- [x] Console logs cleaned and made production-safe
- [x] Build configuration optimized for production
- [x] .env.example files created with all required variables
- [x] .gitignore configured to protect sensitive files

---

## Setup for Production

### 1. Environment Variables

#### Frontend (.env.production)
```
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=EduAssist
```

#### Backend (.env)
```
# Server
PORT=3001
NODE_ENV=production

# Security - MUST be set!
JWT_SECRET=<your-generated-secret>

# Database
DATABASE_URL=./eduassist.db

# CORS
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Generate Secure JWT_SECRET

**On Linux/Mac:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 3. Build Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# This creates optimized bundle in dist/
```

### 4. Prepare Backend

```bash
cd backend

# Install dependencies
npm install

# Start production server
NODE_ENV=production npm start
```

---

## Deployment Platforms

### Vercel (Frontend)
1. Connect repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL`
5. Deploy

### Railway/Render (Backend)
1. Connect repository
2. Set start command: `npm start`
3. Add environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=<your-secret>`
   - `FRONTEND_URL=<your-frontend-url>`
4. Deploy

### Docker Deployment

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

---

## Security Checklist

- [ ] JWT_SECRET is strong (minimum 32 characters)
- [ ] .env files are in .gitignore
- [ ] No sensitive data in version control
- [ ] Database backups configured
- [ ] CORS is properly configured
- [ ] HTTPS enabled for all endpoints
- [ ] Database credentials are environment variables
- [ ] Rate limiting configured (if needed)
- [ ] Error messages don't leak sensitive info

---

## Monitoring

Monitor the following in production:
- Database connection health
- API error rates
- Response times
- JWT token validation failures
- Disk space (for SQLite database)

---

## Database Migration (Future)

To migrate from SQLite to PostgreSQL:
1. Export SQLite data
2. Import to PostgreSQL
3. Update DATABASE_URL
4. Test thoroughly in staging
5. Perform backup before production migration

---

## Troubleshooting

### "JWT_SECRET is required" Error
- Set JWT_SECRET environment variable
- Verify it's accessible to the Node process

### API Connection Failures
- Verify VITE_API_URL matches backend URL
- Check CORS is properly configured
- Verify firewall/network settings

### Database Errors
- Check file permissions on database file
- Verify DATABASE_URL path is correct
- Ensure database file has write permissions

---

## Support
For issues, check logs and verify all environment variables are correctly set.
