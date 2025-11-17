# HospitalGuard Deployment Checklist

Use this checklist to ensure a smooth deployment to Netlify.

## Pre-Deployment Checklist

### Code Preparation
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] All environment variables configured locally
- [ ] Build succeeds locally (`npm run build`)
- [ ] Preview works locally (`npm run preview`)
- [ ] All tests passing (`npm run test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Code committed to Git
- [ ] `.env` file is NOT committed (check `.gitignore`)

### Database Setup (Supabase)
- [ ] Supabase project created
- [ ] Database schema deployed (`hospital-database.sql`)
- [ ] Seed data loaded (`hospital-seed.sql`)
- [ ] Row-level security (RLS) policies enabled
- [ ] API keys copied (URL and anon key)
- [ ] Storage buckets created (if needed)
- [ ] Database backups configured

### Repository Setup
- [ ] Code pushed to GitHub
- [ ] Repository is public or Netlify has access
- [ ] Main branch exists
- [ ] Dev branch created (optional)
- [ ] Branch protection rules set (optional)

## Netlify Setup Checklist

### Account & Site Setup
- [ ] Netlify account created
- [ ] Site created from GitHub repository
- [ ] Build settings configured:
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Node version: 18

### Environment Variables
- [ ] `VITE_SUPABASE_URL` set
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` set
- [ ] All other required variables set
- [ ] Variables set for all contexts (production, preview)

### Site Configuration
- [ ] Custom domain added (optional)
- [ ] HTTPS enabled (automatic)
- [ ] Redirects configured (in `netlify.toml`)
- [ ] Headers configured (in `netlify.toml`)
- [ ] Build hooks created (optional)

## CI/CD Setup Checklist

### GitHub Secrets
- [ ] `NETLIFY_AUTH_TOKEN` added
- [ ] `NETLIFY_SITE_ID` added
- [ ] `VITE_SUPABASE_URL` added
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` added

### GitHub Actions
- [ ] Workflow file exists (`.github/workflows/deploy.yml`)
- [ ] Workflow triggers on main branch
- [ ] Workflow triggers on pull requests
- [ ] Manual workflow trigger enabled

## First Deployment Checklist

### Initial Deploy
- [ ] Trigger first deployment (push to main)
- [ ] Build completes successfully
- [ ] No build errors in logs
- [ ] Site is accessible at Netlify URL
- [ ] All routes work (no 404s)

### Functionality Testing
- [ ] Homepage loads correctly
- [ ] Authentication works (login/signup)
- [ ] Dashboard loads after login
- [ ] All department tabs work
- [ ] Data loads from Supabase
- [ ] Forms submit successfully
- [ ] No console errors in production
- [ ] Mobile responsive design works

### Performance Testing
- [ ] Lighthouse score checked
- [ ] Page load time acceptable (<3s)
- [ ] Images load correctly
- [ ] Assets cached properly

## Post-Deployment Checklist

### Monitoring Setup
- [ ] Netlify Analytics enabled
- [ ] Error tracking configured (optional)
- [ ] Uptime monitoring set up (optional)
- [ ] Log aggregation configured (optional)

### Documentation
- [ ] Deployment URL documented
- [ ] Admin credentials secured
- [ ] API endpoints documented
- [ ] Deployment process documented
- [ ] Team members notified

### Security
- [ ] HTTPS working
- [ ] Security headers verified
- [ ] API keys not exposed in client
- [ ] No sensitive data in logs
- [ ] RLS policies tested in production

### Backup & Recovery
- [ ] Database backup schedule confirmed
- [ ] Rollback procedure tested
- [ ] Recovery time objective (RTO) defined
- [ ] Disaster recovery plan documented

## Continuous Deployment Checklist

### For Each Deployment
- [ ] Feature branch tested locally
- [ ] Pull request created
- [ ] Preview deployment reviewed
- [ ] Code review completed
- [ ] Tests passing in CI/CD
- [ ] Merge approved
- [ ] Production deployment successful
- [ ] Smoke tests passed
- [ ] Rollback plan ready

### Weekly Tasks
- [ ] Review deployment logs
- [ ] Check error rates
- [ ] Review performance metrics
- [ ] Update dependencies (if needed)
- [ ] Review security alerts

### Monthly Tasks
- [ ] Full system backup
- [ ] Review and update documentation
- [ ] Performance audit
- [ ] Security audit
- [ ] Cost review

## Troubleshooting Checklist

If deployment fails, check:
- [ ] Build logs in Netlify
- [ ] GitHub Actions logs
- [ ] Environment variables set correctly
- [ ] Node version matches local
- [ ] Package versions compatible
- [ ] Supabase connection working
- [ ] No missing dependencies
- [ ] `netlify.toml` syntax correct

## Emergency Rollback Checklist

If critical issue found:
1. [ ] Identify last working deployment
2. [ ] Click "Publish deploy" on last good version
3. [ ] Verify rollback successful
4. [ ] Notify team
5. [ ] Investigate issue
6. [ ] Create hotfix branch
7. [ ] Deploy fix
8. [ ] Document incident

## Success Criteria

Deployment is successful when:
- ✅ Site is live and accessible
- ✅ All features work as expected
- ✅ No console errors
- ✅ Authentication working
- ✅ Database connections working
- ✅ Performance metrics acceptable
- ✅ Security headers present
- ✅ HTTPS enabled
- ✅ Mobile responsive
- ✅ CI/CD pipeline functional

---

## Quick Commands Reference

```bash
# Test build locally
npm run build

# Preview production build
npm run preview

# Deploy to Netlify (CLI)
netlify deploy --prod

# Check status
netlify status

# View logs
netlify logs

# Rollback (via Git)
git revert HEAD
git push origin main
```

## Support Contacts

- **Netlify Support**: https://answers.netlify.com
- **Supabase Support**: https://supabase.com/support
- **GitHub Actions**: https://github.community

---

**Last Updated**: Ready for deployment
**Next Review**: After first deployment
