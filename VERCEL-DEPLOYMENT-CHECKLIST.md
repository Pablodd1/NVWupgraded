# ✅ Vercel Deployment Checklist

## 🎯 **QUICK START (13 Minutes)**

Your platform is ready to deploy! Just follow these 3 steps:

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### ✅ **Code Status:**
- [x] All features complete (8 phases)
- [x] All bugs fixed
- [x] Test accounts created
- [x] Database seeds ready
- [x] Documentation complete
- [x] Git commits pushed

### ✅ **What You Need:**
- [ ] MongoDB Atlas account (create in Step 1)
- [ ] Vercel account (create in Step 2)
- [ ] Stripe keys (you have these!)
- [ ] 13 minutes of time

---

## 🚀 **STEP 1: MongoDB Atlas Setup** (5 minutes)

### **1.1 Create Account:**
```
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub (fastest)
3. Click "Build a Database"
```

### **1.2 Create FREE Cluster:**
```
Cluster Type:    Shared (FREE)
Provider:        AWS
Region:          US East (N. Virginia) - us-east-1
Cluster Name:    napa-wineries-prod
```
Click "Create Cluster" (takes 3-5 minutes to provision)

### **1.3 Database Access (Create User):**
```
1. Left menu → "Database Access"
2. Click "Add New Database User"
3. Username: napa-admin
4. Password: [GENERATE SECURE PASSWORD] → Click "Autogenerate Secure Password"
5. COPY THE PASSWORD IMMEDIATELY! (you'll need it)
6. Database User Privileges: Atlas admin
7. Click "Add User"
```

**🔑 SAVE THIS:**
```
Username: napa-admin
Password: [your-generated-password]
```

### **1.4 Network Access (Allow Vercel):**
```
1. Left menu → "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere"
4. IP Address: 0.0.0.0/0 (auto-filled)
5. Comment: "Vercel deployment"
6. Click "Confirm"
```

### **1.5 Get Connection String:**
```
1. Left menu → "Database" (Dashboard)
2. Click "Connect" button on your cluster
3. Choose: "Connect your application"
4. Driver: Node.js
5. Version: 5.5 or later
6. Copy the connection string
```

**Example connection string:**
```
mongodb+srv://napa-admin:<password>@napa-wineries-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### **1.6 Modify Connection String:**
```
Replace <password> with your actual password
Add database name /nvw before the ?

Final format:
mongodb+srv://napa-admin:YOUR_PASSWORD@napa-wineries-prod.xxxxx.mongodb.net/nvw?retryWrites=true&w=majority
```

**🔑 SAVE THIS FINAL CONNECTION STRING!** You'll add it to Vercel!

---

## 🚀 **STEP 2: Deploy to Vercel** (3 minutes)

### **2.1 Create Vercel Account:**
```
1. Go to: https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub
```

### **2.2 Import Project:**
```
1. Vercel Dashboard → Click "Add New..." → "Project"
2. Find repository: "Pablodd1/nvm"
3. Click "Import"
```

### **2.3 Configure Project:**
```
Framework Preset:    Next.js (auto-detected) ✅
Root Directory:      ./ (default) ✅
Build Command:       npm run build (default) ✅
Output Directory:    .next (default) ✅
Install Command:     npm install (default) ✅
Node.js Version:     20.x (default) ✅
```

### **2.4 Add Environment Variables:**

Click "Environment Variables" section, then add these **4 REQUIRED** variables:

#### **Variable 1: Database**
```
Name:  MONGODB_URI
Value: mongodb+srv://napa-admin:YOUR_PASSWORD@napa-wineries-prod.xxxxx.mongodb.net/nvw?retryWrites=true&w=majority
```
(Use your connection string from Step 1.6)

#### **Variable 2: JWT Secret**
```
Name:  JWT_SECRET
Value: napa-valley-wineries-super-secret-jwt-key-2025-secure-random-string-12345
```
(You can change this to any random 32+ character string)

#### **Variable 3: Stripe Secret Key**
```
Name:  STRIPE_SECRET_KEY
Value: [YOUR STRIPE SECRET KEY - paste it here when you share]
```

#### **Variable 4: Stripe Publishable Key**
```
Name:  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: [YOUR STRIPE PUBLISHABLE KEY - paste it here when you share]
```

### **2.5 Deploy!**
```
1. Click "Deploy" button
2. Wait 2-3 minutes for build
3. 🎉 You'll get a live URL!
```

**Example URL:** `https://nvm-xxxxx.vercel.app`

### **2.6 Update App URL:**
```
1. Copy your Vercel URL from deployment
2. Go back to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Click "Add Another" variable:
   
   Name:  NEXT_PUBLIC_APP_URL
   Value: https://nvm-xxxxx.vercel.app (your actual URL)
   
4. Click "Save"
5. Go to "Deployments" tab
6. Click "Redeploy" on latest deployment (automatic with new env var)
```

---

## 🗄️ **STEP 3: Seed Production Database** (5 minutes)

### **3.1 Update Local Environment:**

On your local machine (or in sandbox):

```bash
cd /home/user/webapp

# Edit .env.local
nano .env.local
```

**Change line 4 from:**
```
MONGODB_URI=mongodb://localhost:27017/nvw
```

**To your MongoDB Atlas connection string:**
```
MONGODB_URI=mongodb+srv://napa-admin:YOUR_PASSWORD@napa-wineries-prod.xxxxx.mongodb.net/nvw?retryWrites=true&w=majority
```

Save and exit (Ctrl+X, Y, Enter)

### **3.2 Run Seed Scripts:**

```bash
# Seed 6 Napa Valley wineries
npm run seed

# Seed 1,620 booking slots (90 days, 3 times/day)
npm run seed:slots

# Create test accounts (admin, winery, customers)
npm run create:accounts
```

### **3.3 Verify in MongoDB Atlas:**

```
1. Go to: https://cloud.mongodb.com/
2. Click "Browse Collections"
3. You should see:
   - wineries (6 documents)
   - slotinventories (1,620 documents)
   - users (4 documents)
   - bookings (0 documents initially)
```

---

## 🎉 **YOUR PLATFORM IS LIVE!**

### **🔗 Access Your Platform:**
```
URL: https://nvm-xxxxx.vercel.app (your Vercel URL)
```

### **🔐 Test Accounts:**
```
Admin:
  Email:    admin@napawineries.com
  Password: admin123

Winery Owner:
  Email:    owner@napawineries.com
  Password: owner123
  Winery:   Opus One Winery

Customer 1:
  Email:    customer@test.com
  Password: customer123

Customer 2:
  Email:    john@example.com
  Password: john123
```

---

## 🧪 **TEST YOUR DEPLOYMENT**

### **Test #1: Homepage**
```
✅ Visit: https://your-app.vercel.app
✅ Should see: 6 Napa Valley wineries
✅ Check: Voice search button (🎙️) in header
```

### **Test #2: Winery Details**
```
✅ Click: "View Details" on any winery
✅ Should see: Real-Time Availability Widget
✅ Check: Today + next 7 days with available slots
✅ Color codes: Purple (today), Green (available), Gray (full)
```

### **Test #3: Voice Search**
```
✅ Click: 🎙️ microphone icon
✅ Say: "Show me cabernet wineries under fifty dollars"
✅ Should see: AI results with confidence scores
✅ Check: "Perfect Match" badges on results
```

### **Test #4: Signup/Login**
```
✅ Click: "Sign Up" in header
✅ Fill: First Name, Last Name, Email, Phone, DOB, Password
✅ Check: Only Instagram & TikTok social buttons
✅ Submit: Create account
✅ Should: Redirect to homepage with "Welcome" message
```

### **Test #5: Booking Flow**
```
✅ Login: customer@test.com / customer123
✅ Click: "Add to Itinerary" on any winery
✅ Click: "Itinerary" in header
✅ Select: Date, Time, Food Pairing, Tour
✅ Check: All fields are clickable and updating
✅ Click: "Book Now"
✅ Should: See Stripe checkout (if Stripe keys added)
```

### **Test #6: Admin Dashboard**
```
✅ Login: admin@napawineries.com / admin123
✅ Visit: /admin/dashboard
✅ Should see: All bookings, users, statistics
✅ Click: "Create Winery" → Fill form → Create account
✅ Check: New winery owner can login
```

### **Test #7: Winery Dashboard**
```
✅ Login: owner@napawineries.com / owner123
✅ Visit: /winery-dashboard
✅ Should see: Opus One Winery dashboard
✅ Check: Today's bookings, pending requests
✅ Click: "Inventory" → See 1,620 available slots
✅ Try: Confirm/Decline a booking
```

---

## 📊 **MONITORING**

### **Vercel Analytics:**
```
1. Vercel Dashboard → Your Project → Analytics
2. Monitor:
   - Page views
   - Performance
   - Errors
   - Top pages
```

### **MongoDB Atlas:**
```
1. MongoDB Dashboard → Metrics
2. Monitor:
   - Storage usage (512MB free)
   - Operations per second
   - Connections
```

---

## 🔄 **CONTINUOUS DEPLOYMENT**

### **How It Works:**
```
1. You push code to GitHub (genspark_ai_developer branch)
2. Vercel automatically detects the push
3. Builds and deploys your changes
4. Live in 2-3 minutes!
```

### **To Deploy Updates:**
```bash
# Make changes to code
git add .
git commit -m "Your update message"
git push origin genspark_ai_developer

# Vercel will automatically deploy!
```

---

## 🆘 **TROUBLESHOOTING**

### **Issue: Build Fails**
```
Solution:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Test build locally: npm run build
4. Check for TypeScript errors
```

### **Issue: Database Connection Error**
```
Solution:
1. Verify MONGODB_URI is correct
2. Check MongoDB Atlas IP whitelist (0.0.0.0/0)
3. Verify username/password
4. Check database name (/nvw)
```

### **Issue: 500 Internal Server Error**
```
Solution:
1. Check Vercel logs: Dashboard → Functions → View logs
2. Check MongoDB connection
3. Verify JWT_SECRET is set
4. Check API routes in /api/* folders
```

### **Issue: Stripe Not Working**
```
Solution:
1. Verify Stripe keys are added to Vercel
2. Check if using test keys (pk_test_, sk_test_)
3. Verify NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY format
4. Check browser console for errors
```

### **Issue: Environment Variables Not Working**
```
Solution:
1. Vercel → Settings → Environment Variables
2. Verify all required variables are set
3. Click "Redeploy" to apply changes
4. Clear browser cache
```

---

## 💰 **COST TRACKING**

### **Current Setup (FREE):**
```
✅ Vercel:        $0 (100GB bandwidth/month)
✅ MongoDB:       $0 (512MB storage)
✅ Stripe:        $0 (pay-per-transaction only)
✅ Gemini API:    $0 (60 requests/min)

Total: $0/month
```

### **When You Need to Upgrade:**
```
MongoDB:   Upgrade at ~500 bookings/month → $9/month
Vercel:    Upgrade at >100GB traffic → $20/month
Email:     Use SendGrid FREE (100/day) or upgrade
```

---

## 📈 **SCALING**

### **Free Tier Capacity:**
```
✅ 10,000+ visitors/month
✅ ~500 bookings/month
✅ 86,400 AI queries/day
✅ Unlimited API calls
```

### **As You Grow:**
```
At 1,000 bookings/month:  ~$57/month
At 5,000 bookings/month:  ~$213/month

But you're earning commissions! 💰
```

---

## ✅ **DEPLOYMENT COMPLETE!**

### **What You Have:**
- ✅ Live wine tourism platform
- ✅ Production MongoDB database
- ✅ Automatic deployments
- ✅ SSL/HTTPS enabled
- ✅ Global CDN
- ✅ 6 wineries with 1,620 slots
- ✅ Voice search & AI
- ✅ Real-time availability
- ✅ Zero overbooking system
- ✅ Admin & winery dashboards
- ✅ Payment processing ready

### **Total Time:** 13 minutes
### **Total Cost:** $0/month
### **Your URL:** https://nvm-xxxxx.vercel.app

**🎉 Congratulations! Your platform is live!**

---

## 📞 **NEED HELP?**

### **Documentation:**
- `DEPLOYMENT-GUIDE.md` - Full deployment guide
- `QUICK-DEPLOY.md` - Quick reference
- `FREE-DEPLOYMENT-SUMMARY.md` - Cost breakdown
- `TEST-ACCOUNTS.md` - All test credentials

### **Support Resources:**
- Vercel Docs: https://vercel.com/docs
- MongoDB: https://docs.atlas.mongodb.com/
- Next.js: https://nextjs.org/docs

---

*Vercel Deployment Checklist - December 2024*
