import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { rateLimiter } from "../rateLimits";
import { statementTypeValidator, periodValidator } from "../validators";

const FMP_STABLE_BASE = "https://financialmodelingprep.com/stable";
const FMP_V3_BASE = "https://financialmodelingprep.com/api/v3";

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

async function fetchStatement(
  symbol: string,
  statementType: keyof typeof STATEMENT_PATHS,
  period: "annual" | "quarterly"
): Promise<Array<Record<string, unknown>> | null> {
  const path = STATEMENT_PATHS[statementType];
  const apiKey = getApiKey();

  const stableUrl =
    `${FMP_STABLE_BASE}/${path}` +
    `?symbol=${encodeURIComponent(symbol)}&period=${period}&limit=5&apikey=${apiKey}`;
  const stableRes = await fetch(stableUrl);

  // FMP can return 402/403 for plan-restricted endpoints on some keys. Try v3.
  if (stableRes.status === 402 || stableRes.status === 403) {
    const v3Url =
      `${FMP_V3_BASE}/${path}/${encodeURIComponent(symbol)}` +
      `?period=${period}&limit=5&apikey=${apiKey}`;
    const v3Res = await fetch(v3Url);
    if (!v3Res.ok) {
      if (v3Res.status === 402 || v3Res.status === 403) {
        console.warn(
          `FMP financial statements unavailable for ${symbol} (${statementType}/${period}): ${v3Res.status}`
        );
        return null;
      }
      throw new Error(`FMP error: ${v3Res.status}`);
    }
    const v3Data: unknown = await v3Res.json();
    return Array.isArray(v3Data)
      ? (v3Data as Array<Record<string, unknown>>)
      : null;
  }

  if (!stableRes.ok) throw new Error(`FMP error: ${stableRes.status}`);
  const stableData: unknown = await stableRes.json();
  return Array.isArray(stableData)
    ? (stableData as Array<Record<string, unknown>>)
    : null;
}

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

    const data = await fetchStatement(symbol, statementType, period);
    if (!data) return null;

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
