import express from 'express' ;
import cors from 'cors' ;
import userrouter from './Routes/userRoutes.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv' ;

dotenv.config();
const app = express();

// Middlewares
app.use(
  cors({
    origin:  "*",
    credentials: true,
  })
);


app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", userrouter);

const PORT = process.env.PORT || 4000;
connectDB();


app.listen(PORT , (req , res) => { 
  console.log(`server is up and running on port ${PORT}`) ;
})
