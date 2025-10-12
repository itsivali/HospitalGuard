# Quick Fix Guide - Role Error & Email Templates

## 🚨 CRITICAL: Follow These Steps in Order

### Step 1: Run the Database Trigger (5 minutes)

This fixes the "Error fetching user role" issue.

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/hdpavdwanzydfcudogar

2. **Navigate to SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Or go directly to: https://supabase.com/dashboard/project/hdpavdwanzydfcudogar/sql/new

3. **Create New Query**
   - Click **New query** button (top right)

4. **Copy the SQL**
   - Open the file: `supabase-role-trigger.sql`
   - Copy ALL the contents (Ctrl+A, Ctrl+C)

5. **Paste and Run**
   - Paste into the SQL Editor
   - Click **Run** button (or press Ctrl+Enter)
   - Wait for "Success. No rows returned"

6. **Verify Trigger Created**
   - Go to **Database** → **Triggers** (in left sidebar)
   - You should see:
     - ✅ `on_auth_user_created`
     - ✅ `on_auth_user_created_immediate`

---

### Step 2: Set Up Email Templates (10 minutes)

This fixes the generic email issue.

#### A. Access Email Templates

1. **Open Authentication Settings**
   - In Supabase dashboard, click **Authentication** (left sidebar)
   - Click **Email Templates** sub-menu
   - Or go to: https://supabase.com/dashboard/project/hdpavdwanzydfcudogar/auth/templates

2. **You'll see 4 templates:**
   - Confirm signup
   - Invite user
   - Magic Link
   - Reset Password

#### B. Update Confirm Signup Template

1. **Click "Confirm signup"**

2. **See the current template:**
   ```
   Subject: Confirm Your Signup

   <h2>Confirm your signup</h2>
   ...generic HTML...
   ```

3. **Replace with branded template:**
   - Open: `email-templates/confirm-signup.html`
   - Copy ALL contents (it's long - about 200 lines)
   - Paste into the Supabase editor (replace everything)

4. **Keep the Subject line or change to:**
   ```
   Welcome to HospitalGuard - Confirm Your Email
   ```

5. **Click "Save" button** (bottom right)

6. **You should see:** "Successfully updated"

#### C. Update Magic Link Template (Optional but Recommended)

1. **Click "Magic Link"**

2. **Replace with:**
   - Open: `email-templates/magic-link.html`
   - Copy all contents
   - Paste into editor

3. **Update Subject to:**
   ```
   Sign In to HospitalGuard
   ```

4. **Click "Save"**

#### D. Update Reset Password Template (Optional but Recommended)

1. **Click "Reset Password"**

2. **Replace with:**
   - Open: `email-templates/recovery.html`
   - Copy all contents
   - Paste into editor

3. **Update Subject to:**
   ```
   Reset Your HospitalGuard Password
   ```

4. **Click "Save"**

---

### Step 3: Test the Complete Flow (5 minutes)

#### A. Delete Old Test User (if exists)

1. **Go to Authentication → Users**
2. **Find your test email** (the one that had the error)
3. **Click the "..." menu** → **Delete user**
4. **Confirm deletion**

#### B. Test New Signup

1. **Open your app:** http://localhost:8080/auth

2. **Click Sign Up tab**

3. **Fill in form with REAL email:**
   ```
   Full Name: Test User
   Email: your-real-email@outlook.com
   Phone: (optional)
   Role: Patient
   Password: test123456
   ```

4. **Click "Create Account"**

5. **You should see toast:** "Check your email! We've sent you a confirmation link..."

#### C. Check Email

1. **Open your email inbox** (Outlook, Gmail, etc.)

2. **Look for email from Supabase**
   - From: `noreply@mail.app.supabase.io`
   - Subject: "Welcome to HospitalGuard - Confirm Your Email"

3. **Verify branded template:**
   - ✅ Purple gradient header
   - ✅ Hospital icon
   - ✅ "HospitalGuard" title
   - ✅ "Confirm Email Address" button
   - ✅ HIPAA security badge

4. **Click "Confirm Email Address" button**

#### D. Verify Login Works

1. **After clicking confirm**, you should be redirected to app

2. **If not logged in automatically**, go to http://localhost:8080/auth

3. **Login with your email and password**

4. **Verify:**
   - ✅ NO "Error fetching user role" message
   - ✅ Redirected to `/patient-dashboard` (or your chosen role)
   - ✅ Dashboard loads correctly

#### E. Verify Role in Database

1. **Go to Supabase** → **Table Editor** → **user_roles**

2. **Find your user:**
   - user_id: (your UUID)
   - role: patient (or whatever you selected)

3. **If role exists:** ✅ Everything is working!

---

## Troubleshooting

### ❌ Problem: Still getting role error

**Solution 1: Check if trigger exists**
```sql
-- Run this in SQL Editor
SELECT * FROM information_schema.triggers
WHERE trigger_name LIKE 'on_auth_user%';
```

**Should return 2 rows**. If not, re-run Step 1.

**Solution 2: Manually insert role**
```sql
-- Get your user ID first
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Then insert role (replace USER_ID_HERE)
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'patient')
ON CONFLICT (user_id) DO UPDATE SET role = 'patient';
```

### ❌ Problem: Email still looks generic

**Checklist:**
- [ ] Did you copy the ENTIRE HTML file? (200+ lines)
- [ ] Did you click "Save" button?
- [ ] Did you refresh the Email Templates page?
- [ ] Try signing up with a new email (not the old one)

**Solution: Re-do Step 2**
1. Go back to Email Templates
2. Click "Confirm signup"
3. Verify the HTML has `<h1>HospitalGuard</h1>` in it
4. If not, copy-paste again from `email-templates/confirm-signup.html`

### ❌ Problem: Not receiving emails

**Solution 1: Check spam folder**
- Look in Junk/Spam
- Add `noreply@mail.app.supabase.io` to contacts

**Solution 2: Check email settings**
1. Go to **Authentication** → **Providers** → **Email**
2. Verify "Enable Email provider" is ON
3. Check "Confirm email" is ENABLED (for production)

**Solution 3: Check rate limits**
- Supabase free tier: 4 emails per hour per user
- Wait 15 minutes and try again

### ❌ Problem: Trigger not firing

**Check logs:**
1. Go to **Logs** → **Database Logs**
2. Look for: "Creating user role for user..."
3. If you see it: trigger is working
4. If not: re-run the trigger SQL

**Alternative: Run trigger manually**
```sql
-- Run this after user confirms email
SELECT handle_new_user();
```

---

## Verification Checklist

Before considering this fixed, verify:

- [ ] Trigger `on_auth_user_created` exists in Database → Triggers
- [ ] Trigger `on_auth_user_created_immediate` exists
- [ ] Confirm signup email template updated (check in Email Templates)
- [ ] Test email received with HospitalGuard branding
- [ ] Can confirm email without errors
- [ ] Can login without "role error"
- [ ] Redirected to correct dashboard
- [ ] Role visible in `user_roles` table

---

## Common Mistakes

### ❌ Mistake 1: Not running the trigger SQL
**Symptom:** Still getting role errors
**Fix:** Re-read Step 1 and run the SQL

### ❌ Mistake 2: Only copying part of email template
**Symptom:** Email looks broken or still generic
**Fix:** Copy from `<!DOCTYPE html>` to `</html>` (entire file)

### ❌ Mistake 3: Not deleting old test user
**Symptom:** Old user doesn't have role
**Fix:** Delete user, re-signup

### ❌ Mistake 4: Expecting instant results
**Symptom:** Role not appearing immediately
**Fix:** Trigger fires when email is CONFIRMED, not when signup happens

---

## Testing Multiple Roles

Want to test different roles?

1. **Sign up with different emails:**
   - `yourname+patient@gmail.com` → Role: Patient
   - `yourname+doctor@gmail.com` → Role: Doctor
   - `yourname+nurse@gmail.com` → Role: Nurse

2. **Gmail tip:** `+anything` goes to same inbox

3. **Verify each redirects correctly:**
   - Patient → `/patient-dashboard`
   - Doctor → `/doctor-dashboard`
   - Nurse → `/nurse-dashboard`

---

## Success Indicators

You'll know it's working when:

✅ **Email:**
- Subject: "Welcome to HospitalGuard..."
- Purple gradient header
- Hospital icon visible
- Professional, branded design

✅ **After Confirmation:**
- No error messages
- Automatic redirect to dashboard
- Correct role-based dashboard shows

✅ **In Database:**
- User exists in `auth.users`
- Role exists in `user_roles`
- email_confirmed_at is not null

✅ **In Logs:**
- "Creating user role for user..." message
- No error messages

---

## Next Steps After Success

1. **Customize email colors** (optional)
   - Edit hex codes in email templates
   - Match your brand colors

2. **Add your logo** (optional)
   - Replace SVG with your logo image
   - Update footer links

3. **Test all flows:**
   - Password recovery
   - Magic link sign in
   - Different roles

4. **Set up for production:**
   - Configure custom SMTP
   - Add custom domain
   - Enable 2FA

---

## Need Help?

**Check logs:**
- Supabase → Logs → Auth Logs
- Supabase → Logs → Database Logs
- Browser console (F12)

**Verify setup:**
```sql
-- Check trigger function exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Check triggers exist
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name LIKE '%auth_user%';

-- Check recent users
SELECT id, email, email_confirmed_at, raw_user_meta_data->>'role' as metadata_role
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Check user roles
SELECT ur.*, u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.created_at DESC;
```

---

**Remember:** The trigger only fires when email is CONFIRMED, not at signup!
