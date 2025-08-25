import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, User } from 'lucide-react';
import { format } from 'date-fns';
import DashboardNavbar from '@/components/DashboardNavbar';

// Mock data - replace with real data later
const mockInterviews = [
  {
    id: 1,
    interviewerName: 'Sarah Thompson',
    company: 'TechCorp Inc.',
    date: new Date('2024-01-25T10:00:00'),
    jobDescription: 'Frontend Developer - React Position',
    status: 'upcoming'
  },
  {
    id: 2,
    interviewerName: 'Mike Chen',
    company: 'StartupXYZ',
    date: new Date('2024-01-28T15:00:00'),
    jobDescription: 'Full Stack Developer Position',
    status: 'upcoming'
  },
];

const IntervieweeDashboard = () => {
  const isEventLive = (eventDate: Date) => {
    const now = new Date();
    const timeDiff = eventDate.getTime() - now.getTime();
    return timeDiff <= 300000 && timeDiff >= -300000; // 5 minutes before to 5 minutes after
  };

  const sortedInterviews = mockInterviews.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Interviews</h1>
          <p className="text-muted-foreground">Your scheduled interviews, sorted by date</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Scheduled Interviews
              </CardTitle>
              <CardDescription>
                All your upcoming interviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sortedInterviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No interviews scheduled</h3>
                  <p>You don't have any interviews scheduled at the moment.</p>
                </div>
              ) : (
                sortedInterviews.map((interview) => (
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
                          {isEventLive(interview.date) && (
                            <Badge className="bg-accent text-accent-foreground">
                              Live Now
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Interviewer: {interview.interviewerName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {interview.company}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(interview.date, 'EEEE, MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {format(interview.date, 'HH:mm')}
                        </div>
                      </div>
                    </div>
                    
                    {isEventLive(interview.date) && (
                      <div className="pt-4 border-t">
                        <Button 
                          className="w-full bg-gradient-hero hover:opacity-90"
                          onClick={() => console.log('Join meeting')}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Join Interview Now
                        </Button>
                      </div>
                    )}
                    
                    {!isEventLive(interview.date) && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          The interview will be available to join 5 minutes before the scheduled time.
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntervieweeDashboard;