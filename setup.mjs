import { execSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { existsSync, readFileSync, appendFileSync } from "node:fs";
import { stdin, stdout } from "node:process";

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

console.log("");
console.log(`${BOLD}  Baby Bloomberg Setup${RESET}`);
console.log(`${DIM}  ─────────────────────${RESET}`);
console.log("");

// ── Check prerequisites ──────────────────────────────────────────────

console.log(`${BOLD}  Checking prerequisites...${RESET}`);
console.log("");

const nodeVersion = process.versions.node;
const nodeMajor = parseInt(nodeVersion.split(".")[0], 10);
if (nodeMajor < 20) {
  console.log(`  ${YELLOW}\u2717${RESET} Node.js v${nodeVersion} found — v20+ required. Install from https://nodejs.org/`);
  process.exit(1);
}
console.log(`  ${GREEN}\u2713${RESET} Node.js v${nodeVersion}`);

try {
  execSync("pnpm --version", { stdio: "ignore" });
  console.log(`  ${GREEN}\u2713${RESET} pnpm found`);
} catch {
  console.log(`  ${YELLOW}\u2717${RESET} pnpm is not installed. Install with: npm install -g pnpm`);
  process.exit(1);
}

console.log("");

// ── Install dependencies ─────────────────────────────────────────────

if (!existsSync("node_modules")) {
  console.log(`${BOLD}  Installing dependencies...${RESET}`);
  console.log("");
  execSync("pnpm install", { stdio: "inherit" });
  console.log("");
} else {
  console.log(`  ${GREEN}\u2713${RESET} Dependencies already installed`);
  console.log("");
}

// ── Convex setup ─────────────────────────────────────────────────────

console.log(`${BOLD}  Setting up Convex...${RESET}`);
console.log("");
console.log(`  This will walk you through Convex account creation, project setup,`);
console.log(`  and schema deployment. Follow the interactive prompts.`);
console.log("");

try {
  execSync("npx convex dev --once", { stdio: "inherit" });
  console.log("");
  console.log(`  ${GREEN}\u2713${RESET} Convex setup complete`);
} catch {
  console.log("");
  console.log(`  ${YELLOW}\u2717${RESET} Convex setup failed — you can retry with: npx convex dev --once`);
}

console.log("");

// ── Ensure .env.local has VITE_CONVEX_URL ────────────────────────────

let hasConvexUrl = false;
if (existsSync(".env.local")) {
  const content = readFileSync(".env.local", "utf-8");
  hasConvexUrl = content.includes("VITE_CONVEX_URL=");
}

if (!hasConvexUrl) {
  console.log(`  ${DIM}\u2192 VITE_CONVEX_URL not found in .env.local, fetching...${RESET}`);
  try {
    const url = execSync("npx convex url", { encoding: "utf-8" }).trim();
    if (url) {
      appendFileSync(".env.local", `${existsSync(".env.local") ? "\n" : ""}VITE_CONVEX_URL=${url}\n`);
      console.log(`  ${GREEN}\u2713${RESET} Added VITE_CONVEX_URL to .env.local`);
    }
  } catch {
    console.log(`  ${YELLOW}\u2717${RESET} Could not get Convex URL. Add VITE_CONVEX_URL to .env.local manually.`);
  }
  console.log("");
} else {
  console.log(`  ${GREEN}\u2713${RESET} .env.local has VITE_CONVEX_URL`);
  console.log("");
}

// ── API Keys ─────────────────────────────────────────────────────────

console.log(`${BOLD}  Backend API Keys${RESET}`);
console.log("");
console.log(`  These are set on your Convex deployment (not in .env.local).`);
console.log(`  Press Enter to skip any key — you can always add it later.`);
console.log("");

const rl = createInterface({ input: stdin, output: stdout });

const apiKeys = [
  {
    key: "FINNHUB_API_KEY",
    label: "Finnhub \u2014 stock quotes, news, charts",
    url: "https://finnhub.io/register",
    required: true,
  },
  {
    key: "FMP_API_KEY",
    label: "Financial Modeling Prep \u2014 financial statements, profiles",
    url: "https://site.financialmodelingprep.com/register",
    required: true,
  },
  {
    key: "FIRECRAWL_API_KEY",
    label: "Firecrawl \u2014 web scraping for AI analysis",
    url: "https://www.firecrawl.dev/app/sign-up",
    required: false,
  },
  {
    key: "GOOGLE_GENERATIVE_AI_API_KEY",
    label: "Google AI \u2014 Gemini LLM for analysis",
    url: "https://aistudio.google.com/apikey",
    required: false,
  },
];

for (const { key, label, url, required } of apiKeys) {
  const tag = required
    ? `${YELLOW}(required)${RESET}`
    : `${DIM}(optional)${RESET}`;
  console.log(`  ${BOLD}${label}${RESET} ${tag}`);
  console.log(`  ${DIM}Sign up at: ${CYAN}${url}${RESET}`);

  const value = await rl.question(`  ${key}: `);
  console.log("");

  if (value.trim()) {
    try {
      execSync(`npx convex env set ${key} ${value.trim()}`, { stdio: "ignore" });
      console.log(`  ${GREEN}\u2713${RESET} ${key} set`);
    } catch {
      console.log(`  ${YELLOW}\u2717${RESET} Failed to set ${key} \u2014 make sure Convex is configured`);
    }
  } else {
    console.log(`  ${DIM}  Skipped${RESET}`);
  }
  console.log("");
}

rl.close();

// ── Done ─────────────────────────────────────────────────────────────

console.log(`${BOLD}  ─────────────────────${RESET}`);
console.log("");
console.log(`  ${GREEN}Setup complete!${RESET}`);
console.log("");
console.log(`  Start the app with:`);
console.log("");
console.log(`    ${CYAN}pnpm dev${RESET}`);
console.log("");
console.log(`  Then open ${CYAN}http://localhost:3000${RESET}`);
console.log("");
