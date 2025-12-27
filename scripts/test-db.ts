import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function testConnection() {
    console.log("🔍 Testing MongoDB Connection...\n");

    const MONGO_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGO_URI;

    console.log("MongoDB URI exists:", !!MONGO_URI);
    console.log("URI starts with:", MONGO_URI?.substring(0, 20) + "...\n");

    try {
        console.log("Attempting to connect...");
        await mongoose.connect(MONGO_URI!, {
            dbName: "nvw",
            serverSelectionTimeoutMS: 5000,
        });

        console.log("✅ Connected to MongoDB successfully!\n");

        // Count wineries
        const WineryModel = mongoose.model("Winery", new mongoose.Schema({}, { strict: false }));
        const count = await WineryModel.countDocuments();
        console.log(`📊 Total wineries in database: ${count}\n`);

        if (count > 0) {
            const wineries = await WineryModel.find().limit(10).select("name");
            console.log("Wineries found:");
            wineries.forEach((w: any, i: number) => {
                console.log(`  ${i + 1}. ${w.name}`);
            });
        } else {
            console.log("⚠️  No wineries found in database - needs seeding!");
        }

        await mongoose.disconnect();
        console.log("\n✅ Test complete!");
        process.exit(0);

    } catch (error: any) {
        console.error("❌ Connection failed:", error.message);
        process.exit(1);
    }
}

testConnection();
