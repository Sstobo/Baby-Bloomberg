import { v } from "convex/values";
import { query, mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { quoteValidator } from "../validators";

const QUOTE_STALE_MS = 30_000;

export const getQuote = query({
  args: { symbol: v.string() },
  returns: v.union(v.null(), quoteValidator),
  handler: async (ctx, { symbol }) => {
    return await ctx.db
      .query("quotes")
      .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
      .unique();
  },
});

export const getQuotes = query({
  args: { symbols: v.array(v.string()) },
  returns: v.array(quoteValidator),
  handler: async (ctx, { symbols }) => {
    const results = [];
    for (const symbol of symbols) {
      const quote = await ctx.db
        .query("quotes")
        .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
        .unique();
      if (quote) results.push(quote);
    }
    return results;
  },
});

export const storeQuote = internalMutation({
  args: {
    symbol: v.string(),
    price: v.number(),
    change: v.number(),
    changePercent: v.number(),
    high: v.number(),
    low: v.number(),
    open: v.number(),
    prevClose: v.number(),
    volume: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("quotes")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .unique();

    const data = { ...args, updatedAt: Date.now() };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("quotes", data);
    }
    return null;
  },
});

export const requestQuote = mutation({
  args: { symbol: v.string() },
  returns: v.null(),
  handler: async (ctx, { symbol }) => {
    const existing = await ctx.db
      .query("quotes")
      .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
      .unique();

    if (existing && Date.now() - existing.updatedAt < QUOTE_STALE_MS) {
      return null;
    }

    await ctx.scheduler.runAfter(0, internal.market.finnhub.fetchQuote, {
      symbol,
    });
    return null;
  },
});

export const refreshActiveQuotes = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const watchlists = await ctx.db.query("watchlists").collect();

    const symbolSet = new Set<string>();
    for (const wl of watchlists) {
      for (const s of wl.symbols) {
        symbolSet.add(s);
      }
    }

    for (const symbol of symbolSet) {
      const existing = await ctx.db
        .query("quotes")
        .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
        .unique();

      if (!existing || Date.now() - existing.updatedAt >= QUOTE_STALE_MS) {
        await ctx.scheduler.runAfter(0, internal.market.finnhub.fetchQuote, {
          symbol,
        });
      }
    }
    return null;
  },
});
