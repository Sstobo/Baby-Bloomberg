import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { rateLimiter } from "../rateLimits";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("FINNHUB_API_KEY not set");
  return key;
}

async function finnhubFetch(path: string) {
  const url = `${FINNHUB_BASE}${path}&token=${getApiKey()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const fetchQuote = internalAction({
  args: { symbol: v.string() },
  returns: v.null(),
  handler: async (ctx, { symbol }) => {
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "finnhubApi", {
      key: "global",
    });
    if (!ok)
      throw new Error(
        `Finnhub rate limited. Retry in ${Math.ceil(retryAfter / 1000)}s`
      );

    const data = await finnhubFetch(`/quote?symbol=${encodeURIComponent(symbol)}`);

    if (!data || data.c === 0) return null;

    await ctx.scheduler.runAfter(0, internal.market.quotes.storeQuote, {
      symbol,
      price: data.c ?? 0,
      change: data.d ?? 0,
      changePercent: data.dp ?? 0,
      high: data.h ?? 0,
      low: data.l ?? 0,
      open: data.o ?? 0,
      prevClose: data.pc ?? 0,
      volume: 0,
    });

    return null;
  },
});

export const fetchProfile = internalAction({
  args: { symbol: v.string() },
  returns: v.null(),
  handler: async (ctx, { symbol }) => {
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "finnhubApi", {
      key: "global",
    });
    if (!ok)
      throw new Error(
        `Finnhub rate limited. Retry in ${Math.ceil(retryAfter / 1000)}s`
      );

    const data = await finnhubFetch(
      `/stock/profile2?symbol=${encodeURIComponent(symbol)}`
    );

    if (!data || !data.name) return null;

    await ctx.scheduler.runAfter(0, internal.market.profiles.storeProfile, {
      symbol,
      name: data.name ?? symbol,
      sector: data.finnhubIndustry ?? undefined,
      industry: data.finnhubIndustry ?? undefined,
      exchange: data.exchange ?? undefined,
      country: data.country ?? undefined,
      logo: data.logo ?? undefined,
      weburl: data.weburl ?? undefined,
      marketCap: data.marketCapitalization
        ? data.marketCapitalization * 1_000_000
        : undefined,
    });

    return null;
  },
});

export const fetchCandles = internalAction({
  args: {
    symbol: v.string(),
    resolution: v.string(),
    from: v.number(),
    to: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { symbol, resolution, from, to }) => {
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "finnhubApi", {
      key: "global",
    });
    if (!ok)
      throw new Error(
        `Finnhub rate limited. Retry in ${Math.ceil(retryAfter / 1000)}s`
      );

    const data = await finnhubFetch(
      `/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}`
    );

    if (!data || data.s !== "ok") return null;

    const bars = [];
    for (let i = 0; i < data.t.length; i++) {
      bars.push({
        time: data.t[i],
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
      });
    }

    await ctx.scheduler.runAfter(0, internal.market.historical.storeBars, {
      symbol,
      resolution,
      bars: JSON.stringify(bars),
      fromTimestamp: from,
      toTimestamp: to,
    });

    return null;
  },
});

export const fetchCompanyNews = internalAction({
  args: { symbol: v.string() },
  returns: v.null(),
  handler: async (ctx, { symbol }) => {
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "finnhubApi", {
      key: "global",
    });
    if (!ok)
      throw new Error(
        `Finnhub rate limited. Retry in ${Math.ceil(retryAfter / 1000)}s`
      );

    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const data = await finnhubFetch(
      `/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}`
    );

    if (!Array.isArray(data)) return null;

    const profile = await finnhubFetch(
      `/stock/profile2?symbol=${encodeURIComponent(symbol)}`
    );
    const companyName = (profile?.name ?? "").toLowerCase();
    const symLower = symbol.toLowerCase();

    const relevant = data.filter((article: { headline?: string; summary?: string }) => {
      const headline = (article.headline ?? "").toLowerCase();
      const summary = (article.summary ?? "").toLowerCase();
      return (
        headline.includes(symLower) ||
        summary.includes(symLower) ||
        (companyName && headline.includes(companyName)) ||
        (companyName && summary.includes(companyName))
      );
    });

    for (const article of relevant.slice(0, 30)) {
      await ctx.scheduler.runAfter(0, internal.market.news.storeArticle, {
        externalId: String(article.id),
        symbol,
        headline: article.headline ?? "",
        summary: article.summary ?? undefined,
        source: article.source ?? "",
        url: article.url ?? "",
        publishedAt: (article.datetime ?? 0) * 1000,
        category: undefined,
      });
    }

    return null;
  },
});

export const fetchMarketNews = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "finnhubApi", {
      key: "global",
    });
    if (!ok)
      throw new Error(
        `Finnhub rate limited. Retry in ${Math.ceil(retryAfter / 1000)}s`
      );

    const data = await finnhubFetch(`/news?category=general`);

    if (!Array.isArray(data)) return null;

    for (const article of data.slice(0, 50)) {
      await ctx.scheduler.runAfter(0, internal.market.news.storeArticle, {
        externalId: String(article.id),
        symbol: "__MARKET__",
        headline: article.headline ?? "",
        summary: article.summary ?? undefined,
        source: article.source ?? "",
        url: article.url ?? "",
        publishedAt: (article.datetime ?? 0) * 1000,
        category: article.category ?? undefined,
      });
    }

    return null;
  },
});

export const searchTickers = internalAction({
  args: { query: v.string() },
  returns: v.array(
    v.object({
      symbol: v.string(),
      description: v.string(),
      type: v.string(),
    })
  ),
  handler: async (ctx, { query }) => {
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "finnhubApi", {
      key: "global",
    });
    if (!ok)
      throw new Error(
        `Finnhub rate limited. Retry in ${Math.ceil(retryAfter / 1000)}s`
      );

    const data = await finnhubFetch(
      `/search?q=${encodeURIComponent(query)}`
    );

    if (!data || !data.result) return [];

    return data.result
      .filter(
        (r: { type: string }) =>
          r.type === "Common Stock" || r.type === "ETP" || r.type === "ADR"
      )
      .slice(0, 10)
      .map((r: { symbol: string; description: string; type: string }) => ({
        symbol: r.symbol,
        description: r.description,
        type: r.type,
      }));
  },
});
