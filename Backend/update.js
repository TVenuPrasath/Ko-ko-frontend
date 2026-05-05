import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const result = await mongoose.connection.db
  .collection("users")
  .updateOne({ phone: "9876543210" }, { $set: { phone: "6381679573" } });

console.log("Updated:", result.modifiedCount, "document");
await mongoose.disconnect();
process.exit(0);
