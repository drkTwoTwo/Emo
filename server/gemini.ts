import { GoogleGenAI } from "@google/genai";
import type { ChatContext, StressAnalysisResult } from "@shared/schema";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Sentiment {
  rating: number;
  confidence: number;
}

export async function analyzeSentiment(text: string): Promise<Sentiment> {
  try {
    const systemPrompt = `You are a sentiment analysis expert. 
Analyze the sentiment of the text and provide a rating
from 1 to 5 stars and a confidence score between 0 and 1.
Respond with JSON in this format: 
{'rating': number, 'confidence': number}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            rating: { type: "number" },
            confidence: { type: "number" },
          },
          required: ["rating", "confidence"],
        },
      },
      contents: text,
    });

    const rawJson = response.text;

    if (rawJson) {
      const data: Sentiment = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Failed to analyze sentiment:", error);
    return { rating: 3, confidence: 0.5 };
  }
}

export async function analyzeStressLevel(context: ChatContext): Promise<StressAnalysisResult> {
  try {
    const systemPrompt = `You are a wellness and stress analysis expert. 
Analyze the provided health metrics, mood data, and focus patterns to calculate a stress score.
Provide a comprehensive stress analysis with actionable recommendations.
Respond with JSON matching this exact schema.`;

    const userPrompt = `Analyze this user's wellness data:

Recent Health Metrics:
${context.recentMetrics?.map(m => `- Date: ${m.date}, Steps: ${m.steps}, Heart Rate: ${m.heartRate || 'N/A'}, Sleep: ${m.sleepHours || 'N/A'}h`).join('\n') || 'No data available'}

Recent Mood Entries:
${context.recentMoods?.map(m => `- ${new Date(m.createdAt).toLocaleDateString()}: Sentiment ${m.sentiment}/5, "${m.content.substring(0, 100)}..."`).join('\n') || 'No mood data'}

Focus Stats:
- Focused time: ${context.focusStats?.focusedMinutes || 0} minutes
- Distracted time: ${context.focusStats?.distractedMinutes || 0} minutes

Provide a stress score (0-100), level classification, contributing factors, recommendations, and trend.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "number" },
            level: { 
              type: "string",
              enum: ["low", "moderate", "high", "very-high"]
            },
            factors: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            trend: {
              type: "string",
              enum: ["improving", "stable", "worsening"]
            }
          },
          required: ["score", "level", "factors", "recommendations", "trend"],
        },
      },
      contents: userPrompt,
    });

    const rawJson = response.text;

    if (rawJson) {
      const data: StressAnalysisResult = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Failed to analyze stress level:", error);
    return {
      score: 35,
      level: "moderate",
      factors: ["Insufficient data for complete analysis"],
      recommendations: ["Continue tracking your wellness metrics for better insights"],
      trend: "stable"
    };
  }
}

export async function chatWithAI(
  message: string,
  mode: "chat" | "insight",
  context?: ChatContext
): Promise<string> {
  try {
    let systemPrompt = "";
    let userPrompt = message;

    if (mode === "insight") {
      systemPrompt = `You are a wellness AI assistant analyzing user health data. 
Provide clear, actionable insights based on their metrics, mood, and focus patterns.
Be empathetic, supportive, and specific in your recommendations.`;

      const contextInfo = context ? `
User's Recent Data:
- Steps: ${context.recentMetrics?.[0]?.steps || 'N/A'}
- Sleep: ${context.recentMetrics?.[0]?.sleepHours || 'N/A'} hours
- Heart Rate: ${context.recentMetrics?.[0]?.heartRate || 'N/A'} bpm
- Recent Mood: ${context.recentMoods?.[0]?.sentiment || 'N/A'}/5
- Focus Time: ${context.focusStats?.focusedMinutes || 0} min focused, ${context.focusStats?.distractedMinutes || 0} min distracted
- Current Stress Score: ${context.currentStressScore || 'N/A'}

User Question: ${message}` : message;

      userPrompt = contextInfo;
    } else {
      systemPrompt = `You are a friendly, knowledgeable wellness AI assistant. 
Help users with stress management, wellness tips, mental health guidance, and healthy lifestyle recommendations.
Be supportive, empathetic, and provide evidence-based advice.
Keep responses concise but helpful (2-3 paragraphs max).`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: userPrompt,
    });

    return response.text || "I apologize, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Failed to chat with AI:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

export async function generateMindfulnessActivity(category: string): Promise<{
  title: string;
  description: string;
  duration: number;
}> {
  try {
    const systemPrompt = `You are a mindfulness and wellness expert.
Generate a specific, actionable mindfulness activity for the category: ${category}.
Provide a title, detailed description with step-by-step guidance, and duration in minutes.
Make it practical and easy to follow.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            duration: { type: "number" }
          },
          required: ["title", "description", "duration"],
        },
      },
      contents: `Generate a ${category} activity`,
    });

    const rawJson = response.text;

    if (rawJson) {
      return JSON.parse(rawJson);
    }
  } catch (error) {
    console.error("Failed to generate mindfulness activity:", error);
  }

  // Fallback activities
  const fallbacks: Record<string, any> = {
    breathing: {
      title: "4-7-8 Breathing Technique",
      description: "Sit comfortably with your back straight. Inhale quietly through your nose for 4 counts, hold your breath for 7 counts, then exhale completely through your mouth for 8 counts. Repeat this cycle 3-4 times.",
      duration: 5
    },
    meditation: {
      title: "Body Scan Meditation",
      description: "Lie down or sit comfortably. Close your eyes and bring awareness to each part of your body, starting from your toes and moving up to your head. Notice any sensations without judgment.",
      duration: 10
    },
    stretch: {
      title: "Desk Stretches",
      description: "Stand up and stretch your arms overhead, then gently bend side to side. Roll your shoulders backward 10 times. Stretch your neck by tilting your head to each side.",
      duration: 3
    },
    break: {
      title: "Mindful Tea Break",
      description: "Make your favorite beverage. As you drink, focus completely on the experience - the warmth, aroma, and taste. Let your mind rest from work.",
      duration: 5
    }
  };

  return fallbacks[category] || fallbacks.breathing;
}
