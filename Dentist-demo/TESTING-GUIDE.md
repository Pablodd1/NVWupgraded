# 🧪 Deployment Testing Guide

## Comprehensive Testing Checklist for Vercel Deployment

---

## 🎯 Testing Overview

This guide covers:
1. Pre-deployment testing (local)
2. Deployment verification
3. Functional testing
4. Performance testing
5. Security testing
6. User acceptance testing

---

## Phase 1: Pre-Deployment Testing (Local)

### 1.1 Local Build Test

```bash
cd e:\NVWineries-dec-genspark_ai_developer\Dentist-demo

# Install dependencies
npm install

# Create .env.local file
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev
```

**Expected Output:**
```
VITE v6.2.0  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.x:3000/
```

**✅ Checklist:**
- [ ] No dependency installation errors
- [ ] Development server starts successfully
- [ ] No console errors on page load
- [ ] App renders correctly at localhost:3000

---

### 1.2 Production Build Test

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

**Expected Output:**
```
vite v6.2.0 building for production...
✓ 45 modules transformed.
dist/index.html                   5.65 kB │ gzip:  2.12 kB
dist/assets/index-[hash].css     12.34 kB │ gzip:  3.45 kB
dist/assets/index-[hash].js     234.56 kB │ gzip: 78.90 kB
✓ built in 3.45s
```

**✅ Checklist:**
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] dist/ folder created
- [ ] Preview server runs successfully
- [ ] App works in preview mode

---

### 1.3 Code Quality Checks

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for linting issues (if ESLint configured)
npx eslint . --ext .ts,.tsx

# Check bundle size
npm run build -- --report
```

**✅ Checklist:**
- [ ] No TypeScript compilation errors
- [ ] No linting errors (or only warnings)
- [ ] Bundle size is reasonable (<500KB gzipped)

---

## Phase 2: Deployment Verification

### 2.1 Trigger Deployment

**Method 1: Git Push**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

**Method 2: Vercel CLI**
```bash
vercel --prod
```

**Method 3: Manual Redeploy**
- Go to Vercel Dashboard → Deployments
- Click "Redeploy" on latest deployment

---

### 2.2 Monitor Deployment

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click on "Deployments" tab
   - Find the latest deployment

2. **Check Build Logs**
   ```
   Expected stages:
   ✓ Cloning repository
   ✓ Installing dependencies
   ✓ Building application
   ✓ Uploading build output
   ✓ Deployment ready
   ```

3. **Verify Deployment Status**
   - Status should be "Ready" (green checkmark)
   - Deployment URL should be active
   - No error messages

**✅ Checklist:**
- [ ] Deployment status is "Ready"
- [ ] Build completed in <5 minutes
- [ ] No build errors in logs
- [ ] Deployment URL is accessible

---

### 2.3 Environment Variables Check

**Verify in Vercel Dashboard:**
1. Settings → Environment Variables
2. Confirm `GEMINI_API_KEY` is present
3. Check it's enabled for Production

**Test in Browser Console:**
```javascript
// This should NOT show your API key (security check)
console.log(window.process?.env?.API_KEY);
// Should be undefined or the key (depending on implementation)
```

**✅ Checklist:**
- [ ] Environment variable is set in Vercel
- [ ] Variable is available to the application
- [ ] No errors about missing API key

---

## Phase 3: Functional Testing

### 3.1 Landing Page Test

**URL:** `https://your-app.vercel.app`

**Test Steps:**
1. Open the deployment URL
2. Verify landing page loads
3. Check all text is visible
4. Verify logo/branding displays
5. Click "Begin Studio Session" button

**✅ Checklist:**
- [ ] Page loads within 3 seconds
- [ ] All images load correctly
- [ ] Fonts render properly (Playfair Display, Lato)
- [ ] Animations work smoothly
- [ ] Button click navigates to camera view

---

### 3.2 Camera Capture Test

**Test Steps:**
1. Grant camera permissions when prompted
2. Verify camera feed displays
3. Check alignment guides are visible
4. Take a photo
5. Verify photo is captured

**✅ Checklist:**
- [ ] Camera permission prompt appears
- [ ] Camera feed displays (mirrored)
- [ ] Alignment guides overlay correctly
- [ ] "Calibrated" indicator shows
- [ ] Capture button works
- [ ] Photo transitions to editor view

**Troubleshooting:**
- If camera doesn't work: Check HTTPS is enabled (Vercel provides this)
- If permission denied: Clear site data and reload
- If no camera available: Test file upload instead

---

### 3.3 File Upload Test

**Test Steps:**
1. Click "Import" button
2. Select a dental photo from your device
3. Verify image loads in editor

**Test Images:**
- Use a clear frontal smile photo
- Recommended: 1280x720 or higher resolution
- Format: JPEG, PNG, or WebP

**✅ Checklist:**
- [ ] File picker opens
- [ ] Image uploads successfully
- [ ] Image displays in editor
- [ ] No upload errors

---

### 3.4 Image Generation Test

**Test Steps:**
1. In editor view, enter prompt: "Add bright white veneers to front teeth"
2. Click "Apply Simulation"
3. Wait for generation (10-30 seconds)
4. Verify generated image appears

**Additional Test Prompts:**
```
1. "Add porcelain veneers with natural translucency"
2. "Whiten teeth to VITA shade B1"
3. "Add zirconia crowns to molars"
4. "Simulate orthodontic alignment"
```

**✅ Checklist:**
- [ ] Prompt input accepts text
- [ ] "Apply Simulation" button is clickable
- [ ] Loading indicator appears
- [ ] Generation completes within 30 seconds
- [ ] Generated image displays
- [ ] Image quality is good (no artifacts)
- [ ] "Show Original" toggle works

**Expected Behavior:**
- Loading message: "Simulating Morphology..."
- Spinner animation during generation
- Smooth transition to generated image

---

### 3.5 Tooth Selection Test

**Test Steps:**
1. In editor view, click "Parameters" tab (mobile) or right panel (desktop)
2. Click on tooth selection map
3. Select teeth (e.g., teeth 8, 9, 10)
4. Verify selection indicators appear
5. Generate with selected teeth

**✅ Checklist:**
- [ ] Tooth map is interactive
- [ ] Clicking teeth toggles selection
- [ ] Selected teeth show visual indicator
- [ ] Selection count updates
- [ ] Amber dots appear on image overlay
- [ ] Generation targets selected teeth only

---

### 3.6 Material Adjustment Test

**Test Steps:**
1. Adjust "Chromatic Shading" sliders
   - Hue: -50 to +50
   - Saturation: -50 to +50
2. Change "Surface Topology" dropdown
3. Adjust "Reflectivity" slider
4. Generate and verify changes

**✅ Checklist:**
- [ ] Sliders move smoothly
- [ ] Dropdown shows options
- [ ] Values update in real-time
- [ ] Generated image reflects adjustments
- [ ] Different materials produce different results

---

### 3.7 Cart/Proposal Test

**Test Steps:**
1. Click shopping cart icon in header
2. Verify cart drawer opens
3. Add items from product catalog
4. Check cart updates
5. Remove items
6. Verify total calculation

**✅ Checklist:**
- [ ] Cart drawer slides in smoothly
- [ ] Empty cart shows placeholder message
- [ ] Products can be added
- [ ] Cart count badge updates
- [ ] Items can be removed
- [ ] Total price calculates correctly
- [ ] "Finalize Consultation" button present

---

### 3.8 Zoom & Pan Test

**Test Steps:**
1. In editor view, scroll mouse wheel to zoom
2. Drag image when zoomed
3. Click zoom in/out buttons
4. Click reset button

**✅ Checklist:**
- [ ] Mouse wheel zooms in/out
- [ ] Zoom range: 1x to 4x
- [ ] Dragging works when zoomed
- [ ] Zoom controls work
- [ ] Reset returns to 1x zoom
- [ ] Cursor changes to grab/grabbing

---

## Phase 4: Cross-Browser Testing

### 4.1 Desktop Browsers

**Test on:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS)
- [ ] Edge (latest)

**For each browser, verify:**
- [ ] App loads correctly
- [ ] Camera works
- [ ] Image generation works
- [ ] UI renders properly
- [ ] No console errors

---

### 4.2 Mobile Browsers

**Test on:**
- [ ] iOS Safari (iPhone)
- [ ] Android Chrome
- [ ] iOS Chrome (iPhone)

**For each, verify:**
- [ ] Responsive layout works
- [ ] Touch interactions work
- [ ] Camera works (rear camera option)
- [ ] Tab navigation works
- [ ] Keyboard doesn't break layout

---

### 4.3 Tablet Testing

**Test on:**
- [ ] iPad Safari
- [ ] Android tablet Chrome

**Verify:**
- [ ] Layout adapts to tablet size
- [ ] Touch targets are large enough
- [ ] Landscape mode works
- [ ] Split-screen works

---

## Phase 5: Performance Testing

### 5.1 Page Load Performance

**Tools:**
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- Chrome DevTools Lighthouse

**Run Lighthouse Audit:**
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Performance" category
4. Click "Analyze page load"

**Target Scores:**
- Performance: >80
- Accessibility: >90
- Best Practices: >90
- SEO: >80

**✅ Checklist:**
- [ ] First Contentful Paint (FCP): <2s
- [ ] Largest Contentful Paint (LCP): <2.5s
- [ ] Time to Interactive (TTI): <3.5s
- [ ] Cumulative Layout Shift (CLS): <0.1
- [ ] Total Blocking Time (TBT): <300ms

---

### 5.2 API Performance

**Test API Response Times:**

```javascript
// In browser console
const testAPIPerformance = async () => {
  const start = performance.now();
  
  // Trigger image generation
  // (use actual app functionality)
  
  const end = performance.now();
  console.log(`Generation time: ${(end - start) / 1000}s`);
};
```

**Target Metrics:**
- Image generation: <30 seconds
- API response time: <10 seconds
- Error rate: <5%

**✅ Checklist:**
- [ ] Generation completes within 30s
- [ ] No timeout errors
- [ ] Consistent performance across tests
- [ ] No rate limiting issues

---

### 5.3 Bundle Size Analysis

**Check in Vercel Deployment Logs:**
```
dist/assets/index-[hash].js     234.56 kB │ gzip: 78.90 kB
```

**Target Sizes:**
- Total JS bundle: <300KB gzipped
- CSS bundle: <50KB gzipped
- Initial page load: <500KB total

**✅ Checklist:**
- [ ] Bundle sizes within targets
- [ ] No duplicate dependencies
- [ ] Code splitting implemented (if needed)

---

## Phase 6: Security Testing

### 6.1 API Key Security

**Test:**
1. Open browser DevTools → Network tab
2. Trigger image generation
3. Check API requests

**✅ Checklist:**
- [ ] API key is NOT visible in Network tab
- [ ] API key is NOT in page source
- [ ] API key is NOT in localStorage
- [ ] Requests go through proper channels

**⚠️ Current Implementation:**
- API key IS exposed in browser (see SECURITY-GUIDE.md)
- Acceptable for demo/testing
- NOT recommended for production

---

### 6.2 HTTPS Verification

**Test:**
1. Check URL starts with `https://`
2. Click padlock icon in browser
3. Verify certificate is valid

**✅ Checklist:**
- [ ] Site uses HTTPS
- [ ] Certificate is valid
- [ ] No mixed content warnings
- [ ] Camera permissions work (requires HTTPS)

---

### 6.3 Input Validation

**Test:**
1. Try extremely long prompts (>1000 characters)
2. Try special characters in prompts
3. Try uploading very large images (>10MB)
4. Try invalid file types

**✅ Checklist:**
- [ ] Long prompts handled gracefully
- [ ] Special characters don't break app
- [ ] Large images show error or resize
- [ ] Invalid files show error message

---

## Phase 7: Error Handling Testing

### 7.1 Network Error Test

**Test Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try to generate image
4. Verify error message

**✅ Checklist:**
- [ ] Error message displays
- [ ] User-friendly error text
- [ ] No app crash
- [ ] Can retry after reconnecting

---

### 7.2 API Error Test

**Test Steps:**
1. Temporarily use invalid API key
2. Try to generate image
3. Verify error handling

**✅ Checklist:**
- [ ] Error message: "Clinical Key expired"
- [ ] Option to select new API key
- [ ] No sensitive error details exposed
- [ ] App remains functional

---

### 7.3 Browser Compatibility Errors

**Test:**
1. Disable JavaScript
2. Use very old browser (if possible)
3. Block camera permissions

**✅ Checklist:**
- [ ] Graceful degradation
- [ ] Helpful error messages
- [ ] Alternative options provided (e.g., upload instead of camera)

---

## Phase 8: User Acceptance Testing (UAT)

### 8.1 User Flow Test

**Scenario: New User First Visit**

1. Land on homepage
2. Click "Begin Studio Session"
3. Grant camera permission
4. Take photo
5. Enter treatment prompt
6. Generate visualization
7. Compare before/after
8. Add to cart
9. View proposal

**✅ Checklist:**
- [ ] Flow is intuitive
- [ ] No confusing steps
- [ ] Clear instructions
- [ ] Smooth transitions
- [ ] Can complete without help

---

### 8.2 Accessibility Test

**Tools:**
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- Screen reader (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation

**Test:**
1. Navigate entire app using only keyboard (Tab, Enter, Esc)
2. Use screen reader to read content
3. Check color contrast ratios
4. Verify ARIA labels

**✅ Checklist:**
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Screen reader announces content
- [ ] Color contrast meets WCAG AA standards
- [ ] Alt text on images

---

### 8.3 Mobile UX Test

**Test on Real Device:**
1. Complete full user flow on mobile
2. Test in portrait and landscape
3. Test with one hand
4. Test with gloves (if applicable)

**✅ Checklist:**
- [ ] Touch targets are large enough (44x44px minimum)
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling
- [ ] Buttons don't overlap
- [ ] Keyboard doesn't cover inputs

---

## 📊 Testing Results Template

### Deployment Test Report

**Date:** December 30, 2025  
**Tester:** [Your Name]  
**Deployment URL:** https://dentist-demo.vercel.app  
**Build Version:** [Commit hash or version number]

#### Summary
- Total Tests: X
- Passed: X
- Failed: X
- Warnings: X

#### Critical Issues
- [ ] None found
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

#### Performance Metrics
- Page Load Time: X seconds
- Generation Time: X seconds
- Lighthouse Score: X/100

#### Browser Compatibility
- Chrome: ✅ Pass
- Firefox: ✅ Pass
- Safari: ✅ Pass
- Mobile: ✅ Pass

#### Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

#### Sign-off
- [ ] Ready for production
- [ ] Needs fixes before launch
- [ ] Requires further testing

---

## 🚨 Common Issues & Solutions

### Issue: "Clinical API Key is not configured"
**Solution:** Add GEMINI_API_KEY to Vercel environment variables and redeploy

### Issue: Camera not working
**Solution:** Ensure HTTPS is enabled (Vercel provides this automatically)

### Issue: Slow generation times
**Solution:** Check Gemini API status, verify billing is enabled

### Issue: Build fails
**Solution:** Check build logs, verify dependencies, test local build

### Issue: Images don't load
**Solution:** Check network tab for errors, verify image URLs

---

## ✅ Final Pre-Launch Checklist

Before announcing to users:

- [ ] All Phase 1-8 tests passed
- [ ] No critical bugs
- [ ] Performance meets targets
- [ ] Security review completed
- [ ] Error handling tested
- [ ] Mobile experience verified
- [ ] Billing alerts configured
- [ ] Monitoring set up
- [ ] Documentation complete
- [ ] Support plan in place

---

**Testing Completed:** [Date]  
**Status:** ✅ Ready for launch / ⚠️ Needs attention  
**Next Steps:** [Action items]
