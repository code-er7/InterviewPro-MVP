import { Router } from 'express';
import { createAIBotSession, endcall, LiveCalling } from '../controllers/agentController.js';
import protect from '../middlewares/authMiddleware.js';
import isInterviewee from '../middlewares/isInterviewee.js';
const agentRouter = Router() ;


agentRouter.post("/createSession", protect, isInterviewee, createAIBotSession);
agentRouter.post('/calling', protect ,  isInterviewee , LiveCalling) ;
agentRouter.post("/endcall", protect, isInterviewee, endcall);



export default agentRouter ;