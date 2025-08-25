import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Calendar, Users, Mic, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-interview.jpg';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Video,
      title: "HD Video Interviews",
      description: "Crystal clear video calls with professional interview experience"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Easy scheduling system with automated reminders and notifications"
    },
    {
      icon: Mic,
      title: "Live Transcription",
      description: "Real-time transcription of interviews for better analysis"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Separate dashboards for interviewers and candidates"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security for your interview data"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get interview transcripts and analysis immediately after sessions"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              InterviewPro
            </h1>
            <div className="space-x-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  The Future of{' '}
                  <span className="bg-gradient-hero bg-clip-text text-transparent">
                    Remote Interviews
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-md">
                  Conduct professional video interviews with live transcription, 
                  smart scheduling, and comprehensive analytics.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6"
                  onClick={() => navigate('/signup')}
                >
                  Start Interviewing
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Professional video interview platform" 
                className="rounded-2xl shadow-elevated w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Perfect Interviews
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools you need to conduct, manage, 
              and analyze professional video interviews.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-elevated transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground">
              Ready to Transform Your Interview Process?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Join thousands of companies already using InterviewPro for their hiring needs.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => navigate('/signup')}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            InterviewPro
          </div>
          <p className="text-muted-foreground">
            The modern solution for professional video interviews
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
