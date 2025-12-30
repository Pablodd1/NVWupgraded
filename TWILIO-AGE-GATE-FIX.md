# 🔞 Twilio Age Gate Compliance Fix

## Issue: Toll-Free Verification Rejected

**Rejection Code:** 30529 - SHAFT Violation - Alcohol Message Content Without a 21+ Robust Age Gate

**Phone Number:** +18443145527  
**Business:** NVW (Napa Valley Wineries)  
**Deadline:** 7 days for prioritized resubmission

---

## 🎯 What Twilio Requires

For alcohol-related businesses, Twilio requires:

1. **Robust Age Verification** (21+ in the US)
2. **Clear Opt-In Process** with age confirmation
3. **Documentation** of age gate implementation
4. **Compliance** with SHAFT regulations (Sex, Hate, Alcohol, Firearms, Tobacco)

---

## ✅ Solution: Implement 21+ Age Gate

### Step 1: Add Age Verification to User Registration

#### Update User Model

Edit `src/models/user.model.ts`:

```typescript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Existing fields...
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  
  // Add age verification fields
  dateOfBirth: { 
    type: Date, 
    required: true // Make this required
  },
  ageVerified: { 
    type: Boolean, 
    default: false 
  },
  ageVerificationDate: { 
    type: Date 
  },
  ageVerificationMethod: {
    type: String,
    enum: ['dob', 'id_verification', 'third_party'],
    default: 'dob'
  },
  
  // SMS Opt-in with age confirmation
  smsOptIn: {
    type: Boolean,
    default: false
  },
  smsOptInDate: {
    type: Date
  },
  smsOptInAgeConfirmed: {
    type: Boolean,
    default: false
  },
  
  // Existing fields...
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add method to verify age
userSchema.methods.verifyAge = function() {
  if (!this.dateOfBirth) return false;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  const isOver21 = age >= 21;
  
  if (isOver21) {
    this.ageVerified = true;
    this.ageVerificationDate = new Date();
  }
  
  return isOver21;
};

export default mongoose.models.User || mongoose.model('User', userSchema);
```

---

### Step 2: Create Age Verification Component

Create `src/components/AgeGate.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AgeGateProps {
  onVerified: () => void;
  showSMSOptIn?: boolean;
}

export default function AgeGate({ onVerified, showSMSOptIn = false }: AgeGateProps) {
  const router = useRouter();
  const [dateOfBirth, setDateOfBirth] = useState({
    month: '',
    day: '',
    year: ''
  });
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateAge = (dob: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleVerify = async () => {
    setError('');
    
    // Validate inputs
    if (!dateOfBirth.month || !dateOfBirth.day || !dateOfBirth.year) {
      setError('Please enter your complete date of birth');
      return;
    }

    // Create date object
    const dob = new Date(
      parseInt(dateOfBirth.year),
      parseInt(dateOfBirth.month) - 1,
      parseInt(dateOfBirth.day)
    );

    // Validate date
    if (isNaN(dob.getTime())) {
      setError('Please enter a valid date');
      return;
    }

    // Check if date is in the future
    if (dob > new Date()) {
      setError('Date of birth cannot be in the future');
      return;
    }

    // Calculate age
    const age = calculateAge(dob);

    // Check if 21+
    if (age < 21) {
      setError('You must be 21 years or older to access this site');
      return;
    }

    setLoading(true);

    try {
      // Save age verification to user profile
      const response = await fetch('/api/user/verify-age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateOfBirth: dob.toISOString(),
          smsOptIn: showSMSOptIn ? smsOptIn : false
        })
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      // Store in session/localStorage
      sessionStorage.setItem('ageVerified', 'true');
      sessionStorage.setItem('ageVerifiedDate', new Date().toISOString());

      onVerified();
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">
            Napa Valley Wineries
          </h1>
          <div className="w-16 h-1 bg-amber-600 mx-auto mb-4"></div>
        </div>

        {/* Age Verification Message */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🍷</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Age Verification Required
          </h2>
          <p className="text-gray-600 text-sm">
            You must be 21 years or older to book wine tasting experiences.
            Please verify your age to continue.
          </p>
        </div>

        {/* Date of Birth Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Date of Birth
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Month */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Month</label>
              <select
                value={dateOfBirth.month}
                onChange={(e) => setDateOfBirth({ ...dateOfBirth, month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Day</label>
              <select
                value={dateOfBirth.day}
                onChange={(e) => setDateOfBirth({ ...dateOfBirth, day: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">DD</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Year</label>
              <select
                value={dateOfBirth.year}
                onChange={(e) => setDateOfBirth({ ...dateOfBirth, year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">YYYY</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SMS Opt-In (if enabled) */}
        {showSMSOptIn && (
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={smsOptIn}
                onChange={(e) => setSmsOptIn(e.target.checked)}
                className="mt-1 mr-3 h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <div className="text-sm">
                <p className="font-semibold text-gray-900 mb-1">
                  📱 Receive SMS Notifications (Optional)
                </p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  I confirm I am 21+ and consent to receive booking confirmations, 
                  reminders, and updates via SMS. Message and data rates may apply. 
                  Reply STOP to opt out anytime.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify Age & Continue'}
        </button>

        {/* Legal Notice */}
        <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
          By continuing, you certify that you are 21 years of age or older and agree to our{' '}
          <a href="/terms" className="text-amber-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-amber-600 hover:underline">Privacy Policy</a>.
        </p>

        {/* Exit Option */}
        <button
          onClick={() => router.push('https://www.responsibility.org/')}
          className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          I am under 21 - Exit Site
        </button>
      </div>
    </div>
  );
}
```

---

### Step 3: Create Age Verification API Route

Create `src/app/api/user/verify-age/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/user.model';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { dateOfBirth, smsOptIn } = await request.json();

    // Validate date of birth
    if (!dateOfBirth) {
      return NextResponse.json(
        { error: 'Date of birth is required' },
        { status: 400 }
      );
    }

    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 21) {
      return NextResponse.json(
        { error: 'Must be 21 or older' },
        { status: 403 }
      );
    }

    // Update user in database
    await connectDB();
    
    const updateData: any = {
      dateOfBirth: dob,
      ageVerified: true,
      ageVerificationDate: new Date(),
      ageVerificationMethod: 'dob',
      updatedAt: new Date()
    };

    if (smsOptIn) {
      updateData.smsOptIn = true;
      updateData.smsOptInDate = new Date();
      updateData.smsOptInAgeConfirmed = true;
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ageVerified: true,
      smsOptIn: user.smsOptIn
    });

  } catch (error) {
    console.error('Age verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
```

---

### Step 4: Add Age Gate to Main Layout/Pages

Edit `src/app/layout.tsx` or create a wrapper component:

```typescript
'use client';

import { useState, useEffect } from 'react';
import AgeGate from '@/components/AgeGate';

export default function AgeGateWrapper({ children }: { children: React.ReactNode }) {
  const [ageVerified, setAgeVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if age already verified in session
    const verified = sessionStorage.getItem('ageVerified');
    const verifiedDate = sessionStorage.getItem('ageVerifiedDate');
    
    if (verified && verifiedDate) {
      // Check if verification is still valid (within 24 hours)
      const verifiedTime = new Date(verifiedDate).getTime();
      const now = new Date().getTime();
      const hoursSinceVerification = (now - verifiedTime) / (1000 * 60 * 60);
      
      if (hoursSinceVerification < 24) {
        setAgeVerified(true);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!ageVerified) {
    return (
      <AgeGate 
        onVerified={() => setAgeVerified(true)}
        showSMSOptIn={true}
      />
    );
  }

  return <>{children}</>;
}
```

---

### Step 5: Update SMS Sending Logic

Edit your Twilio SMS service to check age verification:

```typescript
// src/lib/twilio.ts or wherever you send SMS

import twilio from 'twilio';
import User from '@/models/user.model';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendBookingConfirmation(
  userEmail: string,
  phoneNumber: string,
  message: string
) {
  try {
    // Verify user has opted in and is age-verified
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check age verification
    if (!user.ageVerified) {
      console.warn('SMS not sent: User age not verified');
      return { success: false, reason: 'age_not_verified' };
    }

    // Check SMS opt-in
    if (!user.smsOptIn || !user.smsOptInAgeConfirmed) {
      console.warn('SMS not sent: User has not opted in');
      return { success: false, reason: 'not_opted_in' };
    }

    // Send SMS
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // +18443145527
      to: phoneNumber
    });

    console.log('SMS sent:', result.sid);
    return { success: true, sid: result.sid };

  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
}
```

---

## 📋 Twilio Console Update Steps

### Step 1: Update Toll-Free Verification

1. **Go to Twilio Console:**
   - Visit https://console.twilio.com/
   - Navigate to **Phone Numbers** → **Manage** → **Regulatory Compliance**

2. **Find Your Submission:**
   - Look for phone number: +18443145527
   - Status should show "Rejected"

3. **Edit Submission:**
   - Click **Edit** on the rejected submission
   - Update the following fields:

### Step 2: Update Use Case Description

**Current Issue:** Missing age gate information

**Updated Description:**
```
Napa Valley Wineries (NVW) uses this toll-free number to send booking 
confirmations, reminders, and updates for wine tasting experiences.

AGE VERIFICATION COMPLIANCE:
- All users must verify they are 21+ years old before registration
- Age verification is required via date of birth entry
- SMS opt-in requires explicit consent with age confirmation checkbox
- Users must check "I confirm I am 21+ and consent to receive SMS"
- Age verification is stored in user profile
- Only age-verified, opted-in users receive SMS messages

MESSAGING CONTENT:
- Booking confirmations
- Appointment reminders
- Cancellation notifications
- Winery updates (for opted-in users only)

OPT-IN/OPT-OUT:
- Users explicitly opt-in during registration with age confirmation
- SMS includes "Reply STOP to opt out" in every message
- Opt-out requests are processed immediately
```

### Step 3: Add Supporting Documentation

**Upload Screenshots:**
1. Age gate screen (screenshot of AgeGate component)
2. SMS opt-in checkbox with age confirmation
3. User profile showing age verification fields

**Website URL:**
- Add your production URL where age gate is visible

### Step 4: Update Opt-In Workflow

**Describe your opt-in process:**
```
1. User visits website and encounters age gate modal
2. User enters date of birth (month/day/year dropdowns)
3. System validates user is 21+ years old
4. User sees SMS opt-in checkbox: "I confirm I am 21+ and consent to receive SMS"
5. User must check box to opt-in to SMS notifications
6. Age verification and SMS consent are saved to user profile
7. Only users who complete both steps receive SMS messages
```

### Step 5: Resubmit

1. Review all changes
2. Click **Submit for Review**
3. Wait for approval (typically 1-3 business days)

---

## 📸 Screenshots to Provide Twilio

Create these screenshots for your submission:

### Screenshot 1: Age Gate
- Show the age verification modal
- Highlight the "21+" requirement
- Show date of birth input fields

### Screenshot 2: SMS Opt-In
- Show the SMS consent checkbox
- Highlight the "I confirm I am 21+" text
- Show the full consent language

### Screenshot 3: User Profile
- Show (redacted) user profile with:
  - `ageVerified: true`
  - `smsOptIn: true`
  - `smsOptInAgeConfirmed: true`

---

## ✅ Implementation Checklist

Before resubmitting to Twilio:

- [ ] User model updated with age verification fields
- [ ] AgeGate component created and styled
- [ ] Age verification API route implemented
- [ ] Age gate added to app layout/entry point
- [ ] SMS sending logic checks age verification
- [ ] SMS sending logic checks opt-in status
- [ ] Age gate tested (try with under 21 date)
- [ ] SMS opt-in tested
- [ ] Screenshots taken for Twilio
- [ ] Twilio console updated with new description
- [ ] Supporting documentation uploaded
- [ ] Submission resubmitted

---

## 🚀 Quick Implementation

**Priority Order:**
1. ✅ Create AgeGate component (30 minutes)
2. ✅ Update user model (15 minutes)
3. ✅ Create API route (20 minutes)
4. ✅ Add to app layout (10 minutes)
5. ✅ Update SMS logic (15 minutes)
6. ✅ Test thoroughly (30 minutes)
7. ✅ Take screenshots (10 minutes)
8. ✅ Update Twilio console (20 minutes)
9. ✅ Resubmit (5 minutes)

**Total Time:** ~2.5 hours

---

## 📞 SMS Message Template (Compliant)

Update your SMS messages to include opt-out language:

```typescript
const message = `
🍷 NVW Booking Confirmed!

Date: ${bookingDate}
Time: ${bookingTime}
Winery: ${wineryName}
Guests: ${guestCount}

View details: ${bookingUrl}

Reply STOP to opt out. Msg&data rates may apply.
`.trim();
```

---

## 🔒 Additional Compliance Tips

### 1. Privacy Policy Update
Add section about age verification:
```
AGE VERIFICATION
You must be 21 years or older to use our services. We collect and 
store your date of birth to verify your age and comply with alcohol 
regulations.
```

### 2. Terms of Service Update
Add age requirement:
```
By using this service, you certify that you are at least 21 years 
of age and legally permitted to purchase and consume alcohol in 
your jurisdiction.
```

### 3. SMS Consent Language
Use this exact language:
```
I confirm I am 21 years of age or older and consent to receive 
booking confirmations, reminders, and updates via SMS from Napa 
Valley Wineries. Message and data rates may apply. Reply STOP 
to opt out anytime.
```

---

## 📊 Expected Timeline

- **Day 1:** Implement age gate (today)
- **Day 2:** Test and take screenshots
- **Day 3:** Update Twilio console and resubmit
- **Day 4-7:** Wait for Twilio review
- **Day 7:** Approval (typically)

---

## ✅ Success Criteria

You'll know you're compliant when:
- ✅ Age gate appears before any booking
- ✅ Users must verify 21+ to proceed
- ✅ SMS opt-in requires age confirmation
- ✅ Database stores age verification
- ✅ SMS only sent to verified, opted-in users
- ✅ Twilio approves your resubmission

---

**Need help implementing? Let me know which step you'd like to start with!**
