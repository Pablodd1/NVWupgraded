const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://napa-admin:NapaWineries2024Secure@napa-wineries-prod.vkpze.mongodb.net/nvw?retryWrites=true&w=majority&appName=napa-wineries-prod";

// Simple winery schema
const winerySchema = new mongoose.Schema({}, { strict: false });
const Winery = mongoose.model('Winery', winerySchema);

const wineries = [
    {
        name: "Stag's Leap Wine Cellars",
        location: { address: "5766 Silverado Trail, Napa, CA 94558", latitude: 38.4081, longitude: -122.3342, is_mountain_location: false },
        contact_info: { phone: "(707) 944-2020", email: "info@stagsleap.com", website: "https://www.stagsleap.com" },
        description: "World-renowned winery famous for the 1976 Judgment of Paris.",
        tasting_info: [{ tasting_title: "Estate Tasting Experience", tasting_price: 75, wine_types: ["Red", "White"], images: ["https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb"], booking_info: { booking_enabled: true, max_guests_per_slot: 8 } }],
        amenities: { virtual_sommelier: true, handicap_accessible: true },
        owner: new mongoose.Types.ObjectId()
    },
    {
        name: "Opus One Winery",
        location: { address: "7900 St Helena Hwy, Oakville, CA 94562", latitude: 38.4324, longitude: -122.4101, is_mountain_location: false },
        contact_info: { phone: "(707) 963-1979", email: "visit@opusonewinery.com", website: "https://www.opusonewinery.com" },
        description: "An iconic Napa Valley partnership between Baron Philippe de Rothschild and Robert Mondavi.",
        tasting_info: [{ tasting_title: "Opus One Signature Tasting", tasting_price: 150, wine_types: ["Red"], images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"], booking_info: { booking_enabled: true, max_guests_per_slot: 6 } }],
        amenities: { virtual_sommelier: true, handicap_accessible: true },
        owner: new mongoose.Types.ObjectId()
    },
    {
        name: "Schramsberg Vineyards",
        location: { address: "1400 Schramsberg Rd, Calistoga, CA 94515", latitude: 38.5689, longitude: -122.5745, is_mountain_location: true },
        contact_info: { phone: "(707) 942-4558", email: "info@schramsberg.com", website: "https://www.schramsberg.com" },
        description: "Historic estate specializing in premium sparkling wines using méthode traditionnelle.",
        tasting_info: [{ tasting_title: "Sparkling Wine Cave Tour & Tasting", tasting_price: 95, wine_types: ["Sparkling"], images: ["https://images.unsplash.com/photo-1510812431401-41d2bd2722f3"], booking_info: { booking_enabled: true, max_guests_per_slot: 10 } }],
        amenities: { augmented_reality_tours: true },
        owner: new mongoose.Types.ObjectId()
    },
    {
        name: "Castello di Amorosa",
        location: { address: "4045 St Helena Hwy, Calistoga, CA 94515", latitude: 38.5423, longitude: -122.5234, is_mountain_location: false },
        contact_info: { phone: "(707) 967-6272", email: "info@castellodiamorosa.com", website: "https://www.castellodiamorosa.com" },
        description: "Authentic 13th-century Tuscan castle replica featuring 107 rooms on 8 levels.",
        tasting_info: [{ tasting_title: "Royal Tasting Experience", tasting_price: 65, wine_types: ["Red", "White", "Rosé", "Dessert"], images: ["https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb"], booking_info: { booking_enabled: true, max_guests_per_slot: 12 } }],
        amenities: { augmented_reality_tours: true, handicap_accessible: true },
        owner: new mongoose.Types.ObjectId()
    },
    {
        name: "Domaine Carneros",
        location: { address: "1240 Duhig Rd, Napa, CA 94559", latitude: 38.2456, longitude: -122.3012, is_mountain_location: false },
        contact_info: { phone: "(707) 257-0101", email: "concierge@domainecarneros.com", website: "https://www.domainecarneros.com" },
        description: "Château-style winery specializing in sparkling wines and Pinot Noir from the cool Los Carneros AVA.",
        tasting_info: [{ tasting_title: "Sparkling Wine Flight", tasting_price: 50, wine_types: ["Sparkling", "Red"], images: ["https://images.unsplash.com/photo-1474722883778-792e7990302f"], booking_info: { booking_enabled: true, max_guests_per_slot: 8 } }],
        amenities: { virtual_sommelier: true, handicap_accessible: true },
        owner: new mongoose.Types.ObjectId()
    },
    {
        name: "Silver Oak Cellars",
        location: { address: "915 Oakville Cross Rd, Oakville, CA 94562", latitude: 38.4312, longitude: -122.4201, is_mountain_location: false },
        contact_info: { phone: "(707) 942-7082", email: "hospitality@silveroak.com", website: "https://www.silveroak.com" },
        description: "Dedicated exclusively to producing Cabernet Sauvignon. LEED Platinum certified winery.",
        tasting_info: [{ tasting_title: "Cabernet Tasting Experience", tasting_price: 60, wine_types: ["Red"], images: ["https://images.unsplash.com/photo-1547595628-c61a29f496f0"], booking_info: { booking_enabled: true, max_guests_per_slot: 10 } }],
        amenities: { virtual_sommelier: true, augmented_reality_tours: true, handicap_accessible: true },
        owner: new mongoose.Types.ObjectId()
    },
    {
        name: "Beringer Vineyards",
        location: { address: "2000 Main St, St Helena, CA 94574", latitude: 38.5053, longitude: -122.4705, is_mountain_location: false },
        contact_info: { phone: "(707) 963-7115", email: "reservations@beringer.com", website: "https://www.beringer.com" },
        description: "Napa Valley's oldest continuously operating winery. Featuring the historic Rhine House and extensive wine caves.",
        tasting_info: [{ tasting_title: "Old Winery Tour & Tasting", tasting_price: 35, wine_types: ["Red", "White"], images: ["https://images.unsplash.com/photo-1574672280450-482020227916"], booking_info: { booking_enabled: true, max_guests_per_slot: 10 } }],
        amenities: { virtual_sommelier: true, augmented_reality_tours: true, handicap_accessible: true },
        owner: new mongoose.Types.ObjectId()
    },
    {
        name: "V. Sattui Winery",
        location: { address: "1111 White Ln, St Helena, CA 94574", latitude: 38.4877, longitude: -122.4590, is_mountain_location: false },
        contact_info: { phone: "(707) 963-7774", email: "info@vsattui.com", website: "https://www.vsattui.com" },
        description: "A family-owned winery known for its deli, picnic grounds, and diverse portfolio of small-lot wines.",
        tasting_info: [{ tasting_title: "Marketplace Tasting", tasting_price: 45, wine_types: ["Red", "White", "Rosé", "Sparkling"], special_features: ["External Booking Only"], images: ["https://images.unsplash.com/photo-1528643329766-3b1029c0b168"], booking_info: { booking_enabled: true, max_guests_per_slot: 20 } }],
        amenities: { handicap_accessible: true },
        payment_method: { type: 'external_booking', external_booking_link: 'https://www.vsattui.com/visit/tastings' },
        owner: new mongoose.Types.ObjectId()
    }
];

async function seed() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, { dbName: 'nvw' });
        console.log('✅ Connected!');

        console.log('🗑️  Clearing existing wineries...');
        await Winery.deleteMany({});

        console.log('📝 Inserting 8 wineries...');
        await Winery.insertMany(wineries);

        const count = await Winery.countDocuments();
        console.log(`✅ Successfully seeded ${count} wineries!`);

        const names = await Winery.find().select('name');
        console.log('\nWineries in database:');
        names.forEach((w, i) => console.log(`  ${i + 1}. ${w.name}`));

        await mongoose.disconnect();
        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seed();
