import { RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

const DAY = 24 * 60 * 60 * 1000;

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  finnhubApi: {
    kind: "fixed window",
    rate: 55,
    period: 60_000,
  },
  fmpApi: {
    kind: "fixed window",
    rate: 240,
    period: DAY,
  },
});
