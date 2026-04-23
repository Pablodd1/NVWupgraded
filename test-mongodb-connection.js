#!/usr/bin/env node

/**
 * Quick MongoDB Connection Test
 * Tests if we can connect to MongoDB Atlas
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    console.log('\n🔍 Testing MongoDB Connection');
    console.log('========================================\n');

    console.log('Connection URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password
    console.log('');

    try {
        console.log('📡 Attempting to connect...');

        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 5000
        });

        console.log('✅ Connection successful!\n');

        // Test a simple operation
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log(`📁 Available collections: ${collections.length}`);
        collections.forEach(col => console.log(`   - ${col.name}`));

        await mongoose.disconnect();
        console.log('\n✅ Test complete!\n');
        process.exit(0);

    } catch (error) {
        console.log('❌ Connection failed!\n');
        console.error('Error details:', error.message);

        console.log('\n🔧 Troubleshooting steps:\n');

        if (error.message.includes('querySrv')) {
            console.log('  1. Check if your DNS can resolve the MongoDB SRV record');
            console.log('  2. Try using the standard connection string format instead');
            console.log('     (mongodb:// instead of mongodb+srv://)');
        } else if (error.message.includes('authentication')) {
            console.log('  1. Verify your database username and password');
            console.log('  2. Check if the user has the correct permissions');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('  1. Check your internet connection');
            console.log('  2. Verify the cluster URL is correct');
        } else if (error.message.includes('timeout')) {
            console.log('  1. Check MongoDB Atlas network access settings');
            console.log('  2. Add your IP address to the whitelist');
            console.log('  3. Or allow access from anywhere (0.0.0.0/0)');
        }

        console.log('\n💡 Alternative: Use MongoDB Atlas Local (Docker-based)');
        console.log('   Or install MongoDB locally: https://www.mongodb.com/try/download/community\n');

        process.exit(1);
    }
}

testConnection();
