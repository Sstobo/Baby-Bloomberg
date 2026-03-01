import { v } from "convex/values";
import { internalAction, internalQuery, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

const USER_AGENT = "BabyBloomberg/1.0 (terminal@example.com)";
const TICKERS_URL = "https://www.sec.gov/files/company_tickers.json";
const SUBMISSIONS_URL = "https://data.sec.gov/submissions";
const ARCHIVES_URL = "https://www.sec.gov/Archives/edgar/data";
const TARGET_FORMS = new Set(["10-K", "10-Q", "8-K", "DEF 14A"]);
const MAX_FILINGS = 30;
const CIK_STALE_MS = 30 * 24 * 60 * 60 * 1000;

export const getCachedCik = internalQuery({
  args: { symbol: v.string() },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, { symbol }) => {
    const mapping = await ctx.db
      .query("cikMappings")
      .withIndex("by_symbol", (q) => q.eq("symbol", symbol.toUpperCase()))
      .unique();
    if (!mapping) return null;
    if (Date.now() - mapping.updatedAt > CIK_STALE_MS) return null;
    return mapping.cik;
  },
});

export const saveCikMapping = internalMutation({
  args: { symbol: v.string(), cik: v.string() },
  returns: v.null(),
  handler: async (ctx, { symbol, cik }) => {
    const upper = symbol.toUpperCase();
    const existing = await ctx.db
      .query("cikMappings")
      .withIndex("by_symbol", (q) => q.eq("symbol", upper))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { cik, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("cikMappings", { symbol: upper, cik, updatedAt: Date.now() });
    }
    return null;
  },
});

async function fetchCikFromSec(ticker: string): Promise<string | null> {
  const res = await fetch(TICKERS_URL, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) return null;

  const data = await res.json() as Record<string, { cik_str: number; ticker: string }>;
  const upper = ticker.toUpperCase();
  for (const entry of Object.values(data)) {
    if (entry.ticker === upper) {
      return String(entry.cik_str);
    }
  }
  return null;
}

export const fetchFilings = internalAction({
  args: { symbol: v.string(), sinceDays: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, { symbol, sinceDays }) => {
    let cik = await ctx.runQuery(internal.market.edgar.getCachedCik, { symbol });

    if (!cik) {
      cik = await fetchCikFromSec(symbol);
      if (!cik) return null;
      await ctx.runMutation(internal.market.edgar.saveCikMapping, { symbol, cik });
    }

    const paddedCik = cik.padStart(10, "0");
    const res = await fetch(`${SUBMISSIONS_URL}/CIK${paddedCik}.json`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) return null;

    const data = await res.json() as {
      filings: {
        recent: {
          accessionNumber: string[];
          filingDate: string[];
          reportDate: string[];
          form: string[];
          primaryDocument: string[];
          primaryDocDescription: string[];
        };
      };
    };

    const recent = data.filings.recent;
    let stored = 0;

    const cutoffDate = sinceDays
      ? new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : null;

    for (let i = 0; i < recent.form.length && stored < MAX_FILINGS; i++) {
      if (!TARGET_FORMS.has(recent.form[i])) continue;
      if (cutoffDate && recent.filingDate[i] < cutoffDate) continue;

      const accession = recent.accessionNumber[i];
      const accessionNoDashes = accession.replace(/-/g, "");
      const primaryDoc = recent.primaryDocument[i];
      const filingUrl = `${ARCHIVES_URL}/${cik}/${accessionNoDashes}/${primaryDoc}`;

      await ctx.scheduler.runAfter(0, internal.market.filings.storeFiling, {
        symbol,
        accessionNumber: accession,
        form: recent.form[i],
        fileDate: recent.filingDate[i],
        periodEnding: recent.reportDate[i] ?? recent.filingDate[i],
        description: recent.primaryDocDescription[i] || recent.form[i],
        url: filingUrl,
      });

      stored++;
    }

    return null;
  },
});
