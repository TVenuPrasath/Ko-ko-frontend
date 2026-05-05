import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST /api/auth/login
// Login flow: phone → find/create user → return JWT
// New users (from registration) are created with full details
// Existing users just get a new token
router.post("/login", async (req, res) => {
  try {
    const { phone, name, hamlet, shg_name } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: "Valid 10-digit phone number required" });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      // New user — always SHG Member, created from registration screen
      user = await User.create({
        phone,
        name: name || "",
        role: "SHG Member",
        hamlet: hamlet || "",
        shg_name: shg_name || "",
        approved: false,
      });
    } else {
      // Existing user — update name/hamlet if they were missing
      let changed = false;
      if (name && !user.name) { user.name = name; changed = true; }
      if (hamlet && !user.hamlet) { user.hamlet = hamlet; changed = true; }
      if (shg_name && !user.shg_name) { user.shg_name = shg_name; changed = true; }
      if (changed) await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, hamlet: user.hamlet },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/seed-crp
// Protected route to manually create CRP/Buyer accounts via Postman
router.post("/seed-crp", async (req, res) => {
  try {
    const { phone, name, role, hamlet, secret } = req.body;

    if (secret !== process.env.SEED_SECRET) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (role !== "CRP") {
      return res.status(400).json({ message: "Only CRP can be seeded via this route" });
    }

    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ phone, name, role, hamlet, approved: true });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
