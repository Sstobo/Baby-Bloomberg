import { v } from "convex/values";
import { query, mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { secFilingValidator } from "../validators";

const FILINGS_STALE_MS = 5 * 60 * 1000;

export const getFilings = query({
  args: { symbol: v.string() },
  returns: v.array(secFilingValidator),
  handler: async (ctx, { symbol }) => {
    return await ctx.db
      .query("secFilings")
      .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
      .order("desc")
      .take(20);
  },
});

export const storeFiling = internalMutation({
  args: {
    symbol: v.string(),
    accessionNumber: v.string(),
    form: v.string(),
    fileDate: v.string(),
    periodEnding: v.string(),
    description: v.string(),
    url: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("secFilings")
      .withIndex("by_accession", (q) =>
        q.eq("accessionNumber", args.accessionNumber)
      )
      .unique();

    if (existing) return null;
    await ctx.db.insert("secFilings", { ...args, updatedAt: Date.now() });
    return null;
  },
});

export const requestFilings = mutation({
  args: { symbol: v.string() },
  returns: v.null(),
  handler: async (ctx, { symbol }) => {
    const latest = await ctx.db
      .query("secFilings")
      .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
      .order("desc")
      .first();

    if (latest && Date.now() - latest.updatedAt < FILINGS_STALE_MS) {
      return null;
    }

    await ctx.scheduler.runAfter(
      0,
      internal.market.edgar.fetchFilings,
      { symbol, sinceDays: 10 }
    );
    return null;
  },
});

export const refreshFilings = mutation({
  args: { symbol: v.string() },
  returns: v.null(),
  handler: async (ctx, { symbol }) => {
    await ctx.scheduler.runAfter(
      0,
      internal.market.edgar.fetchFilings,
      { symbol, sinceDays: 10 }
    );
    return null;
  },
});

export const clearFilings = mutation({
  args: { symbol: v.string() },
  returns: v.null(),
  handler: async (ctx, { symbol }) => {
    const filings = await ctx.db
      .query("secFilings")
      .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
      .collect();

    for (const filing of filings) {
      await ctx.db.delete(filing._id);
    }
    return null;
  },
});
