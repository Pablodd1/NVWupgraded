const mongoose = require('mongoose');

// NEW password provided by the user
const uri = "mongodb+srv://shadowjas_db_user:tn04cwD9TxU57PXr@cluster0.hazcwpy.mongodb.net/nvw?retryWrites=true&w=majority";

async function run() {
    try {
        console.log("Connecting with NEW password...");
        await mongoose.connect(uri);
        console.log("✅ Successfully connected to MongoDB!");

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

    } catch (err) {
        console.error("❌ Connection failed!");
        console.error(err.message);
    } finally {
        await mongoose.disconnect();
    }
}
run();
