# 🚀 Quick Deploy Guide - HospitalGuard to Netlify

Get HospitalGuard deployed to Netlify in **5 minutes**!

## Step 1: Prepare Your Code (2 minutes)

```bash
# Ensure all changes are committed
git add .
git commit -m "feat: Ready for deployment"
git push origin main
```

## Step 2: Deploy to Netlify (3 minutes)

### Option A: One-Click Deploy (Fastest) ⚡

1. Click this button:
   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

2. Connect your GitHub repository

3. Add environment variables when prompted:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key

4. Click **Deploy site**

### Option B: Manual Deploy via Netlify UI

1. **Go to Netlify**: https://app.netlify.com

2. **Click "Add new site"** → "Import an existing project"

3. **Choose GitHub** and authorize

4. **Select repository**: `HospitalGuard`

5. **Configure build**:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

6. **Add environment variables**:
   - Go to **Site settings** → **Environment variables**
   - Add:
     - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
     - `VITE_SUPABASE_PUBLISHABLE_KEY` = `your-anon-key`

7. **Click "Deploy site"**

8. **Wait ~2 minutes** for the build to complete

9. **Done!** Your site is live at `https://your-site.netlify.app`

## Step 3: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon public key** → Use as `VITE_SUPABASE_PUBLISHABLE_KEY`

## Step 4: Setup CI/CD (1 minute)

Add these secrets to GitHub for automatic deployments:

1. Go to **GitHub repo** → **Settings** → **Secrets and variables** → **Actions**

2. Add these secrets:
   ```
   NETLIFY_AUTH_TOKEN = (Get from Netlify User Settings → Applications)
   NETLIFY_SITE_ID = (Get from Netlify Site Settings → Site details)
   VITE_SUPABASE_URL = (Your Supabase URL)
   VITE_SUPABASE_PUBLISHABLE_KEY = (Your Supabase anon key)
   ```

3. Now every push to `main` automatically deploys! 🎉

## Verification Checklist ✅

After deployment, verify:

- [ ] Site loads at your Netlify URL
- [ ] No console errors (press F12)
- [ ] Login/signup works
- [ ] Dashboard loads after login
- [ ] Data loads from database

## Common Issues & Quick Fixes

### Issue: Build fails
**Fix**: Check environment variables are set correctly

### Issue: White screen after deploy
**Fix**: Check browser console for errors, verify Supabase credentials

### Issue: Routes return 404
**Fix**: Already fixed in `netlify.toml` - if issue persists, contact support

## Next Steps

- 📝 [Full Deployment Guide](./DEPLOYMENT.md)
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- 🔧 Configure custom domain (optional)
- 📊 Enable Netlify Analytics (optional)

## Support

- **Netlify**: https://answers.netlify.com
- **Supabase**: https://supabase.com/support

---

**That's it! Your hospital management system is now live! 🏥🚀**
