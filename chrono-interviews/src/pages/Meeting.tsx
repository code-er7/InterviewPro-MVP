import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";

type TranscriptEntry = {
  speaker: string; // "Interviewer" | "Interviewee"
  text: string;
  timestamp: number;
};

const Meeting = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  const localIdRef = useRef<string | null>(null);

  const callRef = useRef<HTMLDivElement>(null);
  const dailyCall = useRef<DailyCall | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { link, session, meetingToken } = location.state || {};

  // 👤 Get current user role from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myRole = user?.role || "guest"; // should be "interviewer" | "interviewee"
  console.log(myRole);

  // Setup meeting iframe + transcription
  useEffect(() => {
    if (!callRef.current || !link) return;

    const frame = DailyIframe.createFrame(callRef.current, {
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "none",
        borderRadius: "0.5rem",
      },
    });

    // Join the call
    frame.join({ url: link, token: meetingToken });
    dailyCall.current = frame;

    // ✅ When joined, save my participantId
    frame.on("joined-meeting", async (ev: any) => {
      const localId = ev.participants?.local?.session_id;
      localIdRef.current = localId; // updates instantly
      console.log("localIdRef", localIdRef.current);

      try {
        await frame.startTranscription();
      } catch (err) {
        console.error("❌ Failed to start transcription:", err);
      }
    });

    // ✅ Listen for transcription events
    frame.on("transcription-message", (ev: any) => {
      console.log("📝 Transcription event received:", ev);

      const { participantId, text, timestamp } = ev;
      console.log("this participant send the text ");

      console.log(participantId);

      console.log("this is the locaid");

      console.log(localIdRef.current);

      let roleLabel: string;
      if (participantId === localIdRef.current) {
        // it's me
        roleLabel = myRole === "interviewer" ? "Interviewer" : "Interviewee";
      } else {
        // other person
        roleLabel = myRole === "interviewer" ? "Interviewee" : "Interviewer";
      }

      setTranscript((prev) => [
        ...prev,
        {
          speaker: roleLabel,
          text,
          timestamp: new Date(timestamp).getTime() || Date.now(),
        },
      ]);
    });

    return () => {
      frame.destroy();
    };
  }, [link, meetingToken, myRole]);

  // Controls
  const toggleMute = () => {
    if (isEndingMeeting) return; // Prevent actions during loading

    if (dailyCall.current) {
      dailyCall.current.setLocalAudio(isMuted);
    }
    setIsMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    if (isEndingMeeting) return; // Prevent actions during loading

    if (dailyCall.current) {
      dailyCall.current.setLocalVideo(!isVideoOn);
    }
    setIsVideoOn((prev) => !prev);
  };

  const handleEndMeeting = async () => {
    if (isEndingMeeting) return; // Prevent multiple clicks

    setIsEndingMeeting(true);

    try {
      // Leave the call first
      if (dailyCall.current) {
        dailyCall.current.leave();
      }

      const response = await fetch(
        "http://localhost:4000/api/interview/end-meeting",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: session, // change to session.id if needed
            meeting_transcriptions: transcript, // must be array
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newSession = data.session;
      
      console.log(newSession);

      // Navigate to results page with data
      navigate("/results", {
        state: { session : newSession },
      });
    } catch (error) {
      console.error("Error ending meeting:", error);
      // Reset loading state on error so user can try again
      setIsEndingMeeting(false);
      // Optionally show error message to user here
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <DashboardNavbar />

      <div className="container mx-auto p-6 flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Interview Meeting
            </h1>
            <p className="text-muted-foreground">
              Frontend Developer Interview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-accent text-accent-foreground">Live</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Video Call */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="shadow-card flex-1 flex flex-col">
              <CardContent className="p-0 flex-1">
                {/* Daily Iframe Container */}
                <div
                  ref={callRef}
                  className="w-full h-[500px] lg:h-full rounded-lg overflow-hidden"
                />
              </CardContent>
            </Card>

            {/* Meeting Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleMute}
                disabled={isEndingMeeting}
                className="rounded-full w-14 h-14"
              >
                {isMuted ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>

              <Button
                variant={isVideoOn ? "secondary" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                disabled={isEndingMeeting}
                className="rounded-full w-14 h-14"
              >
                {isVideoOn ? (
                  <Video className="h-6 w-6" />
                ) : (
                  <VideoOff className="h-6 w-6" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndMeeting}
                disabled={isEndingMeeting}
                className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                {isEndingMeeting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <PhoneOff className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Live Transcript */}
          <div className="lg:col-span-1">
            <Card className="shadow-card h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <h3 className="font-semibold mb-4 text-foreground">
                  Live Transcript
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto flex-1">
                  {transcript.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Waiting for transcription...
                    </p>
                  )}
                  {transcript.map((t, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge
                          variant={
                            t.speaker === "Interviewer"
                              ? "outline"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {t.speaker}
                        </Badge>
                        <p className="text-sm">{t.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isEndingMeeting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-8 shadow-lg border max-w-sm mx-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ending Meeting
                </h3>
                <p className="text-sm text-muted-foreground">
                  Processing transcription and generating results...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meeting;
