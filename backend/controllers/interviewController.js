import createDailyRoom from "../middlewares/webcalling.js";
import Interview from "../models/interviewSchema.js";
import UserSession from "../models/userSession.js";
import dotenv from 'dotenv' ;
dotenv.config() ;


const DAILY_API_KEY = process.env.DAILY_API_KEY ;

export const createMeeting = async (req, res) => {
  try {
    const { interviewId } = req.body;

    // verify interview exists
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    // check if there exists an active UserSession for this interview
    const existingSession = await UserSession.findOne({
      interview: interviewId,
      state: "active",
    });

    if (existingSession) {
      return res.json({
        message: "session was already active ",
        success: true,
        session: existingSession,
      });
    }

    // NEW LOGIC: Check for a session with "ended" state
    const endedSession = await UserSession.findOne({
      interview: interviewId,
      state: "ended",
    });

    if (endedSession) {
      return res.status(409).json({ error: "Interview has already finished." });
    }

    // create Daily room
    const roomLink = await createDailyRoom();

    // create new UserSession
    const session = await UserSession.create({
      interview: interview._id,
      link: roomLink,
    });

    return res.json({ success: true, session });
  } catch (err) {
    console.error("Error in createMeeting:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};


export const createToken = async (req , res)=>{
  const { roomName } = req.body;

  const resp = await fetch("https://api.daily.co/v1/meeting-tokens", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        permissions: {
          canAdmin: ["transcription"], // ✅ every user can start transcription
        },
      },
    }),
  });

  const data = await resp.json();
  res.json({ meetingToken: data.token });
}