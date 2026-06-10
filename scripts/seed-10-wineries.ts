import mongoose from "mongoose";
import User from "../src/models/user.model";
import Winery from "../src/models/winery.model";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nvw";

const sampleWineries = [
  {
    name: "Valley View Estate",
    description: "A beautiful hillside estate offering panoramic views of the valley and award-winning Cabernets.",
    address: "100 Valley View Rd, Napa, CA 94558",
    lat: 38.3813,
    lng: -122.3598,
    isMountain: true,
  },
  {
    name: "Sonoma Serenity Vineyards",
    description: "Peaceful organic vineyards focusing on sustainable farming and crisp Chardonnays.",
    address: "200 Serenity Ln, Sonoma, CA 95476",
    lat: 38.2919,
    lng: -122.4580,
    isMountain: false,
  },
  {
    name: "Oak Reserve Cellars",
    description: "Historic cellars dating back to the 1800s. Famous for our deep, oak-aged red blends.",
    address: "300 Oak Tree Way, St. Helena, CA 94574",
    lat: 38.5053,
    lng: -122.4704,
    isMountain: false,
  },
  {
    name: "Mountain Peak Winery",
    description: "High altitude vines producing intense, structured wines. Accessible via scenic tram.",
    address: "400 Summit Dr, Calistoga, CA 94515",
    lat: 38.5788,
    lng: -122.5797,
    isMountain: true,
  },
  {
    name: "Riverbend Tasting Room",
    description: "A modern tasting room located right on the riverbank. Perfect for sunny afternoons.",
    address: "500 River Rd, Napa, CA 94559",
    lat: 38.2975,
    lng: -122.2869,
    isMountain: false,
  },
  {
    name: "Golden Hills Winery",
    description: "Family-owned since 1950, producing classic Californian Pinot Noir and Zinfandel.",
    address: "600 Golden Hills Way, Healdsburg, CA 95448",
    lat: 38.6105,
    lng: -122.8692,
    isMountain: true,
  },
  {
    name: "Silver Creek Vineyards",
    description: "Boutique winery specializing in small-batch, artisanal sparkling wines.",
    address: "700 Silver Creek Rd, Yountville, CA 94599",
    lat: 38.4016,
    lng: -122.3601,
    isMountain: false,
  },
  {
    name: "Sunset Ridge Estate",
    description: "Enjoy breathtaking sunsets from our tasting patio. Known for our elegant Syrah.",
    address: "800 Ridge Rd, Sonoma, CA 95476",
    lat: 38.3000,
    lng: -122.4600,
    isMountain: true,
  },
  {
    name: "Crystal Springs Cellars",
    description: "State-of-the-art winemaking facility surrounded by lush gardens and natural springs.",
    address: "900 Spring St, Rutherford, CA 94573",
    lat: 38.4590,
    lng: -122.4215,
    isMountain: false,
  },
  {
    name: "Heritage Oak Winery",
    description: "Classic Napa Valley charm with a focus on heritage clones and old-vine production.",
    address: "1000 Heritage Ln, Oakville, CA 94562",
    lat: 38.4385,
    lng: -122.3995,
    isMountain: false,
  }
];

async function seed10Wineries() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    for (let i = 0; i < sampleWineries.length; i++) {
      const wineryData = sampleWineries[i];
      const ownerEmail = `owner${i+1}@test.com`;

      // 1. Check if user exists or create
      let owner = await User.findOne({ email: ownerEmail });
      if (!owner) {
        owner = await User.create({
          firstName: "Test",
          lastName: `Owner ${i+1}`,
          email: ownerEmail,
          phone: "555000000" + i,
          password: "password123",
          role: "winery",
          isActive: true,
        });
        console.log(`Created User: ${ownerEmail}`);
      } else {
        console.log(`User ${ownerEmail} already exists`);
      }

      // 2. Check if winery exists or create
      let winery = await Winery.findOne({ name: wineryData.name });
      if (!winery) {
        winery = await Winery.create({
          name: wineryData.name,
          location: {
            address: wineryData.address,
            latitude: wineryData.lat,
            longitude: wineryData.lng,
            is_mountain_location: wineryData.isMountain,
          },
          contact_info: {
            phone: "555123456" + i,
            email: `contact@${wineryData.name.replace(/\s+/g, '').toLowerCase()}.com`,
            website: `https://www.${wineryData.name.replace(/\s+/g, '').toLowerCase()}.com`,
          },
          description: wineryData.description,
          images: [
            "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&q=80&w=800"
          ],
          tasting_info: [
            {
              tasting_title: "Classic Flight",
              tasting_description: "A flight of our signature wines.",
              tasting_price: 45,
              ava: "Napa Valley",
              wine_types: ["Cabernet Sauvignon", "Chardonnay"],
              number_of_wines_per_tasting: 4,
              special_features: ["Vineyard Tour"],
              available_times: ["10:00 AM", "01:00 PM", "03:00 PM"],
              images: [],
              food_pairing_options: [
                { name: "Cheese Board", price: 25 }
              ],
              tours: {
                available: true,
                tour_price: 20,
                tour_options: [{ description: "Cellar Tour", cost: 20 }]
              },
              booking_info: {
                booking_enabled: true,
                max_guests_per_slot: 6,
                number_of_people: [1, 2, 3, 4, 5, 6],
                allow_excess_guests: false
              }
            }
          ],
          amenities: {
            handicap_accessible: true,
            allows_children: i % 2 === 0, // Every other is kid-friendly
            allows_non_drinkers: true,
          },
          transportation: {
            uber_availability: true,
          },
          payment_method: {
            type: 'pay_winery'
          },
          is_featured: i < 3, // First 3 are featured
          status: 'approved',
          owner: owner._id,
        });
        console.log(`Created Winery: ${wineryData.name}`);

        // Update user to link winery
        owner.wineryId = winery._id;
        await owner.save();
      } else {
        console.log(`Winery ${wineryData.name} already exists`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ SUCCESSFULLY ADDED 10 WINERIES AND OWNERS");
    console.log("=".repeat(60));
    console.log("You can log in to edit these wineries using the following credentials:");
    console.log("Emails: owner1@test.com through owner10@test.com");
    console.log("Password: password123 (for all)");
    console.log("=".repeat(60) + "\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error seeding wineries:", error);
    process.exit(1);
  }
}

seed10Wineries();
