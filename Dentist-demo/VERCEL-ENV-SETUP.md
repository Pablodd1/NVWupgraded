# 🔧 Vercel Environment Variables Setup Guide

## Step-by-Step Instructions with Screenshots

---

## Method 1: Via Vercel Dashboard (Recommended)

### Step 1: Access Your Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find and click on **Dentist-demo** project
3. You should see your project overview

### Step 2: Navigate to Settings

1. Click on the **Settings** tab (top navigation)
2. In the left sidebar, click **Environment Variables**

### Step 3: Add Environment Variable

1. You'll see a form with three fields:
   - **Name (Key)**
   - **Value**
   - **Environments**

2. Fill in the form:
   ```
   Name: GEMINI_API_KEY
   Value: [Paste your actual API key here - starts with AIza...]
   ```

3. Select environments (check all three):
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

4. Click **Save** button

### Step 4: Verify

You should see your new environment variable listed:
```
GEMINI_API_KEY    •••••••••••••••    Production, Preview, Development
```

The value will be hidden (shown as dots) for security.

---

## Method 2: Via Vercel CLI

### Prerequisites
```bash
# Install Vercel CLI globally
npm install -g vercel

# Or use npx (no installation needed)
npx vercel --version
```

### Step 1: Login to Vercel
```bash
vercel login
```
This will open your browser to authenticate.

### Step 2: Link Your Project
```bash
cd e:\NVWineries-dec-genspark_ai_developer\Dentist-demo
vercel link
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → Yes
- **What's the name?** → Dentist-demo

### Step 3: Add Environment Variable
```bash
vercel env add GEMINI_API_KEY
```

Follow the prompts:
- **What's the value?** → Paste your API key
- **Add to which environments?** → Select all (Production, Preview, Development)
  - Use arrow keys to navigate
  - Press Space to select
  - Press Enter to confirm

### Step 4: Verify
```bash
vercel env ls
```

You should see:
```
Environment Variables for Dentist-demo
┌──────────────────┬─────────────────────────┬─────────────────────────┐
│ Name             │ Environments            │ Created                 │
├──────────────────┼─────────────────────────┼─────────────────────────┤
│ GEMINI_API_KEY   │ Production, Preview,    │ 2025-12-30 11:20:00     │
│                  │ Development             │                         │
└──────────────────┴─────────────────────────┴─────────────────────────┘
```

---

## Method 3: Via vercel.json (Not Recommended for Secrets)

⚠️ **Warning:** This method is NOT recommended for API keys as it would commit secrets to Git.

Only use this for non-sensitive configuration:

```json
{
  "env": {
    "PUBLIC_APP_NAME": "Dental Pro Studio"
  }
}
```

For secrets, always use Method 1 or 2.

---

## 🔐 Getting Your Gemini API Key

### Step 1: Go to Google AI Studio

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click **"Get API Key"** button

### Step 2: Create or Select API Key

**Option A: Create New Key**
1. Click **"Create API key in new project"**
2. Wait for key generation (5-10 seconds)
3. Copy the key (starts with `AIza...`)

**Option B: Use Existing Key**
1. Click **"Create API key"**
2. Select existing Google Cloud project
3. Copy the key

### Step 3: Enable Billing (CRITICAL)

⚠️ **The app won't work without billing enabled!**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (top dropdown)
3. Navigate to **Billing** in the left menu
4. Click **"Link a billing account"**
5. Follow the prompts to add a payment method

**Verify Billing is Enabled:**
1. Go to **APIs & Services** → **Dashboard**
2. Search for "Generative Language API"
3. Click on it
4. You should see "API enabled" status
5. Check that billing is active (no warnings)

---

## 🚀 Trigger Deployment After Adding Variables

### Option 1: Automatic (Push to GitHub)

```bash
# Make a small change or empty commit
git commit --allow-empty -m "Trigger deployment with env vars"
git push origin main
```

### Option 2: Manual Redeploy

1. Go to Vercel Dashboard → Deployments
2. Find the latest deployment
3. Click the three dots (•••) menu
4. Click **"Redeploy"**
5. Confirm

### Option 3: Via CLI

```bash
vercel --prod
```

---

## ✅ Verification Checklist

After adding environment variables and deploying:

- [ ] Environment variable shows in Vercel Dashboard
- [ ] All three environments selected (Production, Preview, Development)
- [ ] Deployment completed successfully (green checkmark)
- [ ] No build errors in deployment logs
- [ ] App loads without errors
- [ ] Can access camera/upload image
- [ ] Image generation works (test with "Add white veneers")

---

## 🐛 Troubleshooting

### Issue: "Environment variable not found"

**Symptoms:**
- Error in browser console: "Clinical API Key is not configured"
- App shows "Select API Key" screen

**Solutions:**

1. **Verify variable is set:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Confirm `GEMINI_API_KEY` is listed

2. **Check spelling:**
   - Must be exactly: `GEMINI_API_KEY` (case-sensitive)
   - No spaces before or after

3. **Redeploy:**
   - Environment variables only apply to new deployments
   - Trigger a new deployment (see above)

4. **Clear cache:**
   - Clear browser cache
   - Hard reload (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: "API_KEY_EXPIRED" or "Entity not found"

**Symptoms:**
- Image generation fails
- Error: "Clinical Key expired"

**Solutions:**

1. **Verify billing is enabled:**
   - Go to Google Cloud Console
   - Check billing account is linked
   - Verify no payment issues

2. **Test API key:**
   ```bash
   curl -X POST \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```

3. **Generate new API key:**
   - Go to Google AI Studio
   - Create a new API key
   - Update in Vercel
   - Redeploy

### Issue: "Deployment failed"

**Symptoms:**
- Build fails in Vercel
- Red X on deployment

**Solutions:**

1. **Check build logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on failed deployment
   - Read error messages

2. **Test build locally:**
   ```bash
   cd Dentist-demo
   npm install
   npm run build
   ```

3. **Common fixes:**
   - Clear Vercel build cache (Settings → Clear Cache)
   - Update dependencies: `npm update`
   - Check for TypeScript errors

---

## 🔄 Updating Environment Variables

### To Change an Existing Variable:

**Via Dashboard:**
1. Go to Settings → Environment Variables
2. Find `GEMINI_API_KEY`
3. Click the three dots (•••) menu
4. Click **"Edit"**
5. Update the value
6. Save and redeploy

**Via CLI:**
```bash
# Remove old variable
vercel env rm GEMINI_API_KEY production

# Add new variable
vercel env add GEMINI_API_KEY production
```

### To Remove a Variable:

**Via Dashboard:**
1. Settings → Environment Variables
2. Find the variable
3. Click three dots (•••) → **"Remove"**
4. Confirm

**Via CLI:**
```bash
vercel env rm GEMINI_API_KEY
```

---

## 📊 Environment Variable Best Practices

### ✅ DO:
- Use Vercel Dashboard or CLI for secrets
- Enable for all environments (Production, Preview, Development)
- Use descriptive names (e.g., `GEMINI_API_KEY`, not `KEY1`)
- Document all variables in `.env.local.example`
- Rotate API keys periodically (every 90 days)

### ❌ DON'T:
- Commit `.env.local` to Git (already in `.gitignore` ✅)
- Share API keys in public channels
- Use the same key for multiple projects
- Hardcode secrets in source code
- Store secrets in `vercel.json`

---

## 🔐 Security Tips

### 1. Separate Keys for Environments

For production apps, use different API keys:

```
GEMINI_API_KEY_DEV     → Development/Preview
GEMINI_API_KEY_PROD    → Production only
```

### 2. Monitor API Usage

Set up alerts in Google Cloud Console:
1. Go to **APIs & Services** → **Dashboard**
2. Click on Generative Language API
3. Go to **Quotas** tab
4. Set up quota alerts

### 3. Implement Backend Proxy

For production, move API key to server-side:
- See `SECURITY-GUIDE.md` for implementation
- Protects key from browser exposure
- Adds rate limiting

---

## 📝 Environment Variables Reference

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` | ✅ Yes |

### Optional Variables (Future)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_APP_NAME` | App display name | `Dental Pro` | ❌ No |
| `SENTRY_DSN` | Error tracking | `https://...` | ❌ No |
| `ANALYTICS_ID` | Analytics tracking | `G-...` | ❌ No |

---

## 🎯 Quick Reference Commands

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Add environment variable
vercel env add GEMINI_API_KEY

# List all variables
vercel env ls

# Deploy to production
vercel --prod

# View deployment logs
vercel logs
```

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] Gemini API key obtained from Google AI Studio
- [ ] Billing enabled in Google Cloud Console
- [ ] `GEMINI_API_KEY` added to Vercel (all environments)
- [ ] Variable verified in Vercel Dashboard
- [ ] Deployment triggered after adding variable
- [ ] Deployment completed successfully
- [ ] App tested and working
- [ ] Image generation tested successfully

**All checked?** 🎉 **Environment setup complete!**

---

**Last Updated:** December 30, 2025  
**Estimated Time:** 10-15 minutes  
**Difficulty:** Easy
