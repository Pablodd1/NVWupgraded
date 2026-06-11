import mongoose from "mongoose";
import Winery from "../src/models/winery.model";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nvw";

const unsplashIds = [
  "1506377247377-2a5b3b417ebb", // Wine glasses
  "1516594915697-87eb3b1c14ea", // Vineyard
  "1564144007927-459fc25bbfbb", // Wine bottles
  "1504279587326-08ce90deceeb", // Grapes
  "1584916201218-f4242ceb4809", // Tasting room
  "1559564484-e48b3e040bf4", // Wine pouring
  "1576484392661-bc57d383b169", // Vineyard sunset
  "1510812431401-41d2bd2722f3", // Wine barrels
  "1474696110915-d72b0c1e847c", // Red wine
  "1585553616435-2dc0a54e271d", // White wine
  "1504567961562-113b2c159045", // Grapes on vine
  "1553361371-9b22f78e8b1d", // Cheers
  "1580455584556-9d66141444fb", // Wine cellar
  "1593414220166-0ec82dc45009", // Tasting table
  "1543362905-24c6e00b6fb8", // Wine and cheese
  "1566454519-58ec78dc7116", // Vineyard rows
  "1606907568058-29649dbb050d", // Rose wine
  "1505934523315-05e810a9a117", // Harvest
  "1559079634-19ba5ec9db84", // Grapes basket
  "1574586088219-c68e1a1bb1cc", // Wine glasses sunset
  "1528823872057-9c018a7a7553", // Barrels
  "1430160249764-169828fa605d"  // Vineyard road
];

// Shuffle array
function shuffle(array: string[]) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

async function updateWineryImages() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const wineries = await Winery.find({});
    console.log(`Found ${wineries.length} wineries.`);

    let imagePool = shuffle([...unsplashIds]);

    for (let i = 0; i < wineries.length; i++) {
      const winery = wineries[i];
      
      // Ensure we have enough images in the pool, refill if necessary
      if (imagePool.length < 3) {
        imagePool = shuffle([...unsplashIds]);
      }

      // Pop 2 images for the main winery profile
      const img1 = `https://images.unsplash.com/photo-${imagePool.pop()}?auto=format&fit=crop&q=80&w=800`;
      const img2 = `https://images.unsplash.com/photo-${imagePool.pop()}?auto=format&fit=crop&q=80&w=800`;
      
      // Pop 1 image for the tasting package
      const img3 = `https://images.unsplash.com/photo-${imagePool.pop()}?auto=format&fit=crop&q=80&w=800`;

      winery.images = [img1, img2];
      
      if (winery.tasting_info && winery.tasting_info.length > 0) {
        winery.tasting_info[0].images = [img3];
      }

      await winery.save();
      console.log(`✅ Updated images for ${winery.name}`);
    }

    console.log("✅ All wineries updated with unique images.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating wineries:", error);
    process.exit(1);
  }
}

updateWineryImages();
