import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    interviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date, // stores both date + time, or you can split if you prefer
      required: true,
    },
    time: {
      type: String, 
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
