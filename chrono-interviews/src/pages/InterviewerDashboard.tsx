import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, User, Video, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/DashboardNavbar";
import ScheduleModal from "@/components/ScheduleModal";
import axios from "axios";
import { useEffect } from "react";



const mockEvents = [
  {
    id: 1,
    candidateName: "Alice Johnson",
    date: new Date("2025-08-25T01:52:00"),
    jobDescription: "Frontend Developer - React Position",
    status: "upcoming",
  },
  {
    id: 2,
    candidateName: "Bob Smith",
    date: new Date("2024-01-26T14:30:00"),
    jobDescription: "Backend Developer - Node.js Position",
    status: "upcoming",
  },
  {
    id: 3,
    candidateName: "Bob Smith",
    date: new Date("2024-01-26T14:30:00"),
    jobDescription: "Backend Developer - Node.js Position",
    status: "upcoming",
  },
];

const InterviewerDashboard = () => {
  // const token = localStorage.getItem("token");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();
   
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    console.log(token);
    if (!token || !user) {
      console.log(token , user) ;
      navigate("/"); // not logged in

      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== "interviewer") {
      navigate("/"); // not interviewer
      return;
    }

    // fetch candidates
    console.log(token);
    const fetchCandidates = async () => {
      try {
        const res = await axios.get(
          "http://localhost:4000/api/data/interviewees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCandidates(res.data); // backend should return an array of candidates
      } catch (err) {
        console.error(err);
        navigate("/"); // if token invalid → redirect
      }
    };

    fetchCandidates();

        const fetchEvents = async () => {
          try {
            const res = await axios.get(
              "http://localhost:4000/api/data/my-interviews",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const formatted = res.data.map((interview: any) => ({
              id: interview._id,
              candidateName: interview.interviewee?.name,
              date: new Date(interview.date), // backend saves combined date+time
              jobDescription: interview.jobDescription,
              status: "upcoming", // you can calculate based on date if needed
            }));
            console.log(`here is the data that came from the req  and full response `, res , formatted)
            setEvents(formatted);
          } catch (err) {
            console.error("Error fetching interviews:", err);
          }
        };

        fetchEvents();
  }, [navigate]);

  const handleScheduleInterview = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsScheduleModalOpen(true);
  };
  function getRoomNameFromLink(link: string) {
    try {
      const url = new URL(link);
      return url.pathname.replace("/", ""); // removes the leading "/"
    } catch (e) {
      console.error("Invalid link:", link);
      return null;
    }
  }
  const handleJoinMeeting = async (interviewId: string) => {
    try {
      const token = localStorage.getItem("token");

      // 1. Create/fetch session
      const res = await axios.post(
        "http://localhost:4000/api/interview/create",
        { interviewId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { session } = res.data;
      if (!session?.link) {
        alert("Could not get meeting link");
        return;
      }

      const roomName = getRoomNameFromLink(session.link);
      
      const tokenRes = await axios.post(
        "http://localhost:4000/api/interview/token",
        {
          roomName: session.name, // or however you store it
        }
      );

      const { meetingToken } = tokenRes.data;
      
      console.log(meetingToken) ;
      // 3. Navigate with both session + token
      navigate("/meeting", {
        state: { link: session.link, session, meetingToken },
      });
    } catch (err) {
      console.error("Error joining meeting:", err);
      alert("Failed to join meeting");
    }
  };


  const isEventLive = (eventDate: Date) => {
    const now = new Date();
    // console.log(now);
    // const timeDiff = eventDate.getTime() - now.getTime();
    return 1 ;
    // return timeDiff <= 300000 && timeDiff >= -300000; // 5 minutes before to 5 minutes after
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Interviewer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage candidates and schedule interviews
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Candidates Panel */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Candidates
              </CardTitle>
              <CardDescription>
                Click on a candidate to schedule an interview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleScheduleInterview(candidate)}
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {candidate.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {candidate.email}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Events Panel */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Interviews
              </CardTitle>
              <CardDescription>Your scheduled interviews</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No interviews scheduled yet</p>
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        {event.candidateName}
                      </h3>
                      {isEventLive(event.date) && (
                        <Badge className="bg-accent text-accent-foreground">
                          Live
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.jobDescription}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(event.date, "MMM dd, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(event.date, "HH:mm")}
                      </div>
                    </div>
                    {isEventLive(event.date) && (
                      <Button
                        className="w-full bg-gradient-hero hover:opacity-90"
                        onClick={() => handleJoinMeeting(event.id)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Join Interview
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        candidate={selectedCandidate}
      />
    </div>
  );
};

export default InterviewerDashboard;
