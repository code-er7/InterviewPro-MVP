import { Router } from "express" ;
import { createMeeting, createToken, endUserSession } from "../controllers/interviewController.js";
import protect from "../middlewares/authMiddleware.js";
const interviewRouter = Router() ;


interviewRouter.post('/create' , protect , createMeeting) ; 
interviewRouter.post('/token' , createToken ) ;
interviewRouter.post('/end-meeting'  , endUserSession) ;


export default interviewRouter ; 