# Security & Cost Optimization Guide

## 🔐 Current Security Status

### ⚠️ Critical Security Issues

#### 1. **Client-Side API Key Exposure**

**Current Implementation:**
```typescript
// vite.config.ts
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

**Risk Level:** 🔴 **HIGH**

**Impact:**
- API key is visible in browser DevTools
- Anyone can extract and abuse your API key
- Potential for unlimited API calls → high costs
- No control over usage or rate limiting

**Who Can See Your API Key:**
1. Open browser DevTools (F12)
2. Go to Sources → View compiled JavaScript
3. Search for "API_KEY" → Your key is visible in plain text

---

## 🛡️ Recommended Security Architecture

### Solution: Backend API Proxy

**Architecture:**
```
User → Frontend (Vercel) → Backend API (Vercel Serverless) → Gemini API
                                  ↑
                            API Key (Server-Side Only)
```

### Implementation Steps

#### Step 1: Create Serverless API Route

Create `api/generate-image.ts`:

```typescript
import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiting storage (use Vercel KV in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 10; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function getRateLimitKey(req: VercelRequest): string {
  // Use IP address or user session
  return req.headers['x-forwarded-for'] as string || 'unknown';
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const rateLimitKey = getRateLimitKey(req);
  if (!checkRateLimit(rateLimitKey)) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please try again later.' 
    });
  }

  // Get API key from environment (server-side only)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { base64Image, prompt, selectedTeeth, colorAdjustment, materialAdjustment } = req.body;

    // Validate input
    if (!base64Image || !prompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Call Gemini API (server-side)
    const ai = new GoogleGenAI({ apiKey });
    
    // ... (copy the generation logic from geminiService.ts)
    // Build prompt, call API, return result

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ''), mimeType: 'image/jpeg' } },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    let generatedImageBase64 = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          generatedImageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      throw new Error('No image generated');
    }

    return res.status(200).json({ 
      image: `data:image/jpeg;base64,${generatedImageBase64}` 
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Image generation failed' 
    });
  }
}
```

#### Step 2: Update Frontend Service

Modify `services/geminiService.ts`:

```typescript
export const editDentalImage = async (
  base64Image: string, 
  prompt: string, 
  selectedTeeth: number[] = [],
  colorAdjustment: ColorAdjustment = { hue: 0, saturation: 0 },
  materialAdjustment?: MaterialAdjustment
): Promise<string> => {
  
  try {
    // Call your backend API instead of Gemini directly
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        prompt,
        selectedTeeth,
        colorAdjustment,
        materialAdjustment
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Generation failed');
    }

    const data = await response.json();
    return data.image;

  } catch (error: any) {
    console.error('Clinical Imaging Error:', error);
    throw error;
  }
};
```

#### Step 3: Update Vite Config

Remove API key from client-side:

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // Remove the 'define' section that exposes API key
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
```

#### Step 4: Install Dependencies

```bash
npm install @vercel/node
```

#### Step 5: Deploy

```bash
git add .
git commit -m "Implement backend API proxy for security"
git push origin main
```

---

## 💰 Cost Optimization

### Current Risk: Unlimited API Usage

**Scenario:**
- User discovers your API key
- Creates a script to make 1000 requests
- Your bill: $$$$ 💸

### Protection Strategies

#### 1. **Rate Limiting** (Implemented Above)

```typescript
const RATE_LIMIT = 10; // requests per hour per IP
```

**Adjust based on your needs:**
- Free tier: 5 requests/hour
- Paid users: 50 requests/hour
- Premium: Unlimited

#### 2. **Request Validation**

```typescript
// Validate image size
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
if (base64Image.length > MAX_IMAGE_SIZE) {
  throw new Error('Image too large');
}

// Validate prompt length
const MAX_PROMPT_LENGTH = 1000;
if (prompt.length > MAX_PROMPT_LENGTH) {
  throw new Error('Prompt too long');
}
```

#### 3. **Caching**

```typescript
import { kv } from '@vercel/kv'; // Vercel KV storage

// Generate cache key
const cacheKey = `gen:${hashString(base64Image + prompt)}`;

// Check cache
const cached = await kv.get(cacheKey);
if (cached) {
  return res.status(200).json({ image: cached });
}

// Generate and cache
const result = await generateImage(...);
await kv.set(cacheKey, result, { ex: 3600 }); // Cache for 1 hour
```

#### 4. **Usage Monitoring**

```typescript
// Log every request
console.log({
  timestamp: new Date().toISOString(),
  ip: req.headers['x-forwarded-for'],
  cost: estimatedCost,
  model: 'gemini-3-pro-image-preview'
});

// Send to analytics
await analytics.track('image_generation', {
  userId: getUserId(req),
  cost: estimatedCost
});
```

#### 5. **Budget Alerts**

**Google Cloud Console:**
1. Go to **Billing** → **Budgets & Alerts**
2. Create budget: $50/month
3. Set alerts at 50%, 90%, 100%
4. Add email notifications

**Vercel:**
1. Go to **Settings** → **Usage**
2. Monitor serverless function invocations
3. Set up alerts for unusual spikes

---

## 🔒 Additional Security Measures

### 1. **CORS Protection**

```typescript
// api/generate-image.ts
export const config = {
  cors: {
    origin: ['https://your-domain.vercel.app'],
    methods: ['POST'],
  },
};
```

### 2. **Authentication**

**Option A: Simple API Key (Client-Side)**
```typescript
// Client sends a secret key
const response = await fetch('/api/generate-image', {
  headers: {
    'X-API-Key': 'your-secret-client-key'
  }
});

// Server validates
if (req.headers['x-api-key'] !== process.env.CLIENT_API_KEY) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

**Option B: JWT Authentication**
```typescript
import jwt from 'jsonwebtoken';

// Verify JWT token
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Option C: OAuth (Google, GitHub)**
```typescript
import { auth } from '@/lib/auth'; // NextAuth, Clerk, etc.

const session = await auth(req);
if (!session) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### 3. **Input Sanitization**

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user input
const sanitizedPrompt = DOMPurify.sanitize(prompt);

// Prevent injection attacks
const safePrompt = prompt.replace(/[<>]/g, '');
```

### 4. **Request Signing**

```typescript
import crypto from 'crypto';

// Client signs request
const signature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(JSON.stringify(body))
  .digest('hex');

// Server verifies
const expectedSignature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

---

## 📊 Monitoring & Alerts

### 1. **Error Tracking**

**Install Sentry:**
```bash
npm install @sentry/node @sentry/react
```

**Configure:**
```typescript
// api/generate-image.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
});

try {
  // ... API logic
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### 2. **Usage Analytics**

```typescript
// Track API usage
await analytics.track('api_call', {
  endpoint: '/api/generate-image',
  user: getUserId(req),
  cost: estimatedCost,
  duration: Date.now() - startTime,
  success: true
});
```

### 3. **Real-Time Alerts**

**Slack Webhook:**
```typescript
// Send alert for high usage
if (dailyRequests > 1000) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `⚠️ High API usage detected: ${dailyRequests} requests today`
    })
  });
}
```

---

## ✅ Security Checklist

Before going to production:

- [ ] Move API key to server-side (backend proxy)
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Set up CORS protection
- [ ] Add authentication (if needed)
- [ ] Implement caching
- [ ] Set up error monitoring (Sentry)
- [ ] Configure billing alerts in Google Cloud
- [ ] Test rate limiting works
- [ ] Test with invalid API key
- [ ] Test with malicious input
- [ ] Monitor API usage for 1 week
- [ ] Document security measures

---

## 🎯 Recommended Timeline

### Week 1: Critical Security
- [ ] Implement backend API proxy
- [ ] Add basic rate limiting
- [ ] Set up billing alerts

### Week 2: Enhanced Security
- [ ] Add authentication
- [ ] Implement caching
- [ ] Set up error monitoring

### Week 3: Optimization
- [ ] Fine-tune rate limits
- [ ] Optimize API usage
- [ ] Add analytics

### Week 4: Monitoring
- [ ] Review usage patterns
- [ ] Adjust limits as needed
- [ ] Document best practices

---

## 📞 Emergency Response

### If API Key is Compromised:

1. **Immediately:**
   - Go to Google AI Studio
   - Revoke the compromised API key
   - Generate a new API key

2. **Update Vercel:**
   - Update `GEMINI_API_KEY` in Vercel Dashboard
   - Redeploy application

3. **Monitor:**
   - Check Google Cloud Console for unusual activity
   - Review billing for unexpected charges

4. **Prevent:**
   - Implement backend proxy (if not done)
   - Add rate limiting
   - Set up alerts

---

**Last Updated:** December 30, 2025  
**Security Level:** 🔴 Needs Improvement → 🟢 Production Ready (after implementing backend proxy)
