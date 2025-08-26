import AIBotSession from "../models/aiBotSession.js";
import Interview from "../models/interviewSchema.js";
import agentResponse from "../agents/conversastionalAgent.js";
import { sessions } from "../server.js";




export const createAIBotSession = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const userId = req.user._id;

    // 1. Check interview exists
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // 2. Ensure it's AI-based
    if (!interview.isAI) {
      return res.status(400).json({ message: "This is not an AI interview" });
    }

    // 3. Check if a session exists
    const existingSession = await AIBotSession.findOne({
      interview: interviewId,
    }).populate({
      path: "interview",
      populate: [
        { path: "interviewer", select: "name email" },
        { path: "interviewee", select: "name email" },
      ],
    });

    if (existingSession) {
      if (existingSession.state === "ended") {
        return res.status(400).json({
          message: "This interview has already ended",
        });
      }
      return res.status(200).json({
        message: "Session already active",
        session: existingSession,
      });
    }

    // 4. Create new session with empty result
    const newSession = await AIBotSession.create({
      interview: interviewId,
      result: "",
    });

    const populatedSession = await AIBotSession.findById(
      newSession._id
    ).populate({
      path: "interview",
      populate: [
        { path: "interviewer", select: "name email" },
        { path: "interviewee", select: "name email" },
      ],
    });

    return res.status(201).json({
      message: "AI Bot session created",
      session: populatedSession,
    });
  } catch (error) {
    console.error("Error creating AI Bot session:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};











export async function LiveCalling(req, res) {
  try {
    const { text, session } = req.body;

    if (!text || !session?._id) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const sessionId = session._id;
    const intervieweeName =
      session?.interview?.interviewee?.name || "Candidate";
    const jobDescription =
      session?.interview?.jobDescription || "the given job";
    const interviewerName =
      session?.interview?.interviewer?.name || "Interviewer";

    let promptText = text;

    // Handle INIT message → set up proper intro prompt
    if (text === "___INIT_HELLO___") {
      promptText = `You are acting as an interviewer named ${interviewerName}.  
The interviewee is ${intervieweeName}.  
The role is described as: "${jobDescription}".  

Start the interview in a natural way (e.g., greet and ask the first question).`;
    }

    // Get AI’s reply
    const reply = await agentResponse(sessionId, promptText);

    
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { history: [] });
    }
    const storedSession = sessions.get(sessionId);
    storedSession.meta = {
      interviewee: intervieweeName,
      interviewer: interviewerName,
      jobDescription,
    };

    // Send back AI response + sessionId (so frontend can keep track)
    res.json({
      reply,
      sessionId,
      meta: storedSession.meta,
    });
  } catch (error) {
    console.log("Gemini key:", process.env.GEMINI_API_KEY?.slice(0, 6)); 
    console.error("Error in LiveCalling:", error);
    res.status(500).json({ message: "Error generating AI response" });
  }
}
