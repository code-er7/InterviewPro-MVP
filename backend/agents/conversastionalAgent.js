import { GoogleGenerativeAI } from "@google/generative-ai";
import { sessions } from "../server.js";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


async function agentResponse(sessionId, userText) {

  // const apikey = process.env.GEMINI_API_KEY;
 
  // const genAI = new GoogleGenerativeAI(`${apikey}`);

  // const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { history: [] });
  }
  const session = sessions.get(sessionId);

  
  const historyContext = session.history
    .slice(-2)
    .map((h) => `User: ${h.user}\nAI: ${h.ai}`)
    .join("\n");

  const prompt = `
You are an AI interviewer. Continue the interview naturally.
Conversation so far:
${historyContext}

Now user said: "${userText}"
Respond as the interviewer.
  `;

  // Generate reply from Gemini
  const result = await model.generateContent(prompt);
  const reply = result.response.text();

  // Save to memory
  session.history.push({ user: userText, ai: reply });
  console.log(session.history);
  return reply;
}


export default agentResponse ;