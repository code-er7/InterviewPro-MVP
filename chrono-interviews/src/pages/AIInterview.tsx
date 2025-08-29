import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneOff, Bot, User, Mic, Square } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";

const AIInterview = () => {
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false); // 🔥 disable mic while AI responds

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null); // 🔥 track AI audio

  const navigate = useNavigate();
  const location = useLocation();

  // from navigate("/ai-interview", { state: {...} })
  const { session, interview, result } = location.state || {};
  const token = localStorage.getItem("token");

  // --------- CHECK SESSION VALIDITY ----------
  useEffect(() => {
    const checkSession = async () => {
      if (!session || !session._id || session.state != 'active') {
        navigate("/interviewee-dashboard"); // 🚪 invalid access
        return;
      }
    };
    checkSession();
  }, [session, navigate, token]);

  // --------- END CALL ON LEAVE ----------
  useEffect(() => {
    const handleEnd = async () => {
      // stop AI audio if still playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (session?._id) {
        try {
          await fetch("http://localhost:4000/api/ai/endcall", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sessionId: session._id }),
          });
        } catch (err) {
          console.error("Failed to end call:", err);
        }
      }
    };

    // Trigger on tab close / reload
    window.addEventListener("beforeunload", handleEnd);
    // Trigger on component unmount (route change)
    return () => {
      handleEnd();
      window.removeEventListener("beforeunload", handleEnd);
    };
  }, [session, token]);

  // --------- RECORDING FUNCTIONS ----------
  const startRecording = async () => {
    if (isProcessing || aiSpeaking) return; // 🔒 block mic
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      await handleUserAudio(audioBlob);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // --------- SEND AUDIO TO BACKEND ----------
  const handleUserAudio = async (audioBlob: Blob) => {
    setIsProcessing(true); // 🔥 block mic

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);

    reader.onloadend = async () => {
      const base64Audio = reader.result as string;

      const res = await fetch("http://localhost:4000/api/ai/calling", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session,
          audio: base64Audio,
        }),
      });

      const data = await res.json();
      const { transcript, replyText, replyAudio } = data;

      // Add user transcript
      if (transcript) {
        setTranscript((prev) => [
          ...prev,
          { speaker: "User", text: transcript, timestamp: new Date() },
        ]);
      }

      // Add AI reply
      if (replyText) {
        setTranscript((prev) => [
          ...prev,
          { speaker: "AI", text: replyText, timestamp: new Date() },
        ]);
      }

      // Play AI audio
      if (replyAudio) {
        // stop any previous audio first
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const audio = new Audio(`data:audio/mp3;base64,${replyAudio}`);
        audioRef.current = audio;

        audio.onplay = () => setAiSpeaking(true);
        audio.onended = () => {
          setAiSpeaking(false);
          setIsProcessing(false); // 🔓 unlock mic
          audioRef.current = null;
        };
        audio.play();
      } else {
        setIsProcessing(false); // 🔓 unlock mic if no audio
      }
    };
  };

  // --------- END CALL BUTTON ----------
  const handleEndCall = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    await fetch("http://localhost:4000/api/ai/endcall", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId: session._id }),
    });

    navigate("/results", { state: { session, interview, result } });
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });



  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <div className="container mx-auto p-6">
        {/* Meeting Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              AI Interview Session
            </h1>
            <p className="text-muted-foreground">
              Voice-only interview with AI Interviewer
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-accent text-accent-foreground">Live</Badge>
            <Badge
              variant="secondary"
              className="bg-red-500/10 text-red-600 border-red-200"
            >
              {recording ? "Recording" : "Idle"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voice Call Interface */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* AI Box */}
                  <div
                    className={`relative bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-8 transition-all duration-300 ${
                      aiSpeaking ? "ring-4 ring-primary/50 animate-pulse" : ""
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center transition-all ${
                          aiSpeaking ? "scale-110 shadow-glow" : ""
                        }`}
                      >
                        <Bot className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">AI Interviewer</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {aiSpeaking ? "Speaking..." : "Waiting"}
                      </p>
                    </div>
                  </div>

                  {/* User Box */}
                  <div
                    className={`relative bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-xl p-8 transition-all duration-300 ${
                      recording ? "ring-4 ring-secondary/50 animate-bounce" : ""
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-secondary flex items-center justify-center transition-all ${
                          recording ? "scale-110 shadow-glow" : ""
                        }`}
                      >
                        <User className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">You</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {recording ? "Recording..." : "Silent"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6">
                  {!recording ? (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={startRecording}
                      className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
                      disabled={isProcessing || aiSpeaking} // 🔒 lock mic
                    >
                      <Mic className="h-6 w-6" />
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={stopRecording}
                      className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
                    >
                      <Square className="h-6 w-6" />
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleEndCall}
                    className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transcript */}
          <div className="lg:col-span-1">
            <Card className="shadow-card h-full">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Live Transcript</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transcript.map((entry, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge
                          variant={
                            entry.speaker === "AI" ? "default" : "secondary"
                          }
                          className="text-xs min-w-fit"
                        >
                          {entry.speaker === "AI" ? (
                            <>
                              <Bot className="h-3 w-3 mr-1" /> AI
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 mr-1" /> You
                            </>
                          )}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm">{entry.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(entry.timestamp)}
                          </p>
                        </div>
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

export default AIInterview;
