# 🔐 Security & Performance Optimization Guide
**Napa Valley Wineries Platform**

## 📋 Table of Contents
- [Environment Variables Checklist](#environment-variables-checklist)
- [Security Implementations](#security-implementations)
- [Performance Optimizations](#performance-optimizations)
- [Production Deployment Checklist](#production-deployment-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🔑 Environment Variables Checklist

### ✅ REQUIRED Variables

#### 1. Database
```bash
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
```
**Status:** ⚠️ **CONFIGURE IN PRODUCTION**
- Use MongoDB Atlas production cluster
- Enable IP whitelist
- Use strong password (32+ characters)
- Enable encryption at rest

#### 2. JWT Secret
```bash
JWT_SECRET=<generate-random-32-char-string>
```
**Status:** ⚠️ **CRITICAL - MUST CONFIGURE**
- Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **NEVER** use `NEXT_PUBLIC_` prefix (exposes to client!)
- Rotate every 90 days
- Different secret for dev/staging/production

#### 3. Application URL
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
```
**Status:** ⚠️ **CONFIGURE IN PRODUCTION**

#### 4. Email Configuration
```bash
# Option 1: SendGrid (Recommended - FREE 100/day)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@your-domain.com

# Option 2: SMTP (Gmail, etc.)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password
EMAIL_FROM=your-email@gmail.com
```
**Status:** ⚠️ **CONFIGURE FOR PRODUCTION**
- Ethereal Email works for development (auto-configured)
- Production needs real email service

### ⚙️ OPTIONAL Variables

#### 5. SMS Notifications (Twilio)
```bash
NEXT_PUBLIC_ENABLE_SMS=false  # Set to true when configured
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
```
**Status:** ✅ **OPTIONAL** (Currently disabled)
- Free $15 credit from Twilio
- Enable after email is working

#### 6. Payment Processing (Stripe)
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```
**Status:** ⚠️ **REQUIRED FOR PAYMENTS**
- Use test keys in development
- Switch to live keys in production

#### 7. Google Services
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxx
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyxxxxx
GEMINI_API_KEY=xxxxx  # For voice search
```
**Status:** ⚠️ **CONFIGURE & RESTRICT**
- **IMPORTANT:** Restrict API keys in Google Console to your domain!
- Current key in template is exposed - replace immediately!

#### 8. Security Configuration
```bash
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
CORS_ORIGINS=https://your-domain.com
ENABLE_SECURITY_HEADERS=true
```
**Status:** ✅ **CONFIGURED** (defaults set)

---

## 🛡️ Security Implementations

### ✅ Implemented Security Features

#### 1. **Rate Limiting** ✅
- **Location:** `src/middleware.ts`
- **Default:** 100 requests per minute per IP
- **Configurable via:** `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW`
- **Applies to:** All API routes
- **Headers returned:**
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
  - `Retry-After`

#### 2. **Security Headers** ✅
- **X-Frame-Options:** DENY (prevents clickjacking)
- **X-Content-Type-Options:** nosniff (prevents MIME sniffing)
- **X-XSS-Protection:** 1; mode=block
- **Referrer-Policy:** strict-origin-when-cross-origin
- **Content-Security-Policy:** Configured for Stripe, Google Maps
- **Permissions-Policy:** Restricts camera, microphone
- **Strict-Transport-Security:** HTTPS enforcement (production only)

#### 3. **Input Sanitization** ✅
- **Location:** `src/lib/security.ts`
- **Functions:**
  - `sanitizeString()` - XSS prevention
  - `sanitizeEmail()` - Email validation
  - `sanitizePhone()` - Phone number cleaning
  - `sanitizeObject()` - Recursive object sanitization

#### 4. **Validation** ✅
- Email format validation
- Phone number validation
- MongoDB ObjectId validation
- Date validation
- Number range validation
- Password strength validation (8+ chars, uppercase, lowercase, number, special char)

#### 5. **SQL/NoSQL Injection Prevention** ✅
- Pattern detection for SQL injection
- NoSQL operator detection ($where, $regex, etc.)
- Input sanitization before database queries

#### 6. **JWT Authentication** ✅
- Secure token verification using `jose` library
- Role-based access control (admin, winery_owner, client)
- Token expiration handling
- Invalid token cleanup

#### 7. **Bot Detection** ✅
- User agent analysis
- Logging of suspicious activity
- Configurable blocking (currently logs only)

#### 8. **CORS Protection** ✅
- Origin validation
- Configurable allowed origins
- Credentials support

---

## ⚡ Performance Optimizations

### ✅ Implemented Optimizations

#### 1. **Image Optimization** ✅
- **Next.js Image component** with automatic optimization
- **Formats:** AVIF, WebP (modern formats)
- **Lazy loading:** Images load on scroll
- **Responsive images:** Multiple sizes for different devices
- **CDN caching:** 1-year cache for images

#### 2. **Code Splitting** ✅
- **Automatic route-based splitting**
- **Vendor chunk separation**
- **Common chunk extraction**
- **Dynamic imports** for heavy components

#### 3. **Caching Strategy** ✅
- **Static assets:** 1-year cache
- **Images:** 1-year cache with immutable flag
- **API responses:** No cache (dynamic data)
- **DNS prefetch:** Enabled

#### 4. **Bundle Optimization** ✅
- **SWC minification** (faster than Terser)
- **Tree shaking** for unused code
- **Package optimization** for common libraries
- **Compression** enabled

#### 5. **Database Optimization** ✅
- **Connection pooling** (Mongoose)
- **Indexes** on frequently queried fields
- **Lean queries** for read-only operations
- **Projection** to limit returned fields

#### 6. **Server-Side Rendering** ✅
- **Static generation** for public pages
- **Incremental Static Regeneration** for dynamic content
- **Server components** for better performance

---

## 📝 Production Deployment Checklist

### Before Deployment

- [ ] **Environment Variables**
  - [ ] Set `JWT_SECRET` (generate new, don't reuse dev secret)
  - [ ] Configure `MONGODB_URI` (production cluster)
  - [ ] Set `NEXT_PUBLIC_APP_URL` (production domain)
  - [ ] Configure email provider (SendGrid/SMTP)
  - [ ] Set Stripe live keys (if using payments)
  - [ ] Restrict Google API keys to production domain
  - [ ] Configure `CORS_ORIGINS`

- [ ] **Security**
  - [ ] Remove any test/debug endpoints
  - [ ] Verify rate limiting is enabled
  - [ ] Check security headers are applied
  - [ ] Ensure JWT_SECRET is not using NEXT_PUBLIC_ prefix
  - [ ] Review and update CORS origins
  - [ ] Enable HTTPS (Strict-Transport-Security)

- [ ] **Database**
  - [ ] Create production database
  - [ ] Set up database backups
  - [ ] Configure IP whitelist
  - [ ] Enable MongoDB Atlas monitoring
  - [ ] Run seed scripts if needed

- [ ] **Email & Notifications**
  - [ ] Test email delivery
  - [ ] Verify email templates render correctly
  - [ ] Configure email sender domain (SPF, DKIM)
  - [ ] Test SMS if enabled

- [ ] **Performance**
  - [ ] Run production build locally: `npm run build`
  - [ ] Test build output
  - [ ] Verify image optimization
  - [ ] Check bundle sizes
  - [ ] Test on slow network

- [ ] **Testing**
  - [ ] Test all user flows
  - [ ] Test authentication
  - [ ] Test booking process
  - [ ] Test payment flow
  - [ ] Test admin dashboard
  - [ ] Test winery dashboard

### After Deployment

- [ ] **Verification**
  - [ ] Check all pages load correctly
  - [ ] Verify SSL certificate
  - [ ] Test API endpoints
  - [ ] Check security headers (use securityheaders.com)
  - [ ] Test email notifications
  - [ ] Verify database connections

- [ ] **Monitoring Setup**
  - [ ] Set up error tracking (Sentry recommended)
  - [ ] Configure uptime monitoring
  - [ ] Set up performance monitoring
  - [ ] Enable database monitoring
  - [ ] Configure log aggregation

---

## 📊 Monitoring & Maintenance

### Recommended Tools

#### 1. **Error Tracking**
- **Sentry** (recommended)
  - Real-time error tracking
  - Performance monitoring
  - Release tracking
  - Free tier: 5,000 events/month

#### 2. **Uptime Monitoring**
- **UptimeRobot** (free)
  - 50 monitors
  - 5-minute intervals
  - Email/SMS alerts

#### 3. **Performance Monitoring**
- **Vercel Analytics** (if deployed on Vercel)
- **Google PageSpeed Insights**
- **Lighthouse CI**

#### 4. **Database Monitoring**
- **MongoDB Atlas built-in monitoring**
  - Query performance
  - Index usage
  - Connection pool stats

### Maintenance Tasks

#### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review failed email/SMS notifications

#### Weekly
- [ ] Review performance metrics
- [ ] Check database performance
- [ ] Review security logs
- [ ] Monitor rate limit violations

#### Monthly
- [ ] Update dependencies
- [ ] Review and rotate secrets
- [ ] Database backup verification
- [ ] Security audit
- [ ] Performance optimization review

#### Quarterly
- [ ] Rotate JWT_SECRET
- [ ] Review and update security policies
- [ ] Dependency security audit
- [ ] Performance benchmarking

---

## 🚨 Security Incidents Response

### If JWT_SECRET is Compromised
1. Generate new secret immediately
2. Update environment variable
3. Redeploy application
4. Force logout all users (tokens will be invalid)
5. Notify users if necessary

### If Database Credentials are Compromised
1. Rotate database password immediately
2. Update environment variable
3. Review database access logs
4. Check for unauthorized access
5. Restore from backup if necessary

### If API Keys are Compromised
1. Revoke compromised keys
2. Generate new keys
3. Update environment variables
4. Review usage logs
5. Set up key restrictions

---

## 📚 Additional Resources

### Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)

### Performance
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Monitoring
- [Sentry Documentation](https://docs.sentry.io/)
- [Vercel Analytics](https://vercel.com/analytics)
- [MongoDB Atlas Monitoring](https://www.mongodb.com/docs/atlas/monitoring-alerts/)

---

## ✅ Implementation Status

### Security Features
- ✅ Rate limiting
- ✅ Security headers
- ✅ Input sanitization
- ✅ Input validation
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Bot detection
- ✅ CORS protection
- ✅ SQL/NoSQL injection prevention
- ✅ Password strength validation

### Performance Features
- ✅ Image optimization
- ✅ Code splitting
- ✅ Caching strategy
- ✅ Bundle optimization
- ✅ Database optimization
- ✅ Server-side rendering

### Pending Configuration
- ⚠️ Production environment variables
- ⚠️ Email service configuration
- ⚠️ Google API key restrictions
- ⚠️ Monitoring setup
- ⚠️ Backup configuration

---

**Last Updated:** December 23, 2025  
**Version:** 1.0.0  
**Status:** ✅ Security & Performance Features Implemented - Ready for Configuration
