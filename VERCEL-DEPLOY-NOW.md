# 🚀 Vercel Deployment Guide - Step by Step

**Platform:** Napa Valley Wineries  
**Repository:** https://github.com/Pablodd1/NVWineries-dec  
**Branch:** `genspark_ai_developer`  
**Cost:** $0/month (Free Tier)

---

## ⏱️ **Quick Stats**

- **Total Time:** ~15 minutes
- **Difficulty:** Easy
- **Cost:** $0 (Vercel, MongoDB Atlas, SendGrid all free tier)
- **Custom Domain:** Optional ($3/month with Hostinger)

---

## 📋 **PREREQUISITES**

Before starting, have ready:
- [ ] GitHub account access
- [ ] Vercel account (create at https://vercel.com/signup)
- [ ] MongoDB Atlas account (create at https://mongodb.com/cloud/atlas/register)
- [ ] Stripe keys (optional, can add later)
- [ ] This guide open

---

## 🎯 **DEPLOYMENT PROCESS**

---

## **STEP 1: MongoDB Atlas Setup** (5 minutes)

### **1.1 Create Free Cluster**

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with Google/GitHub or email
3. **Choose:** M0 FREE tier
4. **Provider:** AWS
5. **Region:** US East (N. Virginia) `us-east-1`
6. **Cluster Name:** `napa-wineries-prod`
7. Click **"Create Cluster"**

⏳ Wait 3-5 minutes for cluster creation...

---

### **1.2 Create Database User**

1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. **Username:** `napa-admin`
4. **Password:** Generate strong password (save this!)
   - Example: `NapaWine2025!SecureDB#987`
5. **Database User Privileges:** Atlas Admin
6. Click **"Add User"**

💾 **SAVE THIS PASSWORD!** You'll need it in Step 2.

---

### **1.3 Configure Network Access**

1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access From Anywhere"**
   - IP Address: `0.0.0.0/0`
4. Click **"Confirm"**

⚠️ **Note:** For production, you should restrict to specific IPs. For now, this works.

---

### **1.4 Get Connection String**

1. Click **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. **Driver:** Node.js
5. **Version:** 5.5 or later
6. **Copy** the connection string:
   ```
   mongodb+srv://napa-admin:<password>@napa-wineries-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Replace** `<password>` with your actual password from step 1.2

📝 **Your connection string should look like:**
```
mongodb+srv://napa-admin:NapaWine2025!SecureDB#987@napa-wineries-prod.ab1cd.mongodb.net/nvw?retryWrites=true&w=majority
```

💾 **SAVE THIS STRING!** You'll paste it into Vercel.

✅ **MongoDB Setup Complete!**

---

## **STEP 2: Vercel Deployment** (3 minutes)

### **2.1 Sign Up for Vercel**

1. **Go to:** https://vercel.com/signup
2. **Sign up with GitHub** (easiest)
3. Authorize Vercel to access GitHub
4. You'll see your Vercel dashboard

---

### **2.2 Import Repository**

1. Click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. **Search for:** `NVWineries-dec`
4. Click **"Import"** next to `Pablodd1/NVWineries-dec`

---

### **2.3 Configure Project**

#### **Framework Preset:**
- ✅ Automatically detected: **Next.js**

#### **Root Directory:**
- Leave as: `./` (root)

#### **Build Command:**
- Auto-detected: `npm run build`

#### **Output Directory:**
- Auto-detected: `.next`

#### **Install Command:**
- Auto-detected: `npm install`

---

### **2.4 Add Environment Variables** ⚠️ **CRITICAL**

Click **"Environment Variables"** section and add these:

#### **1. Database (REQUIRED)**
```
Name: MONGODB_URI
Value: [Paste your MongoDB connection string from Step 1.4]
```

#### **2. Authentication (REQUIRED)**
```
Name: JWT_SECRET
Value: napa-valley-wineries-super-secret-jwt-key-2025-secure-random-string-12345
```

#### **3. Stripe (OPTIONAL - Can add later)**
```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_51RIEIQIWOkw4Rqfdar3ZmxjQ9XolfKQXZRwEtw5WTo6aBy4OnU9CVKGx7WPInk3TgDKwZrDUYZzL2JRoxQV56fVO00QhhEvS8H
```

```
Name: STRIPE_SECRET_KEY
Value: [Your Stripe Secret Key - starts with sk_live_...]
```

#### **4. App URL (Add AFTER first deployment)**
```
Name: NEXT_PUBLIC_APP_URL
Value: [Will be provided after deployment, e.g., https://nvwineries-dec.vercel.app]
```

⚠️ **Note:** You'll add `NEXT_PUBLIC_APP_URL` after the first deployment when you get your Vercel URL.

---

### **2.5 Deploy!**

1. Click **"Deploy"**
2. ⏳ Wait 2-3 minutes for build...
3. 🎉 You'll see **"Congratulations!"** when done

---

### **2.6 Get Your URL**

After deployment:
1. Copy your Vercel URL (e.g., `https://nvwineries-dec.vercel.app`)
2. Go to **Project Settings** → **Environment Variables**
3. Add `NEXT_PUBLIC_APP_URL` with your Vercel URL as value
4. Click **"Redeploy"** to apply the new variable

✅ **Vercel Deployment Complete!**

---

## **STEP 3: Seed Database** (5 minutes)

Now we need to populate your database with wineries and slots.

### **Option A: Using Local Terminal** (Recommended)

1. Open your terminal
2. Navigate to project:
   ```bash
   cd /home/user/webapp
   ```
3. Update `.env.local` with production MongoDB URI:
   ```bash
   # Edit .env.local
   MONGODB_URI="mongodb+srv://napa-admin:YOUR_PASSWORD@napa-wineries-prod.xxxxx.mongodb.net/nvw?retryWrites=true&w=majority"
   ```
4. Run seed scripts:
   ```bash
   npm run seed
   npm run seed:slots
   npm run create:accounts
   ```

### **Option B: Using Vercel CLI**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Login to Vercel:
   ```bash
   vercel login
   ```
3. Link to project:
   ```bash
   vercel link
   ```
4. Run seed commands:
   ```bash
   vercel env pull .env.production
   npm run seed
   npm run seed:slots  
   npm run create:accounts
   ```

✅ **Database Seeded!**

---

## **STEP 4: Verify Deployment** (2 minutes)

### **4.1 Test Public Pages**

1. Visit your Vercel URL
2. Browse wineries
3. Click on a winery
4. Verify images load
5. Verify data displays

**Expected:** ✅ All public pages work

---

### **4.2 Test Authentication**

1. Go to login page
2. Login with:
   - **Email:** `admin@napawineries.com`
   - **Password:** `admin123`
3. Verify dashboard loads

**Expected:** ✅ Login successful

---

### **4.3 Test Winery Owner**

1. Logout
2. Login with:
   - **Email:** `owner@napawineries.com`
   - **Password:** `owner123`
3. Verify winery dashboard
4. Try editing profile

**Expected:** ✅ Dashboard works

---

### **4.4 Test Customer Flow**

1. Logout
2. Register new account
3. Browse wineries
4. Test external booking (if configured)
5. Test adding to itinerary

**Expected:** ✅ Customer flow works

---

## ✅ **DEPLOYMENT COMPLETE!**

🎉 **Congratulations!** Your Napa Valley Wineries platform is now live!

---

## 📝 **Post-Deployment Checklist**

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Vercel project deployed
- [ ] Environment variables added
- [ ] Database seeded with wineries
- [ ] Test accounts created
- [ ] Admin login tested
- [ ] Winery owner login tested
- [ ] Customer flow tested
- [ ] External booking tested

---

## 🔧 **OPTIONAL: Custom Domain** ($3/month)

### **If you want a custom domain:**

1. **Buy domain** from Hostinger ($3/month)
   - Example: `napavalleywineries.com`
   
2. **Add to Vercel:**
   - Go to Project Settings → Domains
   - Add your domain
   - Follow DNS setup instructions
   
3. **Update DNS:**
   - Add A record: `76.76.21.21`
   - Add CNAME: `cname.vercel-dns.com`
   
4. **Wait 24-48 hours** for propagation

⚠️ **Note:** Custom domain is optional. Your Vercel URL works perfectly!

---

## 📊 **Your New URLs**

### **Production Site:**
```
https://[your-project-name].vercel.app
```

### **Admin Dashboard:**
```
https://[your-project-name].vercel.app/admin/dashboard
```

### **Winery Dashboard:**
```
https://[your-project-name].vercel.app/winery-dashboard
```

---

## 🔐 **Production Test Accounts**

### **Super Admin**
```
Email: admin@napawineries.com
Password: admin123
Access: Full platform control
```

### **Winery Owner**
```
Email: owner@napawineries.com
Password: owner123
Winery: Opus One Winery
```

### **Customer**
```
Email: customer@test.com
Password: customer123
```

⚠️ **Change these passwords in production!**

---

## 💰 **Cost Breakdown**

| Service | Tier | Cost |
|---------|------|------|
| **Vercel** | Hobby (Free) | $0/month |
| **MongoDB Atlas** | M0 Free | $0/month |
| **SendGrid** | Free (100 emails/day) | $0/month |
| **Cloudinary** | Free | $0/month |
| **Stripe** | Pay-per-transaction | $0/month + fees |
| **Gemini AI** | Free (60 req/min) | $0/month |
| **Custom Domain** | Optional | $3/month |

**Total:** $0-$3/month 🎉

---

## 📈 **Scaling Costs**

As you grow:

| Visitors/Month | Bookings | Cost |
|----------------|----------|------|
| **< 10,000** | < 500 | $0/month |
| **10,000 - 100,000** | 500 - 2,000 | $0-$20/month |
| **100,000+** | 2,000+ | $20-$100/month |

---

## 🐛 **Troubleshooting**

### **Issue: Build Failed**
**Solution:**
- Check environment variables are set correctly
- Verify MongoDB URI format
- Check Node.js version (should be 18+)

### **Issue: 500 Error on Pages**
**Solution:**
- Check MongoDB connection string
- Verify database user has correct permissions
- Check Vercel logs: Settings → Deployments → Click latest → View Logs

### **Issue: Images Not Loading**
**Solution:**
- Check Cloudinary configuration (optional)
- Verify image URLs are valid
- Check browser console for errors

### **Issue: Can't Login**
**Solution:**
- Verify database seeded correctly
- Check test accounts exist in MongoDB
- Clear browser cache and cookies
- Try incognito mode

---

## 📞 **Support Resources**

### **Vercel**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### **MongoDB Atlas**
- Docs: https://docs.atlas.mongodb.com
- Support: https://www.mongodb.com/cloud/atlas/support

### **Project Docs**
- GitHub: https://github.com/Pablodd1/NVWineries-dec
- Issues: https://github.com/Pablodd1/NVWineries-dec/issues

---

## 🎓 **Next Steps**

### **Immediate:**
1. ✅ Test all features thoroughly
2. ✅ Change default passwords
3. ✅ Add your Stripe keys
4. ✅ Configure email settings

### **Short Term:**
1. Set up monitoring (Vercel Analytics)
2. Configure custom domain (optional)
3. Set up backup schedule
4. Create PR to main branch

### **Long Term:**
1. Add more wineries
2. Customize branding
3. Add custom features
4. Scale as needed

---

## ✅ **Success Criteria**

Your deployment is successful when:
- ✅ Site loads at Vercel URL
- ✅ Can login as admin
- ✅ Can login as winery owner
- ✅ Can register new customers
- ✅ Wineries display correctly
- ✅ Bookings work (built-in or external)
- ✅ No console errors
- ✅ Mobile responsive

---

## 🎉 **YOU'RE LIVE!**

Your Napa Valley Wineries platform is now:
- ✅ Deployed to production
- ✅ Running on free tier ($0/month)
- ✅ Scalable to millions of users
- ✅ Enterprise-grade infrastructure
- ✅ 99.99% uptime guaranteed by Vercel

**Share your new platform!** 🍷✨

---

**Deployed:** _______________  
**URL:** _______________  
**Version:** 1.0.0 Production  
**Status:** Live 🚀
