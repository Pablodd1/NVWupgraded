#!/usr/bin/env node

/**
 * Complete Database Seeding Script
 * 
 * Seeds the database with:
 * - Admin account
 * - Test winery owners + wineries
 * - Test customers
 * - Sample bookings
 * 
 * Usage: node scripts/seed-database.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Import models (we'll use dynamic schemas for simplicity)
const userSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const winerySchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const bookingSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

const User = mongoose.model('User', userSchema);
const Winery = mongoose.model('Winery', winerySchema);
const Booking = mongoose.model('Booking', bookingSchema);

// For password hashing
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nvw';

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function seedDatabase() {
    try {
        console.log('\n🍷 NVW Database Seeding');
        console.log('========================================\n');

        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            dbName: 'nvw',
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Connected to MongoDB Atlas!\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Winery.deleteMany({}),
            Booking.deleteMany({})
        ]);
        console.log('✅ Database cleared\n');

        // ========================================
        // 1. CREATE ADMIN ACCOUNT
        // ========================================
        console.log('👤 Creating admin account...');
        const adminPassword = await hashPassword('admin123');
        const admin = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@napawineries.com',
            password: adminPassword,
            phone: '+1-707-555-0001',
            role: 'admin',
            dateOfBirth: new Date('1990-01-01'),
            ageVerified: true,
            isActive: true
        });
        console.log(`✅ Admin created: ${admin.email} / admin123\n`);

        // ========================================
        // 2. CREATE WINERY OWNERS + WINERIES
        // ========================================
        console.log('🏰 Creating winery owners and wineries...\n');

        const wineryData = [
            {
                owner: {
                    firstName: 'Robert',
                    lastName: 'Mondavi',
                    email: 'owner@stagsleap.com',
                    phone: '+1-707-944-2020'
                },
                winery: {
                    name: "Stag's Leap Wine Cellars",
                    location: {
                        address: "5766 Silverado Trail, Napa, CA 94558",
                        latitude: 38.4081,
                        longitude: -122.3342,
                        is_mountain_location: false
                    },
                    contact_info: {
                        phone: "(707) 944-2020",
                        email: "info@stagsleap.com",
                        website: "https://www.stagsleap.com"
                    },
                    description: "World-renowned winery famous for the 1976 Judgment of Paris.",
                    images: ["https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb"],
                    tasting_info: [{
                        tasting_title: "Estate Tasting Experience",
                        tasting_description: "Explore our award-winning Cabernet Sauvignons",
                        tasting_price: 75,
                        base_booking_fee: 75,
                        additional_guest_fee: 50,
                        free_guests_included: 1,
                        available_times: ["10:00", "12:00", "14:00", "16:00"],
                        wine_types: ["Red", "White"],
                        images: [],
                        booking_info: {
                            booking_enabled: true,
                            max_guests_per_slot: 8,
                            number_of_people: [1, 8],
                            allow_excess_guests: false,
                            available_slots: []
                        }
                    }],
                    amenities: {
                        virtual_sommelier: true,
                        augmented_reality_tours: false,
                        handicap_accessible: true
                    }
                }
            },
            {
                owner: {
                    firstName: 'Philippe',
                    lastName: 'Rothschild',
                    email: 'owner@opusone.com',
                    phone: '+1-707-963-1979'
                },
                winery: {
                    name: "Opus One Winery",
                    location: {
                        address: "7900 St Helena Hwy, Oakville, CA 94562",
                        latitude: 38.4324,
                        longitude: -122.4101,
                        is_mountain_location: false
                    },
                    contact_info: {
                        phone: "(707) 963-1979",
                        email: "visit@opusonewinery.com",
                        website: "https://www.opusonewinery.com"
                    },
                    description: "An iconic Napa Valley partnership between Baron Philippe de Rothschild and Robert Mondavi.",
                    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
                    tasting_info: [{
                        tasting_title: "Opus One Signature Tasting",
                        tasting_description: "Premium tasting of our flagship Bordeaux blend",
                        tasting_price: 150,
                        base_booking_fee: 150,
                        additional_guest_fee: 100,
                        free_guests_included: 1,
                        available_times: ["11:00", "13:00", "15:00"],
                        wine_types: ["Red"],
                        images: [],
                        booking_info: {
                            booking_enabled: true,
                            max_guests_per_slot: 6,
                            number_of_people: [2, 6],
                            allow_excess_guests: false,
                            available_slots: []
                        }
                    }],
                    amenities: {
                        virtual_sommelier: true,
                        augmented_reality_tours: false,
                        handicap_accessible: true
                    }
                }
            },
            {
                owner: {
                    firstName: 'Jack',
                    lastName: 'Davies',
                    email: 'owner@schramsberg.com',
                    phone: '+1-707-942-4558'
                },
                winery: {
                    name: "Schramsberg Vineyards",
                    location: {
                        address: "1400 Schramsberg Rd, Calistoga, CA 94515",
                        latitude: 38.5689,
                        longitude: -122.5745,
                        is_mountain_location: true
                    },
                    contact_info: {
                        phone: "(707) 942-4558",
                        email: "info@schramsberg.com",
                        website: "https://www.schramsberg.com"
                    },
                    description: "Historic estate specializing in premium sparkling wines using méthode traditionnelle.",
                    images: ["https://images.unsplash.com/photo-1510812431401-41d2bd2722f3"],
                    tasting_info: [{
                        tasting_title: "Sparkling Wine Cave Tour & Tasting",
                        tasting_description: "Guided cave tour with sparkling wine tasting",
                        tasting_price: 95,
                        base_booking_fee: 95,
                        additional_guest_fee: 75,
                        free_guests_included: 1,
                        available_times: ["10:00", "11:30", "13:00", "14:30"],
                        wine_types: ["Sparkling"],
                        images: [],
                        booking_info: {
                            booking_enabled: true,
                            max_guests_per_slot: 10,
                            number_of_people: [2, 10],
                            allow_excess_guests: true,
                            excess_guest_multiplier: 1.5,
                            available_slots: []
                        }
                    }],
                    amenities: {
                        virtual_sommelier: false,
                        augmented_reality_tours: true,
                        handicap_accessible: false
                    }
                }
            }
        ];

        const createdWineries = [];

        for (const data of wineryData) {
            // Create owner
            const ownerPassword = await hashPassword('password123');
            const owner = await User.create({
                firstName: data.owner.firstName,
                lastName: data.owner.lastName,
                email: data.owner.email,
                password: ownerPassword,
                phone: data.owner.phone,
                role: 'winery',
                dateOfBirth: new Date('1980-01-01'),
                ageVerified: true,
                isActive: true
            });

            // Create winery
            const winery = await Winery.create({
                ...data.winery,
                owner: owner._id,
                transportation: {
                    uber_availability: true,
                    lyft_availability: true,
                    distance_from_user: 0
                },
                user_reviews: [],
                payment_method: {}
            });

            // Link winery to owner
            owner.wineryId = winery._id;
            await owner.save();

            createdWineries.push({ owner, winery });
            console.log(`  ✅ ${winery.name}`);
            console.log(`     Owner: ${owner.email} / password123`);
        }

        console.log('');

        // ========================================
        // 3. CREATE CUSTOMER ACCOUNTS
        // ========================================
        console.log('👥 Creating customer accounts...\n');

        const customers = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'customer@test.com',
                phone: '+1-415-555-0101'
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@test.com',
                phone: '+1-415-555-0102'
            },
            {
                firstName: 'Michael',
                lastName: 'Johnson',
                email: 'michael.j@test.com',
                phone: '+1-415-555-0103'
            }
        ];

        const createdCustomers = [];

        for (const customerData of customers) {
            const customerPassword = await hashPassword('customer123');
            const customer = await User.create({
                ...customerData,
                password: customerPassword,
                role: 'customer',
                dateOfBirth: new Date('1995-06-15'),
                ageVerified: true,
                isActive: true
            });
            createdCustomers.push(customer);
            console.log(`  ✅ ${customer.email} / customer123`);
        }

        console.log('');

        // ========================================
        // 4. CREATE SAMPLE BOOKINGS
        // ========================================
        console.log('📅 Creating sample bookings...\n');

        // Create a booking for the first customer at Stag's Leap
        const booking1 = await Booking.create({
            user: createdCustomers[0]._id,
            winery: createdWineries[0].winery._id,
            tasting_package: createdWineries[0].winery.tasting_info[0].tasting_title,
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            time: "14:00",
            guests: 4,
            total_price: 225, // 75 + (3 × 50)
            status: 'confirmed',
            special_requests: 'Celebrating anniversary',
            contact_info: {
                name: `${createdCustomers[0].firstName} ${createdCustomers[0].lastName}`,
                email: createdCustomers[0].email,
                phone: createdCustomers[0].phone
            }
        });

        console.log(`  ✅ Booking #1: ${createdCustomers[0].email} → ${createdWineries[0].winery.name}`);

        // Create a booking for the second customer at Opus One
        const booking2 = await Booking.create({
            user: createdCustomers[1]._id,
            winery: createdWineries[1].winery._id,
            tasting_package: createdWineries[1].winery.tasting_info[0].tasting_title,
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            time: "11:00",
            guests: 2,
            total_price: 250, // 150 + (1 × 100)
            status: 'confirmed',
            special_requests: '',
            contact_info: {
                name: `${createdCustomers[1].firstName} ${createdCustomers[1].lastName}`,
                email: createdCustomers[1].email,
                phone: createdCustomers[1].phone
            }
        });

        console.log(`  ✅ Booking #2: ${createdCustomers[1].email} → ${createdWineries[1].winery.name}`);

        console.log('');

        // ========================================
        // SUMMARY
        // ========================================
        console.log('========================================');
        console.log('✅ Database seeding complete!\n');

        console.log('📊 Summary:');
        const userCount = await User.countDocuments();
        const wineryCount = await Winery.countDocuments();
        const bookingCount = await Booking.countDocuments();

        console.log(`  - Users: ${userCount}`);
        console.log(`  - Wineries: ${wineryCount}`);
        console.log(`  - Bookings: ${bookingCount}\n`);

        console.log('🔑 Test Accounts:\n');
        console.log('  ADMIN:');
        console.log('    Email: admin@napawineries.com');
        console.log('    Password: admin123\n');

        console.log('  WINERY OWNERS:');
        console.log('    owner@stagsleap.com / password123');
        console.log('    owner@opusone.com / password123');
        console.log('    owner@schramsberg.com / password123\n');

        console.log('  CUSTOMERS:');
        console.log('    customer@test.com / customer123');
        console.log('    jane.smith@test.com / customer123');
        console.log('    michael.j@test.com / customer123\n');

        console.log('========================================');
        console.log('🚀 You can now start the development server!');
        console.log('   npm run dev\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error seeding database:', error);
        console.error('\nTroubleshooting:');
        console.error('- Check your MongoDB connection string in .env.local');
        console.error('- Ensure MongoDB Atlas network access is configured');
        console.error('- Verify database user credentials\n');
        process.exit(1);
    }
}

// Run the seed
seedDatabase();
