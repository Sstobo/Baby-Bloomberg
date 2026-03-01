import { v } from "convex/values";
import { query, mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { newsArticleValidator } from "../validators";

const NEWS_STALE_MS = 5 * 60 * 1000;

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export const getCompanyNews = query({
  args: { symbol: v.string() },
  returns: v.array(newsArticleValidator),
  handler: async (ctx, { symbol }) => {
    const cutoff = Date.now() - THREE_DAYS_MS;
    const all = await ctx.db
      .query("newsArticles")
      .withIndex("by_symbol", (q) =>
        q.eq("symbol", symbol).gte("publishedAt", cutoff)
      )
      .order("desc")
      .take(50);
    return all.filter((a) => !a.archived);
  },
});

export const getMarketNews = query({
  args: {},
  returns: v.array(newsArticleValidator),
  handler: async (ctx) => {
    return await ctx.db
      .query("newsArticles")
      .withIndex("by_symbol", (q) => q.eq("symbol", "__MARKET__"))
      .order("desc")
      .take(50);
  },
});

export const storeArticle = internalMutation({
  args: {
    externalId: v.string(),
    symbol: v.string(),
    headline: v.string(),
    summary: v.optional(v.string()),
    source: v.string(),
    url: v.string(),
    publishedAt: v.number(),
    category: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("newsArticles")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();

    if (existing) return null;
    await ctx.db.insert("newsArticles", { ...args, archived: false });
    return null;
  },
});

export const getWatchlistNews = query({
  args: { symbols: v.array(v.string()) },
  returns: v.array(newsArticleValidator),
  handler: async (ctx, { symbols }) => {
    const allArticles = [];
    for (const symbol of symbols) {
      const articles = await ctx.db
        .query("newsArticles")
        .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
        .order("desc")
        .take(10);
      allArticles.push(...articles);
    }
    allArticles.sort((a, b) => b.publishedAt - a.publishedAt);
    return allArticles.slice(0, 100);
  },
});

export const requestWatchlistNews = mutation({
  args: { symbols: v.array(v.string()) },
  returns: v.null(),
  handler: async (ctx, { symbols }) => {
    for (const symbol of symbols) {
      const latest = await ctx.db
        .query("newsArticles")
        .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
        .order("desc")
        .first();

      if (latest && Date.now() - latest._creationTime < NEWS_STALE_MS) {
        continue;
      }

      await ctx.scheduler.runAfter(
        0,
        internal.market.finnhub.fetchCompanyNews,
        { symbol }
      );
    }
    return null;
  },
});

export const requestCompanyNews = mutation({
  args: { symbol: v.string(), force: v.optional(v.boolean()) },
  returns: v.null(),
  handler: async (ctx, { symbol, force }) => {
    if (!force) {
      const latest = await ctx.db
        .query("newsArticles")
        .withIndex("by_symbol", (q) => q.eq("symbol", symbol))
        .order("desc")
        .first();

      if (latest && Date.now() - latest._creationTime < NEWS_STALE_MS) {
        return null;
      }
    }

    await ctx.scheduler.runAfter(
      0,
      internal.market.finnhub.fetchCompanyNews,
      { symbol }
    );
    return null;
  },
});

export const deleteArticle = mutation({
  args: { id: v.id("newsArticles") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { archived: true });
    return null;
  },
});

export const deleteOlderThan = mutation({
  args: { olderThanMs: v.number() },
  returns: v.number(),
  handler: async (ctx, { olderThanMs }) => {
    const cutoff = Date.now() - olderThanMs;
    const articles = await ctx.db
      .query("newsArticles")
      .withIndex("by_publishedAt")
      .collect();
    let count = 0;
    for (const article of articles) {
      if (article.publishedAt < cutoff && !article.archived) {
        await ctx.db.patch(article._id, { archived: true });
        count++;
      }
    }
    return count;
  },
});

export const deleteAll = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const articles = await ctx.db.query("newsArticles").collect();
    let count = 0;
    for (const article of articles) {
      if (!article.archived) {
        await ctx.db.patch(article._id, { archived: true });
        count++;
      }
    }
    return count;
  },
});

export const refreshMarketNews = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(
      0,
      internal.market.finnhub.fetchMarketNews,
      {}
    );
    return null;
  },
});
