import { v } from "convex/values";
import { query, mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { historicalBarsValidator } from "../validators";

const BARS_STALE_MS = 5 * 60 * 1000;

export const getBars = query({
  args: { symbol: v.string(), resolution: v.string() },
  returns: v.union(v.null(), historicalBarsValidator),
  handler: async (ctx, { symbol, resolution }) => {
    return await ctx.db
      .query("historicalBars")
      .withIndex("by_symbol_resolution", (q) =>
        q.eq("symbol", symbol).eq("resolution", resolution)
      )
      .unique();
  },
});

export const storeBars = internalMutation({
  args: {
    symbol: v.string(),
    resolution: v.string(),
    bars: v.string(),
    fromTimestamp: v.number(),
    toTimestamp: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("historicalBars")
      .withIndex("by_symbol_resolution", (q) =>
        q.eq("symbol", args.symbol).eq("resolution", args.resolution)
      )
      .unique();

    const data = { ...args, updatedAt: Date.now() };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("historicalBars", data);
    }
    return null;
  },
});

export const requestBars = mutation({
  args: {
    symbol: v.string(),
    resolution: v.string(),
    from: v.number(),
    to: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { symbol, resolution, from, to }) => {
    const existing = await ctx.db
      .query("historicalBars")
      .withIndex("by_symbol_resolution", (q) =>
        q.eq("symbol", symbol).eq("resolution", resolution)
      )
      .unique();

    if (existing && Date.now() - existing.updatedAt < BARS_STALE_MS) {
      return null;
    }

    await ctx.scheduler.runAfter(0, internal.market.finnhub.fetchCandles, {
      symbol,
      resolution,
      from,
      to,
    });
    return null;
  },
});
