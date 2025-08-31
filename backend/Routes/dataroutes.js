import { Router } from "express";
import protect from "../middlewares/AuthMiddleware.js";
import { isInterviewer } from "../middlewares/IsInterviewer.js";
import {
  getAllInterviewees,
  getIntervieweeInterviews,
  getInterviewerInterviews,
  scheduleInterview,
} from "../controllers/DataContollers.js";
import isInterviewee from "../middlewares/IsInterviewee.js";

const datarouter = Router();

datarouter.get("/interviewees", protect, isInterviewer, getAllInterviewees);
datarouter.post("/schedule", protect, isInterviewer, scheduleInterview);
datarouter.get("/my-interviews", protect, getInterviewerInterviews);
datarouter.get(
  "/interviewee-interviews",
  protect,
  isInterviewee,
  getIntervieweeInterviews
);

export default datarouter;
