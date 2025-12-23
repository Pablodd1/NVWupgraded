export const mockWineries = [
    {
        _id: "657999acac9c9c0012345671",
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
        owner: "657999acac9c9c0012345670"
    },
    {
        _id: "657999acac9c9c0012345672",
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
        description: "An iconic Napa Valley partnership between Baron Philippe de Rothschild and Robert Mondavi. Renowned for producing world-class Bordeaux-style blends.",
        tasting_info: [
            {
                tasting_title: "Opus One Signature Tasting",
                tasting_description: "Experience the epitome of Napa Valley excellence",
                ava: "Oakville",
                tasting_price: 150,
                available_times: ["10:00 AM", "11:30 AM", "1:30 PM", "3:00 PM"],
                wine_types: ["Red"],
                number_of_wines_per_tasting: 3,
                special_features: ["Tour Available", "Organic"],
                images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
                booking_info: {
                    booking_enabled: true,
                    max_guests_per_slot: 6,
                    available_slots: ["10:00 AM", "11:30 AM", "1:30 PM", "3:00 PM"],
                }
            }
        ],
        amenities: { virtual_sommelier: true, handicap_accessible: true },
        owner: "657999acac9c9c0012345670"
    },
    {
        _id: "657999acac9c9c0012345673",
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
        description: "Historic estate specializing in premium sparkling wines using méthode traditionnelle. Famous for serving at Presidential toasts.",
        tasting_info: [
            {
                tasting_title: "Sparkling Wine Cave Tour & Tasting",
                tasting_description: "Explore our historic caves while tasting our finest sparkling wines",
                ava: "Calistoga",
                tasting_price: 95,
                wine_types: ["Sparkling"],
                images: ["https://images.unsplash.com/photo-1510812431401-41d2bd2722f3"],
                booking_info: {
                    booking_enabled: true,
                    max_guests_per_slot: 10,
                }
            }
        ],
        amenities: { augmented_reality_tours: true },
        owner: "657999acac9c9c0012345670"
    },
    {
        _id: "657999acac9c9c0012345674",
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
        description: "Authentic 13th-century Tuscan castle replica featuring 107 rooms on 8 levels. Producing Italian-style wines in a stunning medieval setting.",
        tasting_info: [
            {
                tasting_title: "Royal Tasting Experience",
                tasting_description: "Taste premium wines in our authentic castle setting",
                ava: "Calistoga",
                tasting_price: 65,
                wine_types: ["Red", "White", "Rosé", "Dessert"],
                images: ["https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb"],
                booking_info: {
                    booking_enabled: true,
                    max_guests_per_slot: 12,
                }
            }
        ],
        amenities: { augmented_reality_tours: true, handicap_accessible: true },
        owner: "657999acac9c9c0012345670"
    },
    {
        _id: "657999acac9c9c0012345675",
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
        description: "Château-style winery specializing in sparkling wines and Pinot Noir from the cool Los Carneros AVA.",
        tasting_info: [
            {
                tasting_title: "Sparkling Wine Flight",
                tasting_description: "Sample our exquisite sparkling wines on the terrace with vineyard views",
                ava: "Los Carneros",
                tasting_price: 50,
                wine_types: ["Sparkling", "Red"],
                images: ["https://images.unsplash.com/photo-1474722883778-792e7990302f"],
                booking_info: {
                    booking_enabled: true,
                    max_guests_per_slot: 8,
                }
            }
        ],
        amenities: { virtual_sommelier: true, handicap_accessible: true },
        owner: "657999acac9c9c0012345670"
    },
    {
        _id: "657999acac9c9c0012345676",
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
        description: "Dedicated exclusively to producing Cabernet Sauvignon. LEED Platinum certified winery showcasing sustainable practices.",
        tasting_info: [
            {
                tasting_title: "Cabernet Tasting Experience",
                tasting_description: "Discover our single-varietal Cabernet Sauvignon from Napa Valley and Alexander Valley",
                ava: "Oakville",
                tasting_price: 60,
                wine_types: ["Red"],
                images: ["https://images.unsplash.com/photo-1547595628-c61a29f496f0"],
                booking_info: {
                    booking_enabled: true,
                    max_guests_per_slot: 10,
                }
            }
        ],
        amenities: { virtual_sommelier: true, augmented_reality_tours: true, handicap_accessible: true },
        owner: "657999acac9c9c0012345670"
    },
    {
        _id: "657999acac9c9c0012345677",
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
                tasting_description: "Explore the historic wine caves and taste current releases",
                ava: "St. Helena",
                tasting_price: 35,
                wine_types: ["Red", "White"],
                images: ["https://images.unsplash.com/photo-1574672280450-482020227916"],
                booking_info: {
                    booking_enabled: true,
                    max_guests_per_slot: 10,
                }
            }
        ],
        amenities: { virtual_sommelier: true, augmented_reality_tours: true, handicap_accessible: true },
        owner: "657999acac9c9c0012345670"
    },
    {
        _id: "657999acac9c9c0012345678",
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
                tasting_description: "Casual tasting in our artisan marketplace",
                ava: "St. Helena",
                tasting_price: 45,
                wine_types: ["Red", "White", "Rosé", "Sparkling"],
                special_features: ["Picnic Area", "Deli", "External Booking Only"],
                images: ["https://images.unsplash.com/photo-1528643329766-3b1029c0b168"],
                booking_info: {
                    booking_enabled: true,
                    max_guests_per_slot: 20,
                }
            }
        ],
        amenities: { handicap_accessible: true },
        payment_method: {
            type: 'external_booking',
            external_booking_link: 'https://www.vsattui.com/visit/tastings'
        },
        owner: "657999acac9c9c0012345670"
    }
];

