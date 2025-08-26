import AIBotSession from "../models/aiBotSession.js";
import Interview from "../models/interviewSchema.js";





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











// Dummy responses for now
const dummyReplies = [
  "Hello! I am your AI assistant.",
  "I can help you with information or tasks.",
  "Let's get started!",
];

let counter = 0;

export async function LiveCalling(req, res) {
  const { text } = req.body; // text from frontend
  console.log("User said:", text);

  // Simulate agent processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Cycle through dummy replies
  const reply = dummyReplies[counter % dummyReplies.length];
  counter++;

  res.json({ reply });
}
