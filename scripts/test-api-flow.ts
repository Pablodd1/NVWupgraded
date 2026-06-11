import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../src/models/user.model";
import { autoGenerateWinerySlots } from "../src/lib/slotGenerator";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nvw";
const SECRET = process.env.JWT_SECRET || "";

const samplePayload = {
  name: "API Test Winery",
  location: {
    address: "123 API Road, Napa, CA 94558",
    latitude: 38.3,
    longitude: -122.3,
    is_mountain_location: false,
  },
  contact_info: {
    phone: "555-123-API",
    email: "test@apiwinery.com",
    website: "https://apiwinery.com",
  },
  description: "Testing the API workflow.",
  images: ["https://example.com/img1.jpg"],
  tasting_info: [
    {
      tasting_title: "API Flight",
      tasting_description: "A flight created via API.",
      tasting_price: 50,
      ava: "Napa Valley",
      wine_types: ["Cabernet Sauvignon"],
      number_of_wines_per_tasting: 3,
      special_features: [],
      available_times: ["10:00 AM"],
      available_dates: ["2026-06-15"], // testing specific dates
      booking_info: {
        booking_enabled: true,
        max_guests_per_slot: 4,
        number_of_people: [1, 2, 3, 4],
        allow_excess_guests: false,
        external_booking_link: "https://booking.com/api" // testing external booking
      }
    }
  ],
  amenities: {
    handicap_accessible: true,
    allows_children: false,
    allows_non_drinkers: true,
  },
  transportation: {
    uber_availability: true,
  },
  payment_method: {
    type: "pay_winery"
  },
  operating_hours: [
    { day: "Monday", open: "10:00 AM", close: "05:00 PM", is_closed: false }
  ]
};

async function runTest() {
  console.log("Starting API Workflow Test...");
  if (!SECRET) {
    console.error("JWT_SECRET is missing.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB.");

  // Get a winery owner
  const owner = await User.findOne({ role: "winery" });
  if (!owner) {
    console.error("No winery owner found in DB.");
    process.exit(1);
  }

  const payload = {
    userId: owner._id.toString(),
    email: owner.email,
    role: owner.role,
  };

  const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });

  console.log("Sending POST request to http://localhost:3000/api/winery...");
  
  try {
    const res = await fetch("http://localhost:3000/api/winery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `token=${token}`
      },
      body: JSON.stringify(samplePayload)
    });

    const data = await res.json();
    console.log(`Response Status: ${res.status}`);
    console.log("Response Body:", data);

    if (res.status === 201 || res.status === 200) {
      console.log("✅ API Workflow Test Passed!");
    } else {
      console.error("❌ API Workflow Test Failed!");
    }
  } catch (err) {
    console.error("❌ Failed to reach the server:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
