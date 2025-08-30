import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // or next/router if using Next.js
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, User } from "lucide-react";
import { format } from "date-fns";
import DashboardNavbar from "@/components/DashboardNavbar";
import axios from 'axios';

interface Interview {
  id: number;
  interviewerName: string;
  date: string;
  jobDescription: string;
  status: string;
}

const IntervieweeDashboard = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  // check authentication
  useEffect(() => {
    const token = localStorage.getItem("token"); // wherever you store JWT
    const user = JSON.parse(localStorage.getItem("user")); 
    if (!token || user.role != "interviewee") {
      navigate("/login"); // redirect if no token
      return;
    }

    // fetch API data
    const fetchInterviews = async () => {
      try {
        const res = await fetch(
          "http://localhost:4000/api/data/interviewee-interviews",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await res.json();

        // transform data here
        const formatted = (data || []).map((item: any) => ({
          id: item._id,
          interviewerName: item.isAI
            ? "AI Bot"
            : item.interviewer?.name || "Unknown",
          date: item.date,
          jobDescription: item.jobDescription,
          status: item.isAI ? "AI" : "Human",
        }));

        setInterviews(formatted);
      } catch (err) {
        console.error("Error fetching interviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [navigate]);


   async function handleJoinMeeting (interview:any)  {
    const token = localStorage.getItem("token");

    try {
      if (interview.status === "AI") {
        // create AI session
        const res = await fetch("http://localhost:4000/api/ai/createSession", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ interviewId: interview.id }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Failed to start AI interview");
          return;
        }

        // session from backend (populated interview inside)
        const { session } = data;

        if (session.state === "ended") {
          alert("This interview has already ended.");
          return;
        }

        // Navigate to AI Interview page with session + interview info
        navigate("/ai-interview", {
          state: {
            session,
            interview: session.interview, 
            result: session.result,
          },
        });
      } else {
        // Non-AI interview → redirect to meeting page 
        try {
          const token = localStorage.getItem("token");

          const res = await axios.post(
            "http://localhost:4000/api/interview/create",
            { interviewId : interview.id },
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

          // Navigate to meeting page with meeting data
          navigate("/meeting", {
            state: { link: session.link, session },
          });
        } catch (err) {
          console.error("Error joining meeting:", err);
          alert("Failed to join meeting");
        }
      }
    } catch (err) {
      console.error("Error joining interview:", err);
      alert("Something went wrong, please try again.");
    }
  }

  //fix later 
  const isEventLive = (eventDate: Date) => {
    const now = new Date();
    const timeDiff = eventDate.getTime() - now.getTime();
    // return timeDiff <= 300000 && timeDiff >= -300000;
    return true ;
  };

  const sortedInterviews = [...interviews].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

   if (loading) {
    return <div className="text-center py-12">Loading interviews...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Interviews
          </h1>
          <p className="text-muted-foreground">
            Your scheduled interviews, sorted by date
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Scheduled Interviews
              </CardTitle>
              <CardDescription>All your upcoming interviews</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sortedInterviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    No interviews scheduled
                  </h3>
                  <p>You don't have any interviews scheduled at the moment.</p>
                </div>
              ) : (
                sortedInterviews.map((interview) => {
                  const interviewDate = new Date(interview.date);
                  return (
                    <div
                      key={interview.id}
                      className="p-6 rounded-lg border space-y-4 hover:shadow-card transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-foreground">
                              {interview.jobDescription}
                            </h3>
                            {isEventLive(interviewDate) && (
                              <Badge className="bg-accent text-accent-foreground">
                                Live Now
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>
                              Interviewer: {interview.interviewerName}
                            </span>
                          </div>
                       
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(interviewDate, "EEEE, MMM dd, yyyy")}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {format(interviewDate, "HH:mm")}
                          </div>
                        </div>
                      </div>

                      {isEventLive(interviewDate) ? (
                        <div className="pt-4 border-t">
                          <Button
                            className="w-full bg-gradient-hero hover:opacity-90"
                            onClick={() => handleJoinMeeting(interview)}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Interview Now
                          </Button>
                        </div>
                      ) : (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            The interview will be available to join 5 minutes
                            before the scheduled time.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntervieweeDashboard;
