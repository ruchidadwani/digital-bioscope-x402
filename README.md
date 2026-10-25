# Digital Bioscope: pay-per-call with x402

Travelling melas had the Bioscope: drop a coin, peer through the eyepiece, watch a reel. This project rebuilds that on the web with **HTTP 402 Payment Required** and the **x402** protocol. Every "peek" is a paid API call settled in USDC on Base Sepolia (testnet).

## How it works

1. A client requests a paid route, for example `GET /api/peek?reel=taj-mahal&frame=0`.
2. The server replies `402 Payment Required` with the price and payment options.
3. The client signs a payment (the coin) and retries the request with a payment header.
4. The x402 facilitator verifies and settles it, and the server returns the frame.

| Route | Price | What you get |
|---|---|---|
| `GET /api/catalog` | free | Reels and prices |
| `GET /api/peek?reel=&frame=` | $0.001 | One frame |
| `GET /api/reel?reel=` | $0.004 | Whole reel (cheaper than peeking every frame) |

The per-frame versus whole-reel pricing is the pay-per-request design point: visitors pay only for what they view.

## Run it

Requires Node.js 18+ and two Base Sepolia wallets (a seller address and a buyer funded with testnet USDC from the Circle faucet).

```bash
npm install
cp .env.example .env     # set PAY_TO and BUYER_PRIVATE_KEY (testnet only)
npm start                # terminal 1: server on :4021
npm run watch            # terminal 2: buys frames one by one
npm run watch -- mela-night reel   # buy a whole reel
```

Open `http://localhost:4021` for the catalog page. Calling a paid route in a browser shows the 402 response.

## Structure

```
src/server.js   Express + @x402/express paymentMiddleware
src/client.js   @x402/fetch client that pays automatically on 402
src/reels.js    Reel content
public/         Free landing page
test/           Data tests (npm test)
```

## Security notes

- Never commit `.env`. Use a throwaway testnet key for the buyer.
- Switch `NETWORK` and `FACILITATOR_URL` only after reading the x402 mainnet docs.

## Stack

Node.js, Express, `@x402/core`, `@x402/express`, `@x402/evm`, `@x402/fetch`, viem.
