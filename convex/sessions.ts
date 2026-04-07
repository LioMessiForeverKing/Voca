import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const analysisValidator = v.object({
  fileName: v.string(),
  duration: v.number(),
  sampleRate: v.number(),
  rmsDb: v.number(),
  peakDb: v.number(),
  dynamicRange: v.number(),
  bands: v.array(
    v.object({
      name: v.string(),
      low: v.number(),
      high: v.number(),
      pct: v.number(),
    })
  ),
});

export const createSession = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.insert("sessions", {
      createdAt: Date.now(),
    });
  },
});

export const getSession = query({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateVocalAnalysis = mutation({
  args: {
    id: v.id("sessions"),
    analysis: analysisValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { vocalAnalysis: args.analysis });
  },
});

export const updateTrackAnalysis = mutation({
  args: {
    id: v.id("sessions"),
    analysis: analysisValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { trackAnalysis: args.analysis });
  },
});
