import { v } from "convex/values";
import { query, mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { companyProfileValidator } from "../validators";

const PROFILE_STALE_MS = 24 * 60 * 60 * 1000;

export const getProfile = query({
  args: { symbol: v.string() },
  returns: v.union(v.null(), companyProfileValidator),
  handler: async (ctx, { symbol }) => {
    return await ctx.db
      .query("companyProfiles")
      .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
      .unique();
  },
});

export const storeProfile = internalMutation({
  args: {
    symbol: v.string(),
    name: v.string(),
    sector: v.optional(v.string()),
    industry: v.optional(v.string()),
    exchange: v.optional(v.string()),
    country: v.optional(v.string()),
    logo: v.optional(v.string()),
    weburl: v.optional(v.string()),
    marketCap: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("companyProfiles")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .unique();

    const data = { ...args, updatedAt: Date.now() };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("companyProfiles", data);
    }
    return null;
  },
});

export const requestProfile = mutation({
  args: { symbol: v.string() },
  returns: v.null(),
  handler: async (ctx, { symbol }) => {
    const existing = await ctx.db
      .query("companyProfiles")
      .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
      .unique();

    if (existing && Date.now() - existing.updatedAt < PROFILE_STALE_MS) {
      return null;
    }

    await ctx.scheduler.runAfter(0, internal.market.finnhub.fetchProfile, {
      symbol,
    });
    return null;
  },
});
