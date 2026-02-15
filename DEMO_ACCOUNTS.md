# Demo Accounts

This document lists all demo/test accounts available for development and testing.

## 🔐 Demo Credentials

### Admin Account
- **Email:** `admin@napawineries.com`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Full system access, can create winery accounts, view all data

### Winery Owner Account
- **Email:** `owner@napawineries.com`
- **Password:** `owner123`
- **Role:** Winery Owner
- **Access:** Manage winery profile, tasting packages, bookings, availability

### Customer Accounts

#### Test Customer
- **Email:** `customer@test.com`
- **Password:** `customer123`
- **Role:** Customer
- **Access:** Browse wineries, make bookings, view itinerary

#### Example Customer
- **Email:** `customer@example.com`
- **Password:** `customer123`
- **Role:** Customer
- **Access:** Browse wineries, make bookings, view itinerary

## 🔧 Resetting Demo Accounts

If demo accounts are not working or passwords need to be reset, run:

```bash
node scripts/seed-demo-accounts.js
```

This script will:
- Create missing demo accounts
- Reset passwords for existing demo accounts
- Ensure all accounts are active and verified

## 🚨 Important Notes

1. **Never use these credentials in production!**
2. Demo accounts are for development and testing only
3. The login route (`/api/auth/login`) has a fallback mechanism that allows these credentials to work even if the database is offline
4. All passwords are hashed using bcrypt in the database

## 📝 Adding New Demo Accounts

To add a new demo account:

1. Edit `scripts/seed-demo-accounts.js`
2. Add the account to the `DEMO_ACCOUNTS` array
3. Run the seed script
4. Update this README
5. Update the demo credentials in `/api/auth/login` route (lines 91-99)

## 🔍 Troubleshooting

### "Invalid credentials" error
- Verify you're using the exact credentials listed above
- Check if the database is connected (check terminal logs)
- Run the seed script to reset passwords

### "Database offline" error
- Check MongoDB connection string in `.env.local`
- Verify MongoDB Atlas cluster is running
- The app will fall back to demo mode automatically

### Account exists but password doesn't work
- Run `node scripts/seed-demo-accounts.js` to reset passwords
- Check for typos in email/password
- Ensure you're not using old/cached credentials
