import { action } from "../_generated/server";
import { v } from "convex/values";

export const checkApiKeys = action({
  args: {},
  returns: v.object({
    finnhub: v.boolean(),
    fmp: v.boolean(),
    firecrawl: v.boolean(),
    google: v.boolean(),
  }),
  handler: async () => {
    return {
      finnhub: !!process.env.FINNHUB_API_KEY,
      fmp: !!process.env.FMP_API_KEY,
      firecrawl: !!process.env.FIRECRAWL_API_KEY,
      google: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    };
  },
});
