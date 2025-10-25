import { motion } from "framer-motion";
import { Sparkles, Wind, Move, Coffee, Heart, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MindfulnessActivity } from "@shared/schema";

const activityIcons = {
  breathing: Wind,
  meditation: Sparkles,
  stretch: Move,
  break: Coffee,
};

const activityColors = {
  breathing: "from-blue-500/20 to-blue-600/5",
  meditation: "from-purple-500/20 to-purple-600/5",
  stretch: "from-green-500/20 to-green-600/5",
  break: "from-orange-500/20 to-orange-600/5",
};

export default function Mindfulness() {
  const { data: activities, isLoading } = useQuery<MindfulnessActivity[]>({
    queryKey: ["/api/mindfulness-activities"],
  });

  const completeActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/mindfulness-activities/${id}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mindfulness-activities"] });
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const completedCount = activities?.filter(a => a.isCompleted).length || 0;
  const totalCount = activities?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-card-border shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-chart-5" />
                Mindfulness Hub
              </CardTitle>
              <CardDescription>
                AI-suggested activities to reduce stress and improve wellness
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-chart-5" />
              <div className="text-right">
                <div className="text-2xl font-mono font-bold">{completedCount}/{totalCount}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Activities Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !activities || activities.length === 0 ? (
        <Card className="border-card-border shadow-lg">
          <CardContent className="p-12 text-center">
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No activities yet</h3>
            <p className="text-muted-foreground">
              AI-generated mindfulness activities will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {activities.map((activity) => {
            const Icon = activityIcons[activity.category as keyof typeof activityIcons] || Sparkles;
            const gradient = activityColors[activity.category as keyof typeof activityColors] || activityColors.breathing;

            return (
              <motion.div key={activity.id} variants={itemVariants}>
                <Card className={`border-card-border shadow-lg h-full bg-gradient-to-br ${gradient} relative overflow-hidden hover-elevate`}>
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-chart-5 to-chart-1 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {activity.isCompleted && (
                        <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                          <Check className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {activity.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {activity.duration} min
                        </Badge>
                      </div>
                    </div>

                    <Button
                      onClick={() => completeActivityMutation.mutate(activity.id)}
                      disabled={activity.isCompleted || completeActivityMutation.isPending}
                      className="w-full mt-6"
                      variant={activity.isCompleted ? "outline" : "default"}
                      data-testid={`button-complete-${activity.id}`}
                    >
                      {activity.isCompleted ? "Completed" : "Start Activity"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* AI Tips Section */}
      <Card className="border-card-border shadow-lg bg-gradient-to-br from-chart-5/10 to-chart-1/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-chart-5" />
            Wellness Tips
          </CardTitle>
          <CardDescription>AI-powered recommendations for your well-being</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-chart-5/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Wind className="h-3 w-3 text-chart-5" />
              </div>
              <p className="text-sm text-foreground">
                Practice deep breathing for 2 minutes when you feel stressed. It activates your parasympathetic nervous system.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-chart-5/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Move className="h-3 w-3 text-chart-5" />
              </div>
              <p className="text-sm text-foreground">
                Take microbreaks every 25-30 minutes to stretch. This improves circulation and reduces physical tension.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-chart-5/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="h-3 w-3 text-chart-5" />
              </div>
              <p className="text-sm text-foreground">
                Start your day with a 5-minute mindfulness meditation to set a calm, focused tone for the hours ahead.
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
