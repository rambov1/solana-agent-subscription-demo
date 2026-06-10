import {
  NORTHSTAR_CRYPTO_DATA_PLAN,
  ONE_USDC,
  SAMPLE_AGENT_WALLET,
  SIVUT_MERCHANT_WALLET,
  SOLANA_USDC_MINT
} from "../src/config.js";
import {
  buildDemoInstructions,
  deriveDemoAddresses
} from "../src/subscriptionDemo.js";

describe("Northstar Solana subscription demo", () => {
  it("defines a practical recurring USDC data plan", () => {
    expect(NORTHSTAR_CRYPTO_DATA_PLAN.amount).toBe(10n * ONE_USDC);
    expect(NORTHSTAR_CRYPTO_DATA_PLAN.periodHours).toBe(720n);
    expect(NORTHSTAR_CRYPTO_DATA_PLAN.tokenMint).toBe(SOLANA_USDC_MINT);
    expect(NORTHSTAR_CRYPTO_DATA_PLAN.destinations).toEqual([
      SIVUT_MERCHANT_WALLET
    ]);
  });

  it("derives stable addresses from public inputs", async () => {
    const first = await deriveDemoAddresses();
    const second = await deriveDemoAddresses();

    expect(first).toEqual(second);
    expect(first.merchant).toBe(SIVUT_MERCHANT_WALLET);
    expect(first.subscriber).toBe(SAMPLE_AGENT_WALLET);
    expect(first.planPda).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
    expect(first.subscriptionPda).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
  });

  it("builds the create, subscribe, and collect instruction sequence", async () => {
    const demo = await buildDemoInstructions();

    expect(demo.instructions.map((instruction) => instruction.label)).toEqual([
      "merchant creates plan",
      "agent subscribes",
      "authorized puller collects"
    ]);
    expect(demo.instructions.every((instruction) => instruction.dataBytes > 0))
      .toBe(true);
    expect(demo.instructions.every((instruction) => instruction.accountCount > 0))
      .toBe(true);
  });

  it("states the core subscription safety invariants", async () => {
    const demo = await buildDemoInstructions();

    expect(demo.safetyModel.join(" ")).toContain("cancel");
    expect(demo.safetyModel.join(" ")).toContain("whitelisted puller");
    expect(demo.safetyModel.join(" ")).toContain("billing period");
  });
});
