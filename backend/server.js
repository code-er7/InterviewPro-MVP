import express from "express";
import cors from "cors";
import userrouter from "./Routes/userRoutes.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import datarouter from "./Routes/dataroutes.js";
import agentRouter from "./Routes/agetnRoutes.js";
import bodyParser from "body-parser";


dotenv.config();
const app = express();

// Middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
export const sessions = new Map(); 
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true }));

// Routes

app.use("/api/auth", userrouter);
app.use("/api/data", datarouter);
app.use("/api/ai", agentRouter);

const PORT = process.env.PORT || 4000;
connectDB();

app.listen(PORT, (req, res) => {
  console.log(`server is up and running on port ${PORT}`);
});
