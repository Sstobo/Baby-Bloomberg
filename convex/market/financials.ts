import { v } from "convex/values";
import { query, mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import {
  financialStatementValidator,
  statementTypeValidator,
  periodValidator,
} from "../validators";

const FINANCIALS_STALE_MS = 24 * 60 * 60 * 1000;

export const getStatement = query({
  args: {
    symbol: v.string(),
    statementType: statementTypeValidator,
    period: periodValidator,
  },
  returns: v.union(v.null(), financialStatementValidator),
  handler: async (ctx, { symbol, statementType, period }) => {
    return await ctx.db
      .query("financialStatements")
      .withIndex("by_symbol_type_period", (q) =>
        q
          .eq("symbol", symbol)
          .eq("statementType", statementType)
          .eq("period", period)
      )
      .unique();
  },
});

export const storeStatement = internalMutation({
  args: {
    symbol: v.string(),
    statementType: statementTypeValidator,
    period: periodValidator,
    data: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("financialStatements")
      .withIndex("by_symbol_type_period", (q) =>
        q
          .eq("symbol", args.symbol)
          .eq("statementType", args.statementType)
          .eq("period", args.period)
      )
      .unique();

    const doc = { ...args, updatedAt: Date.now() };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
    } else {
      await ctx.db.insert("financialStatements", doc);
    }
    return null;
  },
});

export const requestStatement = mutation({
  args: {
    symbol: v.string(),
    statementType: statementTypeValidator,
    period: periodValidator,
  },
  returns: v.null(),
  handler: async (ctx, { symbol, statementType, period }) => {
    const existing = await ctx.db
      .query("financialStatements")
      .withIndex("by_symbol_type_period", (q) =>
        q
          .eq("symbol", symbol)
          .eq("statementType", statementType)
          .eq("period", period)
      )
      .unique();

    if (existing && Date.now() - existing.updatedAt < FINANCIALS_STALE_MS) {
      return null;
    }

    await ctx.scheduler.runAfter(
      0,
      internal.market.fmp.fetchFinancialStatement,
      { symbol, statementType, period }
    );
    return null;
  },
});
