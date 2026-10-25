import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { reels, catalog } from "./reels.js";

const {
  PAY_TO,
  PORT = 4021,
  FACILITATOR_URL = "https://x402.org/facilitator",
  NETWORK = "eip155:84532", // Base Sepolia testnet
} = process.env;

// Prices ("coins" dropped into the Bioscope), in USD, settled in USDC.
export const PRICES = { peek: "$0.001", reel: "$0.004" };

const accept = (price) => [{ scheme: "exact", price, network: NETWORK, payTo: PAY_TO }];

export function createApp() {
  const app = express();
  const facilitator = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
  const resourceServer = new x402ResourceServer(facilitator).register(NETWORK, new ExactEvmScheme());

  // Routes listed here answer HTTP 402 until a valid x402 payment is attached.
  app.use(
    paymentMiddleware(
      {
        "GET /api/peek": {
          accepts: accept(PRICES.peek),
          description: "Peek at ONE frame of a reel. Query: ?reel=<id>&frame=<n>",
          mimeType: "application/json",
        },
        "GET /api/reel": {
          accepts: accept(PRICES.reel),
          description: "Watch the ENTIRE reel (cheaper than peeking every frame). Query: ?reel=<id>",
          mimeType: "application/json",
        },
      },
      resourceServer
    )
  );

  // ---- Free routes ----
  app.use(express.static(fileURLToPath(new URL("../public", import.meta.url))));
  app.get("/api/catalog", (_req, res) => res.json({ prices: PRICES, reels: catalog }));
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // ---- Paid routes (reached only after a valid payment) ----
  app.get("/api/peek", (req, res) => {
    const reel = reels[req.query.reel];
    const n = Number(req.query.frame ?? 0);
    if (!reel || !Number.isInteger(n) || n < 0 || n >= reel.frames.length) {
      return res.status(404).json({ error: "No such reel or frame" });
    }
    res.json({ reel: req.query.reel, title: reel.title, frame: n, of: reel.frames.length, scene: reel.frames[n] });
  });

  app.get("/api/reel", (req, res) => {
    const reel = reels[req.query.reel];
    if (!reel) return res.status(404).json({ error: "No such reel" });
    res.json({ reel: req.query.reel, title: reel.title, frames: reel.frames });
  });

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!PAY_TO) {
    console.error("Set PAY_TO in .env (your wallet address). See .env.example");
    process.exit(1);
  }
  createApp().listen(PORT, () => console.log(`Bioscope open on http://localhost:${PORT} (network ${NETWORK})`));
}
