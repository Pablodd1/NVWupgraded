# 🚨 QUICK FIX - App Not Showing Updates

## 🔍 **Current Issues:**

1. **Local dev server** - Running on port 3001 (not 3000)
2. **Database** - May not be seeded with all 8 wineries
3. **Vercel deployment** - May still be building or using old code

---

## ✅ **IMMEDIATE FIXES:**

### **Fix 1: Access Correct Local URL**

Your app is running on **PORT 3001** (not 3000):

```
http://localhost:3001
```

**NOT:** ~~http://localhost:3000~~

---

### **Fix 2: Kill Old Process & Restart**

```bash
# Kill process on port 3000
taskkill /F /PID 149164

# Restart dev server
npm run dev
```

Then visit: **http://localhost:3000**

---

### **Fix 3: Check Vercel Deployment**

1. Go to: https://vercel.com/dashboard
2. Check if deployment is **"Ready"** (green checkmark)
3. If still building, wait for completion
4. If failed, check error logs

---

### **Fix 4: Hard Refresh Browser**

On the live site (https://nwvupgraded.vercel.app):

- **Windows:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

This clears cache and loads fresh content.

---

## 🎯 **What You Should See:**

### **On Homepage:**
✅ 8 wineries in the main grid  
✅ "Direct Booking Available" purple section  
✅ V. Sattui Winery with "Book Direct" button  
✅ Filter sidebar on left  
✅ Voice search option  

### **Wineries List:**
1. Stag's Leap Wine Cellars
2. Opus One Winery
3. Schramsberg Vineyards
4. Castello di Amorosa
5. Domaine Carneros
6. Silver Oak Cellars
7. Beringer Vineyards
8. V. Sattui Winery (with external booking)

---

## 🔧 **If Still Not Working:**

### **Option A: Fresh Start**

```bash
# 1. Stop all servers
# Press Ctrl+C in terminal

# 2. Clear Next.js cache
rm -rf .next

# 3. Restart
npm run dev
```

### **Option B: Check Database Connection**

The app connects to MongoDB Atlas. Verify:
- Internet connection is stable
- MongoDB Atlas cluster is running
- Credentials in `.env.local` are correct

### **Option C: Verify Environment Variables**

Check `.env.local` has:
```bash
MONGODB_URI=mongodb+srv://napa-admin:NapaWineries2024Secure@napa-wineries-prod.vkpze.mongodb.net/nvw?retryWrites=true&w=majority&appName=napa-wineries-prod
JWT_SECRET=bacc046be0890cf993f2ce0a036cb4890b3bf997248cb938ca155425710f0df9
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 **For Vercel (Live Site):**

### **Check Deployment Status:**

1. Visit: https://vercel.com/dashboard
2. Click your project
3. Go to "Deployments" tab
4. Latest deployment should show:
   - ✅ **Ready** (green) = Good!
   - 🟡 **Building** = Wait a few minutes
   - ❌ **Error** = Click to see logs

### **If Deployment Failed:**

1. Click on the failed deployment
2. Read error logs
3. Common issues:
   - Missing environment variables
   - Build errors
   - Database connection issues

### **Force Redeploy:**

```bash
git commit --allow-empty -m "Force redeploy"
git push
```

---

## 📊 **Quick Checklist:**

- [ ] Using correct port (3001 or 3000)?
- [ ] Hard refreshed browser?
- [ ] Vercel deployment is "Ready"?
- [ ] Environment variables added to Vercel?
- [ ] Database connection working?
- [ ] `.env.local` file exists and has correct values?

---

## 🆘 **Still Having Issues?**

### **Check These:**

1. **Browser Console** (F12)
   - Look for red errors
   - Check Network tab for failed requests

2. **Terminal Output**
   - Look for error messages
   - Check for compilation errors

3. **Vercel Logs**
   - Click deployment → "View Function Logs"
   - Look for runtime errors

---

## ✅ **Expected Behavior:**

### **Local (http://localhost:3000 or 3001):**
- All 8 wineries visible
- Direct booking section appears
- Filters work
- Can click on wineries

### **Live (https://nwvupgraded.vercel.app):**
- Same as local
- All features functional
- Authentication works
- Payments process

---

## 🎯 **Most Common Fix:**

**Just use the correct port!**

If dev server says:
```
- Local: http://localhost:3001
```

Then visit: **http://localhost:3001** (not 3000!)

---

**Last Updated:** December 23, 2025  
**Status:** Troubleshooting Guide Ready
