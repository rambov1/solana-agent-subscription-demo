# Northstar Crypto Filing Radar Subscription Demo

This repository is a compact TypeScript code sample for Solana Native
Subscriptions and Allowances. It demonstrates how a data provider can expose
recurring USDC access to a crypto filing radar API for wallets, dashboards, and
AI-agent workflows.

The scenario is intentionally practical:

- A merchant publishes a `10 USDC / 30 day` subscription plan.
- A subscriber wallet accepts the plan terms for a data product.
- A whitelisted puller collects the recurring payment each billing cycle.
- The subscriber keeps cancellation and revocation control.
- Existing subscribers keep their accepted terms even if the merchant later
  updates the plan metadata or moves new buyers to a different plan.

The sample uses the current published `@solana/subscriptions` TypeScript SDK
and Solana USDC mint:

- Program: `De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44`
- USDC mint: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- Reference product sample:
  `https://pay.sivut.co/api/public-data/sec-crypto-filings/sample?limit=3`

## Why This Use Case

Subscriptions and allowances are a strong fit for paid API access because they
avoid manual invoices, card rails, prepaid dashboards, and custody-heavy API key
balances. A wallet or agent can subscribe once, keep a predictable USDC budget,
and let a merchant or approved puller collect only what the onchain plan allows.

The demo frames that around a Canadian-relevant market-data workflow: a filing
radar for crypto issuers, miners, treasury companies, ETFs, and public market
events. Canadian public-market crypto names such as Bitfarms, Hut 8, WonderFi,
and Sol Strategies are the kinds of entities a buyer-side research desk or
agent workflow might monitor with a recurring data subscription.

## Install

```bash
npm install
```

## Run The Demo

```bash
npm run demo
```

The demo prints the derived plan PDA, subscription authority PDA, subscription
delegation PDA, token accounts, and a three-instruction sequence:

1. Merchant creates the plan.
2. Subscriber accepts the plan.
3. Authorized puller collects the subscription payment.

This repository uses no-op signers so the instruction shape can be inspected
safely. A production integration would replace those signers with wallet
adapter, server wallet, or hardware-backed signers and then send the
instructions through a Solana RPC client.

## Test

```bash
npm test
```

The tests verify:

- The plan amount is exactly `10 USDC`.
- The billing cadence is `720` hours.
- Program-derived addresses are deterministic.
- The create, subscribe, and collect instructions all include accounts and
  instruction data.
- The safety model covers cancellation, whitelisted pullers, and period limits.

## Files

- `src/config.ts` defines the plan, merchant wallet, sample subscriber wallet,
  puller, mint, and units.
- `src/subscriptionDemo.ts` derives PDAs and builds the instruction sequence.
- `src/cli.ts` prints the demo output.
- `tests/subscriptionDemo.test.ts` verifies the plan and instruction sequence.

## Safety Model

The native subscription program uses a subscription authority PDA for each
`(user, mint)` pair. That authority becomes the token account delegate, but it
can only move funds when a valid delegation PDA authorizes the transfer. For
subscription plans, the merchant publishes fixed terms and the subscriber
accepts a snapshot of those terms. Pulls are limited by the plan amount, billing
period, destinations, and puller allowlist.

This design gives API providers recurring revenue while preserving user
controls:

- The subscriber signs setup and cancellation.
- The merchant cannot silently change the price for existing subscribers.
- Collection requires the plan owner or a whitelisted puller.
- Rent can be recovered when delegations are closed.

## Sources

- Solana announcement:
  `https://solana.com/news/subscriptions-and-allowances`
- Solana subscription plan docs:
  `https://solana.com/docs/payments/subscriptions/subscription-plan`
- Program and SDK:
  `https://github.com/solana-foundation/subscriptions`
- Chainstack walkthrough:
  `https://docs.chainstack.com/docs/solana-subscriptions-and-allowances`
