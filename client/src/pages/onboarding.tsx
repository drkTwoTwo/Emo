import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, Target, Sparkles, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useOnboarding } from "@/lib/onboarding-provider";

const onboardingSteps = [
  {
    icon: Brain,
    title: "Welcome to MindFlow",
    description: "Your AI-powered stress tracking and wellness companion. Let's help you achieve better mental clarity and balance.",
    gradient: "from-chart-1 to-chart-2",
  },
  {
    icon: Heart,
    title: "Track Your Wellness",
    description: "Monitor your daily health metrics, sleep patterns, and activity levels to understand your stress triggers.",
    gradient: "from-chart-2 to-chart-3",
  },
  {
    icon: Target,
    title: "Stay Focused",
    description: "Track your focus time and identify distraction patterns to improve productivity and reduce mental fatigue.",
    gradient: "from-chart-3 to-chart-4",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Get personalized recommendations from Gemini AI based on your stress levels, mood, and activity patterns.",
    gradient: "from-chart-4 to-chart-5",
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState({
    notifications: true,
    focusTracking: true,
    aiAnalysis: true,
  });
  const [, setLocation] = useLocation();

  const isLastStep = currentStep === onboardingSteps.length - 1;
  const currentStepData = onboardingSteps[currentStep];

  const { completeOnboarding } = useOnboarding();

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding();
      setLocation("/");
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-card-border shadow-xl">
              <CardContent className="p-12">
                <div className="flex flex-col items-center text-center space-y-8">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <currentStepData.icon className="h-12 w-12 text-white" />
                  </motion.div>

                  <div className="space-y-3">
                    <h1 className="text-4xl font-serif font-bold text-foreground">
                      {currentStepData.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                      {currentStepData.description}
                    </p>
                  </div>

                  {isLastStep && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="w-full space-y-4 pt-4"
                    >
                      <div className="space-y-4 bg-card/50 rounded-lg p-6 border border-card-border">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="notifications" className="text-base">Enable Notifications</Label>
                          <Switch
                            id="notifications"
                            checked={permissions.notifications}
                            onCheckedChange={(checked) =>
                              setPermissions({ ...permissions, notifications: checked })
                            }
                            data-testid="switch-notifications"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="focus" className="text-base">Track Focus Time</Label>
                          <Switch
                            id="focus"
                            checked={permissions.focusTracking}
                            onCheckedChange={(checked) =>
                              setPermissions({ ...permissions, focusTracking: checked })
                            }
                            data-testid="switch-focus"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="ai" className="text-base">AI Analysis & Insights</Label>
                          <Switch
                            id="ai"
                            checked={permissions.aiAnalysis}
                            onCheckedChange={(checked) =>
                              setPermissions({ ...permissions, aiAnalysis: checked })
                            }
                            data-testid="switch-ai"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3 pt-4">
                    {Array.from({ length: onboardingSteps.length }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentStep
                            ? "w-8 bg-primary"
                            : index < currentStep
                            ? "w-2 bg-primary/50"
                            : "w-2 bg-muted"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-4 w-full pt-4">
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      className="flex-1"
                      data-testid="button-skip"
                    >
                      Skip
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="flex-1 gap-2"
                      data-testid="button-next"
                    >
                      {isLastStep ? (
                        <>
                          <Check className="h-4 w-4" />
                          Get Started
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
