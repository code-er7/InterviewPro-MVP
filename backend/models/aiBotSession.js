import mongoose from "mongoose";

const aiBotSessionSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    state: {
      type: String,
      enum: ["active", "ended"],
      default: "active", 
    },
    results: {
      type: String, 
    },
  },
  { timestamps: true }
);

const AIBotSession = mongoose.model("AIBotSession", aiBotSessionSchema);
export default AIBotSession;
