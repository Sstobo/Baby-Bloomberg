import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { rateLimiter } from "../rateLimits";
import { statementTypeValidator, periodValidator } from "../validators";

const FMP_BASE = "https://financialmodelingprep.com/stable";

function getApiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY not set");
  return key;
}

const STATEMENT_PATHS = {
  income: "income-statement",
  balance_sheet: "balance-sheet-statement",
  cash_flow: "cash-flow-statement",
} as const;

export const fetchFinancialStatement = internalAction({
  args: {
    symbol: v.string(),
    statementType: statementTypeValidator,
    period: periodValidator,
  },
  returns: v.null(),
  handler: async (ctx, { symbol, statementType, period }) => {
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "fmpApi", {
      key: "global",
    });
    if (!ok)
      throw new Error(
        `FMP rate limited. Retry in ${Math.ceil(retryAfter / 1000)}s`
      );

    const path = STATEMENT_PATHS[statementType];
    const url = `${FMP_BASE}/${path}?symbol=${encodeURIComponent(symbol)}&period=${period}&limit=5&apikey=${getApiKey()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FMP error: ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data)) return null;

    await ctx.scheduler.runAfter(
      0,
      internal.market.financials.storeStatement,
      {
        symbol,
        statementType,
        period,
        data: JSON.stringify(data),
      }
    );

    return null;
  },
});
