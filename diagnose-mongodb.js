#!/usr/bin/env node

/**
 * Direct MongoDB Connection Test
 * Tests with exact connection string to diagnose auth issues
 */

const mongoose = require('mongoose');

// Try multiple connection variations
const connections = [
    {
        name: "From .env.local (nvw database)",
        uri: "mongodb+srv://nvw_admin:RTikw48JzDLbsQGQ@cluster0.sifq2uu.mongodb.net/nvw?retryWrites=true&w=majority"
    },
    {
        name: "Trying napa-valley-wineries database",
        uri: "mongodb+srv://nvw_admin:RTikw48JzDLbsQGQ@cluster0.sifq2uu.mongodb.net/napa-valley-wineries?retryWrites=true&w=majority"
    },
    {
        name: "Trying jasmelacosta_db_user",
        uri: "mongodb+srv://jasmelacosta_db_user:RTikw48JzDLbsQGQ@cluster0.sifq2uu.mongodb.net/nvw?retryWrites=true&w=majority"
    }
];

async function testConnection(connection) {
    console.log(`\n🔍 Testing: ${connection.name}`);
    console.log(`URI: ${connection.uri.replace(/:[^:@]+@/, ':****@')}`);

    try {
        await mongoose.connect(connection.uri, {
            serverSelectionTimeoutMS: 5000
        });

        console.log('✅ Connection successful!');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log(`📁 Collections (${collections.length}):`);
        collections.forEach(col => console.log(`   - ${col.name}`));

        await mongoose.disconnect();
        return true;

    } catch (error) {
        console.log('❌ Failed:', error.message);
        try {
            await mongoose.disconnect();
        } catch (e) { }
        return false;
    }
}

async function runTests() {
    console.log('========================================');
    console.log('🧪 MongoDB Connection Diagnostics');
    console.log('========================================');

    for (const conn of connections) {
        const success = await testConnection(conn);
        if (success) {
            console.log('\n✅ Found working connection!');
            console.log(`Use this configuration: ${conn.name}`);
            process.exit(0);
        }
    }

    console.log('\n========================================');
    console.log('❌ All connection attempts failed');
    console.log('========================================\n');
    console.log('Next steps:');
    console.log('1. Go to MongoDB Atlas → Database Access');
    console.log('2. Click "Edit" on a user (nvw_admin or jasmelacosta_db_user)');
    console.log('3. Click "Edit Password"');
    console.log('4. Either:');
    console.log('   - Set a NEW password (write it down!)');
    console.log('   - Click "Autogenerate" (copy immediately!)');
    console.log('5. Click "Update User"');
    console.log('6. Update MONGODB_URI in .env.local with new password\n');

    process.exit(1);
}

runTests();
