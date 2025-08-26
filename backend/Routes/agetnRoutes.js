import { Router } from 'express';
import { createAIBotSession, LiveCalling } from '../controllers/agentController.js';
import protect from '../middlewares/authMiddleware.js';
import isInterviewee from '../middlewares/isInterviewee.js';
const agentRouter = Router() ;


agentRouter.post("/createSession", protect, isInterviewee, createAIBotSession);
agentRouter.post('/calling', protect ,  isInterviewee , LiveCalling) ;


export default agentRouter ;