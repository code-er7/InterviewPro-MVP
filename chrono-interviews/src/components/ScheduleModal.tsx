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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
}

const ScheduleModal = ({ isOpen, onClose, candidate }: ScheduleModalProps) => {
  const [date, setDate] = useState<Date>();
  // const [time, setTime] = useState("");
  const [jobDescription, setJobDescription] = useState("");
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
      const token = localStorage.getItem("token"); // or however you store JWT

      const res = await axios.post(
        "http://localhost:4000/api/data/schedule", // backend route
        {
          intervieweeId: candidate._id, // interviewee comes from props
          date: date.toISOString(), // send as ISO string (backend parses it)
          // time,
          jobDescription,
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

      // Reset form + close modal
      setDate(undefined);
      // setTime("");
      setJobDescription("");
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
                onChange={(e) => {
                  const selected = new Date(e.target.value);
                  setDate(selected);
                }}
                className="pl-10"
                min={(() => {
                  const now = new Date();
                  now.setMinutes(now.getMinutes() + 5); // enforce 5 mins ahead
                  return format(now, "yyyy-MM-dd'T'HH:mm");
                })()}
                step={300} // step in seconds (300 = 5 minutes)
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
