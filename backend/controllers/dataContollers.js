import User from "../models/userSchema.js";
import Interview from "../models/interviewSchema.js";

export const scheduleInterview = async (req, res) => {
  try {
    const { intervieweeId, date, time, jobDescription } = req.body;

    if (!intervieweeId || !date  || !jobDescription) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // const baseDate = new Date(date);

    
    // const [hourString, minuteString] = time.split(":");
    // let hours = parseInt(hourString, 10);
    // let minutes = parseInt(minuteString, 10);

    
    // if (time.toLowerCase().includes("pm") && hours < 12) hours += 12;
    // if (time.toLowerCase().includes("am") && hours === 12) hours = 0;

   
    // baseDate.setHours(hours);
    // baseDate.setMinutes(minutes);
    // baseDate.setSeconds(0);
    // baseDate.setMilliseconds(0);

    const interview = new Interview({
      interviewer: req.user._id,
      interviewee: intervieweeId,
      date,
      time :"dummy",
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
    }).populate("interviewee", "name email role");
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching interviews" });
  }
};
