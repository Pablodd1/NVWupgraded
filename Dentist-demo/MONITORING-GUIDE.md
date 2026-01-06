# 📊 Monitoring & Alerts Setup Guide

## Complete Monitoring Solution for Production Deployment

---

## 🎯 Monitoring Overview

This guide covers:
1. Google Cloud Console monitoring (API usage & costs)
2. Vercel Analytics (performance & traffic)
3. Error tracking with Sentry
4. Uptime monitoring
5. Custom alerts & notifications

---

## Part 1: Google Cloud Console Monitoring

### 1.1 Enable API Monitoring

**Step 1: Access Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (top dropdown)
3. Navigate to **APIs & Services** → **Dashboard**

**Step 2: View API Usage**
1. Click on **Generative Language API**
2. Go to **Metrics** tab
3. View:
   - Requests per day
   - Error rate
   - Latency
   - Quota usage

**✅ Checklist:**
- [ ] API metrics dashboard accessible
- [ ] Current usage visible
- [ ] No quota warnings

---

### 1.2 Set Up Billing Alerts

**Step 1: Create Budget**
1. Go to **Billing** → **Budgets & alerts**
2. Click **Create Budget**
3. Configure:
   ```
   Name: Dentist Demo API Budget
   Projects: [Your project]
   Services: Generative Language API
   Time range: Monthly
   ```

**Step 2: Set Budget Amount**
```
Budget amount: $50.00 per month
(Adjust based on expected usage)
```

**Step 3: Configure Alert Thresholds**
```
Alert at:
☑️ 50% of budget ($25)
☑️ 90% of budget ($45)
☑️ 100% of budget ($50)
☑️ 110% of budget ($55) - Overage alert
```

**Step 4: Add Notification Channels**
1. Click **Manage notification channels**
2. Add email addresses:
   - Your email
   - Billing admin email
   - Team lead email (if applicable)

**Step 5: Save Budget**

**✅ Checklist:**
- [ ] Budget created
- [ ] Alert thresholds configured
- [ ] Email notifications enabled
- [ ] Test alert received (optional)

---

### 1.3 Set Up Quota Alerts

**Step 1: Access Quotas**
1. Go to **IAM & Admin** → **Quotas**
2. Filter by service: "Generative Language API"

**Step 2: View Current Quotas**
```
Common quotas:
- Requests per minute: 60
- Requests per day: 1,500
- Tokens per minute: 32,000
```

**Step 3: Request Quota Increase (if needed)**
1. Select quota
2. Click **Edit Quotas**
3. Request increase
4. Provide justification

**Step 4: Set Up Quota Alerts**
1. Go to **Monitoring** → **Alerting**
2. Click **Create Policy**
3. Configure:
   ```
   Condition: API quota usage > 80%
   Notification: Email
   Documentation: "API quota nearing limit"
   ```

**✅ Checklist:**
- [ ] Current quotas reviewed
- [ ] Quota alerts configured
- [ ] Increase requested (if needed)

---

### 1.4 Monitor API Errors

**Step 1: Access Logs**
1. Go to **Logging** → **Logs Explorer**
2. Filter by:
   ```
   resource.type="api"
   resource.labels.service="generativelanguage.googleapis.com"
   severity>="ERROR"
   ```

**Step 2: Create Error Alert**
1. Click **Create alert from query**
2. Configure:
   ```
   Alert name: Gemini API Errors
   Condition: Log entries > 10 in 5 minutes
   Notification: Email
   ```

**Step 3: Set Up Error Dashboard**
1. Go to **Monitoring** → **Dashboards**
2. Click **Create Dashboard**
3. Add charts:
   - Error rate over time
   - Error types breakdown
   - Affected users

**✅ Checklist:**
- [ ] Error logging enabled
- [ ] Error alerts configured
- [ ] Dashboard created

---

## Part 2: Vercel Analytics

### 2.1 Enable Vercel Analytics

**Step 1: Install Package**
```bash
cd e:\NVWineries-dec-genspark_ai_developer\Dentist-demo
npm install @vercel/analytics
```

**Step 2: Add to Application**

Edit `index.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
```

**Step 3: Deploy**
```bash
git add .
git commit -m "Add Vercel Analytics"
git push origin main
```

**Step 4: View Analytics**
1. Go to Vercel Dashboard → Your Project
2. Click **Analytics** tab
3. View:
   - Page views
   - Unique visitors
   - Top pages
   - Referrers
   - Devices

**✅ Checklist:**
- [ ] Analytics package installed
- [ ] Code updated
- [ ] Deployed successfully
- [ ] Data appearing in dashboard

---

### 2.2 Enable Speed Insights

**Step 1: Install Package**
```bash
npm install @vercel/speed-insights
```

**Step 2: Add to Application**

Edit `index.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
);
```

**Step 3: View Speed Insights**
1. Vercel Dashboard → Speed Insights
2. Monitor:
   - Core Web Vitals (LCP, FID, CLS)
   - Performance score
   - Slow pages
   - Device breakdown

**✅ Checklist:**
- [ ] Speed Insights installed
- [ ] Real User Monitoring (RUM) data collecting
- [ ] Core Web Vitals visible

---

### 2.3 Configure Vercel Alerts

**Step 1: Access Settings**
1. Vercel Dashboard → Settings → Notifications

**Step 2: Enable Alerts**
```
☑️ Deployment failed
☑️ Deployment succeeded (optional)
☑️ Domain configuration issues
☑️ Build errors
☑️ Function errors
```

**Step 3: Add Notification Channels**
- Email
- Slack (optional)
- Discord (optional)

**✅ Checklist:**
- [ ] Deployment alerts enabled
- [ ] Email notifications configured
- [ ] Test alert received

---

## Part 3: Error Tracking with Sentry

### 3.1 Set Up Sentry Account

**Step 1: Create Account**
1. Go to [Sentry.io](https://sentry.io/)
2. Sign up for free account
3. Create new project:
   ```
   Platform: React
   Project name: Dentist Demo
   ```

**Step 2: Get DSN**
- Copy the DSN (Data Source Name)
- Format: `https://[key]@[org].ingest.sentry.io/[project]`

---

### 3.2 Install Sentry

**Step 1: Install Packages**
```bash
npm install @sentry/react @sentry/vite-plugin
```

**Step 2: Configure Sentry**

Create `src/lib/sentry.ts`:
```typescript
import * as Sentry from "@sentry/react";

export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true, // HIPAA compliance
        blockAllMedia: true,
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: 1.0, // 100% of transactions
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of errors
    
    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive patient data
      if (event.request) {
        delete event.request.cookies;
      }
      return event;
    },
  });
};
```

**Step 3: Initialize in App**

Edit `index.tsx`:
```typescript
import { initSentry } from './lib/sentry';

// Initialize Sentry before React
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
);
```

**Step 4: Add Error Boundary**

Create `src/components/ErrorBoundary.tsx`:
```typescript
import * as Sentry from "@sentry/react";

const ErrorBoundary = Sentry.ErrorBoundary;

export default ErrorBoundary;
```

Wrap App:
```typescript
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </ErrorBoundary>
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
);

const ErrorFallback = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Something went wrong</h1>
    <p>We've been notified and are working on a fix.</p>
    <button onClick={() => window.location.reload()}>
      Reload Page
    </button>
  </div>
);
```

**Step 5: Add Environment Variable**

Add to Vercel:
```
VITE_SENTRY_DSN=https://[your-sentry-dsn]
```

**Step 6: Deploy**
```bash
git add .
git commit -m "Add Sentry error tracking"
git push origin main
```

**✅ Checklist:**
- [ ] Sentry account created
- [ ] SDK installed
- [ ] Error boundary added
- [ ] DSN configured in Vercel
- [ ] Deployed successfully
- [ ] Test error captured

---

### 3.3 Configure Sentry Alerts

**Step 1: Access Alerts**
1. Sentry Dashboard → Alerts
2. Click **Create Alert Rule**

**Step 2: Create Error Alert**
```
Alert name: High Error Rate
Condition: Errors > 10 in 1 hour
Action: Send email notification
```

**Step 3: Create Performance Alert**
```
Alert name: Slow API Responses
Condition: P95 response time > 30 seconds
Action: Send email notification
```

**Step 4: Add Integrations**
- Email
- Slack (optional)
- PagerDuty (optional)

**✅ Checklist:**
- [ ] Error alerts configured
- [ ] Performance alerts configured
- [ ] Notifications working

---

## Part 4: Uptime Monitoring

### 4.1 UptimeRobot Setup

**Step 1: Create Account**
1. Go to [UptimeRobot.com](https://uptimerobot.com/)
2. Sign up for free account (50 monitors)

**Step 2: Add Monitor**
```
Monitor Type: HTTPS
Friendly Name: Dentist Demo Production
URL: https://your-app.vercel.app
Monitoring Interval: 5 minutes
```

**Step 3: Configure Alerts**
```
Alert Contacts:
- Email: your-email@example.com
- SMS: +1-xxx-xxx-xxxx (optional)

Alert When:
☑️ Monitor goes down
☑️ Monitor goes up (recovery)
```

**Step 4: Add Status Page** (Optional)
1. Create public status page
2. Share URL with users
3. Shows uptime history

**✅ Checklist:**
- [ ] Monitor created
- [ ] Alert contacts added
- [ ] Test alert received
- [ ] Status page created (optional)

---

### 4.2 Vercel Deployment Monitoring

**Built-in Monitoring:**
1. Vercel Dashboard → Deployments
2. View:
   - Deployment status
   - Build times
   - Error rates
   - Function invocations

**Set Up Alerts:**
1. Settings → Notifications
2. Enable:
   - Deployment failures
   - Function errors
   - Domain issues

**✅ Checklist:**
- [ ] Deployment monitoring active
- [ ] Alerts configured
- [ ] Dashboard reviewed regularly

---

## Part 5: Custom Monitoring Dashboard

### 5.1 Create Monitoring Dashboard

**Option 1: Google Sheets (Simple)**

Create spreadsheet with columns:
```
Date | Page Views | API Calls | Errors | Cost | Notes
```

Update daily/weekly manually from:
- Vercel Analytics
- Google Cloud Console
- Sentry

**Option 2: Grafana (Advanced)**

1. Set up Grafana Cloud (free tier)
2. Connect data sources:
   - Google Cloud Monitoring
   - Vercel API
   - Sentry
3. Create dashboards with:
   - API usage trends
   - Error rates
   - Performance metrics
   - Cost tracking

---

### 5.2 Daily Monitoring Checklist

**Every Morning (5 minutes):**
- [ ] Check Vercel deployment status
- [ ] Review Sentry errors (if any)
- [ ] Check Google Cloud API usage
- [ ] Verify uptime (UptimeRobot)
- [ ] Review costs (Google Cloud Billing)

**Weekly Review (30 minutes):**
- [ ] Analyze traffic trends
- [ ] Review performance metrics
- [ ] Check for security issues
- [ ] Update documentation
- [ ] Plan optimizations

**Monthly Review (2 hours):**
- [ ] Comprehensive cost analysis
- [ ] Performance optimization
- [ ] Security audit
- [ ] User feedback review
- [ ] Feature planning

---

## Part 6: Alert Configuration Reference

### 6.1 Critical Alerts (Immediate Action)

**1. API Quota Exceeded**
```
Trigger: API calls > 90% of quota
Action: Email + SMS
Priority: P1 (Critical)
Response: Increase quota or optimize usage
```

**2. High Error Rate**
```
Trigger: Errors > 5% of requests
Action: Email + Slack
Priority: P1 (Critical)
Response: Investigate and fix immediately
```

**3. Site Down**
```
Trigger: Uptime check fails
Action: Email + SMS + PagerDuty
Priority: P0 (Emergency)
Response: Check Vercel status, investigate
```

**4. Budget Exceeded**
```
Trigger: Costs > 100% of budget
Action: Email + SMS
Priority: P1 (Critical)
Response: Review usage, pause if needed
```

---

### 6.2 Warning Alerts (Monitor Closely)

**1. Slow Performance**
```
Trigger: P95 latency > 30 seconds
Action: Email
Priority: P2 (High)
Response: Optimize API calls
```

**2. High Traffic**
```
Trigger: Requests > 2x normal
Action: Email
Priority: P2 (High)
Response: Monitor for abuse, scale if needed
```

**3. Budget Warning**
```
Trigger: Costs > 50% of budget
Action: Email
Priority: P3 (Medium)
Response: Review usage trends
```

---

### 6.3 Info Alerts (FYI)

**1. Deployment Success**
```
Trigger: New deployment live
Action: Email (optional)
Priority: P4 (Low)
Response: None required
```

**2. Weekly Report**
```
Trigger: Every Monday 9 AM
Action: Email summary
Priority: P4 (Low)
Response: Review and plan week
```

---

## Part 7: Monitoring Best Practices

### 7.1 Data Retention

**Logs:**
- Google Cloud: 30 days (default)
- Sentry: 90 days (free tier)
- Vercel: 30 days

**Recommendations:**
- Export important logs monthly
- Archive critical incidents
- Keep cost data for 12 months

---

### 7.2 Alert Fatigue Prevention

**Best Practices:**
- Set appropriate thresholds (not too sensitive)
- Group related alerts
- Use different channels for different priorities
- Review and adjust alert rules monthly
- Implement auto-remediation where possible

---

### 7.3 Security Monitoring

**Monitor for:**
- Unusual API usage patterns
- Failed authentication attempts
- Suspicious IP addresses
- Data access anomalies

**Tools:**
- Google Cloud Security Command Center
- Vercel Security Logs
- Sentry Security Reports

---

## 📊 Monitoring Dashboard Template

### Daily Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Uptime | >99.9% | 100% | ✅ |
| API Calls | <1000/day | 450 | ✅ |
| Error Rate | <1% | 0.5% | ✅ |
| Avg Response | <10s | 8s | ✅ |
| Daily Cost | <$5 | $2.50 | ✅ |

### Weekly Trends

| Week | Users | API Calls | Errors | Cost |
|------|-------|-----------|--------|------|
| W1 | 50 | 2,500 | 12 | $15 |
| W2 | 75 | 3,750 | 8 | $22 |
| W3 | 100 | 5,000 | 15 | $30 |
| W4 | 120 | 6,000 | 10 | $35 |

---

## ✅ Final Monitoring Checklist

Before considering monitoring complete:

- [ ] Google Cloud billing alerts configured
- [ ] API quota alerts set up
- [ ] Vercel Analytics installed
- [ ] Speed Insights enabled
- [ ] Sentry error tracking active
- [ ] Uptime monitoring configured
- [ ] Alert channels tested
- [ ] Daily monitoring routine established
- [ ] Weekly review scheduled
- [ ] Documentation updated

---

**Monitoring Setup Completed:** [Date]  
**Status:** ✅ Fully monitored  
**Next Review:** [Date + 1 week]
