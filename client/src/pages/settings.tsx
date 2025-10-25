import { Settings as SettingsIcon, Bell, Target, Brain, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/lib/theme-provider";

export default function Settings() {
  const { toast } = useToast();
  const { theme } = useTheme();

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      return await apiRequest("PATCH", "/api/settings", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    },
  });

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/data/clear", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Data cleared",
        description: "All your data has been deleted.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-card rounded-2xl animate-pulse" />
        <div className="h-64 bg-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-card-border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-muted-foreground" />
            Settings
          </CardTitle>
          <CardDescription>
            Manage your preferences and privacy settings
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Appearance */}
      <Card className="border-card-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>Customize how MindFlow looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Currently using {theme} mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-card-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-chart-1" />
            Notifications
          </CardTitle>
          <CardDescription>Control when and how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive smart reminders and alerts
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={settings?.notificationsEnabled ?? true}
              onCheckedChange={(checked) =>
                updateSettingsMutation.mutate({ notificationsEnabled: checked })
              }
              data-testid="switch-notifications-enabled"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Break Reminder Interval</Label>
            <div className="grid grid-cols-3 gap-3">
              {[60, 90, 120].map((interval) => (
                <Button
                  key={interval}
                  variant={settings?.breakReminderInterval === interval ? "default" : "outline"}
                  onClick={() =>
                    updateSettingsMutation.mutate({ breakReminderInterval: interval })
                  }
                  data-testid={`button-interval-${interval}`}
                >
                  {interval} min
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking */}
      <Card className="border-card-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-chart-4" />
            Tracking & Features
          </CardTitle>
          <CardDescription>Control what data is collected and analyzed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="focus-tracking">Focus Time Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Monitor your active and idle time
              </p>
            </div>
            <Switch
              id="focus-tracking"
              checked={settings?.focusTrackingEnabled ?? true}
              onCheckedChange={(checked) =>
                updateSettingsMutation.mutate({ focusTrackingEnabled: checked })
              }
              data-testid="switch-focus-tracking"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ai-analysis">AI Analysis & Insights</Label>
              <p className="text-sm text-muted-foreground">
                Get personalized recommendations from Gemini AI
              </p>
            </div>
            <Switch
              id="ai-analysis"
              checked={settings?.aiAnalysisEnabled ?? true}
              onCheckedChange={(checked) =>
                updateSettingsMutation.mutate({ aiAnalysisEnabled: checked })
              }
              data-testid="switch-ai-analysis"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="border-card-border shadow-lg border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Privacy & Data
          </CardTitle>
          <CardDescription>Manage your data and privacy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Clear All Data</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Permanently delete all your health metrics, mood journal entries, chat history, and focus sessions. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Are you sure you want to delete all your data? This cannot be undone.")) {
                  clearDataMutation.mutate();
                }
              }}
              disabled={clearDataMutation.isPending}
              data-testid="button-clear-data"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Export Data</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Download all your data in JSON format
            </p>
            <Button
              variant="outline"
              disabled
              data-testid="button-export-data"
            >
              Export Data (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-card-border shadow-md bg-gradient-to-br from-chart-1/10 to-chart-2/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center flex-shrink-0">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">MindFlow v1.0</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered stress tracking and wellness companion
              </p>
              <p className="text-xs text-muted-foreground">
                Powered by Gemini AI • Built with care for your mental wellness
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
