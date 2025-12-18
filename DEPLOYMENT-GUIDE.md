# 🚀 Deployment Guide - Napa Valley Wineries Platform

## 📋 Overview

This guide walks you through deploying the platform using a **FREE/affordable** stack:
- **Vercel** (FREE) - Hosting
- **MongoDB Atlas** (FREE) - Database
- **Hostinger** ($3/month) - Domain
- **SendGrid** (FREE) - Email
- **Cloudinary** (FREE) - Images
- **Gemini API** (FREE) - AI features

**Total Cost: ~$3/month** 🎉

---

## 🎯 **Phase 1: Database Setup (MongoDB Atlas)**

### **Step 1: Create MongoDB Atlas Account**

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub (easier)
3. Choose: **"Shared" cluster** (FREE tier)
4. Select: **AWS** provider
5. Region: **US East (N. Virginia)** - us-east-1
6. Cluster Name: `napa-wineries-prod`
7. Click: **"Create Cluster"** (takes 3-5 minutes)

### **Step 2: Configure Database Access**

1. In Atlas dashboard, go to: **"Database Access"**
2. Click: **"Add New Database User"**
3. Create user:
   ```
   Username: napa-admin
   Password: [Generate secure password]
   Role: Atlas admin
   ```
4. **SAVE THIS PASSWORD!** You'll need it for environment variables

### **Step 3: Configure Network Access**

1. Go to: **"Network Access"**
2. Click: **"Add IP Address"**
3. Choose: **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is safe for Vercel's serverless functions
4. Click: **"Confirm"**

### **Step 4: Get Connection String**

1. Go to: **"Database"** → **"Connect"**
2. Choose: **"Connect your application"**
3. Driver: **Node.js**
4. Version: **5.5 or later**
5. Copy connection string:
   ```
   mongodb+srv://napa-admin:<password>@napa-wineries-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. **Save this string!** You'll add it to Vercel environment variables

### **Step 5: Create Database**

1. In connection string, add database name:
   ```
   mongodb+srv://napa-admin:<password>@napa-wineries-prod.xxxxx.mongodb.net/nvw?retryWrites=true&w=majority
   ```
   (Added `/nvw` before the `?`)

---

## 🚀 **Phase 2: Vercel Deployment**

### **Step 1: Connect GitHub Repository**

1. Go to: https://vercel.com/signup
2. Sign up with GitHub
3. Click: **"Import Project"**
4. Select repository: **"Pablodd1/nvm"**
5. Click: **"Import"**

### **Step 2: Configure Project**

1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** `./` (default)
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `.next` (default)

### **Step 3: Environment Variables**

Click **"Environment Variables"** and add:

```bash
# Database
MONGODB_URI=mongodb+srv://napa-admin:<password>@napa-wineries-prod.xxxxx.mongodb.net/nvw?retryWrites=true&w=majority

# JWT Secret (generate a random 32-character string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App URL (will be provided by Vercel after first deploy)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Email (Ethereal for testing, SendGrid for production)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your-ethereal-user
EMAIL_PASS=your-ethereal-pass

# Stripe (use test keys initially)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google Maps (optional, for map features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Gemini API (for AI features)
GEMINI_API_KEY=your-gemini-api-key
```

### **Step 4: Deploy**

1. Click: **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://nvm-xxxxx.vercel.app`
4. Click the URL to view your deployed app! 🎉

### **Step 5: Update App URL**

1. Copy your Vercel URL
2. Go back to Vercel dashboard
3. Settings → Environment Variables
4. Update `NEXT_PUBLIC_APP_URL` with your Vercel URL
5. Redeploy (automatic)

---

## 🌐 **Phase 3: Custom Domain (Hostinger)**

### **Step 1: Purchase Domain**

1. Go to: https://www.hostinger.com/domain-checker
2. Search: `napavalleywineries.com` (or your preferred name)
3. Purchase domain (~$10-15/year)
4. Add domain privacy protection (recommended)

### **Step 2: Connect Domain to Vercel**

**In Vercel:**
1. Go to project → **"Settings"** → **"Domains"**
2. Add domain: `napavalleywineries.com`
3. Vercel will show DNS records to add

**In Hostinger:**
1. Go to: **"Domains"** → **"DNS Zone"**
2. Add records from Vercel:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
3. Save changes
4. Wait 24-48 hours for DNS propagation

### **Step 3: SSL Certificate**

- Vercel automatically provides FREE SSL
- Your site will be HTTPS after domain connects
- No additional configuration needed! ✅

---

## 📧 **Phase 4: Email Service (SendGrid)**

### **Step 1: Create SendGrid Account**

1. Go to: https://signup.sendgrid.com/
2. Sign up (FREE tier: 100 emails/day)
3. Verify email address
4. Complete account setup

### **Step 2: Create API Key**

1. Go to: **"Settings"** → **"API Keys"**
2. Click: **"Create API Key"**
3. Name: `napa-wineries-prod`
4. Permissions: **"Full Access"**
5. Copy API key (save it!)

### **Step 3: Verify Sender Identity**

1. Go to: **"Settings"** → **"Sender Authentication"**
2. Choose: **"Single Sender Verification"**
3. Add email: `info@napavalleywineries.com`
4. Fill in details
5. Verify email (check inbox)

### **Step 4: Update Vercel Environment Variables**

```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=info@napavalleywineries.com
```

Redeploy app to apply changes.

---

## 🖼️ **Phase 5: Image Storage (Cloudinary)**

### **Step 1: Create Cloudinary Account**

1. Go to: https://cloudinary.com/users/register/free
2. Sign up (FREE tier: 25GB storage)
3. Verify email

### **Step 2: Get API Credentials**

1. Dashboard → **"API Keys"**
2. Copy:
   ```
   Cloud Name: your-cloud-name
   API Key: your-api-key
   API Secret: your-api-secret
   ```

### **Step 3: Add to Vercel Environment Variables**

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### **Step 4: Upload Preset (Optional)**

1. Go to: **"Settings"** → **"Upload"**
2. Add upload preset: `napa-wineries`
3. Signing Mode: **"Unsigned"**
4. Use for direct uploads from frontend

---

## 💳 **Phase 6: Payment Setup (Stripe)**

### **Step 1: Create Stripe Account**

1. Go to: https://stripe.com/
2. Sign up
3. Complete business details

### **Step 2: Get API Keys**

**Test Mode (for initial testing):**
1. Dashboard → **"Developers"** → **"API Keys"**
2. Copy:
   ```
   Publishable key: pk_test_...
   Secret key: sk_test_...
   ```

**Live Mode (for production):**
1. Complete Stripe verification
2. Activate account
3. Get live keys:
   ```
   Publishable key: pk_live_...
   Secret key: sk_live_...
   ```

### **Step 3: Update Environment Variables**

**Testing:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Production:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

---

## 🤖 **Phase 7: AI Features (Gemini API)**

### **Step 1: Get Gemini API Key**

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click: **"Create API Key"**
4. Copy key

### **Step 2: Add to Vercel**

```bash
GEMINI_API_KEY=your-gemini-api-key
```

### **Step 3: Free Tier Limits**

- 60 requests per minute
- Sufficient for voice search & AI recommendations
- Monitor usage in Google Cloud Console

---

## 🗄️ **Phase 8: Seed Production Database**

### **Step 1: Update Local Connection**

Edit `.env.local`:
```bash
MONGODB_URI=mongodb+srv://napa-admin:<password>@napa-wineries-prod.xxxxx.mongodb.net/nvw?retryWrites=true&w=majority
```

### **Step 2: Seed Data**

```bash
# Seed wineries
npm run seed

# Seed booking slots
npm run seed:slots

# Create test accounts
npm run create:accounts
```

### **Step 3: Verify**

1. Check MongoDB Atlas dashboard
2. Collections should show:
   - wineries (6 documents)
   - slotinventories (1,620 documents)
   - users (4 documents)

---

## ✅ **Phase 9: Testing & Launch**

### **Pre-Launch Checklist**

- [ ] Database connected and seeded
- [ ] All environment variables set
- [ ] Custom domain connected
- [ ] SSL certificate active (HTTPS)
- [ ] Email sending working
- [ ] Stripe test payments working
- [ ] Voice search & AI functional
- [ ] Mobile responsive
- [ ] All test accounts working

### **Test All Features**

1. **Signup/Login:**
   - Create new account
   - Login with existing account
   - Verify email sent

2. **Browse Wineries:**
   - View all wineries
   - Use filters
   - Voice search
   - AI recommendations

3. **Booking Flow:**
   - Add to itinerary
   - Select date/time
   - View availability widget
   - Complete booking
   - Receive confirmation email

4. **Admin Dashboard:**
   - Login as admin
   - Create winery account
   - Manage users
   - View all bookings

5. **Winery Dashboard:**
   - Login as winery owner
   - Update profile
   - Manage slots
   - Confirm bookings

### **Go Live! 🚀**

1. Announce launch
2. Share live URL
3. Monitor for issues
4. Collect user feedback

---

## 📊 **Monitoring & Maintenance**

### **Vercel Analytics (FREE)**

1. Enable in Vercel dashboard
2. Monitor:
   - Page views
   - Performance
   - Errors

### **MongoDB Atlas Monitoring**

1. Dashboard → **"Metrics"**
2. Watch:
   - Storage usage
   - Operations per second
   - Connection count

### **SendGrid Stats**

1. Dashboard → **"Statistics"**
2. Track:
   - Emails sent
   - Delivery rate
   - Bounce rate

---

## 💰 **Scaling & Costs**

### **Current Setup (FREE/Cheap):**
- Vercel: FREE (100GB bandwidth)
- MongoDB: FREE (512MB storage)
- SendGrid: FREE (100 emails/day)
- Cloudinary: FREE (25GB storage)
- Hostinger: $3/month
- **Total: $3/month**

### **As You Grow:**

**1,000 bookings/month:**
- Vercel: Still FREE
- MongoDB: Upgrade to $9/month (10GB storage)
- SendGrid: Upgrade to $15/month (40,000 emails)
- Stripe fees: ~$30 in transaction fees
- **Total: ~$57/month**

**5,000 bookings/month:**
- Vercel: Upgrade to $20/month (Pro tier)
- MongoDB: $25/month (25GB storage)
- SendGrid: $15/month
- Stripe fees: ~$150
- **Total: ~$210/month**

---

## 🆘 **Troubleshooting**

### **Deployment Fails**

1. Check Vercel build logs
2. Verify all environment variables
3. Test build locally: `npm run build`
4. Check for syntax errors

### **Database Connection Issues**

1. Verify MongoDB URI
2. Check IP whitelist (0.0.0.0/0)
3. Verify user credentials
4. Test connection locally

### **Email Not Sending**

1. Verify SendGrid API key
2. Check sender verification
3. Look at SendGrid activity logs
4. Test with Ethereal first

### **Domain Not Working**

1. Wait 24-48 hours for DNS
2. Verify DNS records in Hostinger
3. Check Vercel domain status
4. Use `dig` command to test DNS

---

## 📞 **Support Resources**

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **SendGrid:** https://docs.sendgrid.com/
- **Stripe:** https://stripe.com/docs
- **Next.js:** https://nextjs.org/docs

---

## 🎉 **Congratulations!**

Your Napa Valley Wineries platform is now live!

**Live URL:** https://napavalleywineries.com (your domain)

**Next Steps:**
1. Share with beta testers
2. Collect feedback
3. Monitor analytics
4. Iterate and improve

---

*Deployment Guide - December 2024*
