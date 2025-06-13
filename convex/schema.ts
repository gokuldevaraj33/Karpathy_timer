import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  sessions: defineTable({
    userId: v.id("users"),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    duration: v.number(), // in seconds
    isCompleted: v.boolean(),
    isPaused: v.optional(v.boolean()), // Make isPaused optional to handle existing sessions
    date: v.string(), // YYYY-MM-DD format
    activityName: v.optional(v.string()), // what the user is working on
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_completed", ["userId", "isCompleted"]),

  userSettings: defineTable({
    userId: v.id("users"),
    dailyGoalHours: v.number(), // 2-8 hours
    breakReminderMinutes: v.number(), // 30, 60, 90, 120
    soundNotifications: v.boolean(),
  }).index("by_user", ["userId"]),

  dailyProgress: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    totalSeconds: v.number(),
    sessionCount: v.number(),
    goalAchieved: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),

  activities: defineTable({
    userId: v.id("users"),
    name: v.string(),
    totalSeconds: v.number(),
    sessionCount: v.number(),
    lastPracticed: v.number(), // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "name"]),

  leaderboard: defineTable({
    userId: v.id("users"),
    userName: v.string(),
    totalHours: v.number(),
    totalSessions: v.number(),
    currentStreak: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_total_hours", ["totalHours"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
