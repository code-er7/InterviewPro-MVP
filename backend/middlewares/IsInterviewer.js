export const isInterviewer = (req, res, next) => {
  if (req.user && req.user.role === "interviewer") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Interviewer only" });
  }
};
