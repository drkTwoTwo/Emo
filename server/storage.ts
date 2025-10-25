import { 
  type User, 
  type InsertUser,
  type HealthMetric,
  type InsertHealthMetric,
  type MoodEntry,
  type InsertMoodEntry,
  type FocusSession,
  type InsertFocusSession,
  type ChatMessage,
  type InsertChatMessage,
  type MindfulnessActivity,
  type InsertMindfulnessActivity,
  type UserSettings,
  type InsertUserSettings,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Health Metrics
  getHealthMetrics(limit?: number): Promise<HealthMetric[]>;
  createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
  getWeeklyTrends(): Promise<any[]>;

  // Mood Entries
  getMoodEntries(limit?: number): Promise<MoodEntry[]>;
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  updateMoodEntry(id: string, updates: Partial<MoodEntry>): Promise<MoodEntry | undefined>;

  // Focus Sessions
  getFocusSessions(limit?: number): Promise<FocusSession[]>;
  getActiveFocusSession(): Promise<FocusSession | undefined>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: string, updates: Partial<FocusSession>): Promise<FocusSession | undefined>;
  getFocusStats(): Promise<{ totalFocused: number; totalDistracted: number; sessionsToday: number }>;

  // Chat Messages
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Mindfulness Activities
  getMindfulnessActivities(): Promise<MindfulnessActivity[]>;
  createMindfulnessActivity(activity: InsertMindfulnessActivity): Promise<MindfulnessActivity>;
  updateMindfulnessActivity(id: string, updates: Partial<MindfulnessActivity>): Promise<MindfulnessActivity | undefined>;

  // Settings
  getSettings(): Promise<UserSettings>;
  updateSettings(updates: Partial<UserSettings>): Promise<UserSettings>;

  // Data Management
  clearAllData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private healthMetrics: Map<string, HealthMetric>;
  private moodEntries: Map<string, MoodEntry>;
  private focusSessions: Map<string, FocusSession>;
  private chatMessages: Map<string, ChatMessage>;
  private mindfulnessActivities: Map<string, MindfulnessActivity>;
  private settings: UserSettings;

  constructor() {
    this.users = new Map();
    this.healthMetrics = new Map();
    this.moodEntries = new Map();
    this.focusSessions = new Map();
    this.chatMessages = new Map();
    this.mindfulnessActivities = new Map();
    
    // Initialize default settings
    this.settings = {
      id: randomUUID(),
      theme: "dark",
      notificationsEnabled: true,
      focusTrackingEnabled: true,
      aiAnalysisEnabled: true,
      breakReminderInterval: 120,
      hasCompletedOnboarding: false,
    };

    // Seed initial data
    this.seedInitialData();
  }

  private seedInitialData() {
    // Create sample health metrics for the past week
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const id = randomUUID();
      this.healthMetrics.set(id, {
        id,
        date,
        steps: Math.floor(5000 + Math.random() * 8000),
        heartRate: Math.floor(60 + Math.random() * 20),
        sleepHours: Math.floor(6 + Math.random() * 3),
        activeMinutes: Math.floor(20 + Math.random() * 60),
      });
    }

    // Create initial mindfulness activities
    const activities = [
      {
        title: "Morning Breathing Exercise",
        description: "Start your day with 5 minutes of deep breathing. Inhale for 4 counts, hold for 4, exhale for 4, and hold for 4. This calms your nervous system and sets a peaceful tone.",
        duration: 5,
        category: "breathing",
      },
      {
        title: "Guided Body Scan",
        description: "Lie down and mentally scan your body from toes to head. Notice any tension or sensations without trying to change them. This builds body awareness and releases stress.",
        duration: 10,
        category: "meditation",
      },
      {
        title: "Neck and Shoulder Stretch",
        description: "Gently roll your shoulders backward 10 times, then forward 10 times. Tilt your head to each side, holding for 10 seconds. This releases computer-induced tension.",
        duration: 3,
        category: "stretch",
      },
      {
        title: "Mindful Coffee Break",
        description: "Step away from your desk and make a warm beverage. Focus entirely on the process and sensations - the aroma, warmth, and taste. No screens, just presence.",
        duration: 5,
        category: "break",
      },
      {
        title: "Walking Meditation",
        description: "Take a slow, mindful walk. Notice each step, the sensation of your feet touching the ground, your breath, and your surroundings. Let thoughts pass without engaging.",
        duration: 15,
        category: "meditation",
      },
      {
        title: "Progressive Muscle Relaxation",
        description: "Tense and then relax each muscle group for 5 seconds, starting with your toes and moving up. This reduces physical tension and promotes deep relaxation.",
        duration: 8,
        category: "stretch",
      },
    ];

    activities.forEach(activity => {
      const id = randomUUID();
      this.mindfulnessActivities.set(id, {
        id,
        ...activity,
        isCompleted: false,
        completedAt: null,
      });
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Health Metrics
  async getHealthMetrics(limit = 30): Promise<HealthMetric[]> {
    const metrics = Array.from(this.healthMetrics.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
    return metrics;
  }

  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const id = randomUUID();
    const newMetric: HealthMetric = { ...metric, id };
    this.healthMetrics.set(id, newMetric);
    return newMetric;
  }

  async getWeeklyTrends(): Promise<any[]> {
    const metrics = await this.getHealthMetrics(7);
    return metrics.reverse().map((m, index) => ({
      day: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
      stress: Math.floor(20 + Math.random() * 60), // Simulated stress data
      steps: m.steps,
      sleep: m.sleepHours,
    }));
  }

  // Mood Entries
  async getMoodEntries(limit = 50): Promise<MoodEntry[]> {
    const entries = Array.from(this.moodEntries.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    return entries;
  }

  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const id = randomUUID();
    const newEntry: MoodEntry = {
      ...entry,
      id,
      createdAt: new Date(),
      sentiment: null,
      sentimentConfidence: null,
      stressLevel: null,
    };
    this.moodEntries.set(id, newEntry);
    return newEntry;
  }

  async updateMoodEntry(id: string, updates: Partial<MoodEntry>): Promise<MoodEntry | undefined> {
    const entry = this.moodEntries.get(id);
    if (!entry) return undefined;
    
    const updated = { ...entry, ...updates };
    this.moodEntries.set(id, updated);
    return updated;
  }

  // Focus Sessions
  async getFocusSessions(limit = 20): Promise<FocusSession[]> {
    const sessions = Array.from(this.focusSessions.values())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
    return sessions;
  }

  async getActiveFocusSession(): Promise<FocusSession | undefined> {
    return Array.from(this.focusSessions.values()).find(s => s.isActive);
  }

  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    const id = randomUUID();
    const newSession: FocusSession = {
      ...session,
      id,
      startTime: new Date(),
    };
    this.focusSessions.set(id, newSession);
    return newSession;
  }

  async updateFocusSession(id: string, updates: Partial<FocusSession>): Promise<FocusSession | undefined> {
    const session = this.focusSessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates };
    this.focusSessions.set(id, updated);
    return updated;
  }

  async getFocusStats(): Promise<{ totalFocused: number; totalDistracted: number; sessionsToday: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = Array.from(this.focusSessions.values()).filter(
      s => new Date(s.startTime) >= today
    );

    return {
      totalFocused: todaySessions.reduce((acc, s) => acc + (s.focusedMinutes || 0), 0),
      totalDistracted: todaySessions.reduce((acc, s) => acc + (s.distractedMinutes || 0), 0),
      sessionsToday: todaySessions.length,
    };
  }

  // Chat Messages
  async getChatMessages(limit = 100): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-limit);
    return messages;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const newMessage: ChatMessage = {
      ...message,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  // Mindfulness Activities
  async getMindfulnessActivities(): Promise<MindfulnessActivity[]> {
    return Array.from(this.mindfulnessActivities.values());
  }

  async createMindfulnessActivity(activity: InsertMindfulnessActivity): Promise<MindfulnessActivity> {
    const id = randomUUID();
    const newActivity: MindfulnessActivity = {
      ...activity,
      id,
    };
    this.mindfulnessActivities.set(id, newActivity);
    return newActivity;
  }

  async updateMindfulnessActivity(id: string, updates: Partial<MindfulnessActivity>): Promise<MindfulnessActivity | undefined> {
    const activity = this.mindfulnessActivities.get(id);
    if (!activity) return undefined;
    
    const updated = { ...activity, ...updates };
    this.mindfulnessActivities.set(id, updated);
    return updated;
  }

  // Settings
  async getSettings(): Promise<UserSettings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }

  // Data Management
  async clearAllData(): Promise<void> {
    this.healthMetrics.clear();
    this.moodEntries.clear();
    this.focusSessions.clear();
    this.chatMessages.clear();
    this.mindfulnessActivities.clear();
    
    // Re-seed initial data
    this.seedInitialData();
  }
}

export const storage = new MemStorage();
