import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Play, Pause, BarChart3, Clock, TrendingUp, Move } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FocusSession } from "@shared/schema";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function Focus() {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTab, setCurrentTab] = useState("MindFlow");

  const { data: sessions, isLoading } = useQuery<FocusSession[]>({
    queryKey: ["/api/focus-sessions"],
  });

  const { data: stats } = useQuery<{
    totalFocused: number;
    totalDistracted: number;
    sessionsToday: number;
  }>({
    queryKey: ["/api/focus-stats"],
  });

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/focus-sessions/start", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/focus-stats"] });
      setIsTracking(true);
      setElapsedTime(0);
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/focus-sessions/end", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/focus-stats"] });
      setIsTracking(false);
      setElapsedTime(0);
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  // Track active tab changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setCurrentTab("Away");
      } else {
        setCurrentTab(document.title || "MindFlow");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const focusRatio = stats 
    ? (stats.totalFocused / (stats.totalFocused + stats.totalDistracted)) * 100 
    : 0;

  const chartData = sessions?.slice(0, 7).reverse().map((session, index) => ({
    name: `Session ${index + 1}`,
    focused: session.focusedMinutes || 0,
    distracted: session.distractedMinutes || 0,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-card-border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-chart-4" />
            Focus Tracker
          </CardTitle>
          <CardDescription>
            Monitor your focus time and identify distraction patterns
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Session */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-card-border shadow-lg bg-gradient-to-br from-chart-4/10 to-chart-5/5">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    {isTracking ? "Current Session" : "Ready to Focus"}
                  </h3>
                  <div className="text-6xl font-mono font-bold text-foreground">
                    {formatTime(elapsedTime)}
                  </div>
                </div>

                {isTracking && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-muted-foreground">Tracking: {currentTab}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  {!isTracking ? (
                    <Button
                      onClick={() => startSessionMutation.mutate()}
                      disabled={startSessionMutation.isPending}
                      size="lg"
                      className="gap-2"
                      data-testid="button-start-session"
                    >
                      <Play className="h-5 w-5" />
                      Start Focus Session
                    </Button>
                  ) : (
                    <Button
                      onClick={() => endSessionMutation.mutate()}
                      disabled={endSessionMutation.isPending}
                      variant="destructive"
                      size="lg"
                      className="gap-2"
                      data-testid="button-end-session"
                    >
                      <Pause className="h-5 w-5" />
                      End Session
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session History Chart */}
          <Card className="border-card-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-chart-4" />
                Recent Sessions
              </CardTitle>
              <CardDescription>Focus vs. distraction time breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading chart...</p>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No sessions yet</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="focused" 
                      fill="hsl(var(--chart-4))" 
                      radius={[8, 8, 0, 0]}
                      name="Focused (min)"
                    />
                    <Bar 
                      dataKey="distracted" 
                      fill="hsl(var(--chart-5))" 
                      radius={[8, 8, 0, 0]}
                      name="Distracted (min)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card className="border-card-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Today's Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Focus Ratio</span>
                  <span className="font-mono font-semibold" data-testid="text-focus-ratio">{focusRatio.toFixed(0)}%</span>
                </div>
                <Progress value={focusRatio} className="h-3" />
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Focused Time</span>
                  <Badge variant="secondary" className="font-mono">
                    {stats?.totalFocused || 0}m
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Distracted Time</span>
                  <Badge variant="secondary" className="font-mono">
                    {stats?.totalDistracted || 0}m
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sessions Today</span>
                  <Badge variant="secondary" className="font-mono">
                    {stats?.sessionsToday || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border shadow-md bg-gradient-to-br from-chart-4/10 to-transparent">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Focus Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                Take a 5-minute break every 25 minutes to maintain optimal focus and reduce mental fatigue.
              </p>
            </CardContent>
          </Card>

          <Card className="border-card-border shadow-md">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                disabled
              >
                <Clock className="h-4 w-4" />
                Set Timer (Coming Soon)
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                disabled
              >
                <Move className="h-4 w-4" />
                Focus Goals (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
