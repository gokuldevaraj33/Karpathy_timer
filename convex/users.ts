import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate a random username
function generateRandomUsername(): string {
  const adjectives = [
    "Swift", "Bright", "Clever", "Bold", "Wise", "Quick", "Sharp", "Cool",
    "Epic", "Mighty", "Noble", "Brave", "Smart", "Fast", "Strong", "Keen"
  ];
  
  const nouns = [
    "Coder", "Builder", "Maker", "Creator", "Learner", "Thinker", "Dreamer",
    "Artist", "Writer", "Player", "Master", "Expert", "Ninja", "Wizard", "Hero"
  ];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  
  return `${adjective}${noun}${number}`;
}

export const initializeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Only initialize if user doesn't have a name
    if (!user.name) {
      const randomUsername = generateRandomUsername();
      await ctx.db.patch(userId, {
        name: randomUsername,
      });
    }
  },
});

export const updateUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const trimmedUsername = args.username.trim();
    if (!trimmedUsername) {
      throw new Error("Username cannot be empty");
    }

    if (trimmedUsername.length < 2) {
      throw new Error("Username must be at least 2 characters long");
    }

    if (trimmedUsername.length > 30) {
      throw new Error("Username must be less than 30 characters long");
    }

    // Check if username is already taken
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), trimmedUsername))
      .first();

    if (existingUser && existingUser._id !== userId) {
      throw new Error("Username is already taken");
    }

    await ctx.db.patch(userId, {
      name: trimmedUsername,
    });

    // Update leaderboard entry if it exists
    const leaderboardEntry = await ctx.db
      .query("leaderboard")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (leaderboardEntry) {
      await ctx.db.patch(leaderboardEntry._id, {
        userName: trimmedUsername,
      });
    }
  },
});

export const updateSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    duration: v.number(),
    isPaused: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // ...existing code...
  },
});
