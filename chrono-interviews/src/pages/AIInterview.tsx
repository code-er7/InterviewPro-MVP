import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneOff, Bot, User, Mic, Square } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";

type TranscriptEntry = {
  speaker: "User" | "AI";
  text: string;
  timestamp: Date;
};

const AIInterview = () => {
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false); // used during end call

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null); // to stop playback on leave
  const transcriptRef = useRef<TranscriptEntry[]>([]); // always-latest transcript
  const endedRef = useRef(false); // prevent duplicate /endcall posts

  const navigate = useNavigate();
  const location = useLocation();

  const { session, interview } = (location.state as any) || {};
  const token = localStorage.getItem("token");

  // keep transcriptRef in sync
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // --------- CHECK SESSION VALIDITY ----------
  useEffect(() => {
    if (!session || !session._id) {
      navigate("/interviewee-dashboard");
      return;
    }
  }, [session, navigate]);

  // --------- RECORDING FUNCTIONS ----------
  const startRecording = async () => {
    if (isProcessing || aiSpeaking) return;

    try {
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
        // stop tracks to release mic
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  // --------- SEND AUDIO TO BACKEND ----------
  const handleUserAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);

    reader.onloadend = async () => {
      try {
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

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        const { transcript: userText, replyText, replyAudio } = data;

        if (userText) {
          setTranscript((prev) => [
            ...prev,
            { speaker: "User", text: userText, timestamp: new Date() },
          ]);
        }

        if (replyText) {
          setTranscript((prev) => [
            ...prev,
            { speaker: "AI", text: replyText, timestamp: new Date() },
          ]);
        }

        if (replyAudio) {
          // stop any existing playback first
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
          }
          const el = new Audio(`data:audio/mp3;base64,${replyAudio}`);
          audioRef.current = el;
          el.onplay = () => setAiSpeaking(true);
          el.onended = () => {
            setAiSpeaking(false);
            setIsProcessing(false);
          };
          el.onerror = () => {
            setAiSpeaking(false);
            setIsProcessing(false);
            console.error("Error playing audio");
          };
          el.play();
        } else {
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Error processing audio:", error);
        setIsProcessing(false);
        alert("Error processing your audio. Please try again.");
      }
    };

    reader.onerror = () => {
      console.error("Error reading audio blob");
      setIsProcessing(false);
      alert("Error reading audio. Please try again.");
    };
  };

  // --------- END CALL (manual) ----------
  const handleEnd = useCallback(async () => {
    if (!session?._id || endedRef.current) return;

    console.log("Starting to end call...");
    endedRef.current = true;
    setLoading(true);

    // Stop any ongoing recording
    if (recording && mediaRecorderRef.current) {
      stopRecording();
    }

    // stop any AI playback right away
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch (error) {
        console.warn("Error stopping audio:", error);
      }
    }

    // Prepare payload with the latest transcript
    const payload = {
      sessionId: session._id,
      transcription: JSON.stringify(transcriptRef.current),
    };

    console.log("Ending call with payload:", payload);

    try {
      const res = await fetch("http://localhost:4000/api/ai/endcall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("End call response:", data);

      // Create updated session object
      const updatedSession = {
        ...session,
        state: "ended",
        results: data.session?.results || data.results,
      };

      // Navigate to results page
      navigate("/results", {
        state: {
          session: updatedSession,
          interview,
          result: data.session?.results || data.results,
        },
        replace: true, // Replace current history entry to prevent going back
      });
    } catch (error) {
      console.error("Error ending call:", error);
      alert(`Failed to end call: ${error.message || "Please try again."}`);

      // Reset the ended flag to allow retry
      endedRef.current = false;
      setLoading(false);
    }
  }, [navigate, session, interview, token, recording]);

  // --------- AUTO END on unload / unmount ----------
  useEffect(() => {
    if (!session?._id) return;

    const sendEndKeepAlive = () => {
      if (endedRef.current) return;
      endedRef.current = true;

      console.log("Auto-ending call due to page unload/unmount");

      // stop any playback immediately
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = "";
        } catch (error) {
          console.warn("Error stopping audio during cleanup:", error);
        }
      }

      const payload = {
        sessionId: session._id,
        transcription: JSON.stringify(transcriptRef.current),
      };

      try {
        // keepalive lets the browser send while unloading (limit ~64KB)
        fetch("http://localhost:4000/api/ai/endcall", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      } catch (error) {
        console.warn("Error during auto end call:", error);
      }
    };

    const onBeforeUnload = (e) => {
      sendEndKeepAlive();
      // Optional: Show confirmation dialog
      e.preventDefault();
      e.returnValue = "";
    };

    const onPageHide = () => {
      sendEndKeepAlive();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);

    // IMPORTANT: on SPA route change (component unmount), send too
    return () => {
      sendEndKeepAlive();
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [session?._id, token]);

  // --------- UTILS ----------
  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  // --------- UI ----------
  return (
    <div>
      <DashboardNavbar />
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Ending call and processing results...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please wait, do not refresh the page.
            </p>
          </div>
        ) : (
          <>
            <Card className="mb-6">
              <CardContent className="flex justify-between items-center p-6">
                <div>
                  <h2 className="text-xl font-bold">AI Interview</h2>
                  <p className="text-muted-foreground">
                    {interview?.jobDescription || "Interview in progress"}
                  </p>
                </div>
                <Button
                  onClick={handleEnd}
                  variant="destructive"
                  disabled={loading || !session?._id}
                  className="min-w-[120px]"
                >
                  <PhoneOff className="mr-2 h-4 w-4" />
                  {loading ? "Ending..." : "End Call"}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Voice Call Interface */}
              <div className="lg:col-span-2">
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      {/* AI Box */}
                      <div
                        className={`relative bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-8 transition-all duration-300 ${
                          aiSpeaking
                            ? "ring-4 ring-primary/50 animate-pulse"
                            : ""
                        }`}
                      >
                        <div className="text-center">
                          <div
                            className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center transition-all ${
                              aiSpeaking ? "scale-110 shadow-lg" : ""
                            }`}
                          >
                            <Bot className="h-12 w-12 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold">
                            AI Interviewer
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {aiSpeaking ? "Speaking..." : "Waiting"}
                          </p>
                        </div>
                      </div>

                      {/* User Box */}
                      <div
                        className={`relative bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-xl p-8 transition-all duration-300 ${
                          recording
                            ? "ring-4 ring-secondary/50 animate-pulse"
                            : ""
                        }`}
                      >
                        <div className="text-center">
                          <div
                            className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center transition-all ${
                              recording ? "scale-110 shadow-lg" : ""
                            }`}
                          >
                            <User className="h-12 w-12 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold">You</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {recording
                              ? "Recording..."
                              : isProcessing
                              ? "Processing..."
                              : "Ready"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 flex justify-center gap-4">
                      {!recording ? (
                        <Button
                          onClick={startRecording}
                          disabled={isProcessing || aiSpeaking || loading}
                          className="rounded-full w-16 h-16 text-sm"
                        >
                          <Mic className="h-6 w-6" />
                        </Button>
                      ) : (
                        <Button
                          onClick={stopRecording}
                          variant="secondary"
                          className="rounded-full w-16 h-16 text-sm"
                          disabled={loading}
                        >
                          <Square className="h-6 w-6" />
                        </Button>
                      )}
                    </div>

                    {/* Status */}
                    {isProcessing && (
                      <div className="text-center mt-4">
                        <p className="text-sm text-muted-foreground">
                          Processing your response...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Transcript */}
              <div className="lg:col-span-1">
                <Card className="shadow-card h-full">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center justify-between">
                      Live Transcript
                      <Badge variant="outline" className="text-xs">
                        {transcript.length} messages
                      </Badge>
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {transcript.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No conversation yet. Start by clicking the microphone
                          button.
                        </p>
                      ) : (
                        transcript.map((msg, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-start gap-2">
                              <Badge
                                variant={
                                  msg.speaker === "AI" ? "default" : "secondary"
                                }
                                className="text-xs min-w-fit"
                              >
                                {msg.speaker}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatTime(msg.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIInterview;
