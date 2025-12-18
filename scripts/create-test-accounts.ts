import mongoose from "mongoose";
import User from "../src/models/user.model";
import Winery from "../src/models/winery.model";
import bcrypt from "bcrypt";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nvw";

async function createTestAccounts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Test Account 1: Admin
    console.log("\n📝 Creating Admin Account...");
    const adminExists = await User.findOne({ email: "admin@napawineries.com" });
    
    if (!adminExists) {
      await User.create({
        firstName: "Admin",
        lastName: "User",
        email: "admin@napawineries.com",
        phone: "1234567890",
        password: "admin123",
        role: "admin",
        isActive: true,
      });
      console.log("✅ Admin account created");
      console.log("   Email: admin@napawineries.com");
      console.log("   Password: admin123");
    } else {
      console.log("ℹ️  Admin account already exists");
    }

    // Test Account 2: Customer
    console.log("\n📝 Creating Customer Account...");
    const customerExists = await User.findOne({ email: "customer@test.com" });
    
    if (!customerExists) {
      await User.create({
        firstName: "Test",
        lastName: "Customer",
        email: "customer@test.com",
        phone: "5551234567",
        password: "customer123",
        dateOfBirth: new Date("1990-01-01"),
        role: "customer",
        isActive: true,
      });
      console.log("✅ Customer account created");
      console.log("   Email: customer@test.com");
      console.log("   Password: customer123");
    } else {
      console.log("ℹ️  Customer account already exists");
    }

    // Test Account 3: Winery Owner (for Opus One)
    console.log("\n📝 Creating Winery Owner Account...");
    const wineryOwnerExists = await User.findOne({ email: "owner@napawineries.com" });
    
    if (!wineryOwnerExists) {
      // Find Opus One Winery
      const opusOne = await Winery.findOne({ name: "Opus One Winery" });
      
      if (opusOne) {
        const ownerUser = await User.create({
          firstName: "Michael",
          lastName: "Mondavi",
          email: "owner@napawineries.com",
          phone: "7079551234",
          password: "owner123",
          role: "winery",
          wineryId: opusOne._id,
          isActive: true,
        });
        
        // Update winery with owner reference
        opusOne.owner = ownerUser._id;
        await opusOne.save();
        
        console.log("✅ Winery Owner account created");
        console.log("   Email: owner@napawineries.com");
        console.log("   Password: owner123");
        console.log("   Winery: Opus One Winery");
      } else {
        console.log("⚠️  Opus One Winery not found - skipping owner account");
      }
    } else {
      console.log("ℹ️  Winery Owner account already exists");
    }

    // Test Account 4: Another Customer for testing bookings
    console.log("\n📝 Creating Additional Customer Account...");
    const customer2Exists = await User.findOne({ email: "john@example.com" });
    
    if (!customer2Exists) {
      await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "4155551234",
        password: "john123",
        dateOfBirth: new Date("1985-06-15"),
        role: "customer",
        isActive: true,
      });
      console.log("✅ Additional customer account created");
      console.log("   Email: john@example.com");
      console.log("   Password: john123");
    } else {
      console.log("ℹ️  Additional customer account already exists");
    }

    console.log("\n" + "=".repeat(60));
    console.log("📋 TEST ACCOUNT SUMMARY");
    console.log("=".repeat(60));
    
    console.log("\n👨‍💼 ADMIN ACCOUNT:");
    console.log("   Email:    admin@napawineries.com");
    console.log("   Password: admin123");
    console.log("   Role:     admin");
    console.log("   Access:   Full platform access");
    
    console.log("\n🍷 WINERY OWNER ACCOUNT:");
    console.log("   Email:    owner@napawineries.com");
    console.log("   Password: owner123");
    console.log("   Role:     winery");
    console.log("   Winery:   Opus One Winery");
    console.log("   Access:   Winery Dashboard");
    
    console.log("\n👤 CUSTOMER ACCOUNT 1:");
    console.log("   Email:    customer@test.com");
    console.log("   Password: customer123");
    console.log("   Role:     customer");
    console.log("   Access:   Browse, Book, Pay");
    
    console.log("\n👤 CUSTOMER ACCOUNT 2:");
    console.log("   Email:    john@example.com");
    console.log("   Password: john123");
    console.log("   Role:     customer");
    console.log("   Access:   Browse, Book, Pay");
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ All test accounts ready!");
    console.log("=".repeat(60) + "\n");
    
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error creating test accounts:", error);
    process.exit(1);
  }
}

// Run the function
createTestAccounts();
