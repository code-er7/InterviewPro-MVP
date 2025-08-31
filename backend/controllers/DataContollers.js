import User from "../models/userSchema.js";
import Interview from "../models/interviewSchema.js";

export const scheduleInterview = async (req, res) => {
  try {
    const { intervieweeId, date, time, jobDescription , isAI } = req.body;

    if (!intervieweeId || !date  || !jobDescription ) {
      console.log(intervieweeId , date , jobDescription , isAI) ;
      return res.status(400).json({ message: "All fields are required" });
    }

    const interview = new Interview({
      interviewer: req.user._id,
      interviewee: intervieweeId,
      date,
      isAI ,
      jobDescription,
    });
    await interview.save();
    res.status(201).json({
      message: "Interview scheduled successfully",
      interview,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while scheduling interview" });
  }
};

export const getAllInterviewees = async (req, res) => {
  try {
    const interviewees = await User.find({ role: "interviewee" }).select(
      "-password"
    );
    res.json(interviewees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInterviewerInterviews = async (req, res) => {
  try {
    const interviewerId = req.user._id;
    console.log(interviewerId);
    console.log(req.user);
    const interviews = await Interview.find({
      interviewer: interviewerId,
      isAI : false ,
    }).populate("interviewee", "name email role");
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching interviews" });
  }
};
export const getIntervieweeInterviews = async (req, res) => {
  try {
    const intervieweeId = req.user._id;

    const interviews = await Interview.find({
      interviewee: intervieweeId,
    })
      .populate("interviewee", "name email role") // populate interviewee
      .populate("interviewer", "name email role"); // populate interviewer

    res.json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Error fetching interviews" });
  }
};

