import express from "express";
import fetch from "node-fetch";

const app = express();

// Daily API key (store in .env)
const DAILY_API_KEY = process.env.DAILY_API_KEY;

app.post("/create-room", async (req, res) => {
  try {
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          exp: Math.round(Date.now() / 1000) + 60 * 60, // room expires in 1 hour
          enable_chat: true,
          start_audio_off: false,
          start_video_off: false,
        },
      }),
    });

    const data = await response.json();
    res.json(data); // contains room_url
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on 5000"));
