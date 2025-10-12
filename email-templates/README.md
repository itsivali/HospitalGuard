# HospitalGuard Email Templates

## Overview

This directory contains custom branded email templates for HospitalGuard's authentication flows.

## Templates Included

### 1. Confirm Signup (`confirm-signup.html`)
**Purpose:** Sent when a user creates a new account
**Color Scheme:** Purple/Blue gradient
**Features:**
- Welcome message
- Email confirmation button
- Security badge with HIPAA compliance
- 24-hour expiration notice

### 2. Magic Link (`magic-link.html`)
**Purpose:** Sent when a user requests passwordless sign-in
**Color Scheme:** Green gradient
**Features:**
- Secure sign-in button
- 1-hour expiration warning
- Security notice about not sharing the link

### 3. Password Recovery (`recovery.html`)
**Purpose:** Sent when a user requests a password reset
**Color Scheme:** Red gradient
**Features:**
- Password reset button
- Security warning if not requested
- Password security tips
- 1-hour expiration notice

## Design Features

All templates include:
- ✅ HospitalGuard branding
- ✅ Hospital icon logo
- ✅ Responsive design (mobile-friendly)
- ✅ Professional gradient headers
- ✅ Clear call-to-action buttons
- ✅ Security badges and warnings
- ✅ Footer with links and copyright
- ✅ Accessible HTML structure

## Color Palette

### Confirm Signup
- Header: `#667eea` → `#764ba2` (Purple to Violet)
- Button: Same as header
- Accent: Purple tones

### Magic Link
- Header: `#10b981` → `#059669` (Emerald to Green)
- Button: Same as header
- Accent: Green tones

### Password Recovery
- Header: `#ef4444` → `#dc2626` (Red to Dark Red)
- Button: Same as header
- Accent: Red tones

## Supabase Variables

The templates use Supabase's built-in variables:

- `{{ .ConfirmationURL }}` - The action link (confirm email, sign in, reset password)
- `{{ .SiteURL }}` - Your site's URL (automatically set by Supabase)
- `{{ .Token }}` - The confirmation token (used internally)
- `{{ .TokenHash }}` - Token hash (used internally)

## Installation

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/hdpavdwanzydfcudogar
2. Navigate to **Authentication** → **Email Templates**

### Step 2: Update Each Template

**For Confirm Signup:**
1. Click **Confirm signup**
2. Copy entire contents of `confirm-signup.html`
3. Paste into the HTML editor
4. Click **Save**

**For Magic Link:**
1. Click **Magic Link**
2. Copy entire contents of `magic-link.html`
3. Paste into the HTML editor
4. Click **Save**

**For Password Recovery:**
1. Click **Reset Password**
2. Copy entire contents of `recovery.html`
3. Paste into the HTML editor
4. Click **Save**

### Step 3: Test

Send a test email to verify:
1. Create a new account with a real email
2. Check your inbox
3. Verify branding appears correctly
4. Test the confirmation link

## Customization

### Change Colors

Find the gradient in each template and update:

```css
/* Change from purple to blue */
background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);

/* Change from green to teal */
background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);

/* Change from red to orange */
background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
```

### Add Your Logo

Replace the SVG icon with an image:

```html
<div class="logo-container">
  <img src="https://yourdomain.com/logo.png"
       alt="HospitalGuard"
       style="width: 50px; height: 50px;">
</div>
```

### Update Footer Links

Change the footer links to your actual pages:

```html
<div class="footer-links">
  <a href="https://yourdomain.com" class="footer-link">Home</a>
  <a href="https://yourdomain.com/auth" class="footer-link">Sign In</a>
  <a href="https://yourdomain.com/support" class="footer-link">Support</a>
</div>
```

### Change Company Name

Find and replace "HospitalGuard" with your company name throughout the templates.

## Preview

### Confirm Signup Email
```
┌─────────────────────────────────┐
│  [Purple Gradient Header]       │
│  🏥 HospitalGuard               │
│  Secure Hospital Management      │
├─────────────────────────────────┤
│  Welcome to HospitalGuard!      │
│                                  │
│  Thank you for creating an      │
│  account...                     │
│                                  │
│  [Confirm Email Address Button] │
│                                  │
│  🔒 Security Badge              │
│  Enterprise-grade security &     │
│  HIPAA compliance               │
└─────────────────────────────────┘
```

### Magic Link Email
```
┌─────────────────────────────────┐
│  [Green Gradient Header]        │
│  🏥 HospitalGuard               │
│  Secure Access Requested        │
├─────────────────────────────────┤
│  Sign in to your account        │
│                                  │
│  We received a request to       │
│  sign in...                     │
│                                  │
│  [Sign In to HospitalGuard]    │
│                                  │
│  ⚠️ Security Notice             │
│  This link expires in 1 hour    │
└─────────────────────────────────┘
```

### Password Recovery Email
```
┌─────────────────────────────────┐
│  [Red Gradient Header]          │
│  🏥 HospitalGuard               │
│  Password Reset Request         │
├─────────────────────────────────┤
│  Reset your password            │
│                                  │
│  We received a request to       │
│  reset...                       │
│                                  │
│  [Reset Password Button]        │
│                                  │
│  🔐 Security Warning            │
│  If you didn't request this...  │
│                                  │
│  📋 Password Security Tips      │
│  • Use unique passwords         │
│  • 12+ characters               │
│  • Mix uppercase/lowercase      │
└─────────────────────────────────┘
```

## Responsive Design

All templates are mobile-responsive:
- Maximum width: 600px on desktop
- Scales to 100% on mobile
- Touch-friendly buttons
- Readable font sizes
- Proper spacing for small screens

## Email Client Compatibility

Tested and working on:
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Web, Desktop, Mobile)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ Thunderbird

## Security Features

### Confirm Signup
- 24-hour expiration
- HIPAA compliance badge
- Secure HTTPS links

### Magic Link
- 1-hour expiration
- One-time use only
- Security warning about not sharing

### Password Recovery
- 1-hour expiration
- Warning if not requested
- Password security tips
- Recommendation for 2FA

## Troubleshooting

### Emails going to spam
**Solutions:**
1. Configure custom SMTP in Supabase
2. Set up SPF/DKIM records
3. Use a verified sender domain
4. Whitelist sender in email client

### Styling not showing
**Solutions:**
1. Make sure you pasted the ENTIRE HTML
2. Some email clients strip `<style>` tags - use inline styles
3. Test with different email providers

### Links not working
**Solutions:**
1. Verify Supabase Site URL is correct
2. Check redirect URLs in auth settings
3. Ensure HTTPS is enabled

## Production Recommendations

1. **Use Custom SMTP**: Set up SendGrid, AWS SES, or similar
2. **Custom Domain**: Use your own domain for emails
3. **SPF/DKIM**: Configure email authentication
4. **Monitoring**: Set up email delivery monitoring
5. **Rate Limits**: Review and adjust as needed
6. **Fallback**: Have a backup email provider

## Support

For issues with:
- **Templates**: Check HTML in browser first
- **Delivery**: Check Supabase logs
- **Rendering**: Test in multiple email clients
- **Variables**: Verify Supabase settings

---

**Note**: These templates provide a professional, branded experience that matches your HospitalGuard application's luxury design aesthetic.
