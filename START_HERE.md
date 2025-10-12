# 🏥 HospitalGuard - Complete Setup Guide

## 🎯 What You're Setting Up

You're setting up HospitalGuard on your **NEW Supabase database** (not the old Lovable AI one) with:
- Complete database schema (20+ tables)
- Automatic role assignment after email confirmation
- Branded email templates
- Role-based dashboard routing

---

## ⚡ Quick Start (Follow This Order!)

### Step 1: Run Database Schema ⚠️ CRITICAL - DO THIS FIRST

**Why**: Creates all the tables needed for HospitalGuard
**Time**: 5 minutes

1. Open Supabase: https://supabase.com/dashboard/project/hdpavdwanzydfcudogar
2. Go to **SQL Editor**
3. Open file: `supabase-schema.sql` on your computer
4. Copy ENTIRE file (600 lines)
5. Paste into SQL Editor
6. Click **Run**
7. Verify: Go to **Database** → **Tables** - should see 20+ tables including `user_roles`

**Full instructions**: See `DATABASE_SETUP_GUIDE.md` Step 1

---

### Step 2: Run Role Trigger ⚠️ DO THIS SECOND

**Why**: Automatically assigns roles when users confirm email
**Time**: 2 minutes

1. In SQL Editor, click **New query**
2. Open file: `supabase-role-trigger.sql`
3. Copy entire file
4. Paste and click **Run**
5. Verify: Go to **Database** → **Triggers** - should see 2 triggers

**Full instructions**: See `DATABASE_SETUP_GUIDE.md` Step 2

---

### Step 3: Update Email Template

**Why**: Makes confirmation emails branded instead of generic
**Time**: 5 minutes

1. Go to **Authentication** → **Email Templates**
2. Click **"Confirm signup"**
3. Open: `email-templates/confirm-signup.html`
4. Copy ENTIRE file (200+ lines)
5. Paste into Supabase HTML editor (replace everything)
6. Click **Save**

**Full instructions**: See `DATABASE_SETUP_GUIDE.md` Step 4
**If confused**: See `EMAIL_TEMPLATE_PASTE_GUIDE.txt`

---

### Step 4: Test Everything Works

**Time**: 5 minutes

1. Go to http://localhost:8080/auth
2. Sign up with REAL email (e.g., your Outlook.com)
3. Check inbox for BRANDED email (purple gradient, hospital icon)
4. Click confirm link
5. Login
6. **Verify**: No error, redirects to correct dashboard

**Full instructions**: See `DATABASE_SETUP_GUIDE.md` Step 5

---

## ✅ Success Checklist

You'll know it's working when:

**Database:**
- [x] Can see 20+ tables in Supabase
- [x] `user_roles` table exists
- [x] 2 triggers exist on `auth.users`

**Email:**
- [x] Receive confirmation email with HospitalGuard branding
- [x] Purple gradient header
- [x] Hospital icon visible
- [x] Professional design

**Login:**
- [x] Can confirm email without errors
- [x] Can login without "role error"
- [x] Redirected to correct dashboard
- [x] Role visible in `user_roles` table

---

## 📚 Documentation Reference

### Main Guides (Read in Order)
1. **START_HERE.md** ← You are here
2. **DATABASE_SETUP_GUIDE.md** - Complete step-by-step setup
3. **QUICK_FIX_GUIDE.md** - Troubleshooting and fixes
4. **EMAIL_TEMPLATE_PASTE_GUIDE.txt** - Visual guide for pasting templates

### Reference Docs
- **EMAIL_SETUP_GUIDE.md** - Detailed email configuration
- **FIX_SUMMARY.md** - Technical summary of all fixes
- **SETUP.md** - Original setup documentation
- **TESTING.md** - Testing guide

### Files You'll Use
- **supabase-schema.sql** - Database tables (run in Step 1)
- **supabase-role-trigger.sql** - Role automation (run in Step 2)
- **email-templates/*.html** - Branded email templates (use in Step 3)

---

## 🆘 Common Issues

### Issue 1: "relation user_roles does not exist"

**Problem**: You tried to run the trigger before creating tables
**Solution**: Run Step 1 first (database schema), then Step 2 (trigger)

---

### Issue 2: Still getting "Error fetching user role"

**Checklist:**
- [ ] Did Step 1 run? (Check Database → Tables)
- [ ] Did Step 2 run? (Check Database → Triggers)
- [ ] Did user confirm email?
- [ ] Using NEW signup, not old user?

**Quick Fix**: See `QUICK_FIX_GUIDE.md` troubleshooting section

---

### Issue 3: Email still looks generic

**Checklist:**
- [ ] Did you copy ENTIRE HTML file? (200+ lines)
- [ ] Did you click Save in Supabase?
- [ ] Did you use NEW email for testing?

**Quick Fix**: See `EMAIL_TEMPLATE_PASTE_GUIDE.txt`

---

### Issue 4: Which database am I using?

**Your NEW database:**
- URL: https://hdpavdwanzydfcudogar.supabase.co
- Project ID: hdpavdwanzydfcudogar

**Old Lovable AI database** (don't use):
- URL: https://ifcfevbbkprviqadxqag.supabase.co

**Your `.env` is already configured correctly!** ✅

---

## 🚀 After Everything Works

### Optional Improvements:

1. **Test other roles**:
   - Sign up as doctor, nurse, pharmacist
   - Verify correct dashboard routing

2. **Customize email colors**:
   - Edit hex codes in templates
   - Match your brand

3. **Add your logo**:
   - Replace SVG in templates
   - Update footer links

4. **Create test accounts**:
   ```bash
   npm run setup-test-accounts
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

---

## 📞 Need Help?

### View in Supabase:
- **Tables**: Database → Tables
- **Triggers**: Database → Triggers
- **Users**: Authentication → Users
- **Logs**: Logs → Database / Auth Logs

### SQL to Debug:
```sql
-- Check if schema ran
SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Should return 20+ tables

-- Check if triggers exist
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name LIKE '%auth_user%';
-- Should return 2 rows

-- Check recent signups
SELECT id, email, email_confirmed_at, raw_user_meta_data->>'role'
FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Check roles assigned
SELECT * FROM user_roles ORDER BY created_at DESC;
```

---

## 🎓 Understanding the Setup

### What Each Step Does:

**Step 1 - Database Schema**
- Creates 20+ tables for hospital management
- Sets up relationships and constraints
- Prepares database for the app

**Step 2 - Role Trigger**
- Watches for new user confirmations
- Automatically reads role from signup metadata
- Inserts role into `user_roles` table
- Happens AFTER email confirmation

**Step 3 - Email Templates**
- Replaces generic Supabase emails
- Adds HospitalGuard branding
- Makes professional first impression
- Matches app design

**Step 4 - Testing**
- Verifies complete signup flow
- Ensures role assignment works
- Confirms email branding applied
- Validates dashboard routing

---

## 📋 Pre-Setup Checklist

Before starting, make sure you have:

- [x] Node.js installed
- [x] Dependencies installed (`npm install`)
- [x] Supabase account access
- [x] Project URL: hdpavdwanzydfcudogar
- [x] `.env` file configured (already done!)
- [x] Real email account for testing

---

## 🎉 Ready to Start?

### Follow these 4 steps in order:

1. **Read**: `DATABASE_SETUP_GUIDE.md` (it has detailed instructions)
2. **Run**: Database schema SQL
3. **Run**: Role trigger SQL
4. **Update**: Email template
5. **Test**: Signup with real email

**Time needed**: 30 minutes total

**Result**: Fully working HospitalGuard with automatic role assignment and branded emails!

---

## 💡 Pro Tips

1. **Use different emails for testing**:
   - Gmail trick: `yourname+test1@gmail.com`, `yourname+test2@gmail.com`
   - All go to same inbox, but Supabase sees them as different

2. **Check logs when debugging**:
   - Database logs show trigger execution
   - Auth logs show signup/login events
   - Look for "Creating user role for user..." message

3. **Delete and retry if stuck**:
   - Delete test user in Authentication → Users
   - Sign up again with same email
   - Fresh start often fixes issues

4. **Keep documentation open**:
   - Have `DATABASE_SETUP_GUIDE.md` open while working
   - Reference SQL commands as needed
   - Follow troubleshooting steps if issues arise

---

## 📧 Support

If you get completely stuck:

1. Check `QUICK_FIX_GUIDE.md` troubleshooting section
2. Run the debug SQL commands above
3. Check Supabase logs
4. Verify each checklist item

**Most issues are caused by:**
- Not running schema before trigger
- Not copying entire email template
- Testing with old user instead of new signup

**Solution**: Follow the guide step-by-step! ✅

---

**Let's get started!** 🚀

Open `DATABASE_SETUP_GUIDE.md` and follow Step 1.
