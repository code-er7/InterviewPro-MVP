import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  CheckCircle,
  XCircle,
  TrendingUp,
  MessageSquare,
  FileText,
  Award,
} from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = location.state?.session;

  // Default values if no results
  let parsedResults = {
    confidence_level: 1,
    technical_knowledge: 1,
    communication: 1,
    problem_solving: 1,
  };

  try {
    if (session?.results) {
      // remove backticks + json\n and parse
      const clean = session.results
        .replace(/```json|```/g, "") // remove ```json and ```
        .trim();
      parsedResults = JSON.parse(clean);
    }
  } catch (err) {
    console.error("Failed to parse results:", err);
  }

  // Calculate average
  const scores = Object.values(parsedResults);
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;

  const goToHome = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "interviewer") {
      navigate("/interviewer-dashboard");
    } else {
      navigate("/interviewee-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Interview Results
          </h1>
          <p className="text-muted-foreground">
            Frontend Developer Interview with Alice Johnson
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Score */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Overall Performance
              </CardTitle>
              <CardDescription>
                Comprehensive evaluation based on technical skills and
                communication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {average.toFixed(1)}/10
                </div>
                <Badge
                  className={
                    average >= 7
                      ? "bg-green-500/10 text-green-600 border-green-200"
                      : average >= 5
                      ? "bg-yellow-500/10 text-yellow-600 border-yellow-200"
                      : "bg-red-500/10 text-red-600 border-red-200"
                  }
                >
                  {average >= 7
                    ? "Good Performance"
                    : average >= 5
                    ? "Average Performance"
                    : "Needs Improvement"}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Confidence Level
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {parsedResults.confidence_level}/10
                    </span>
                  </div>
                  <Progress
                    value={parsedResults.confidence_level * 10}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Technical Knowledge
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {parsedResults.technical_knowledge}/10
                    </span>
                  </div>
                  <Progress
                    value={parsedResults.technical_knowledge * 10}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Communication</span>
                    <span className="text-sm text-muted-foreground">
                      {parsedResults.communication}/10
                    </span>
                  </div>
                  <Progress
                    value={parsedResults.communication * 10}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Problem Solving</span>
                    <span className="text-sm text-muted-foreground">
                      {parsedResults.problem_solving}/10
                    </span>
                  </div>
                  <Progress
                    value={parsedResults.problem_solving * 10}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Analysis (static) */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Question Analysis
              </CardTitle>
              <CardDescription>
                Performance breakdown by question categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium text-foreground">
                    React Fundamentals
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    5 questions asked
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">4/5</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium text-foreground">
                    State Management
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    3 questions asked
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">3/3</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium text-foreground">
                    Problem Solving
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    2 coding challenges
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">1/2</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium text-foreground">System Design</h4>
                  <p className="text-sm text-muted-foreground">
                    1 design question
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">1/1</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Summary (static) */}
          <Card className="shadow-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Interview Summary
              </CardTitle>
              <CardDescription>
                Key highlights and areas for improvement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Strengths
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      • Strong technical knowledge in React and TypeScript
                    </li>
                    <li>• Good understanding of modern frontend patterns</li>
                    <li>• Clear problem-solving approach</li>
                    <li>• Experience with state management libraries</li>
                    <li>• Good code organization and best practices</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Confidence in explaining solutions</li>
                    <li>• Algorithm optimization techniques</li>
                    <li>• Speaking up during problem-solving</li>
                    <li>• Time management during coding challenges</li>
                    <li>• Asking clarifying questions</li>
                  </ul>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-foreground mb-3">
                  Interview Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">45</div>
                    <div className="text-xs text-muted-foreground">
                      Minutes Duration
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">11</div>
                    <div className="text-xs text-muted-foreground">
                      Questions Asked
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">9</div>
                    <div className="text-xs text-muted-foreground">
                      Correct Answers
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">2</div>
                    <div className="text-xs text-muted-foreground">
                      Code Challenges
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={goToHome}
            className="bg-gradient-primary hover:opacity-90"
            size="lg"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
