/**
 * Database Seed Script - Demo Accounts
 * 
 * This script ensures demo accounts exist with correct credentials.
 * Run this script to reset demo account passwords or create missing accounts.
 * 
 * Usage: node scripts/seed-demo-accounts.js
 */

import { dbConnect } from '../src/lib/dbConnect.js';
import User from '../src/models/user.model.js';
import bcrypt from 'bcryptjs';

const DEMO_ACCOUNTS = [
    {
        email: 'admin@napawineries.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        ageVerified: true,
        isActive: true,
    },
    {
        email: 'owner@napawineries.com',
        password: 'owner123',
        firstName: 'Winery',
        lastName: 'Owner',
        role: 'winery',
        phone: '+1234567891',
        dateOfBirth: new Date('1990-01-01'),
        ageVerified: true,
        isActive: true,
    },
    {
        email: 'customer@test.com',
        password: 'customer123',
        firstName: 'Test',
        lastName: 'Customer',
        role: 'customer',
        phone: '+1234567892',
        dateOfBirth: new Date('1990-01-01'),
        ageVerified: true,
        isActive: true,
    },
    {
        email: 'customer@example.com',
        password: 'customer123',
        firstName: 'Example',
        lastName: 'Customer',
        role: 'customer',
        phone: '+1234567893',
        dateOfBirth: new Date('1990-01-01'),
        ageVerified: true,
        isActive: true,
    },
];

async function seedDemoAccounts() {
    try {
        console.log('🌱 Connecting to database...');
        await dbConnect();
        console.log('✅ Connected to database');

        for (const account of DEMO_ACCOUNTS) {
            const { email, password, ...userData } = account;

            // Check if user exists
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                // Update password only
                const hashedPassword = await bcrypt.hash(password, 10);
                await User.updateOne(
                    { email },
                    { $set: { password: hashedPassword } }
                );
                console.log(`✅ Updated password for ${email}`);
            } else {
                // Create new user (password will be hashed by model pre-save hook)
                await User.create({
                    email,
                    password,
                    ...userData,
                });
                console.log(`✅ Created new account: ${email}`);
            }
        }

        console.log('\n🎉 Demo accounts seeded successfully!');
        console.log('\n📋 Demo Credentials:');
        console.log('   Admin:    admin@napawineries.com / admin123');
        console.log('   Winery:   owner@napawineries.com / owner123');
        console.log('   Customer: customer@test.com / customer123');
        console.log('   Customer: customer@example.com / customer123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding demo accounts:', error);
        process.exit(1);
    }
}

seedDemoAccounts();
