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
        description: "An iconic Napa Valley partnership between Baron Philippe de Rothschild and Robert Mondavi.",
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
        amenities: { virtual_sommelier: true },
        owner: "657999acac9c9c0012345670"
    }
];
