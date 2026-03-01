import { v } from "convex/values";
import { generateText } from "ai";
import { action, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { chatGoogleFlash } from "../model";

export const analyzeFiling = action({
  args: {
    filingId: v.id("secFilings"),
    url: v.string(),
    form: v.string(),
    description: v.string(),
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
      throw new Error("No content could be extracted from the filing");
    }

    const truncated = markdown.slice(0, 12000);

    const { text } = await generateText({
      model: chatGoogleFlash,
      system: `You are a Bloomberg terminal analyst specializing in SEC filings. Return ONLY plain text, no markdown, no bold, no headers, no bullet points.

Format exactly:
Sentiment: [Bullish/Bearish/Neutral] | Impact: [High/Medium/Low]
[3-5 sentences analyzing the key takeaways from this ${args.form} filing for ${args.symbol}. Focus on material events, financial changes, risk factors, or governance actions. Skip boilerplate legalese. Identify what actually matters for investors and the likely market reaction.]

No disclaimers. Plain text only.`,
      prompt: `${args.form}: "${args.description}"\n\n${truncated}`,
    });

    await ctx.scheduler.runAfter(0, internal.market.filingAnalysis.saveFilingAnalysis, {
      filingId: args.filingId,
      analysis: text,
    });

    return null;
  },
});

export const saveFilingAnalysis = internalMutation({
  args: {
    filingId: v.id("secFilings"),
    analysis: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { filingId, analysis }) => {
    await ctx.db.patch(filingId, { analysis });
    return null;
  },
});
