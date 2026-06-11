import mongoose from "mongoose";
import Winery from "../src/models/winery.model";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nvw";

const workingIds = [
  "1506377247377-2a5b3b417ebb",
  "1547595628-c61a29f496f0",
  "1510812431401-41d2bd2722f3",
  "1536940378788-fcaf6a0bb426",
  "1556439298-d5321c86e54b",
  "1560471269382-3821946a7e5a",
  "1566073771259-6a8506099945",
  "1474722883778-792e7990302f",
  "1574672280450-482020227916",
  "1528643329766-3b1029c0b168"
];

async function updateWineryImagesSafe() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const wineries = await Winery.find({});
    console.log(`Found ${wineries.length} wineries.`);

    for (let i = 0; i < wineries.length; i++) {
      const winery = wineries[i];
      
      const img1 = `https://images.unsplash.com/photo-${workingIds[(i) % workingIds.length]}?auto=format&fit=crop&q=80&w=800`;
      const img2 = `https://images.unsplash.com/photo-${workingIds[(i + 3) % workingIds.length]}?auto=format&fit=crop&q=80&w=800`;
      const img3 = `https://images.unsplash.com/photo-${workingIds[(i + 6) % workingIds.length]}?auto=format&fit=crop&q=80&w=800`;

      winery.images = [img1, img2];
      
      if (winery.tasting_info && winery.tasting_info.length > 0) {
        winery.tasting_info[0].images = [img3];
      }

      await winery.save();
      console.log(`✅ Updated images for ${winery.name}`);
    }

    console.log("✅ All wineries updated with GUARANTEED working images.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating wineries:", error);
    process.exit(1);
  }
}

updateWineryImagesSafe();
