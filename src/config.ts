import { address, type Address } from "@solana/kit";

export const SOLANA_USDC_MINT = address(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

export const SIVUT_MERCHANT_WALLET = address(
  "4kRQGA5ciAXNSiDNo3nVQYRM5SSCCRwUw8boAV1xRPSM"
);

export const SAMPLE_AGENT_WALLET = address(
  "6XhMBYYM2DHwY5pX5kF94XfJ4zJdY4XvYB9eeyR8imkK"
);

export const SAMPLE_PULLER_WALLET = address(
  "8pM1DN3RiT8vbom5h9S2RiYkXfsgu9BfrtTRPxebMZtG"
);

export const USDC_DECIMALS = 6n;
export const ONE_USDC = 10n ** USDC_DECIMALS;

export type DataSubscriptionPlan = {
  planId: bigint;
  name: string;
  tokenMint: Address;
  amount: bigint;
  periodHours: bigint;
  metadataUri: string;
  merchant: Address;
  pullers: Address[];
  destinations: Address[];
};

export const NORTHSTAR_CRYPTO_DATA_PLAN: DataSubscriptionPlan = {
  planId: 20260610n,
  name: "Northstar Crypto Filing Radar",
  tokenMint: SOLANA_USDC_MINT,
  amount: 10n * ONE_USDC,
  periodHours: 24n * 30n,
  metadataUri:
    "https://pay.sivut.co/api/public-data/sec-crypto-filings/sample?limit=3",
  merchant: SIVUT_MERCHANT_WALLET,
  pullers: [SAMPLE_PULLER_WALLET],
  destinations: [SIVUT_MERCHANT_WALLET]
};
