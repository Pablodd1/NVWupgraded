const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://napa-admin:NapaWineries2024Secure@napa-wineries-prod.vkpze.mongodb.net/nvw?retryWrites=true&w=majority&appName=napa-wineries-prod';

async function checkWineries() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const wineries = await mongoose.connection.db.collection('wineries').find({}).toArray();
        console.log(`Found ${wineries.length} wineries`);

        wineries.forEach(w => {
            console.log(`\n--- Winery: ${w.name} ---`);
            console.log('Hero Images:', w.images);
            if (w.tasting_info) {
                w.tasting_info.forEach((t, i) => {
                    console.log(`Tasting ${i} (${t.tasting_title}):`);
                    console.log('  Tasting Images:', t.images);
                    if (t.wine_details) {
                        t.wine_details.forEach((wd, j) => {
                            console.log(`  Wine ${j} (${wd.name}) Photo:`, wd.photo);
                        });
                    }
                });
            }
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkWineries();
