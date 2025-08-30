import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";

type TranscriptEntry = {
  speaker: string;
  text: string;
  timestamp: number;
};

const Meeting = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const callRef = useRef<HTMLDivElement>(null);
  const dailyCall = useRef<DailyCall | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { link, session } = location.state || {};


  // Setup meeting iframe
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

    frame.join({ url: link });
    dailyCall.current = frame;

    // 👂 Listen for transcription events
    (frame as any).on("transcription-received", (ev: any) => {
      const { userId, text, timestamp } = ev;
      setTranscript((prev) => [
        ...prev,
        { speaker: userId || "Guest", text, timestamp },
      ]);
    });

    return () => {
      frame.destroy();
    };
  }, [link]);

  // Controls
  const toggleMute = () => {
    if (dailyCall.current) {
      dailyCall.current.setLocalAudio(isMuted); // if muted -> unmute
    }
    setIsMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    if (dailyCall.current) {
      dailyCall.current.setLocalVideo(!isVideoOn);
    }
    setIsVideoOn((prev) => !prev);
  };

  const handleEndMeeting = () => {
    if (dailyCall.current) {
      dailyCall.current.leave();
    }
    navigate("/results", { state: { session } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
                className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
              >
                <PhoneOff className="h-6 w-6" />
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
                            t.speaker === "local" ? "outline" : "secondary"
                          }
                          className="text-xs"
                        >
                          {t.speaker === "local" ? "You" : t.speaker}
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
    </div>
  );
};

export default Meeting;
