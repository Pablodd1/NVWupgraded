
import mongoose from "mongoose";
import User from "../src/models/user.model"; // Adjust path as needed
import { dbConnect } from "../src/lib/dbConnect";
import bcrypt from "bcryptjs";

const generateAdmin = async () => {
    try {
        await dbConnect();
        console.log("Connected to DB");

        const email = "admin_" + Math.random().toString(36).substring(7) + "@napavalley.test";
        const password = Math.random().toString(36).substring(2, 10) + "Aa1!";

        // Check if user exists (unlikely with random)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User collision, retrying...");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            firstName: "Admin",
            lastName: "Owner",
            email: email,
            password: hashedPassword,
            role: "admin", // Assuming role field exists, otherwise adjust
            phone: "555-0100",
            isVerified: true
        });

        console.log("\n✅ Admin User Generated Successfully!");
        console.log("---------------------------------------");
        console.log(`Username/Email: ${email}`);
        console.log(`Password:       ${password}`);
        console.log("---------------------------------------");
        console.log("Use these credentials to login as a Winery Admin/Owner.");

    } catch (error) {
        console.error("Error generating admin:", error);
    } finally {
        // Force exit to close connection
        process.exit(0);
    }
};

generateAdmin();
