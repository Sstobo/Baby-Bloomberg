import { v } from "convex/values";

export const quoteValidator = v.object({
  _id: v.id("quotes"),
  _creationTime: v.number(),
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
});

export const companyProfileValidator = v.object({
  _id: v.id("companyProfiles"),
  _creationTime: v.number(),
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
});

export const historicalBarsValidator = v.object({
  _id: v.id("historicalBars"),
  _creationTime: v.number(),
  symbol: v.string(),
  resolution: v.string(),
  bars: v.string(),
  fromTimestamp: v.number(),
  toTimestamp: v.number(),
  updatedAt: v.number(),
});

export const watchlistValidator = v.object({
  _id: v.id("watchlists"),
  _creationTime: v.number(),
  userId: v.string(),
  name: v.string(),
  symbols: v.array(v.string()),
  isDefault: v.boolean(),
  sortOrder: v.number(),
});

export const searchResultValidator = v.object({
  symbol: v.string(),
  description: v.string(),
  type: v.string(),
});

export const newsArticleValidator = v.object({
  _id: v.id("newsArticles"),
  _creationTime: v.number(),
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
});

export const secFilingValidator = v.object({
  _id: v.id("secFilings"),
  _creationTime: v.number(),
  symbol: v.string(),
  accessionNumber: v.string(),
  form: v.string(),
  fileDate: v.string(),
  periodEnding: v.string(),
  description: v.string(),
  url: v.string(),
  updatedAt: v.number(),
  analysis: v.optional(v.string()),
});

export const statementTypeValidator = v.union(
  v.literal("income"),
  v.literal("balance_sheet"),
  v.literal("cash_flow")
);

export const periodValidator = v.union(
  v.literal("annual"),
  v.literal("quarterly")
);

export const cikMappingValidator = v.object({
  _id: v.id("cikMappings"),
  _creationTime: v.number(),
  symbol: v.string(),
  cik: v.string(),
  updatedAt: v.number(),
});

export const financialStatementValidator = v.object({
  _id: v.id("financialStatements"),
  _creationTime: v.number(),
  symbol: v.string(),
  statementType: v.union(
    v.literal("income"),
    v.literal("balance_sheet"),
    v.literal("cash_flow")
  ),
  period: v.union(v.literal("annual"), v.literal("quarterly")),
  data: v.string(),
  updatedAt: v.number(),
});
