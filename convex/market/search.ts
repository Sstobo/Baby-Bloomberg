import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { searchResultValidator } from "../validators";

type SearchResult = { symbol: string; description: string; type: string };

export const search = action({
  args: { query: v.string() },
  returns: v.array(searchResultValidator),
  handler: async (ctx, { query }): Promise<SearchResult[]> => {
    if (query.trim().length === 0) return [];
    return await ctx.runAction(internal.market.finnhub.searchTickers, {
      query,
    });
  },
});
