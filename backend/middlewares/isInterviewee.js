 const isInterviewee = (req, res, next) => {
  if (req.user && req.user.role === "interviewee") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Interviewee only" });
  }
};

export default isInterviewee ;
