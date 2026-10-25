// The visitor: drops coins (USDC micro-payments) automatically when the server replies 402.
import "dotenv/config";
import { x402Client, wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const { BUYER_PRIVATE_KEY, SERVER_URL = "http://localhost:4021" } = process.env;
if (!BUYER_PRIVATE_KEY) {
  console.error("Set BUYER_PRIVATE_KEY (testnet only!) in .env");
  process.exit(1);
}

const client = new x402Client();
registerExactEvmScheme(client, { signer: privateKeyToAccount(BUYER_PRIVATE_KEY) });
const paidFetch = wrapFetchWithPayment(fetch, client);
const httpClient = new x402HTTPClient(client);



async function paid(path) {
  const res = await paidFetch(`${SERVER_URL}${path}`);
  if (!res.ok) {
    const hdr = res.headers.get("payment-required");
    if (hdr) {
      const decoded = JSON.parse(Buffer.from(hdr, "base64").toString());
      console.error("Payment rejected:", decoded.error ?? decoded);
    }
    throw new Error(`${res.status} ${await res.text()}`);
  }
  try {
    const receipt = httpClient.getPaymentSettleResponse((h) => res.headers.get(h));
    console.log(`  coin settled, tx: ${receipt.transaction}`);
  } catch { /* receipt header absent */ }
  return res.json();
}

const reelId = process.argv[2] ?? "taj-mahal";
const mode = process.argv[3] ?? "peek"; // "peek" = frame by frame, "reel" = whole film

const cat = await (await fetch(`${SERVER_URL}/api/catalog`)).json();
console.log("Prices:", cat.prices);

if (mode === "reel") {
  const { title, frames } = await paid(`/api/reel?reel=${reelId}`);
  console.log(`\n== ${title} ==`);
  frames.forEach((f) => console.log(`\n${f}`));
} else {
  const info = cat.reels.find((r) => r.id === reelId);
  if (!info) throw new Error(`Unknown reel: ${reelId}`);
  for (let i = 0; i < info.frames; i++) {
    const { scene, title } = await paid(`/api/peek?reel=${reelId}&frame=${i}`);
    if (i === 0) console.log(`\n== ${title} ==`);
    console.log(`\n${scene}`);
  }
}
