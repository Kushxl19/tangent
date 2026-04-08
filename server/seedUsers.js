import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js"; // path check kar lena

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Purane test users hata de (optional)
        await User.deleteMany({ email: /@test\.com$/ });

        const users = [];

        for (let i = 1; i <= 100; i++) {
            const hashedPassword = await bcrypt.hash("123456", 10);

            users.push({
                name: `user${i}`,   // ✅ FIX
                email: `user${i}@test.com`,
                password: hashedPassword,
            });
        }

        await User.insertMany(users);

        console.log("✅ 100 users created");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedUsers();