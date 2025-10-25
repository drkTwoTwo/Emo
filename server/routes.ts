import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeSentiment, analyzeStressLevel, chatWithAI, generateMindfulnessActivity } from "./gemini";
import { 
  insertMoodEntrySchema, 
  insertHealthMetricSchema,
  insertFocusSessionSchema,
  insertChatMessageSchema,
  insertMindfulnessActivitySchema 
} from "@shared/schema";
import type { ChatContext } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health Metrics Endpoints
  app.get("/api/health-metrics", async (req, res) => {
    try {
      const metrics = await storage.getHealthMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health metrics" });
    }
  });

  app.post("/api/health-metrics", async (req, res) => {
    try {
      const validatedData = insertHealthMetricSchema.parse(req.body);
      const metric = await storage.createHealthMetric(validatedData);
      res.json(metric);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create health metric" });
      }
    }
  });

  app.get("/api/weekly-trends", async (req, res) => {
    try {
      const trends = await storage.getWeeklyTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly trends" });
    }
  });

  // Stress Analysis Endpoint
  app.get("/api/stress-analysis", async (req, res) => {
    try {
      const metrics = await storage.getHealthMetrics(7);
      const moods = await storage.getMoodEntries(7);
      const focusStats = await storage.getFocusStats();

      const context: ChatContext = {
        recentMetrics: metrics,
        recentMoods: moods,
        focusStats,
      };

      const analysis = await analyzeStressLevel(context);
      res.json(analysis);
    } catch (error) {
      console.error("Stress analysis error:", error);
      res.status(500).json({ error: "Failed to analyze stress level" });
    }
  });

  // Mood Journal Endpoints
  app.get("/api/mood-entries", async (req, res) => {
    try {
      const entries = await storage.getMoodEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mood entries" });
    }
  });

  app.post("/api/mood-entries", async (req, res) => {
    try {
      // Validate input
      const validatedData = insertMoodEntrySchema.parse(req.body);
      
      // Create entry
      const entry = await storage.createMoodEntry(validatedData);

      // Analyze sentiment with AI
      const sentiment = await analyzeSentiment(validatedData.content);
      
      // Update entry with sentiment
      const updated = await storage.updateMoodEntry(entry.id, {
        sentiment: Math.round(sentiment.rating),
        sentimentConfidence: Math.round(sentiment.confidence * 100),
      });

      res.json(updated || entry);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        console.error("Mood entry error:", error);
        res.status(500).json({ error: "Failed to create mood entry" });
      }
    }
  });

  // Focus Tracking Endpoints
  app.get("/api/focus-sessions", async (req, res) => {
    try {
      const sessions = await storage.getFocusSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch focus sessions" });
    }
  });

  app.get("/api/focus-stats", async (req, res) => {
    try {
      const stats = await storage.getFocusStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch focus stats" });
    }
  });

  app.post("/api/focus-sessions/start", async (req, res) => {
    try {
      // End any active sessions first
      const activeSession = await storage.getActiveFocusSession();
      if (activeSession) {
        await storage.updateFocusSession(activeSession.id, {
          isActive: false,
          endTime: new Date(),
        });
      }

      // Start new session
      const session = await storage.createFocusSession({
        isActive: true,
        focusedMinutes: 0,
        distractedMinutes: 0,
        activeTab: "MindFlow",
        endTime: null,
      });

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to start focus session" });
    }
  });

  app.post("/api/focus-sessions/end", async (req, res) => {
    try {
      const activeSession = await storage.getActiveFocusSession();
      if (!activeSession) {
        return res.status(404).json({ error: "No active session found" });
      }

      // Calculate duration and update session
      const endTime = new Date();
      const durationMinutes = Math.floor(
        (endTime.getTime() - new Date(activeSession.startTime).getTime()) / 60000
      );

      // For demo purposes, assume 70% focused, 30% distracted
      const focusedMinutes = Math.floor(durationMinutes * 0.7);
      const distractedMinutes = durationMinutes - focusedMinutes;

      const updated = await storage.updateFocusSession(activeSession.id, {
        isActive: false,
        endTime,
        focusedMinutes,
        distractedMinutes,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to end focus session" });
    }
  });

  // Chat Endpoints
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const chatSchema = z.object({
        content: z.string().min(1, "Content is required"),
        mode: z.enum(["chat", "insight"]),
      });
      
      const { content, mode } = chatSchema.parse(req.body);

      // Save user message
      const userMessage = await storage.createChatMessage({
        role: "user",
        content,
        mode,
        metadata: null,
      });

      // Prepare context for insight mode
      let context: ChatContext | undefined;
      if (mode === "insight") {
        const metrics = await storage.getHealthMetrics(7);
        const moods = await storage.getMoodEntries(7);
        const focusStats = await storage.getFocusStats();
        const analysis = await analyzeStressLevel({
          recentMetrics: metrics,
          recentMoods: moods,
          focusStats,
        });

        context = {
          recentMetrics: metrics,
          recentMoods: moods,
          currentStressScore: analysis.score,
          focusStats,
        };
      }

      // Get AI response
      const aiResponse = await chatWithAI(content, mode, context);

      // Save AI message
      const assistantMessage = await storage.createChatMessage({
        role: "assistant",
        content: aiResponse,
        mode,
        metadata: null,
      });

      res.json({ userMessage, assistantMessage });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Mindfulness Endpoints
  app.get("/api/mindfulness-activities", async (req, res) => {
    try {
      const activities = await storage.getMindfulnessActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mindfulness activities" });
    }
  });

  app.post("/api/mindfulness-activities/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateMindfulnessActivity(id, {
        isCompleted: true,
        completedAt: new Date(),
      });

      if (!updated) {
        return res.status(404).json({ error: "Activity not found" });
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete activity" });
    }
  });

  app.post("/api/mindfulness-activities/generate", async (req, res) => {
    try {
      const generateSchema = z.object({
        category: z.string().min(1, "Category is required"),
      });
      
      const { category } = generateSchema.parse(req.body);

      const activityData = await generateMindfulnessActivity(category);
      
      const activity = await storage.createMindfulnessActivity({
        ...activityData,
        category,
        isCompleted: false,
        completedAt: null,
      });

      res.json(activity);
    } catch (error) {
      console.error("Generate activity error:", error);
      res.status(500).json({ error: "Failed to generate activity" });
    }
  });

  // Settings Endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const settingsUpdateSchema = z.object({
        theme: z.string().optional(),
        notificationsEnabled: z.boolean().optional(),
        focusTrackingEnabled: z.boolean().optional(),
        aiAnalysisEnabled: z.boolean().optional(),
        breakReminderInterval: z.number().optional(),
        hasCompletedOnboarding: z.boolean().optional(),
      });
      
      const validatedData = settingsUpdateSchema.parse(req.body);
      const updated = await storage.updateSettings(validatedData);
      res.json(updated);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid input", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update settings" });
      }
    }
  });

  // Data Management
  app.delete("/api/data/clear", async (req, res) => {
    try {
      await storage.clearAllData();
      res.json({ success: true, message: "All data cleared successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
