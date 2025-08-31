import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Helper function to format the transcription array
function formatTranscript(transcriptionArray) {
  let formattedTranscript = "";
  transcriptionArray.forEach((turn) => {
    const role = turn.speaker === "User" ? "Interviewee" : "Interviewer";
    formattedTranscript += `${role}: ${turn.text}\n\n`;
  });
  return formattedTranscript.trim();
}

function formatInterviewTranscript(conversationArray) {
  let formattedTranscript = "";
  conversationArray.forEach((turn) => {
    formattedTranscript += `${turn.speaker}: ${turn.text}\n\n`;
  });
  return formattedTranscript.trim();
}

async function resultAgent(transcriptionArray  , isAi) {
  // console.log("+++++++++++++++++++++++++++++++++++");
  // console.log("Original Transcript Array:");
  // console.log(transcriptionArray);

  // 1. Format the array into a clean string
  let transcription = "";
  if(isAi==true){
     transcription = formatTranscript(transcriptionArray);
  }
  else {
    transcription = formatInterviewTranscript(transcriptionArray) ;
  }

  console.log("Formatted Transcript for LLM:");
  console.log(transcription);
  console.log("+++++++++++++++++++++++++++++++++++");


  try {
    const prompt = `
You are an AI agent which evaluates an interview conversation.
Interviewer = AI bot
Interviewee = Human

Conversation transcript:
${transcription}

Return ONLY a JSON object with these fields (1–10 scale for each):
{
  "confidence_level": number,
  "technical_knowledge": number,
  "communication": number,
  "problem_solving": number
}

try best to give in this format if data is not sufficent then give low random values but keep the format strictly the same !
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    // It's good practice to parse the JSON and then return it as an object
    // or handle the stringified JSON as needed by your application.
    return reply; // stringified JSON from AI
  } catch (error) {
    console.error("Error generating result:", error);
    return JSON.stringify({
      confidence_level: 0,
      technical_knowledge: 0,
      communication: 0,
      problem_solving: 0,
    });
  }
}

export default resultAgent;
