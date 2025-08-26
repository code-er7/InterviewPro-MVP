import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneOff, Bot, User } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";

const AIInterview = () => {
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<any[]>([]);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  // -------- SPEECH FUNCTIONS ----------
  const speakText = (text: string) => {
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices[0];
      } else {
        speechSynthesis.onvoiceschanged = () => {
          utterance.voice = speechSynthesis.getVoices()[0];
        };
      }

      utterance.onstart = () => setAiSpeaking(true);
      utterance.onend = () => {
        setAiSpeaking(false);
        resolve();
      };

      speechSynthesis.speak(utterance);
    });
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // --------- SETUP ON MOUNT ----------
  useEffect(() => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setUserSpeaking(true);
    recognition.onend = () => setUserSpeaking(false);

    recognition.onresult = async (event: any) => {
      const userText = event.results[0][0].transcript;
      console.log("User said:", userText);

      // Add to transcript
      setTranscript((prev) => [
        ...prev,
        { speaker: "User", text: userText, timestamp: new Date() },
      ]);

      // Send to backend
      const res = await fetch("http://localhost:4000/api/ai/calling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      });
      const data = await res.json();

      // Show AI reply in transcript
      setTranscript((prev) => [
        ...prev,
        { speaker: "AI", text: data.reply, timestamp: new Date() },
      ]);

      // AI speaks → after done, start listening again
      await speakText(data.reply);
      startListening();
    };

    recognitionRef.current = recognition;

    // ---- INITIAL STARTUP MESSAGE ----
    (async () => {
      const res = await fetch("http://localhost:4000/api/ai/calling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "___INIT_HELLO___" }),
      });
      const data = await res.json();

      setTranscript((prev) => [
        ...prev,
        { speaker: "AI", text: data.reply, timestamp: new Date() },
      ]);

      await speakText(data.reply);
      startListening();
    })();
  }, []);

  const handleEndCall = () => {
    stopListening();
    navigate("/results");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

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
              Recording
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
                      userSpeaking
                        ? "ring-4 ring-secondary/50 animate-bounce"
                        : ""
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-secondary flex items-center justify-center transition-all ${
                          userSpeaking ? "scale-110 shadow-glow" : ""
                        }`}
                      >
                        <User className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">You</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {userSpeaking ? "Speaking..." : "Silent"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
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
