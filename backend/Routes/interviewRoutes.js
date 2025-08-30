import { Router } from "express" ;
import { createMeeting, createToken } from "../controllers/interviewController.js";
import protect from "../middlewares/authMiddleware.js";
const interviewRouter = Router() ;


interviewRouter.post('/create' , protect , createMeeting) ; 
interviewRouter.post('/token' , createToken )

export default interviewRouter ; 