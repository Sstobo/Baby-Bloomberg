import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  quotes: defineTable({
    symbol: v.string(),
    price: v.number(),
    change: v.number(),
    changePercent: v.number(),
    high: v.number(),
    low: v.number(),
    open: v.number(),
    prevClose: v.number(),
    volume: v.number(),
    updatedAt: v.number(),
  })
    .index("by_symbol", ["symbol"])
    .index("by_updatedAt", ["updatedAt"]),

  companyProfiles: defineTable({
    symbol: v.string(),
    name: v.string(),
    sector: v.optional(v.string()),
    industry: v.optional(v.string()),
    exchange: v.optional(v.string()),
    country: v.optional(v.string()),
    logo: v.optional(v.string()),
    weburl: v.optional(v.string()),
    marketCap: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_symbol", ["symbol"]),

  historicalBars: defineTable({
    symbol: v.string(),
    resolution: v.string(),
    bars: v.string(),
    fromTimestamp: v.number(),
    toTimestamp: v.number(),
    updatedAt: v.number(),
  }).index("by_symbol_resolution", ["symbol", "resolution"]),

  watchlists: defineTable({
    userId: v.string(),
    name: v.string(),
    symbols: v.array(v.string()),
    isDefault: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_default", ["userId", "isDefault"]),

  newsArticles: defineTable({
    externalId: v.string(),
    symbol: v.string(),
    headline: v.string(),
    summary: v.optional(v.string()),
    source: v.string(),
    url: v.string(),
    publishedAt: v.number(),
    category: v.optional(v.string()),
    analysis: v.optional(v.string()),
    archived: v.optional(v.boolean()),
  })
    .index("by_symbol", ["symbol", "publishedAt"])
    .index("by_externalId", ["externalId"])
    .index("by_publishedAt", ["publishedAt"]),

  secFilings: defineTable({
    symbol: v.string(),
    accessionNumber: v.string(),
    form: v.string(),
    fileDate: v.string(),
    periodEnding: v.string(),
    description: v.string(),
    url: v.string(),
    updatedAt: v.number(),
    analysis: v.optional(v.string()),
  })
    .index("by_symbol", ["symbol", "fileDate"])
    .index("by_accession", ["accessionNumber"]),

  cikMappings: defineTable({
    symbol: v.string(),
    cik: v.string(),
    updatedAt: v.number(),
  }).index("by_symbol", ["symbol"]),

  financialStatements: defineTable({
    symbol: v.string(),
    statementType: v.union(
      v.literal("income"),
      v.literal("balance_sheet"),
      v.literal("cash_flow")
    ),
    period: v.union(v.literal("annual"), v.literal("quarterly")),
    data: v.string(),
    updatedAt: v.number(),
  }).index("by_symbol_type_period", ["symbol", "statementType", "period"]),
});
