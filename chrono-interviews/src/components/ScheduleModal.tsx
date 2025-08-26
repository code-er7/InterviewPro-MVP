import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Bot, User } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
}

const ScheduleModal = ({ isOpen, onClose, candidate }: ScheduleModalProps) => {
  const [date, setDate] = useState<Date>();
  const [jobDescription, setJobDescription] = useState("");
  const [isAI, setIsAI] = useState(false); // <-- new state
  const { toast } = useToast();

  const handleSchedule = async () => {
    if (!date || !jobDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to schedule the interview.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:4000/api/data/schedule",
        {
          intervieweeId: candidate._id,
          date: date.toISOString(),
          jobDescription,
          isAI, // <-- include in request
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Interview scheduled",
        description: `Interview with ${candidate?.name} has been scheduled successfully.`,
      });

      // Reset form + close
      setDate(undefined);
      setJobDescription("");
      setIsAI(false);
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to schedule",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            Schedule an interview with {candidate.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Candidate Info */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-foreground">{candidate.name}</h3>
            <p className="text-sm text-muted-foreground">{candidate.email}</p>
            <p className="text-sm text-muted-foreground">
              {candidate.role} • {candidate.experience}
            </p>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="datetime">Interview Date & Time</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="datetime"
                type="datetime-local"
                value={date ? format(date, "yyyy-MM-dd'T'HH:mm") : ""}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="pl-10"
                min={(() => {
                  const now = new Date();
                  now.setMinutes(now.getMinutes() + 5);
                  return format(now, "yyyy-MM-dd'T'HH:mm");
                })()}
                step={300}
              />
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Enter the job description and position details..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Who will take interview */}
          <div className="space-y-2">
            <Label>Who will take the interview?</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={isAI ? "outline" : "default"}
                onClick={() => setIsAI(false)}
                className="flex-1 flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Myself
              </Button>
              <Button
                type="button"
                variant={isAI ? "default" : "outline"}
                onClick={() => setIsAI(true)}
                className="flex-1 flex items-center gap-2"
              >
                <Bot className="h-4 w-4" />
                AI
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            className="flex-1 bg-gradient-primary hover:opacity-90"
          >
            Schedule Interview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
