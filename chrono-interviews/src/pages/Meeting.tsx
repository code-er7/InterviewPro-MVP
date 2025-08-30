import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";

const Meeting = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isRecording, setIsRecording] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get meeting data passed via navigate()
  const { link, session } = location.state || {};

  const handleEndMeeting = () => {
    navigate("/results", { state: { session } });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <div className="container mx-auto p-6">
        {/* Meeting Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Interview Meeting
              </h1>
              <p className="text-muted-foreground">
                {session?.interview?.jobDescription || "Ongoing Interview"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-accent text-accent-foreground">Live</Badge>
              {isRecording && (
                <Badge
                  variant="secondary"
                  className="bg-red-500/10 text-red-600 border-red-200"
                >
                  Recording
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Call Interface */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardContent className="p-6">
                {/* Daily.co Meeting Embed */}
                <div
                  className="relative rounded-lg mb-6 overflow-hidden"
                  style={{ aspectRatio: "16/9" }}
                >
                  {link ? (
                    <iframe
                      src={link}
                      allow="camera; microphone; fullscreen; display-capture; autoplay"
                      className="w-full h-full border-0"
                      title="Interview Meeting"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Loading meeting...
                      </p>
                    </div>
                  )}
                </div>

                {/* Meeting Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="lg"
                    onClick={() => setIsMuted(!isMuted)}
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
                    onClick={() => setIsVideoOn(!isVideoOn)}
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
              </CardContent>
            </Card>
          </div>

          {/* Live Transcript (still dummy for now) */}
          <div className="lg:col-span-1">
            <Card className="shadow-card h-full">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-foreground">
                  Live Transcript
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                      <p className="text-sm">
                        Hi Alice, thanks for joining. Let's start with telling
                        me about yourself.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Alice
                      </Badge>
                      <p className="text-sm">
                        Thank you for having me. I'm a frontend developer with 3
                        years of experience, primarily working with React and
                        TypeScript.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                      <p className="text-sm">
                        That's great. Can you walk me through your experience
                        with state management in React?
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Alice
                      </Badge>
                      <p className="text-sm">
                        I've worked extensively with React hooks like useState
                        and useReducer, and also have experience with Redux
                        Toolkit...
                      </p>
                    </div>
                  </div>
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
