#!/usr/bin/env node

/**
 * MongoDB Atlas Quick Setup Script
 * 
 * This script helps you set up MongoDB for the NVW application.
 * 
 * Usage:
 *   node setup-mongodb.js
 * 
 * Options:
 *   1. Use MongoDB Atlas (Free Cloud - Recommended)
 *   2. Use Local MongoDB (if installed)
 *   3. Generate test data
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log('\n========================================');
    console.log('🍷 NVW MongoDB Setup');
    console.log('========================================\n');

    console.log('Choose your MongoDB setup option:\n');
    console.log('1. MongoDB Atlas (Free cloud - Recommended)');
    console.log('2. Local MongoDB (requires installation)');
    console.log('3. Skip (use existing configuration)\n');

    const choice = await question('Enter your choice (1-3): ');

    if (choice === '1') {
        await setupAtlas();
    } else if (choice === '2') {
        await setupLocal();
    } else {
        console.log('\n✅ Keeping existing configuration\n');
    }

    const seedData = await question('\nDo you want to seed test data? (y/n): ');
    if (seedData.toLowerCase() === 'y') {
        await generateTestData();
    }

    rl.close();
}

async function setupAtlas() {
    console.log('\n📘 MongoDB Atlas Setup Instructions:\n');
    console.log('1. Visit: https://www.mongodb.com/cloud/atlas/register');
    console.log('2. Sign up for a FREE account');
    console.log('3. Create a new cluster (M0 FREE tier)');
    console.log('4. Create a database user:');
    console.log('   - Username: nvwuser');
    console.log('   - Password: (your choice)');
    console.log('5. Add your IP to whitelist:');
    console.log('   - For development: Add 0.0.0.0/0 (allows all IPs)');
    console.log('6. Get your connection string:\n');

    const hasAtlas = await question('Have you completed the above steps? (y/n): ');

    if (hasAtlas.toLowerCase() === 'y') {
        const connectionString = await question('\nPaste your MongoDB Atlas connection string: ');

        if (connectionString.includes('mongodb+srv://')) {
            updateEnvFile('MONGODB_URI', connectionString);
            console.log('\n✅ MongoDB Atlas configured successfully!\n');

            // Test connection
            console.log('Testing connection...');
            await testConnection(connectionString);
        } else {
            console.log('\n❌ Invalid connection string. Please try again.\n');
        }
    } else {
        console.log('\n📌 Complete the setup and run this script again.\n');
    }
}

async function setupLocal() {
    console.log('\n📘 Local MongoDB Setup:\n');
    console.log('1. Download MongoDB Community Edition:');
    console.log('   https://www.mongodb.com/try/download/community');
    console.log('2. Install MongoDB');
    console.log('3. Start MongoDB service');
    console.log('4. Default connection: mongodb://localhost:27017/nvw\n');

    const useLocal = await question('Is MongoDB running locally? (y/n): ');

    if (useLocal.toLowerCase() === 'y') {
        const localUri = 'mongodb://localhost:27017/nvw';
        updateEnvFile('MONGODB_URI', localUri);
        console.log('\n✅ Local MongoDB configured!\n');

        // Test connection
        console.log('Testing connection...');
        await testConnection(localUri);
    } else {
        console.log('\n❌ Please install and start MongoDB first.\n');
    }
}

function updateEnvFile(key, value) {
    const envPath = path.join(__dirname, '.env.local');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    // Replace or add the key
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
        envContent += `\n${key}=${value}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`Updated .env.local with ${key}`);
}

async function testConnection(uri) {
    try {
        const mongoose = require('mongoose');
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Connection successful!');
        await mongoose.disconnect();
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('- Check your connection string');
        console.log('- Verify network access in Atlas');
        console.log('- Ensure MongoDB is running (if local)');
    }
}

async function generateTestData() {
    console.log('\n🌱 Generating test data...\n');

    try {
        // Run the seed script
        const { execSync } = require('child_process');
        execSync('node scripts/seed-database.js', { stdio: 'inherit' });
        console.log('\n✅ Test data created successfully!\n');
    } catch (error) {
        console.log('\n❌ Failed to create test data:', error.message);
        console.log('You can run this manually later with: node scripts/seed-database.js\n');
    }
}

// Run the setup
main().catch(error => {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
});
