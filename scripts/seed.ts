import mongoose from "mongoose";
import User from "../src/models/user.model";
import Winery from "../src/models/winery.model";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nvw";

// Sample wineries data with realistic Napa Valley information
const wineries = [
  {
    name: "Stag's Leap Wine Cellars",
    location: {
      address: "5766 Silverado Trail, Napa, CA 94558",
      latitude: 38.4081,
      longitude: -122.3342,
      is_mountain_location: false,
    },
    contact_info: {
      phone: "(707) 944-2020",
      email: "info@stagsleap.com",
      website: "https://www.stagsleap.com",
    },
    description: "World-renowned winery famous for the 1976 Judgment of Paris. Offering exceptional Cabernet Sauvignon from the Stags Leap District, known for its unique volcanic soils and microclimates.",
    tasting_info: [
      {
        tasting_title: "Estate Tasting Experience",
        tasting_description: "Discover our estate-grown wines including our legendary S.L.V. Cabernet Sauvignon",
        ava: "Stags Leap District",
        tasting_price: 75,
        available_times: ["10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM"],
        wine_types: ["Red", "White"],
        number_of_wines_per_tasting: 5,
        special_features: ["Tasting Waived with Bottle Purchase", "Tour Available"],
        images: [
          "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb",
          "https://images.unsplash.com/photo-1547595628-c61a29f496f0",
        ],
        food_pairing_options: [
          { id: "fp1", name: "Artisan Cheese Board", price: 25 },
          { id: "fp2", name: "Charcuterie Selection", price: 30 },
        ],
        tours: {
          available: true,
          tour_price: 100,
          tour_options: [
            { tour_id: "tour1", description: "Historic Caves Tour", cost: 100 },
            { tour_id: "tour2", description: "Vineyard & Winemaking Tour", cost: 125 },
          ],
        },
        wine_details: [
          {
            id: "wine1",
            name: "CASK 23 Cabernet Sauvignon",
            description: "Our flagship wine from the finest estate vineyards",
            year: 2019,
            tasting_notes: "Rich blackberry, cassis, with hints of cedar and tobacco",
            photo: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
          },
          {
            id: "wine2",
            name: "S.L.V. Estate Cabernet Sauvignon",
            description: "From our historic Stag's Leap Vineyard",
            year: 2020,
            tasting_notes: "Elegant structure with dark fruit, graphite, and violet notes",
          },
        ],
        booking_info: {
          booking_enabled: true,
          max_guests_per_slot: 8,
          number_of_people: [1, 2, 3, 4, 5, 6, 7, 8],
          dynamic_pricing: {
            enabled: true,
            weekend_multiplier: 1.2,
          },
          available_slots: ["10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM"],
        },
        other_features: [
          { feature_id: "feat1", description: "Private Terrace Seating", cost: 50 },
        ],
      },
    ],
    amenities: {
      virtual_sommelier: true,
      augmented_reality_tours: true,
      handicap_accessible: true,
    },
    user_reviews: [],
    transportation: {
      uber_availability: true,
      lyft_availability: true,
      distance_from_user: 5.2,
    },
  },
  {
    name: "Opus One Winery",
    location: {
      address: "7900 St Helena Hwy, Oakville, CA 94562",
      latitude: 38.4324,
      longitude: -122.4101,
      is_mountain_location: false,
    },
    contact_info: {
      phone: "(707) 963-1979",
      email: "visit@opusonewinery.com",
      website: "https://www.opusonewinery.com",
    },
    description: "An iconic Napa Valley partnership between Baron Philippe de Rothschild and Robert Mondavi. Renowned for producing world-class Bordeaux-style blends with meticulous attention to detail.",
    tasting_info: [
      {
        tasting_title: "Opus One Signature Tasting",
        tasting_description: "Experience the epitome of Napa Valley excellence with our current vintage",
        ava: "Oakville",
        tasting_price: 150,
        available_times: ["10:00 AM", "11:30 AM", "1:30 PM", "3:00 PM"],
        wine_types: ["Red"],
        number_of_wines_per_tasting: 3,
        special_features: ["Tour Available", "Organic"],
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945",
          "https://images.unsplash.com/photo-1474722883778-792e7990302f",
        ],
        food_pairing_options: [
          { id: "fp3", name: "Gourmet Pairing Menu", price: 75 },
        ],
        tours: {
          available: true,
          tour_price: 200,
          tour_options: [
            { tour_id: "tour3", description: "Estate & Winemaking Experience", cost: 200 },
          ],
        },
        wine_details: [
          {
            id: "wine3",
            name: "Opus One 2019",
            description: "Our signature Bordeaux-style blend",
            year: 2019,
            tasting_notes: "Complex layers of blackcurrant, dark chocolate, and espresso",
            photo: "https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6",
          },
        ],
        booking_info: {
          booking_enabled: true,
          max_guests_per_slot: 6,
          number_of_people: [2, 3, 4, 5, 6],
          dynamic_pricing: {
            enabled: true,
            weekend_multiplier: 1.15,
          },
          available_slots: ["10:00 AM", "11:30 AM", "1:30 PM", "3:00 PM"],
        },
        other_features: [],
      },
    ],
    amenities: {
      virtual_sommelier: true,
      augmented_reality_tours: false,
      handicap_accessible: true,
    },
    user_reviews: [],
    transportation: {
      uber_availability: true,
      lyft_availability: true,
      distance_from_user: 8.5,
    },
  },
  {
    name: "Schramsberg Vineyards",
    location: {
      address: "1400 Schramsberg Rd, Calistoga, CA 94515",
      latitude: 38.5689,
      longitude: -122.5745,
      is_mountain_location: true,
    },
    contact_info: {
      phone: "(707) 942-4558",
      email: "info@schramsberg.com",
      website: "https://www.schramsberg.com",
    },
    description: "Historic estate specializing in premium sparkling wines using méthode traditionnelle. Famous for serving at Presidential toasts and featuring extensive hand-dug caves from the 1800s.",
    tasting_info: [
      {
        tasting_title: "Sparkling Wine Cave Tour & Tasting",
        tasting_description: "Explore our historic caves while tasting our finest sparkling wines",
        ava: "Calistoga",
        tasting_price: 95,
        available_times: ["10:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM"],
        wine_types: ["Sparkling"],
        number_of_wines_per_tasting: 6,
        special_features: ["Tour Available", "Family-Friendly", "Walk-ins Welcome"],
        images: [
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
          "https://images.unsplash.com/photo-1547595628-c61a29f496f0",
        ],
        food_pairing_options: [
          { id: "fp4", name: "Caviar & Champagne Pairing", price: 85 },
          { id: "fp5", name: "Small Bites Selection", price: 35 },
        ],
        tours: {
          available: true,
          tour_price: 95,
          tour_options: [
            { tour_id: "tour4", description: "Historic Caves & Cellar Tour", cost: 95 },
          ],
        },
        wine_details: [
          {
            id: "wine4",
            name: "J. Schram 2016",
            description: "Our prestige cuvée, aged 7 years on the lees",
            year: 2016,
            tasting_notes: "Elegant brioche, citrus zest, and fine mineral notes",
          },
          {
            id: "wine5",
            name: "Blanc de Blancs",
            description: "100% Chardonnay sparkling wine",
            year: 2019,
            tasting_notes: "Crisp apple, lemon, and almond flavors",
          },
        ],
        booking_info: {
          booking_enabled: true,
          max_guests_per_slot: 10,
          number_of_people: [2, 3, 4, 5, 6, 7, 8, 9, 10],
          dynamic_pricing: {
            enabled: false,
            weekend_multiplier: 1.0,
          },
          available_slots: ["10:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM"],
        },
        other_features: [],
      },
    ],
    amenities: {
      virtual_sommelier: false,
      augmented_reality_tours: true,
      handicap_accessible: false,
    },
    user_reviews: [],
    transportation: {
      uber_availability: true,
      lyft_availability: true,
      distance_from_user: 12.3,
    },
  },
  {
    name: "Castello di Amorosa",
    location: {
      address: "4045 St Helena Hwy, Calistoga, CA 94515",
      latitude: 38.5423,
      longitude: -122.5234,
      is_mountain_location: false,
    },
    contact_info: {
      phone: "(707) 967-6272",
      email: "info@castellodiamorosa.com",
      website: "https://www.castellodiamorosa.com",
    },
    description: "Authentic 13th-century Tuscan castle replica featuring 107 rooms on 8 levels. Producing Italian-style wines using traditional and modern techniques in a stunning medieval setting.",
    tasting_info: [
      {
        tasting_title: "Royal Tasting Experience",
        tasting_description: "Taste premium wines in our authentic castle setting",
        ava: "Calistoga",
        tasting_price: 65,
        available_times: ["9:30 AM", "11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM"],
        wine_types: ["Red", "White", "Rosé", "Dessert"],
        number_of_wines_per_tasting: 5,
        special_features: ["Tour Available", "Food Available", "Family-Friendly"],
        images: [
          "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb",
          "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559",
        ],
        food_pairing_options: [
          { id: "fp6", name: "Italian Antipasti Platter", price: 45 },
          { id: "fp7", name: "Castello Cheese Selection", price: 35 },
        ],
        tours: {
          available: true,
          tour_price: 50,
          tour_options: [
            { tour_id: "tour5", description: "Grand Castle Tour", cost: 50 },
            { tour_id: "tour6", description: "Castle & Wine Education Tour", cost: 75 },
          ],
        },
        wine_details: [
          {
            id: "wine6",
            name: "Il Barone Super Tuscan",
            description: "Bordeaux-style blend in Italian tradition",
            year: 2018,
            tasting_notes: "Bold cherry, leather, and Mediterranean herbs",
          },
          {
            id: "wine7",
            name: "La Fantasia",
            description: "Late harvest dessert wine",
            year: 2020,
            tasting_notes: "Honeyed apricot, fig, and orange blossom",
          },
        ],
        booking_info: {
          booking_enabled: true,
          max_guests_per_slot: 12,
          number_of_people: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          dynamic_pricing: {
            enabled: true,
            weekend_multiplier: 1.25,
          },
          available_slots: ["9:30 AM", "11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM"],
        },
        other_features: [
          { feature_id: "feat2", description: "Medieval Costume Photo Op", cost: 20 },
        ],
      },
    ],
    amenities: {
      virtual_sommelier: false,
      augmented_reality_tours: true,
      handicap_accessible: true,
    },
    user_reviews: [],
    transportation: {
      uber_availability: true,
      lyft_availability: true,
      distance_from_user: 15.7,
    },
  },
  {
    name: "Domaine Carneros",
    location: {
      address: "1240 Duhig Rd, Napa, CA 94559",
      latitude: 38.2456,
      longitude: -122.3012,
      is_mountain_location: false,
    },
    contact_info: {
      phone: "(707) 257-0101",
      email: "concierge@domainecarneros.com",
      website: "https://www.domainecarneros.com",
    },
    description: "Château-style winery specializing in sparkling wines and Pinot Noir from the cool Los Carneros AVA. Known for elegant sparkling wines crafted using traditional French methods.",
    tasting_info: [
      {
        tasting_title: "Sparkling Wine Flight",
        tasting_description: "Sample our exquisite sparkling wines on the terrace with vineyard views",
        ava: "Los Carneros (Carneros)",
        tasting_price: 50,
        available_times: ["10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"],
        wine_types: ["Sparkling", "Red"],
        number_of_wines_per_tasting: 4,
        special_features: ["Food Available", "Pet Friendly", "Walk-ins Welcome"],
        images: [
          "https://images.unsplash.com/photo-1474722883778-792e7990302f",
          "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        ],
        food_pairing_options: [
          { id: "fp8", name: "Terrace Tapas Plate", price: 40 },
          { id: "fp9", name: "Oysters & Sparkling", price: 55 },
        ],
        tours: {
          available: false,
          tour_price: 0,
          tour_options: [],
        },
        wine_details: [
          {
            id: "wine8",
            name: "Brut Rosé",
            description: "Elegant sparkling rosé with Pinot Noir",
            year: 2020,
            tasting_notes: "Strawberry, raspberry, with creamy texture",
          },
          {
            id: "wine9",
            name: "Le Rêve Blanc de Blancs",
            description: "Prestige cuvée from Chardonnay",
            year: 2017,
            tasting_notes: "Toasted brioche, citrus, elegant minerality",
          },
        ],
        booking_info: {
          booking_enabled: true,
          max_guests_per_slot: 8,
          number_of_people: [2, 3, 4, 5, 6, 7, 8],
          dynamic_pricing: {
            enabled: true,
            weekend_multiplier: 1.1,
          },
          available_slots: ["10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"],
        },
        other_features: [],
      },
    ],
    amenities: {
      virtual_sommelier: true,
      augmented_reality_tours: false,
      handicap_accessible: true,
    },
    user_reviews: [],
    transportation: {
      uber_availability: true,
      lyft_availability: true,
      distance_from_user: 3.8,
    },
  },
  {
    name: "Silver Oak Cellars",
    location: {
      address: "915 Oakville Cross Rd, Oakville, CA 94562",
      latitude: 38.4312,
      longitude: -122.4201,
      is_mountain_location: false,
    },
    contact_info: {
      phone: "(707) 942-7082",
      email: "hospitality@silveroak.com",
      website: "https://www.silveroak.com",
    },
    description: "Dedicated exclusively to producing Cabernet Sauvignon. LEED Platinum certified winery showcasing sustainable practices and American oak barrel program.",
    tasting_info: [
      {
        tasting_title: "Cabernet Tasting Experience",
        tasting_description: "Discover our single-varietal Cabernet Sauvignon from Napa Valley and Alexander Valley",
        ava: "Oakville",
        tasting_price: 60,
        available_times: ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
        wine_types: ["Red"],
        number_of_wines_per_tasting: 3,
        special_features: ["Tasting Waived with Bottle Purchase", "Organic", "Walk-ins Welcome"],
        images: [
          "https://images.unsplash.com/photo-1547595628-c61a29f496f0",
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
        ],
        food_pairing_options: [
          { id: "fp10", name: "Steak & Cabernet Pairing", price: 65 },
        ],
        tours: {
          available: true,
          tour_price: 75,
          tour_options: [
            { tour_id: "tour7", description: "Sustainable Winery Tour", cost: 75 },
          ],
        },
        wine_details: [
          {
            id: "wine10",
            name: "Napa Valley Cabernet Sauvignon",
            description: "Our flagship Napa Cabernet",
            year: 2018,
            tasting_notes: "Ripe black fruit, vanilla, and warming spices",
          },
          {
            id: "wine11",
            name: "Alexander Valley Cabernet Sauvignon",
            description: "Cabernet from our Sonoma estate",
            year: 2018,
            tasting_notes: "Bright cherry, chocolate, and toasted oak",
          },
        ],
        booking_info: {
          booking_enabled: true,
          max_guests_per_slot: 10,
          number_of_people: [2, 3, 4, 5, 6, 7, 8, 9, 10],
          dynamic_pricing: {
            enabled: false,
            weekend_multiplier: 1.0,
          },
          available_slots: ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
        },
        other_features: [],
      },
    ],
    amenities: {
      virtual_sommelier: true,
      augmented_reality_tours: true,
      handicap_accessible: true,
    },
    user_reviews: [],
    transportation: {
      uber_availability: true,
      lyft_availability: true,
      distance_from_user: 7.2,
    },
  },
  {
    name: "Beringer Vineyards",
    location: {
      address: "2000 Main St, St Helena, CA 94574",
      latitude: 38.5053,
      longitude: -122.4705,
      is_mountain_location: false,
    },
    contact_info: {
      phone: "(707) 963-7115",
      email: "reservations@beringer.com",
      website: "https://www.beringer.com",
    },
    description: "Napa Valley's oldest continuously operating winery. Featuring the historic Rhine House and extensive wine caves.",
    tasting_info: [
      {
        tasting_title: "Old Winery Tour & Tasting",
        tasting_description: "Explore the historic wine caves and taste current releases.",
        ava: "St. Helena",
        tasting_price: 35,
        available_times: ["10:30 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
        wine_types: ["Red", "White"],
        number_of_wines_per_tasting: 4,
        special_features: ["Historic Site", "Caves", "Gardens"],
        images: [
          "https://images.unsplash.com/photo-1574672280450-482020227916",
          "https://images.unsplash.com/photo-1596701768856-74fc2104526d"
        ],
        food_pairing_options: [],
        tours: {
          available: true,
          tour_price: 55,
          tour_options: [{ tour_id: "tour8", description: "Legacy Cave Tour", cost: 55 }]
        },
        wine_details: [
          {
            id: "wine12",
            name: "Private Reserve Cabernet",
            description: "A classic representation of Napa Valley Cabernet.",
            year: 2017,
            tasting_notes: "Rich, layered, and age-worthy.",
            photo: "https://images.unsplash.com/photo-1559818816-dc5c6353d9e6"
          }
        ],
        booking_info: {
          booking_enabled: true,
          max_guests_per_slot: 10,
          number_of_people: [2, 3, 4, 5, 6],
          dynamic_pricing: { enabled: false, weekend_multiplier: 1.0 },
          available_slots: ["10:30 AM", "12:00 PM", "2:00 PM", "4:00 PM"]
        },
        other_features: []
      }
    ],
    amenities: {
      virtual_sommelier: true,
      augmented_reality_tours: true,
      handicap_accessible: true
    },
    user_reviews: [],
    transportation: {
      uber_availability: true,
      lyft_availability: true,
      distance_from_user: 10.5
    }
  },
  {
    name: "V. Sattui Winery",
    location: {
      address: "1111 White Ln, St Helena, CA 94574",
      latitude: 38.4877,
      longitude: -122.4590,
      is_mountain_location: false,
    },
    contact_info: {
      phone: "(707) 963-7774",
      email: "info@vsattui.com",
      website: "https://www.vsattui.com",
    },
    description: "A family-owned winery known for its deli, picnic grounds, and diverse portfolio of small-lot wines.",
    tasting_info: [
      {
        tasting_title: "Marketplace Tasting",
        tasting_description: "Casual tasting in our artisan marketplace.",
        ava: "St. Helena",
        tasting_price: 45,
        available_times: ["10:00 AM", "4:00 PM"],
        wine_types: ["Red", "White", "Rosé", "Sparkling"],
        number_of_wines_per_tasting: 6,
        special_features: ["Picnic Area", "Deli", "External Booking Only"],
        images: [
          "https://images.unsplash.com/photo-1528643329766-3b1029c0b168",
          "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d"
        ],
        food_pairing_options: [],
        tours: {
          available: false,
          tour_price: 0,
          tour_options: []
        },
        wine_details: [
          {
            id: "wine13",
            name: "Gamay Rouge",
            description: "A fruity, slightly sweet blush wine.",
            year: 2021,
            tasting_notes: "Strawberry, cranberry, and floral notes.",
            photo: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809"
          }
        ],
        booking_info: {
          booking_enabled: true,
          max_guests_per_slot: 20,
          number_of_people: [2, 3, 4, 5, 6],
          dynamic_pricing: { enabled: false, weekend_multiplier: 1.0 },
          available_slots: ["10:00 AM", "4:00 PM"]
        },
        other_features: []
      }
    ],
    amenities: {
      virtual_sommelier: false,
      augmented_reality_tours: false,
      handicap_accessible: true
    },
    user_reviews: [],
    transportation: {
      uber_availability: true,
      lyft_availability: true,
      distance_from_user: 9.8
    },
    payment_method: {
      type: 'external_booking',
      external_booking_link: 'https://www.vsattui.com/visit/tastings'
    }
  }
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      dbName: "nvw",
      bufferCommands: false,
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Winery.deleteMany({});
    console.log("✅ Existing data cleared");

    // Create admin user
    console.log("👤 Creating admin user...");
    const adminUser = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@napawineries.com",
      phone: "+1-555-0100",
      password: "admin123",
      role: "admin",
      dateOfBirth: new Date("1980-01-01"),
      isActive: true,
    });
    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create winery owner user
    console.log("👤 Creating winery owner user...");
    const wineryOwner = await User.create({
      firstName: "Winery",
      lastName: "Owner",
      email: "owner@napawineries.com",
      phone: "+1-555-0101",
      password: "owner123",
      role: "winery",
      dateOfBirth: new Date("1975-05-15"),
      isActive: true,
    });
    console.log(`✅ Winery owner created: ${wineryOwner.email}`);

    // Create sample customer user
    console.log("👤 Creating customer user...");
    const customer = await User.create({
      firstName: "John",
      lastName: "Customer",
      email: "customer@example.com",
      phone: "+1-555-0102",
      password: "customer123",
      role: "customer",
      dateOfBirth: new Date("1990-06-15"),
      isActive: true,
    });
    console.log(`✅ Customer user created: ${customer.email}`);

    // Create wineries and link to owner
    console.log("🍷 Creating wineries...");
    const createdWineries = [];
    for (const wineryData of wineries) {
      const winery = await Winery.create({
        ...wineryData,
        owner: wineryOwner._id,
      });
      createdWineries.push(winery);
      console.log(`✅ Created winery: ${winery.name}`);
    }

    // Link first winery to owner user
    if (createdWineries.length > 0) {
      wineryOwner.wineryId = createdWineries[0]._id;
      await wineryOwner.save();
      console.log(`✅ Linked owner to winery: ${createdWineries[0].name}`);
    }

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin Account:");
    console.log("  Email: admin@napawineries.com");
    console.log("  Password: admin123");
    console.log("  Role: admin");
    console.log("\nWinery Owner Account:");
    console.log("  Email: owner@napawineries.com");
    console.log("  Password: owner123");
    console.log("  Role: winery");
    console.log(`  Winery: ${createdWineries[0]?.name || 'None'}`);
    console.log("\nCustomer Account:");
    console.log("  Email: customer@example.com");
    console.log("  Password: customer123");
    console.log("  Role: customer");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log(`📊 Summary:`);
    console.log(`  - Users created: 3`);
    console.log(`  - Wineries created: ${wineries.length}`);

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
