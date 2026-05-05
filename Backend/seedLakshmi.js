import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ── inline schemas (avoids import path issues) ────────────────────────────────
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ["SHG Member", "CRP"], default: "SHG Member" },
  hamlet: String,
  shg_name: String,
  approved: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
}));

const BirdUpdate = mongoose.model("BirdUpdate", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weekDate: { type: String, required: true },
  chicks: { type: Number, default: 0 },
  growers: { type: Number, default: 0 },
  layers: { type: Number, default: 0 },
  broilers: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}));

const Vaccination = mongoose.model("Vaccination", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["white_diarrhea", "smallpox", "deworming"], required: true },
  ageGroup: String,
  dateGiven: { type: Date, required: true },
  nextDueDate: { type: Date, required: true },
  status: { type: String, enum: ["completed", "pending"], default: "completed" },
  createdAt: { type: Date, default: Date.now },
}));

const ServiceDemand = mongoose.model("ServiceDemand", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  farmerName: String,
  hamlet: String,
  type: { type: String, enum: ["Vaccination", "Deworming", "Feed Stock", "Loan", "Equipment"], required: true },
  quantity: { type: Number, required: true },
  amount: Number,
  notes: String,
  status: { type: String, enum: ["Pending", "Completed", "Rejected"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
}));

const DiseaseReport = mongoose.model("DiseaseReport", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: String,
  photo: String,
  reportedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Reviewed"], default: "Pending" },
}));

// ── helpers ───────────────────────────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function weekOf(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}

// ── seed ──────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected ✅\n");

  // 1. Upsert Lakshmi
  let lakshmi = await User.findOne({ phone: "9842100001" });
  if (!lakshmi) {
    lakshmi = await User.create({
      name: "Lakshmi S",
      phone: "9842100001",
      role: "SHG Member",
      hamlet: "வடுகப்பட்டு",
      shg_name: "Thendral SHG",
      approved: true,
    });
    console.log("✅ Created user: Lakshmi S (9842100001)");
  } else {
    // make sure she is approved
    lakshmi.approved = true;
    lakshmi.name = lakshmi.name || "Lakshmi S";
    lakshmi.hamlet = lakshmi.hamlet || "வடுகப்பட்டு";
    lakshmi.shg_name = lakshmi.shg_name || "Thendral SHG";
    await lakshmi.save();
    console.log("⚠️  User already exists — updated: Lakshmi S (9842100001)");
  }
  const uid = lakshmi._id;

  // 2. Bird updates — 13 weeks
  const birdRows = [
    { daysBack: 0,  chicks: 12, growers: 8,  layers: 20, broilers: 10 },
    { daysBack: 7,  chicks: 10, growers: 9,  layers: 18, broilers: 12 },
    { daysBack: 14, chicks: 8,  growers: 10, layers: 17, broilers: 14 },
    { daysBack: 21, chicks: 6,  growers: 11, layers: 16, broilers: 15 },
    { daysBack: 28, chicks: 14, growers: 7,  layers: 15, broilers: 11 },
    { daysBack: 35, chicks: 13, growers: 6,  layers: 14, broilers: 10 },
    { daysBack: 42, chicks: 11, growers: 8,  layers: 13, broilers: 9  },
    { daysBack: 49, chicks: 9,  growers: 9,  layers: 12, broilers: 8  },
    { daysBack: 56, chicks: 7,  growers: 10, layers: 11, broilers: 7  },
    { daysBack: 63, chicks: 10, growers: 8,  layers: 10, broilers: 6  },
    { daysBack: 70, chicks: 8,  growers: 7,  layers: 9,  broilers: 5  },
    { daysBack: 77, chicks: 6,  growers: 6,  layers: 8,  broilers: 4  },
    { daysBack: 84, chicks: 5,  growers: 5,  layers: 7,  broilers: 3  },
  ];
  await BirdUpdate.deleteMany({ userId: uid });
  await BirdUpdate.insertMany(birdRows.map(({ daysBack, ...rest }) => ({
    userId: uid,
    weekDate: weekOf(daysBack),
    createdAt: daysAgo(daysBack),
    ...rest,
  })));
  console.log(`✅ Inserted ${birdRows.length} bird updates`);

  // 3. Vaccinations & dewormings
  await Vaccination.deleteMany({ userId: uid });
  await Vaccination.insertMany([
    {
      userId: uid,
      type: "white_diarrhea",
      ageGroup: "0-7 days",
      dateGiven: daysAgo(75),
      nextDueDate: daysAgo(5),   // overdue — shows alert
      status: "completed",
      createdAt: daysAgo(75),
    },
    {
      userId: uid,
      type: "smallpox",
      ageGroup: "above 60 days",
      dateGiven: daysAgo(45),
      nextDueDate: daysFromNow(15),
      status: "completed",
      createdAt: daysAgo(45),
    },
    {
      userId: uid,
      type: "deworming",
      dateGiven: daysAgo(80),
      nextDueDate: daysAgo(10),  // overdue
      status: "completed",
      createdAt: daysAgo(80),
    },
    {
      userId: uid,
      type: "deworming",
      dateGiven: daysAgo(40),
      nextDueDate: daysFromNow(20),
      status: "completed",
      createdAt: daysAgo(40),
    },
  ]);
  console.log("✅ Inserted vaccinations & dewormings");

  // 4. Service demands
  await ServiceDemand.deleteMany({ userId: uid });
  await ServiceDemand.insertMany([
    {
      userId: uid, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு",
      type: "Loan", quantity: 1, amount: 15000,
      notes: "நோக்கம்: கூண்டு / உபகரணம் | குறிப்பு: கோழி கூண்டு வாங்க கடன் தேவை",
      status: "Completed", createdAt: daysAgo(85),
    },
    {
      userId: uid, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு",
      type: "Feed Stock", quantity: 5,
      notes: "5 bags of layer mash needed",
      status: "Completed", createdAt: daysAgo(60),
    },
    {
      userId: uid, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு",
      type: "Equipment", quantity: 2,
      notes: "2 water drinkers broken, need replacement",
      status: "Completed", createdAt: daysAgo(40),
    },
    {
      userId: uid, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு",
      type: "Feed Stock", quantity: 3,
      notes: "3 bags of chick starter feed",
      status: "Completed", createdAt: daysAgo(20),
    },
    {
      userId: uid, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு",
      type: "Loan", quantity: 1, amount: 8000,
      notes: "நோக்கம்: குஞ்சுகள் வாங்க | குறிப்பு: புதிய கோழி வாங்க கடன் தேவை",
      status: "Pending", createdAt: daysAgo(3),
    },
    {
      userId: uid, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு",
      type: "Equipment", quantity: 1,
      notes: "Feeder tray cracked, need 1 new one",
      status: "Pending", createdAt: daysAgo(1),
    },
  ]);
  console.log("✅ Inserted service demands");

  // 5. Disease reports
  await DiseaseReport.deleteMany({ userId: uid });
  await DiseaseReport.insertMany([
    {
      userId: uid,
      description: "3 birds not eating for 2 days, sitting separately",
      reportedAt: daysAgo(70),
      status: "Reviewed",
    },
    {
      userId: uid,
      description: "White discharge in droppings, feathers look dull",
      reportedAt: daysAgo(35),
      status: "Reviewed",
    },
    {
      userId: uid,
      description: "2 chicks died overnight, cause unknown",
      reportedAt: daysAgo(5),
      status: "Pending",
    },
  ]);
  console.log("✅ Inserted disease reports");

  console.log("\n🎉 Done! Login with phone: 9842100001");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
