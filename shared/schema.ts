import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Health Metrics - simulated Google Fit data
export const healthMetrics = pgTable("health_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().defaultNow(),
  steps: integer("steps").notNull().default(0),
  heartRate: integer("heart_rate"),
  sleepHours: integer("sleep_hours"),
  activeMinutes: integer("active_minutes"),
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true,
});

export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type HealthMetric = typeof healthMetrics.$inferSelect;

// Mood Journal Entries
export const moodEntries = pgTable("mood_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  sentiment: integer("sentiment"), // 1-5 scale
  sentimentConfidence: integer("sentiment_confidence"), // 0-100
  stressLevel: integer("stress_level"), // 1-100
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true,
  sentiment: true,
  sentimentConfidence: true,
  stressLevel: true,
}).extend({
  content: z.string().min(1, "Please write something about how you're feeling"),
});

export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;

// Focus Sessions - browser activity tracking
export const focusSessions = pgTable("focus_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  focusedMinutes: integer("focused_minutes").default(0),
  distractedMinutes: integer("distracted_minutes").default(0),
  activeTab: text("active_tab"),
  isActive: boolean("is_active").default(true),
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({
  id: true,
  startTime: true,
});

export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;

// Chat Messages - AI conversation history
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  mode: text("mode").notNull(), // 'chat' or 'insight'
  metadata: jsonb("metadata"), // for storing context data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Mindfulness Activities
export const mindfulnessActivities = pgTable("mindfulness_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in minutes
  category: text("category").notNull(), // 'breathing', 'meditation', 'stretch', 'break'
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
});

export const insertMindfulnessActivitySchema = createInsertSchema(mindfulnessActivities).omit({
  id: true,
});

export type InsertMindfulnessActivity = z.infer<typeof insertMindfulnessActivitySchema>;
export type MindfulnessActivity = typeof mindfulnessActivities.$inferSelect;

// User Settings
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  theme: text("theme").notNull().default("dark"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  focusTrackingEnabled: boolean("focus_tracking_enabled").default(true),
  aiAnalysisEnabled: boolean("ai_analysis_enabled").default(true),
  breakReminderInterval: integer("break_reminder_interval").default(120), // minutes
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// Stress Analysis Results
export interface StressAnalysisResult {
  score: number; // 0-100
  level: 'low' | 'moderate' | 'high' | 'very-high';
  factors: string[];
  recommendations: string[];
  trend: 'improving' | 'stable' | 'worsening';
}

// Chat Context for AI
export interface ChatContext {
  recentMetrics?: HealthMetric[];
  recentMoods?: MoodEntry[];
  currentStressScore?: number;
  focusStats?: {
    focusedMinutes: number;
    distractedMinutes: number;
  };
}
