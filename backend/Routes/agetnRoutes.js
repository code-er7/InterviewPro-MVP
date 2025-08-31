import { Router } from "express";
import {
  createAIBotSession,
  endcall,
  LiveCalling,
} from "../controllers/AgentController.js";
import protect from "../middlewares/AuthMiddleware.js";
import isInterviewee from "../middlewares/IsInterviewee.js";
const agentRouter = Router();

agentRouter.post("/createSession", protect, isInterviewee, createAIBotSession);
agentRouter.post("/calling", protect, isInterviewee, LiveCalling);
agentRouter.post("/endcall", protect, isInterviewee, endcall);

export default agentRouter;
