#!/usr/bin/env node

/**
 * Quick data verification script
 * Checks what data exists in the database
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function verifyData() {
    try {
        console.log('\n🔍 Verifying Database Content');
        console.log('========================================\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Check each collection
        const collections = ['users', 'wineries', 'bookings', 'slotinventories', 'chatlogs'];

        for (const collName of collections) {
            const collection = db.collection(collName);
            const count = await collection.countDocuments();
            console.log(`📊 ${collName.padEnd(20)} ${count} documents`);

            if (count > 0 && count <= 3) {
                const samples = await collection.find({}).limit(3).toArray();
                samples.forEach((doc, idx) => {
                    if (collName === 'users') {
                        console.log(`   ${idx + 1}. ${doc.email || doc.username} (${doc.role || 'customer'})`);
                    } else if (collName === 'wineries') {
                        console.log(`   ${idx + 1}. ${doc.name} - ${doc.location?.address || 'No address'}`);
                    } else if (collName === 'bookings') {
                        console.log(`   ${idx + 1}. Booking ${doc._id} - ${doc.status}`);
                    }
                });
            }
        }

        console.log('\n========================================');
        console.log('✅ Data verification complete!\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyData();
