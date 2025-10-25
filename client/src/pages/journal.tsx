import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Send, TrendingUp, Calendar, Smile, Meh, Frown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MoodEntry } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMoodEntrySchema } from "@shared/schema";
import type { InsertMoodEntry } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const sentimentEmoji = {
  1: { icon: Frown, label: "Very Negative", color: "text-red-500" },
  2: { icon: Frown, label: "Negative", color: "text-orange-500" },
  3: { icon: Meh, label: "Neutral", color: "text-yellow-500" },
  4: { icon: Smile, label: "Positive", color: "text-green-500" },
  5: { icon: Smile, label: "Very Positive", color: "text-emerald-500" },
};

export default function Journal() {
  const { data: entries, isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries"],
  });

  const form = useForm<InsertMoodEntry>({
    resolver: zodResolver(insertMoodEntrySchema),
    defaultValues: {
      content: "",
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: InsertMoodEntry) => {
      return await apiRequest("POST", "/api/mood-entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      form.reset();
    },
  });

  const onSubmit = (data: InsertMoodEntry) => {
    createEntryMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-card-border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-chart-3" />
            Mood Journal
          </CardTitle>
          <CardDescription>
            Reflect on your feelings and let AI analyze your emotional patterns
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Journal Entry Form */}
        <div className="lg:col-span-2">
          <Card className="border-card-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Write Your Thoughts</CardTitle>
              <CardDescription>
                Express how you're feeling today. AI will analyze the sentiment and provide insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How are you feeling?</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Today I feel... because..."
                            className="min-h-[200px] resize-none"
                            disabled={createEntryMutation.isPending}
                            data-testid="input-journal-entry"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {form.watch("content")?.length || 0} characters
                    </span>
                    <Button
                      type="submit"
                      disabled={createEntryMutation.isPending}
                      className="gap-2"
                      data-testid="button-save-entry"
                    >
                      <Send className="h-4 w-4" />
                      Save & Analyze
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Overview */}
        <div className="space-y-6">
          <Card className="border-card-border shadow-lg bg-gradient-to-br from-chart-3/10 to-chart-4/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Sentiment Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold" data-testid="text-average-sentiment">
                    {entries && entries.length > 0 
                      ? (entries.reduce((acc, e) => acc + (e.sentiment || 3), 0) / entries.length).toFixed(1)
                      : "3.0"
                    }
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Average Sentiment</p>
                </div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const Icon = sentimentEmoji[val as keyof typeof sentimentEmoji].icon;
                    const color = sentimentEmoji[val as keyof typeof sentimentEmoji].color;
                    return (
                      <div key={val} className={`${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Entries</span>
                <Badge variant="secondary">{entries?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Week</span>
                <Badge variant="secondary">
                  {entries?.filter(e => {
                    const entryDate = new Date(e.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return entryDate > weekAgo;
                  }).length || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Past Entries */}
      <Card className="border-card-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-chart-3" />
            Past Reflections
          </CardTitle>
          <CardDescription>Your mood journal history with AI sentiment analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !entries || entries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No journal entries yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start writing to track your emotional journey</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => {
                const sentiment = entry.sentiment || 3;
                const SentimentIcon = sentimentEmoji[sentiment as keyof typeof sentimentEmoji].icon;
                const sentimentColor = sentimentEmoji[sentiment as keyof typeof sentimentEmoji].color;
                const sentimentLabel = sentimentEmoji[sentiment as keyof typeof sentimentEmoji].label;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-card-border rounded-lg p-4 hover-elevate"
                    data-testid={`entry-${index}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <SentimentIcon className={`h-4 w-4 ${sentimentColor}`} />
                          <Badge variant="outline" className="text-xs">
                            {sentimentLabel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {entry.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
