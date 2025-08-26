import { Router } from "express";
import protect from "../middlewares/authMiddleware.js";
import { isInterviewer } from "../middlewares/isInterviewer.js";
import { getAllInterviewees, getIntervieweeInterviews, getInterviewerInterviews, scheduleInterview } from "../controllers/dataContollers.js";
import isInterviewee from "../middlewares/isInterviewee.js";

const datarouter =  Router();



datarouter.get("/interviewees", protect, isInterviewer, getAllInterviewees);
datarouter.post("/schedule", protect, isInterviewer, scheduleInterview);
datarouter.get("/my-interviews", protect, getInterviewerInterviews);
datarouter.get("/interviewee-interviews", protect, isInterviewee , getIntervieweeInterviews);


export default datarouter ;