# 🚀 Deployment Guide - AI File Assistant

This guide will help you deploy your AI File Assistant application to the cloud.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend      │────▶│   MongoDB       │
│    (Vercel)     │     │   (Railway)     │     │   (Atlas)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │   Gemini AI     │
                        │    (Google)     │
                        └─────────────────┘
```

---

## Step 1: Prepare Your Code

### 1.1 Initialize Git Repository

```bash
# In the root folder (ai-assist-using-Motia)
git init
git add .
git commit -m "Initial commit - AI File Assistant"
```

### 1.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `ai-file-assistant`
3. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-file-assistant.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway

### 2.1 Sign Up & Create Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `ai-file-assistant` repository
5. When asked, set the **Root Directory** to `backend`

### 2.2 Configure Environment Variables

In Railway dashboard, go to your service → **Variables** tab → Add these:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://yaswanthvenkata369_db_user:Yaswanth1@cluster0.1pmdadb.mongodb.net/?appName=Cluster0` |
| `MONGODB_DB_NAME` | `ai_file_assistant` |
| `GEMINI_API_KEY` | `AIzaSyD1KxmprDNU0RRUtoSNtun8CteYQY3WUf0` |
| `JWT_SECRET` | Generate a random string (e.g., use `openssl rand -base64 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

### 2.3 Configure Build Settings

In Railway → **Settings** tab:

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `backend`

### 2.4 Generate Domain

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://ai-file-assistant-backend.up.railway.app`)

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Sign Up & Import Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your `ai-file-assistant` repository

### 3.2 Configure Project

When configuring the import:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.3 Add Environment Variables

Add this environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://YOUR-RAILWAY-URL.up.railway.app/api` |

Replace `YOUR-RAILWAY-URL` with your actual Railway backend URL from Step 2.4.

### 3.4 Deploy

Click **"Deploy"** and wait for the build to complete!

---

## Step 4: Configure CORS (Important!)

After deploying, you need to allow your frontend to communicate with your backend.

### 4.1 Update Backend CORS

Create or update `backend/motia.config.js`:

```javascript
export default {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://your-app.vercel.app', // Your Vercel URL
    ],
    credentials: true,
  },
};
```

Then redeploy the backend by pushing to GitHub.

---

## Step 5: Update MongoDB Atlas Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Network Access** in the sidebar
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **Confirm**

This allows Railway servers to connect to your database.

---

## Alternative: Deploy Both to Railway

If you want everything on Railway:

### Frontend on Railway

1. Create another service in Railway
2. Set Root Directory to `frontend`
3. Build Command: `npm run build`
4. Add a `railway.json` in frontend folder:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx serve dist -s -l 3000"
  }
}
```

---

## Troubleshooting

### Backend not starting
- Check Railway logs for errors
- Verify all environment variables are set
- Make sure `motia start` command works locally

### Frontend can't connect to backend
- Check VITE_API_URL is set correctly
- Verify CORS is configured
- Check browser console for errors

### MongoDB connection failed
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string is correct
- Ensure database user has correct permissions

### Gemini API errors
- Verify API key is correct
- Check if API key has quota remaining
- Ensure model name is correct (`gemini-2.5-flash`)

---

## Useful Commands

```bash
# Build frontend locally
cd frontend
npm run build
npm run preview  # Test production build

# Test backend production mode
cd backend
npm run build
npm start
```

---

## Cost Estimate (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway | $5 credit/month | ~$5-10/month |
| Vercel | 100GB bandwidth | Free for hobby |
| MongoDB Atlas | 512MB storage | Free (M0) |
| Gemini API | Free tier | Pay as you go |

**Total: $0 - $10/month** for low-medium traffic

---

## Next Steps After Deployment

1. ✅ Test all features in production
2. ✅ Set up custom domain (optional)
3. ✅ Enable HTTPS (automatic on Vercel/Railway)
4. ✅ Monitor logs for errors
5. ✅ Set up error tracking (Sentry - optional)

---

## Quick Deploy Checklist

- [ ] Push code to GitHub
- [ ] Deploy backend to Railway
- [ ] Set backend environment variables
- [ ] Get backend URL
- [ ] Deploy frontend to Vercel
- [ ] Set `VITE_API_URL` in Vercel
- [ ] Update MongoDB IP whitelist
- [ ] Test the deployed app!

🎉 **Congratulations! Your AI File Assistant is now live!**
