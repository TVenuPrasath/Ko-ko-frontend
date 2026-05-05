import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import birdRoutes from "./routes/birds.js";
import diseaseRoutes from "./routes/disease.js";
import serviceRoutes from "./routes/services.js";
import marketRoutes from "./routes/market.js";
import notificationRoutes from "./routes/notifications.js";
import vaccinationRoutes from "./routes/vaccinations.js";
import farmerRoutes from "./routes/farmers.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/birds", birdRoutes);
app.use("/api/disease", diseaseRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/farmers", farmerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
