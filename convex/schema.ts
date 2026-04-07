import { defineSchema, defineTable } from "convex/server";
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

export default defineSchema({
  sessions: defineTable({
    createdAt: v.number(),
    vocalAnalysis: v.optional(analysisValidator),
    trackAnalysis: v.optional(analysisValidator),
  }),

  messages: defineTable({
    sessionId: v.id("sessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),
});
