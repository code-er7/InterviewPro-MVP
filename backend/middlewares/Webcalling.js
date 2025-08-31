import axios from "axios";

const DAILY_API_KEY = process.env.DAILY_API_KEY;
console.log("++++++++++++_____________________++++++++++++++++");
console.log(DAILY_API_KEY);
async function createDailyRoom() {
  try {
    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        properties: {
          enable_chat: true,
          enable_knocking: false,
          start_video_off: false,
          start_audio_off: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.url; // The room URL
  } catch (error) {
    console.error("Error creating Daily room:", error.response?.data || error);
    throw error;
  }
}

export default createDailyRoom;
