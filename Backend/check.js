import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to DB:", mongoose.connection.name);

const users = await mongoose.connection.db.collection("users").find({}).toArray();
console.log("\nTotal users:", users.length);
users.forEach(u => console.log(` - ${u.role} | ${u.name} | ${u.phone} | approved: ${u.approved}`));

await mongoose.disconnect();
process.exit(0);
