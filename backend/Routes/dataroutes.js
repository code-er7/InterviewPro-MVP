import { Router } from "express";
import protect from "../middlewares/authMiddleware.js";
import { isInterviewer } from "../middlewares/isInterviewer.js";
import { getAllInterviewees, getInterviewerInterviews, scheduleInterview } from "../controllers/dataContollers.js";

const datarouter =  Router();



datarouter.get("/interviewees", protect, isInterviewer, getAllInterviewees);
datarouter.post("/schedule", protect, isInterviewer, scheduleInterview);
datarouter.get("/my-interviews", protect, getInterviewerInterviews);


export default datarouter ;