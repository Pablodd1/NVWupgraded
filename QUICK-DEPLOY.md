# ⚡ Quick Deploy Reference

## 🚀 **5-Minute Setup**

### **1. MongoDB Atlas** (2 min)
```
1. https://www.mongodb.com/cloud/atlas/register
2. Create FREE cluster (Shared, AWS, us-east-1)
3. Add user: napa-admin / [password]
4. Network: Allow 0.0.0.0/0
5. Get connection string
```

### **2. Vercel** (2 min)
```
1. https://vercel.com/signup (GitHub login)
2. Import: Pablodd1/nvm repo
3. Add environment variables (see below)
4. Deploy!
```

### **3. Domain** (1 min setup, 24h wait)
```
1. Buy domain on Hostinger (~$3/month)
2. Add DNS records from Vercel
3. Wait 24-48 hours
```

---

## 🔑 **Environment Variables (Vercel)**

### **Required (Minimum):**
```bash
# Database (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://napa-admin:<password>@cluster.mongodb.net/nvw

# Security
JWT_SECRET=generate-random-32-char-string-here

# App URL (after first deploy)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### **Email (Testing):**
```bash
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=get-from-ethereal.email
EMAIL_PASS=get-from-ethereal.email
```

### **Email (Production - SendGrid):**
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=info@yourdomain.com
```

### **Payment (Stripe - Testing):**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### **AI (Gemini - Optional):**
```bash
GEMINI_API_KEY=your-gemini-key
```

---

## 📦 **After First Deploy**

### **Seed Database:**
```bash
# Update .env.local with production MongoDB URI
MONGODB_URI=mongodb+srv://...

# Run seeds
npm run seed          # Wineries
npm run seed:slots    # Booking slots
npm run create:accounts  # Test accounts
```

---

## 💰 **Cost Summary**

| Service | Cost |
|---------|------|
| Vercel | $0 |
| MongoDB Atlas | $0 |
| SendGrid | $0 (100 emails/day) |
| Cloudinary | $0 |
| Hostinger Domain | $3/month |
| **TOTAL** | **$3/month** |

---

## ✅ **Test Accounts**

After seeding:
```
Admin:    admin@napawineries.com / admin123
Winery:   owner@napawineries.com / owner123
Customer: customer@test.com / customer123
```

---

## 🆘 **Quick Fixes**

**Build fails?**
- Check all env vars set
- Run `npm run build` locally first

**Can't connect to DB?**
- Verify MongoDB URI
- Check IP whitelist (0.0.0.0/0)

**Domain not working?**
- Wait 24-48 hours
- Check DNS records

---

## 📱 **URLs**

- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com/
- **SendGrid:** https://app.sendgrid.com/
- **Stripe:** https://dashboard.stripe.com/

---

*Quick Deploy - December 2024*
