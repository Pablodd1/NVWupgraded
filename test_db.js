const mongoose = require('mongoose');

// Use the production URI directly
const URI = 'mongodb+srv://napa-admin:NapaWineries2024Secure@napa-wineries-prod.vkpze.mongodb.net/nvw?retryWrites=true&w=majority&appName=napa-wineries-prod';

async function test() {
    try {
        console.log('Connecting to:', URI.replace(/:[^:@]+@/, ':***@'));
        await mongoose.connect(URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('SUCCESS');
        
        const count = await mongoose.connection.db.collection('wineries').countDocuments();
        console.log('Winery count:', count);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('FAILED:', err.message);
    }
}

test();
