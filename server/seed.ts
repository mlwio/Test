import { connectDB } from "./db";
import { UserModel } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    
    console.log("Checking for existing admin user...");
    
    // Check if admin user already exists
    const existingUser = await UserModel.findOne({ username: "mlwio" });

    if (existingUser) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("MLWIO0372", 10);
    
    await UserModel.create({
      username: "mlwioapi",
      password: hashedPassword,
    });

    console.log("✓ Admin user created successfully");
    console.log("  Username: mlwioapi");
    console.log("  Password: MLWIO.0372");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
