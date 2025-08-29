import AIBotSession from "../models/aiBotSession.js";
import Interview from "../models/interviewSchema.js";
import agentResponse from "../agents/conversastionalAgent.js";
import { sessions } from "../server.js";
import speech from "@google-cloud/speech";
import textToSpeech from "@google-cloud/text-to-speech";
import resultAgent from "../agents/resultGeneratorAgent.js";

const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();


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
    const { session, audio } = req.body; 

    if (!audio || !session?._id) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const sessionId = session._id;
    const intervieweeName =
      session?.interview?.interviewee?.name || "Candidate";
    const jobDescription =
      session?.interview?.jobDescription || "the given job";
    const interviewerName =
      session?.interview?.interviewer?.name || "Interviewer";

    // Convert base64 → buffer
    const audioBuffer = Buffer.from(audio.split(",")[1], "base64");

    // --- 1. Speech to Text ---
    const [sttResponse] = await speechClient.recognize({
      audio: {
        content: audioBuffer.toString("base64"),
      },
      config: {
        encoding: "WEBM_OPUS", // change to "LINEAR16" if you send WAV
        sampleRateHertz: 48000,
        languageCode: "en-US",
      },
    });

    const transcript = sttResponse.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    // Handle INIT message
    let promptText = transcript;
    if (transcript === "___INIT_HELLO___") {
      promptText = `You are acting as an AI interviewer named .  
The interviewee is ${intervieweeName}.  
The role is described as: "${jobDescription}".  

Start the interview in a natural way (e.g., greet and ask the first question).`;
    }

   
    const replyText = await agentResponse(sessionId, promptText);
 

    // --- 3. Text to Speech ---
    const [ttsResponse] = await ttsClient.synthesizeSpeech({
      input: { text: replyText },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    });

    const replyAudioBase64 = ttsResponse.audioContent.toString("base64");

    // --- 4. Send back transcript + AI reply + audio ---
    res.json({
      transcript, // what user said (from STT)
      replyText, // AI reply (text)
      replyAudio: replyAudioBase64, // AI reply (audio, base64 MP3)
      sessionId,
      
    });
  } catch (error) {
    console.error("Error in LiveCalling:", error);
    res.status(500).json({ message: "Error processing live call" });
  }
}



export async function endcall(req, res) {
  try {
    const { sessionId, transcription } = req.body;
    console.log("Received:", { sessionId, transcription });

    const session = await AIBotSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.state = "ended";

    // Parse the transcription if it's a string
    const parsedTranscription =
      typeof transcription === "string"
        ? JSON.parse(transcription)
        : transcription;

    // Process the results
    const result = await resultAgent(parsedTranscription);
    session.results = result;

    await session.save();

    return res.json({
      success: true,
      session,
      results: result, // Also send results directly for frontend
    });
  } catch (error) {
    console.error("Error in endcall:", error);
    res.status(500).json({ error: "Failed to end call" });
  }
}