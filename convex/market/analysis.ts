import { v } from "convex/values";
import { generateText } from "ai";
import { action, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { chatGoogleFlash } from "../model";

export const analyzeArticle = action({
  args: {
    articleId: v.id("newsArticles"),
    url: v.string(),
    headline: v.string(),
    symbol: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlKey) throw new Error("FIRECRAWL_API_KEY env var not set");

    const response = await fetch(
      `https://api.firecrawl.dev/v1/scrape`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firecrawlKey}`,
        },
        body: JSON.stringify({
          url: args.url,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Scrape failed: ${response.status}`);
    }

    const data = await response.json();
    const markdown = data.data?.markdown ?? "";

    if (!markdown) {
      throw new Error("No content could be extracted from the article");
    }

    const truncated = markdown.slice(0, 12000);

    const { text } = await generateText({
      model: chatGoogleFlash,
      system: `You are a Bloomberg terminal analyst. Return ONLY plain text, no markdown, no bold, no headers, no bullet points.

Format exactly:
Sentiment: [Bullish/Bearish/Neutral] | Impact: [High/Medium/Low]
[3-5 sentences analyzing what happened, why it matters for ${args.symbol}, the likely price direction and magnitude, and any broader market implications.]

No disclaimers. Plain text only.`,
      prompt: `"${args.headline}"\n\n${truncated}`,
    });

    await ctx.scheduler.runAfter(0, internal.market.analysis.saveAnalysis, {
      articleId: args.articleId,
      analysis: text,
    });

    return null;
  },
});

export const generateReport = action({
  args: {
    symbol: v.string(),
    analyses: v.array(
      v.object({
        headline: v.string(),
        analysis: v.string(),
      })
    ),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    const items = args.analyses
      .map((a, i) => `[${i + 1}] "${a.headline}"\n${a.analysis}`)
      .join("\n\n");

    const { text } = await generateText({
      model: chatGoogleFlash,
      system: `You are a Bloomberg terminal senior analyst writing an intelligence brief for ${args.symbol}. Return ONLY plain text, no markdown, no bold, no headers, no bullet points, no numbering.

Write a 4-8 sentence executive summary that synthesizes ALL the analyses below into one cohesive overview. Cover: overall sentiment direction, the key catalysts driving the stock, any conflicting signals, and the near-term outlook. Be direct and opinionated like an Axios Pro newsletter. No disclaimers.`,
      prompt: items,
    });

    return text;
  },
});

export const saveAnalysis = internalMutation({
  args: {
    articleId: v.id("newsArticles"),
    analysis: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { articleId, analysis }) => {
    await ctx.db.patch(articleId, { analysis });
    return null;
  },
});
