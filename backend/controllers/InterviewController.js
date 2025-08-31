import resultAgent from "../agents/ResultGeneratorAgent.js";
import createDailyRoom from "../middlewares/Webcalling.js";
import Interview from "../models/interviewSchema.js";
import UserSession from "../models/userSession.js";
import dotenv from "dotenv";
dotenv.config();

const DAILY_API_KEY = process.env.DAILY_API_KEY;

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

export const createToken = async (req, res) => {
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
          canAdmin: ["transcription"],
        },
      },
    }),
  });

  const data = await resp.json();
  res.json({ meetingToken: data.token });
};

export const endUserSession = async (req, res) => {
  try {
    const { session_id, meeting_transcriptions } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: "session_id is required" });
    }

    const session = await UserSession.findById(session_id);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // If already ended, return whatever
    if (session.state === "ended") {
      return res.status(200).json({ session });
    }

    session.state = "ended";

    // Generate result from meeting transcriptions
    if (meeting_transcriptions && meeting_transcriptions.length > 0) {
      const airesult = await resultAgent(meeting_transcriptions, false);
      session.results = airesult; // NOTE: your schema uses `results` not `result`

      console.log(meeting_transcriptions);
      console.log(
        "++++++++++++++++++++++++++__________________________++++++++++++++++++++++++++++++++"
      );
    }

    await session.save();

    //this should mimic the behaviour as and stop for 2 sec

    return res.status(200).json({ session });
  } catch (error) {
    console.error("Error ending session:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
