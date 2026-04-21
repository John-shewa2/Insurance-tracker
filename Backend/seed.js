const mongoose = require('mongoose');
const User = require('./models/User'); 
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB for seeding...");

    // Clear existing unencrypted users
    await User.deleteMany({});
    console.log("🗑️  Cleared old user data.");

    const users = [
      {
        name: "Admin Officer",
        email: "officer@example.com",
        password: "password123", 
        role: "Officer"
      },
      {
        name: "General Director",
        email: "director@example.com",
        password: "password123",
        role: "Director"
      }
    ];

    // Use a loop with .save() to trigger the password hashing hook
    for (const userData of users) {
      const newUser = new User(userData);
      await newUser.save();
      console.log(`👤 User created: ${userData.email}`);
    }

    console.log("✅ Successfully created and encrypted accounts!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    process.exit(1);
  }
};

seedUsers();