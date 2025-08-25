import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, User, Video, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '@/components/DashboardNavbar';
import ScheduleModal from '@/components/ScheduleModal';

// Mock data - replace with real data later
const mockCandidates = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Frontend Developer', experience: '3 years' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Backend Developer', experience: '5 years' },
  { id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'Full Stack Developer', experience: '4 years' },
  { id: 4, name: 'David Wilson', email: 'david@example.com', role: 'UI/UX Designer', experience: '2 years' },
   { id: 4, name: 'David Wilson', email: 'david@example.com', role: 'UI/UX Designer', experience: '2 years' },
    { id: 4, name: 'David Wilson', email: 'david@example.com', role: 'UI/UX Designer', experience: '2 years' },
     { id: 4, name: 'David Wilson', email: 'david@example.com', role: 'UI/UX Designer', experience: '2 years' },
      { id: 4, name: 'David Wilson', email: 'david@example.com', role: 'UI/UX Designer', experience: '2 years' },
];

const mockEvents = [
  {
    id: 1,
    candidateName: 'Alice Johnson',
    date: new Date('2025-08-25T01:52:00'),
    jobDescription: 'Frontend Developer - React Position',
    status: 'upcoming'
  },
  {
    id: 2,
    candidateName: 'Bob Smith',
    date: new Date('2024-01-26T14:30:00'),
    jobDescription: 'Backend Developer - Node.js Position',
    status: 'upcoming'
  },
    {
    id: 3,
    candidateName: 'Bob Smith',
    date: new Date('2024-01-26T14:30:00'),
    jobDescription: 'Backend Developer - Node.js Position',
    status: 'upcoming'
  },
];


const InterviewerDashboard = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleScheduleInterview = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsScheduleModalOpen(true);
  };

  const isEventLive = (eventDate: Date) => {
    const now = new Date();
    console.log(now);
    const timeDiff = eventDate.getTime() - now.getTime();
    return timeDiff <= 300000 && timeDiff >= -300000; // 5 minutes before to 5 minutes after
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Interviewer Dashboard</h1>
          <p className="text-muted-foreground">Manage candidates and schedule interviews</p>
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
              {mockCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleScheduleInterview(candidate)}
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    
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
              <CardDescription>
                Your scheduled interviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No interviews scheduled yet</p>
                </div>
              ) : (
                mockEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border space-y-3"
                    
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{event.candidateName}</h3>
                      {isEventLive(event.date) && (
                        <Badge className="bg-accent text-accent-foreground">
                          Live
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{event.jobDescription}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(event.date, 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(event.date, 'HH:mm')}
                      </div>
                    </div>
                    {isEventLive(event.date) && (
                      <Button 
                        className="w-full bg-gradient-hero hover:opacity-90"
                        onClick={() => navigate('/meeting')}
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