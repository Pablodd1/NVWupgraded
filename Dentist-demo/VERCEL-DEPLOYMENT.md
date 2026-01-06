# Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### Prerequisites
- ✅ GitHub repository: `Pablodd1/Dentist-demo`
- ✅ Vercel account connected to GitHub
- ⚠️ **Required:** Google Gemini API key with billing enabled

---

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click **"Get API Key"**
3. Create a new API key or use an existing one
4. **Important:** Enable billing in Google Cloud Console
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable billing for your project
   - Gemini API requires billing to be enabled

---

## Step 2: Configure Vercel Environment Variables

### Option A: Via Vercel Dashboard (Recommended)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: **Dentist-demo**
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variable:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `GEMINI_API_KEY` | `your_actual_api_key` | Production, Preview, Development |

5. Click **Save**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
cd Dentist-demo
vercel link

# Add environment variable
vercel env add GEMINI_API_KEY
# When prompted, paste your API key
# Select: Production, Preview, Development (all)
```

---

## Step 3: Deploy to Vercel

### Automatic Deployment (Recommended)

Every push to the `main` branch will automatically deploy to Vercel.

```bash
# Make any change (or just trigger a redeploy)
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

### Manual Deployment via CLI

```bash
cd Dentist-demo
vercel --prod
```

---

## Step 4: Verify Deployment

1. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on the latest deployment
   - Verify build completed successfully

2. **Test the Application**
   - Open your deployment URL (e.g., `dentist-demo.vercel.app`)
   - Click **"Begin Studio Session"**
   - Test camera capture or upload an image
   - Try generating a dental visualization

3. **Verify API Integration**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for any errors related to API key or Gemini API
   - If you see "Clinical Key expired" → API key is invalid or billing not enabled

---

## 🔍 Troubleshooting

### Issue: "Clinical API Key is not configured"

**Cause:** Environment variable not set or not loaded

**Solution:**
1. Verify `GEMINI_API_KEY` is set in Vercel Dashboard
2. Redeploy the application (Vercel → Deployments → Redeploy)
3. Clear browser cache and reload

---

### Issue: "API_KEY_EXPIRED" or "Requested entity was not found"

**Cause:** Invalid API key or billing not enabled

**Solution:**
1. Verify API key is correct in Vercel Dashboard
2. Check billing is enabled in Google Cloud Console:
   - Go to https://console.cloud.google.com/
   - Select your project
   - Go to **Billing** → Ensure billing account is linked
   - Go to **APIs & Services** → Ensure Gemini API is enabled
3. Test API key with a simple curl request:

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

---

### Issue: Camera not working

**Cause:** Browser permissions or HTTP (not HTTPS)

**Solution:**
1. Vercel provides HTTPS by default ✅
2. Grant camera permissions when prompted
3. If using Safari, check Settings → Privacy → Camera
4. Try uploading an image instead (Upload button)

---

### Issue: Build fails on Vercel

**Cause:** Dependency issues or TypeScript errors

**Solution:**
1. Check build logs in Vercel Dashboard
2. Test build locally:
   ```bash
   npm run build
   ```
3. If local build succeeds but Vercel fails:
   - Clear Vercel build cache (Vercel Dashboard → Settings → Clear Cache)
   - Redeploy

---

## 📊 Monitoring & Analytics

### Check API Usage

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Dashboard**
3. Select **Gemini API**
4. View usage metrics, quotas, and errors

### Set Up Billing Alerts

1. Go to **Billing** → **Budgets & Alerts**
2. Create a new budget
3. Set alert threshold (e.g., $10, $50, $100)
4. Add email notifications

### Vercel Analytics

1. Go to Vercel Dashboard → Your Project → Analytics
2. View page views, performance metrics, and user flows
3. Upgrade to Vercel Pro for advanced analytics (optional)

---

## 🔐 Security Best Practices

### Current Setup (Client-Side API Key)

⚠️ **Warning:** The current implementation exposes the API key in the browser. This is acceptable for:
- Personal projects
- Demos
- Low-traffic applications

### Recommended for Production (Backend Proxy)

For production applications with real users, implement a backend proxy:

1. **Create API Route** (`/api/generate-image`)
2. **Move API Key to Server-Side**
3. **Add Rate Limiting**
4. **Add Authentication**

**Example Vercel Serverless Function:**

```typescript
// api/generate-image.ts
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Validate request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting (implement with Vercel KV or Redis)
  // ...

  // Get API key from environment (server-side only)
  const apiKey = process.env.GEMINI_API_KEY;
  
  const { image, prompt, selectedTeeth, colorAdjustment, materialAdjustment } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey });
    // ... (rest of the generation logic)
    res.status(200).json({ image: generatedImage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## 📈 Performance Optimization

### Enable Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

```typescript
// index.tsx
import { SpeedInsights } from '@vercel/speed-insights/react';

// Add to your app
<SpeedInsights />
```

### Enable Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// index.tsx
import { Analytics } from '@vercel/analytics/react';

// Add to your app
<Analytics />
```

---

## 🎯 Deployment Checklist

Before going live, ensure:

- [ ] `GEMINI_API_KEY` is set in Vercel
- [ ] Billing is enabled in Google Cloud Console
- [ ] Test deployment works (camera, upload, generation)
- [ ] API calls succeed (check browser console)
- [ ] Mobile responsiveness tested
- [ ] Camera permissions work on HTTPS
- [ ] Error messages are user-friendly
- [ ] Loading states are visible
- [ ] Billing alerts are set up in Google Cloud
- [ ] Analytics are configured (optional)
- [ ] Custom domain configured (optional)

---

## 🌐 Custom Domain Setup (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `dentaldemo.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)
5. Vercel will automatically provision SSL certificate

---

## 📞 Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Gemini API Documentation:** https://ai.google.dev/docs
- **Vite Documentation:** https://vitejs.dev/
- **React Documentation:** https://react.dev/

---

## 🎉 Success!

Once deployed, your application will be live at:
- **Production:** `https://dentist-demo.vercel.app`
- **Custom Domain:** `https://your-domain.com` (if configured)

Share the link and start visualizing dental treatments! 🦷✨

---

**Last Updated:** December 30, 2025  
**Deployment Status:** ✅ Ready for production with environment variable configuration
