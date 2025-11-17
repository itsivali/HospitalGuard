# HospitalGuard - Deployment Guide

Complete guide for deploying HospitalGuard to Netlify with CI/CD pipelines.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Deploy to Netlify](#quick-deploy-to-netlify)
- [Environment Variables Setup](#environment-variables-setup)
- [CI/CD Pipeline Configuration](#cicd-pipeline-configuration)
- [Deployment Workflows](#deployment-workflows)
- [Post-Deployment Steps](#post-deployment-steps)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ GitHub account
- ✅ Netlify account ([Sign up free](https://app.netlify.com/signup))
- ✅ Supabase project ([Create one](https://app.supabase.com))
- ✅ Git repository initialized

## Quick Deploy to Netlify

### Option 1: Deploy via Netlify UI (Recommended for First Deploy)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "feat: Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your `HospitalGuard` repository

3. **Configure Build Settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (leave empty)

4. **Set Environment Variables** (See [Environment Variables](#environment-variables-setup) below)

5. **Deploy!**
   - Click "Deploy site"
   - Wait for the build to complete (~2-5 minutes)

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   # Deploy to preview
   netlify deploy

   # Deploy to production
   netlify deploy --prod
   ```

### Option 3: One-Click Deploy Button

Click this button to deploy instantly:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/HospitalGuard)

## Environment Variables Setup

### Required Environment Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`

### Setting Environment Variables in Netlify

#### Via UI:
1. Go to **Site Settings** → **Environment Variables**
2. Click **Add a variable**
3. Enter variable name and value
4. Click **Create variable**
5. Repeat for all variables

#### Via Netlify CLI:
```bash
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_PUBLISHABLE_KEY "your-anon-key"
```

### Environment-Specific Variables

For different environments (dev, staging, production):

```bash
# Production only
netlify env:set VITE_SUPABASE_URL "https://prod.supabase.co" --context production

# Deploy previews
netlify env:set VITE_SUPABASE_URL "https://dev.supabase.co" --context deploy-preview

# Branch deploys
netlify env:set VITE_SUPABASE_URL "https://dev.supabase.co" --context branch-deploy
```

## CI/CD Pipeline Configuration

The project includes automated CI/CD using GitHub Actions.

### GitHub Secrets Setup

Add these secrets to your GitHub repository:

1. Go to **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Where to Get It | Description |
|------------|-----------------|-------------|
| `NETLIFY_AUTH_TOKEN` | [Netlify User Settings → Applications](https://app.netlify.com/user/applications) | Personal access token |
| `NETLIFY_SITE_ID` | Site Settings → General → Site details | Site API ID |
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API | Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Settings → API | Anon public key |

### Getting Netlify Auth Token

1. Go to [Netlify User Settings](https://app.netlify.com/user/applications)
2. Scroll to **Personal access tokens**
3. Click **New access token**
4. Give it a name (e.g., "GitHub Actions")
5. Copy the token and add it to GitHub secrets as `NETLIFY_AUTH_TOKEN`

### Getting Netlify Site ID

1. Go to your site in Netlify Dashboard
2. Go to **Site Settings** → **General**
3. Find **Site information** section
4. Copy **API ID** and add it to GitHub secrets as `NETLIFY_SITE_ID`

## Deployment Workflows

### Automatic Deployments

The CI/CD pipeline automatically deploys on:

#### Production Deployment (main branch)
```bash
# Any push to main branch triggers production deployment
git checkout main
git add .
git commit -m "feat: New feature"
git push origin main
```

#### Preview Deployment (dev branch)
```bash
# Any push to dev branch triggers preview deployment
git checkout dev
git add .
git commit -m "feat: Testing new feature"
git push origin dev
```

#### Pull Request Preview
```bash
# Create a pull request to main or dev
git checkout -b feature/new-feature
git add .
git commit -m "feat: Add new feature"
git push origin feature/new-feature
# Create PR on GitHub
```

### Manual Deployments

Trigger deployments manually from GitHub Actions tab:

1. Go to **GitHub Repository** → **Actions**
2. Select **Deploy to Netlify** workflow
3. Click **Run workflow**
4. Choose branch and click **Run workflow**

## Post-Deployment Steps

### 1. Verify Deployment

- ✅ Visit your site URL: `https://your-site.netlify.app`
- ✅ Check all routes work (React Router)
- ✅ Test authentication flow
- ✅ Verify database connections
- ✅ Test all dashboard features

### 2. Custom Domain Setup (Optional)

1. Go to **Site Settings** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `hospitalguard.com`)
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Netlify)

### 3. Configure Redirects

Already configured in `netlify.toml` for SPA routing:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. Set Up Monitoring

Enable Netlify Analytics:
1. Go to **Site Settings** → **Analytics**
2. Enable analytics for your site

### 5. Performance Optimization

- ✅ Lighthouse plugin enabled (see `netlify.toml`)
- ✅ Asset caching configured (1 year for static assets)
- ✅ Security headers enabled
- ✅ Gzip compression enabled by default

## Branch Strategy

Recommended Git workflow:

```
main (production)
  ↓
dev (development)
  ↓
feature/* (feature branches)
```

### Development Workflow

```bash
# 1. Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: Add new feature"

# 3. Push and create PR to dev
git push origin feature/new-feature
# Create PR to dev on GitHub

# 4. After approval, merge to dev (triggers preview deploy)
# Merge PR on GitHub

# 5. When ready for production, create PR from dev to main
# Create PR from dev to main
# After approval, merge triggers production deploy
```

## Rollback Strategy

### Quick Rollback via Netlify

1. Go to **Deploys** tab in Netlify
2. Find the last working deployment
3. Click **⋯** → **Publish deploy**

### Rollback via Git

```bash
# Find the commit hash of last working version
git log

# Create a revert commit
git revert <commit-hash>
git push origin main
```

## Monitoring and Logs

### Build Logs

- View in Netlify: **Deploys** → Click on deploy → View logs
- View in GitHub Actions: **Actions** tab → Select workflow run

### Application Logs

Check browser console for client-side errors:
```javascript
// Add this to track errors in production
window.addEventListener('error', (event) => {
  console.error('Error caught:', event.error);
});
```

## Troubleshooting

### Build Fails

**Issue:** Build fails with "Module not found"
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue:** Environment variables not available
```bash
# Solution: Check that variables are prefixed with VITE_
# ✅ VITE_SUPABASE_URL
# ❌ SUPABASE_URL (won't work in Vite)
```

### Deployment Issues

**Issue:** Site shows 404 on routes
```toml
# Solution: Ensure redirect rule exists in netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Issue:** White screen after deploy
```bash
# Check console errors
# Usually caused by:
# - Missing environment variables
# - API endpoint issues
# - CORS problems
```

### CI/CD Pipeline Issues

**Issue:** GitHub Actions workflow not triggering
```yaml
# Check workflow file syntax
# Ensure secrets are set in GitHub repository
# Check branch protection rules
```

**Issue:** Netlify deploy fails in CI/CD
```bash
# Verify secrets in GitHub:
# - NETLIFY_AUTH_TOKEN
# - NETLIFY_SITE_ID
# Check token permissions in Netlify
```

## Performance Tips

1. **Enable Netlify Edge**: Faster global delivery
2. **Asset Optimization**: Images, fonts, and scripts are optimized
3. **Lazy Loading**: Components load on demand
4. **Code Splitting**: Vite automatically splits code
5. **CDN Caching**: Static assets cached for 1 year

## Security Best Practices

- ✅ Never commit `.env` file
- ✅ Use environment variables for secrets
- ✅ Enable HTTPS (automatic on Netlify)
- ✅ Security headers configured in `netlify.toml`
- ✅ Row-level security enabled in Supabase
- ✅ API keys are public (anon key only)

## Cost Estimates

### Netlify Free Tier
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ✅ Branch previews

### Supabase Free Tier
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth

**Total Cost: $0/month** (for small to medium traffic)

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: Create an issue in the repository
- **Community**: Join discussions in the repository

## Next Steps

After successful deployment:

1. ✅ Set up custom domain
2. ✅ Configure email notifications
3. ✅ Set up error tracking (Sentry)
4. ✅ Configure analytics
5. ✅ Set up backup strategy for Supabase
6. ✅ Document API endpoints
7. ✅ Create user documentation

---

**Happy Deploying! 🚀**

For issues or questions, open a GitHub issue or check the documentation.
