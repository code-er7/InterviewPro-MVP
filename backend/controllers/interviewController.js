import createDailyRoom from "../middlewares/webcalling.js";
import Interview from "../models/interviewSchema.js";
import UserSession from "../models/userSession.js";

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
