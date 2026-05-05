import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ["SHG Member", "CRP", "Buyer"], default: "SHG Member" },
  hamlet: String,
  shg_name: String,
  approved: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// ─── ADD YOUR CRP / BUYER ACCOUNTS HERE ───────────────────────────────────────
const CRP_ACCOUNTS = [
  {
    name: "CRP Admin",
    phone: "9876500000",
    role: "CRP",
    hamlet: "கோணாங்கிப்பட்டி",
    approved: true,
  },
];

const BUYER_ACCOUNTS = [];
// No buyer accounts needed — buyers are not app users
// ──────────────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅\n");

    const allAccounts = [...CRP_ACCOUNTS, ...BUYER_ACCOUNTS];

    for (const account of allAccounts) {
      const existing = await User.findOne({ phone: account.phone });
      if (existing) {
        console.log(`⚠️  Already exists — ${account.role}: ${account.name} (${account.phone})`);
      } else {
        await User.create(account);
        console.log(`✅ Created — ${account.role}: ${account.name} (${account.phone})`);
      }
    }

    console.log("\nDone! You can now log in with these phone numbers.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
