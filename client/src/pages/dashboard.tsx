import { motion } from "framer-motion";
import { Heart, Activity, Moon, TrendingUp, TrendingDown, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import type { HealthMetric, StressAnalysisResult } from "@shared/schema";

const stressLevelColors = {
  low: "text-green-500",
  moderate: "text-yellow-500",
  high: "text-orange-500",
  "very-high": "text-red-500",
};

const stressLevelBg = {
  low: "from-green-500/20 to-green-600/5",
  moderate: "from-yellow-500/20 to-yellow-600/5",
  high: "from-orange-500/20 to-orange-600/5",
  "very-high": "from-red-500/20 to-red-600/5",
};

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<HealthMetric[]>({
    queryKey: ["/api/health-metrics"],
  });

  const { data: stressAnalysis, isLoading: analysisLoading } = useQuery<StressAnalysisResult>({
    queryKey: ["/api/stress-analysis"],
  });

  const { data: weeklyData } = useQuery<any[]>({
    queryKey: ["/api/weekly-trends"],
  });

  const latestMetric = metrics?.[0];
  const stressLevel = stressAnalysis?.level || "low";
  const stressScore = stressAnalysis?.score || 25;

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

  if (metricsLoading || analysisLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-card rounded-3xl animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants}>
        <Card className={`border-card-border shadow-lg bg-gradient-to-br ${stressLevelBg[stressLevel]} overflow-hidden`}>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold text-foreground">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground">
                  Here's your wellness overview for today
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="relative h-32 w-32">
                    <svg className="rotate-[-90deg] h-32 w-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted/20"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - stressScore / 100)}`}
                        className={stressLevelColors[stressLevel]}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-mono font-bold" data-testid="text-stress-score">{stressScore}</span>
                      <span className="text-xs text-muted-foreground">Stress</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className={`text-lg font-semibold capitalize ${stressLevelColors[stressLevel]}`} data-testid="text-stress-level">
                    {stressLevel.replace("-", " ")}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="text-stress-trend">
                    {stressAnalysis?.trend === "improving" && "Improving ↑"}
                    {stressAnalysis?.trend === "stable" && "Stable →"}
                    {stressAnalysis?.trend === "worsening" && "Needs attention ↓"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-card-border shadow-md hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Steps Today</CardTitle>
            <Activity className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-semibold" data-testid="text-steps">
              {latestMetric?.steps?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Goal: 10,000 steps
            </p>
            <Progress 
              value={((latestMetric?.steps || 0) / 10000) * 100} 
              className="mt-3 h-2" 
            />
          </CardContent>
        </Card>

        <Card className="border-card-border shadow-md hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-semibold" data-testid="text-heart-rate">
              {latestMetric?.heartRate || 72} <span className="text-lg text-muted-foreground">bpm</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Resting average
            </p>
          </CardContent>
        </Card>

        <Card className="border-card-border shadow-md hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sleep</CardTitle>
            <Moon className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-semibold" data-testid="text-sleep">
              {latestMetric?.sleepHours || 7}h <span className="text-lg text-muted-foreground">30m</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last night
            </p>
          </CardContent>
        </Card>

        <Card className="border-card-border shadow-md hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Minutes</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-semibold" data-testid="text-active-minutes">
              {latestMetric?.activeMinutes || 45}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Today's activity
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        <Card className="border-card-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-chart-1" />
              Stress Trend (7 Days)
            </CardTitle>
            <CardDescription>Your stress levels over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData || []}>
                <defs>
                  <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
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
                <Area 
                  type="monotone" 
                  dataKey="stress" 
                  stroke="hsl(var(--chart-1))" 
                  fill="url(#stressGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-card-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-chart-2" />
              Activity Overview
            </CardTitle>
            <CardDescription>Steps and active minutes this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData || []}>
                <XAxis 
                  dataKey="day" 
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
                <Line 
                  type="monotone" 
                  dataKey="steps" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Recommendations */}
      {stressAnalysis?.recommendations && stressAnalysis.recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-card-border shadow-lg bg-gradient-to-br from-chart-1/10 to-chart-2/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-chart-1" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Personalized insights based on your data</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {stressAnalysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-chart-1/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-chart-1">{index + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{rec}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
