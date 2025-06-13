import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const startSession = mutation({
  args: {
    activityName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    return await ctx.db.insert("sessions", {
      userId,
      startTime: now,
      duration: 0,
      isCompleted: false,
      isPaused: false,
      date: today,
      activityName: args.activityName,
    });
  },
});

export const updateSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    duration: v.number(),
    isPaused: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      duration: args.duration,
      isPaused: args.isPaused,
    });
  },
});

export const completeSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.sessionId, {
      endTime: now,
      duration: args.duration,
      isCompleted: true,
    });

    // Update activity tracking
    if (session.activityName) {
      const existingActivity = await ctx.db
        .query("activities")
        .withIndex("by_user_and_name", (q) => q.eq("userId", userId).eq("name", session.activityName!))
        .unique();

      if (existingActivity) {
        await ctx.db.patch(existingActivity._id, {
          totalSeconds: existingActivity.totalSeconds + args.duration,
          sessionCount: existingActivity.sessionCount + 1,
          lastPracticed: now,
        });
      } else {
        await ctx.db.insert("activities", {
          userId,
          name: session.activityName!,
          totalSeconds: args.duration,
          sessionCount: 1,
          lastPracticed: now,
        });
      }
    }

    // Update daily progress
    const today = new Date().toISOString().split('T')[0];
    const existingProgress = await ctx.db
      .query("dailyProgress")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .unique();

    const todaySessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .filter((q) => q.eq(q.field("isCompleted"), true))
      .collect();

    const totalSeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const sessionCount = todaySessions.length;

    // Get user's daily goal
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    const dailyGoalSeconds = (settings?.dailyGoalHours || 4) * 3600;
    const goalAchieved = totalSeconds >= dailyGoalSeconds;

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        totalSeconds,
        sessionCount,
        goalAchieved,
      });
    } else {
      await ctx.db.insert("dailyProgress", {
        userId,
        date: today,
        totalSeconds,
        sessionCount,
        goalAchieved,
      });
    }

    // Update leaderboard
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const allCompletedSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_completed", (q) => q.eq("userId", userId).eq("isCompleted", true))
      .collect();

    const totalHours = allCompletedSessions.reduce((sum, s) => sum + s.duration, 0) / 3600;
    const totalSessions = allCompletedSessions.length;

    // Calculate streak
    const streak = await calculateStreak(ctx, userId);

    const existingLeaderboard = await ctx.db
      .query("leaderboard")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingLeaderboard) {
      await ctx.db.patch(existingLeaderboard._id, {
        userName: user.name || `User${userId.slice(-4)}`,
        totalHours,
        totalSessions,
        currentStreak: streak,
        lastUpdated: now,
      });
    } else {
      await ctx.db.insert("leaderboard", {
        userId,
        userName: user.name || `User${userId.slice(-4)}`,
        totalHours,
        totalSessions,
        currentStreak: streak,
        lastUpdated: now,
      });
    }
  },
});

async function calculateStreak(ctx: any, userId: any) {
  const dailyProgress = await ctx.db
    .query("dailyProgress")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .order("desc")
    .collect();

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = new Date();

  for (let i = 0; i < dailyProgress.length; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayProgress = dailyProgress.find((p: any) => p.date === dateStr);
    
    if (dayProgress && dayProgress.goalAchieved) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export const getCurrentSession = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .filter((q) => q.eq(q.field("isCompleted"), false))
      .first();

    if (!session) return null;

    // If the session is paused, return the stored duration
    if (session.isPaused) {
      return {
        ...session,
        currentDuration: session.duration,
      };
    }

    // For active sessions, calculate the current duration
    const elapsed = Math.floor((now - session.startTime) / 1000);
    return {
      ...session,
      currentDuration: session.duration + elapsed,
    };
  },
});

export const getTotalProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const completedSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_completed", (q) => q.eq("userId", userId).eq("isCompleted", true))
      .collect();

    const totalSeconds = completedSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = totalSeconds / 3600;
    const progressPercentage = (totalHours / 10000) * 100;
    const remainingHours = Math.max(0, 10000 - totalHours);

    return {
      totalHours,
      totalSeconds,
      progressPercentage,
      remainingHours,
      sessionCount: completedSessions.length,
    };
  },
});

export const getTodayProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const today = new Date().toISOString().split('T')[0];
    const progress = await ctx.db
      .query("dailyProgress")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .unique();

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const dailyGoalHours = settings?.dailyGoalHours || 4;
    const dailyGoalSeconds = dailyGoalHours * 3600;

    if (!progress) {
      return {
        totalSeconds: 0,
        totalHours: 0,
        sessionCount: 0,
        dailyGoalHours,
        progressPercentage: 0,
        goalAchieved: false,
      };
    }

    return {
      totalSeconds: progress.totalSeconds,
      totalHours: progress.totalSeconds / 3600,
      sessionCount: progress.sessionCount,
      dailyGoalHours,
      progressPercentage: (progress.totalSeconds / dailyGoalSeconds) * 100,
      goalAchieved: progress.goalAchieved,
    };
  },
});

export const getWeeklyStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_completed", (q) => q.eq("userId", userId).eq("isCompleted", true))
      .filter((q) => q.gte(q.field("startTime"), weekAgo.getTime()))
      .collect();

    const totalSeconds = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = totalSeconds / 3600;
    const dailyAverage = totalHours / 7;

    return {
      totalHours,
      dailyAverage,
      sessionCount: sessions.length,
    };
  },
});

export const getMonthlyStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_and_completed", (q) => q.eq("userId", userId).eq("isCompleted", true))
      .filter((q) => q.gte(q.field("startTime"), monthAgo.getTime()))
      .collect();

    const totalSeconds = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = totalSeconds / 3600;
    const dailyAverage = totalHours / 30;

    return {
      totalHours,
      dailyAverage,
      sessionCount: sessions.length,
    };
  },
});

export const getStreak = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    return await calculateStreak(ctx, userId);
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("leaderboard")
      .withIndex("by_total_hours")
      .order("desc")
      .take(10);
  },
});

export const getUserActivities = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("activities")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
