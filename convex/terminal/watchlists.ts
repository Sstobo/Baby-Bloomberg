import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { watchlistValidator } from "../validators";

const LOCAL_USER = "local";
const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "SPY"];

export const getDefault = query({
  args: {},
  returns: v.union(v.null(), watchlistValidator),
  handler: async (ctx) => {
    return await ctx.db
      .query("watchlists")
      .withIndex("by_userId_default", (q) =>
        q.eq("userId", LOCAL_USER).eq("isDefault", true)
      )
      .unique();
  },
});

export const ensureDefault = mutation({
  args: {},
  returns: watchlistValidator,
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("watchlists")
      .withIndex("by_userId_default", (q) =>
        q.eq("userId", LOCAL_USER).eq("isDefault", true)
      )
      .unique();

    if (existing) return existing;

    const id = await ctx.db.insert("watchlists", {
      userId: LOCAL_USER,
      name: "Default",
      symbols: DEFAULT_SYMBOLS,
      isDefault: true,
      sortOrder: 0,
    });
    return (await ctx.db.get(id))!;
  },
});

export const addSymbol = mutation({
  args: { symbol: v.string() },
  returns: v.null(),
  handler: async (ctx, { symbol }) => {
    const watchlist = await ctx.db
      .query("watchlists")
      .withIndex("by_userId_default", (q) =>
        q.eq("userId", LOCAL_USER).eq("isDefault", true)
      )
      .unique();

    if (!watchlist) return null;
    if (watchlist.symbols.includes(symbol.toUpperCase())) return null;

    await ctx.db.patch(watchlist._id, {
      symbols: [...watchlist.symbols, symbol.toUpperCase()],
    });
    return null;
  },
});

export const removeSymbol = mutation({
  args: { symbol: v.string() },
  returns: v.null(),
  handler: async (ctx, { symbol }) => {
    const watchlist = await ctx.db
      .query("watchlists")
      .withIndex("by_userId_default", (q) =>
        q.eq("userId", LOCAL_USER).eq("isDefault", true)
      )
      .unique();

    if (!watchlist) return null;

    await ctx.db.patch(watchlist._id, {
      symbols: watchlist.symbols.filter((s) => s !== symbol),
    });
    return null;
  },
});
