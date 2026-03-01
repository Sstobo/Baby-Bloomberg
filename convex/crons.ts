import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "refresh-quotes",
  { seconds: 30 },
  internal.market.quotes.refreshActiveQuotes
);

crons.interval(
  "refresh-market-news",
  { minutes: 5 },
  internal.market.news.refreshMarketNews
);

export default crons;
