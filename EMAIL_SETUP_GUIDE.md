# Email Configuration Guide for HospitalGuard

## Overview

This guide will help you:
1. Fix the role assignment issue for new signups with email confirmation
2. Customize Supabase email templates with HospitalGuard branding

## Problem Statement

When users sign up with a real email (like Outlook.com) and confirm their email, they get an "Error fetching user role" because the role isn't automatically assigned after email confirmation.

## Solution

### Part 1: Database Trigger for Automatic Role Assignment

#### Step 1: Run the Database Trigger SQL

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/hdpavdwanzydfcudogar

2. Navigate to **SQL Editor** in the left sidebar

3. Create a new query and copy the contents of `supabase-role-trigger.sql`

4. Click **Run** to execute the SQL

**What this does:**
- Creates a database function that automatically assigns roles to new users
- Sets up a trigger that runs after a user confirms their email
- Reads the role from user metadata (set during signup)
- Inserts the role into the `user_roles` table
- Defaults to 'patient' if no role is specified

#### Step 2: Verify the Trigger

After running the SQL, verify it worked:

1. Go to **Database** → **Functions** in Supabase
2. You should see a function called `handle_new_user`

3. Go to **Database** → **Triggers**
4. You should see a trigger called `on_auth_user_created` on the `auth.users` table

### Part 2: Customize Email Templates

#### Step 1: Access Email Templates

1. Go to your Supabase dashboard

2. Navigate to **Authentication** → **Email Templates** in the left sidebar

#### Step 2: Update Confirmation Email

1. Click on **Confirm signup** template

2. Replace the entire HTML with the contents of `email-templates/confirm-signup.html`

3. Click **Save**

**Template Features:**
- HospitalGuard branding with gradient header
- Hospital icon logo
- Professional, modern design
- Security badge highlighting HIPAA compliance
- Responsive design for mobile devices
- Clear call-to-action button

#### Step 3: Update Magic Link Email (Optional)

1. Click on **Magic Link** template

2. Replace the HTML with contents of `email-templates/magic-link.html`

3. Click **Save**

**Template Features:**
- Green color scheme for sign-in actions
- Security warning about link expiration
- Same professional branding

#### Step 4: Update Password Recovery Email

1. Click on **Reset Password** template

2. Replace the HTML with contents of `email-templates/recovery.html`

3. Click **Save**

**Template Features:**
- Red color scheme for security actions
- Password security tips
- Warning if request wasn't made by user
- Professional, reassuring design

### Part 3: Test the Complete Flow

#### Test 1: New User Signup with Real Email

1. Navigate to http://localhost:8080/auth

2. Click **Sign Up** tab

3. Fill in the form with a real email (e.g., your Outlook.com email):
   - Full Name: Test User
   - Email: your-real-email@outlook.com
   - Password: test123456
   - Role: Patient (or any role)

4. Click **Create Account**

5. Check your email inbox for the confirmation email

6. **Verify**: Email should have HospitalGuard branding

7. Click **Confirm Email Address** button in the email

8. You should be redirected to the dashboard

9. **Verify**: You should NOT see "Error fetching user role"

10. **Verify**: You should be redirected to the correct role-based dashboard

#### Test 2: Verify Role Assignment

After confirming your email and logging in:

1. Go to your Supabase dashboard

2. Navigate to **Table Editor** → **user_roles**

3. Find your user entry

4. **Verify**: Your user_id should have the correct role assigned

#### Test 3: Login with Confirmed Account

1. Log out from the app

2. Go back to http://localhost:8080/auth

3. Login with your confirmed email and password

4. **Verify**: You should be redirected to the correct dashboard without any errors

## Troubleshooting

### Issue: Still getting "Error fetching user role"

**Possible Causes:**
1. Database trigger wasn't created successfully
2. User signed up before trigger was created
3. Email wasn't confirmed

**Solutions:**

**A. Verify Trigger Exists:**
```sql
-- Run this in SQL Editor to check if trigger exists
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**B. Manually Insert Role for Existing User:**
```sql
-- Replace USER_ID with your actual user ID from auth.users table
-- Replace 'patient' with the desired role
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID', 'patient')
ON CONFLICT (user_id) DO UPDATE SET role = 'patient';
```

**C. Find Your User ID:**
1. Go to **Authentication** → **Users**
2. Find your email
3. Copy the UUID (user ID)
4. Use it in the SQL above

### Issue: Email templates not showing correctly

**Solution:**
1. Make sure you copied the ENTIRE HTML content
2. Click **Save** after pasting
3. Send a test email to verify

### Issue: Confirmation link expired

**Solution:**
1. Delete the old user from **Authentication** → **Users**
2. Sign up again with the same email
3. Confirm within 24 hours

### Issue: Not receiving confirmation emails

**Possible Causes:**
1. Email went to spam folder
2. Supabase email sending is rate-limited
3. Email provider blocked the email

**Solutions:**
1. Check your spam/junk folder
2. Add `noreply@mail.app.supabase.io` to your contacts
3. Wait a few minutes and try again
4. Use a different email provider (Gmail usually works well)

## Email Template Customization

### Changing Colors

The email templates use gradient colors. To customize:

**Confirm Signup (Purple/Blue):**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Magic Link (Green):**
```css
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
```

**Password Recovery (Red):**
```css
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

Change these hex codes to your preferred colors.

### Adding Your Logo

Replace the SVG icon with your logo:

```html
<!-- Instead of SVG, use an image -->
<img src="https://yourdomain.com/logo.png" alt="HospitalGuard" style="width: 50px; height: 50px;">
```

### Changing Footer Links

Update the footer links to point to your actual pages:

```html
<a href="https://yourdomain.com" class="footer-link">Home</a>
<a href="https://yourdomain.com/auth" class="footer-link">Sign In</a>
<a href="https://yourdomain.com/support" class="footer-link">Support</a>
```

## Supabase Email Settings

### Disable Email Confirmation (For Testing Only)

If you want to test without email confirmation:

1. Go to **Authentication** → **Providers** → **Email**
2. Uncheck **Confirm email**
3. Click **Save**

**Warning:** Only do this for testing. Always enable email confirmation in production.

### Configure Email Rate Limits

Free tier limits:
- 4 emails per hour per user
- Consider upgrading to Pro for production use

### Use Custom SMTP (Production)

For production, use your own email service:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure with your email provider (SendGrid, AWS SES, etc.)
3. This removes Supabase rate limits and adds your sender domain

## Testing Checklist

- [ ] Database trigger created successfully
- [ ] Trigger visible in Database → Triggers
- [ ] Confirmation email template updated
- [ ] Magic link email template updated (optional)
- [ ] Password recovery template updated (optional)
- [ ] Test signup with real email
- [ ] Receive branded confirmation email
- [ ] Click confirmation link
- [ ] Redirect to dashboard works
- [ ] No "Error fetching user role" message
- [ ] Correct role-based dashboard displays
- [ ] Role visible in user_roles table
- [ ] Can log out and log back in successfully

## Next Steps After Setup

1. **Test with multiple roles**: Sign up as patient, doctor, nurse, etc.

2. **Test password recovery**: Use the "Forgot Password" flow

3. **Monitor email delivery**: Check Supabase logs for email sending issues

4. **Set up custom domain**: Configure your own email sending domain

5. **Enable 2FA**: Set up two-factor authentication for extra security

## Production Checklist

Before going live:

- [ ] Custom SMTP configured
- [ ] Email confirmation enabled
- [ ] Email templates tested with all providers (Gmail, Outlook, etc.)
- [ ] Database trigger tested
- [ ] Rate limits reviewed
- [ ] Backup email templates saved
- [ ] Error monitoring set up
- [ ] User role assignment verified for all role types

## Support

If you encounter issues:

1. Check Supabase logs: **Logs** → **Auth Logs**
2. Check database logs: **Logs** → **Database Logs**
3. Review console errors in browser DevTools
4. Verify trigger execution in database logs

---

**Summary:**
- Database trigger automatically assigns roles after email confirmation
- Custom email templates provide professional, branded experience
- All user flows (signup, login, password recovery) now work correctly
- No more "Error fetching user role" messages
