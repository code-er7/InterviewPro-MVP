import { Router } from "express" ;
import { createMeeting } from "../controllers/interviewController.js";
import protect from "../middlewares/authMiddleware.js";
const interviewRouter = Router() ;


interviewRouter.post('/create' , protect , createMeeting) ; 

export default interviewRouter ; 