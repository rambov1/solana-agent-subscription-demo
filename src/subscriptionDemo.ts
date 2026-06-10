import {
  address,
  createNoopSigner,
  type Address,
  type Instruction
} from "@solana/kit";
import {
  findAssociatedTokenPda,
  TOKEN_PROGRAM_ADDRESS
} from "@solana-program/token";
import {
  findPlanPda,
  findSubscriptionAuthorityPda,
  findSubscriptionDelegationPda,
  getCreatePlanOverlayInstructionAsync,
  getSubscribeOverlayInstructionAsync,
  getTransferSubscriptionOverlayInstructionAsync,
  SUBSCRIPTIONS_PROGRAM_ADDRESS
} from "@solana/subscriptions";
import {
  NORTHSTAR_CRYPTO_DATA_PLAN,
  SAMPLE_AGENT_WALLET,
  type DataSubscriptionPlan
} from "./config.js";

export type DemoAddresses = {
  program: Address;
  mint: Address;
  merchant: Address;
  subscriber: Address;
  puller: Address;
  planPda: Address;
  subscriptionAuthorityPda: Address;
  subscriptionPda: Address;
  subscriberAta: Address;
  receiverAta: Address;
};

export type DemoInstructionSummary = {
  label: string;
  programAddress: Address;
  accountCount: number;
  dataBytes: number;
};

export type DemoBuild = {
  plan: DataSubscriptionPlan;
  addresses: DemoAddresses;
  instructions: DemoInstructionSummary[];
  safetyModel: string[];
};

export async function deriveDemoAddresses(
  plan: DataSubscriptionPlan = NORTHSTAR_CRYPTO_DATA_PLAN,
  subscriber: Address = SAMPLE_AGENT_WALLET
): Promise<DemoAddresses> {
  const [planPda] = await findPlanPda({
    owner: plan.merchant,
    planId: plan.planId
  });
  const [subscriptionAuthorityPda] = await findSubscriptionAuthorityPda({
    user: subscriber,
    tokenMint: plan.tokenMint
  });
  const [subscriptionPda] = await findSubscriptionDelegationPda({
    planPda,
    subscriber
  });
  const [subscriberAta] = await findAssociatedTokenPda({
    mint: plan.tokenMint,
    owner: subscriber,
    tokenProgram: TOKEN_PROGRAM_ADDRESS
  });
  const [receiverAta] = await findAssociatedTokenPda({
    mint: plan.tokenMint,
    owner: plan.merchant,
    tokenProgram: TOKEN_PROGRAM_ADDRESS
  });

  return {
    program: SUBSCRIPTIONS_PROGRAM_ADDRESS,
    mint: plan.tokenMint,
    merchant: plan.merchant,
    subscriber,
    puller: plan.pullers[0] ?? plan.merchant,
    planPda: address(planPda),
    subscriptionAuthorityPda: address(subscriptionAuthorityPda),
    subscriptionPda: address(subscriptionPda),
    subscriberAta: address(subscriberAta),
    receiverAta: address(receiverAta)
  };
}

export async function buildDemoInstructions(
  plan: DataSubscriptionPlan = NORTHSTAR_CRYPTO_DATA_PLAN,
  subscriber: Address = SAMPLE_AGENT_WALLET
): Promise<DemoBuild> {
  const addresses = await deriveDemoAddresses(plan, subscriber);
  const merchantSigner = createNoopSigner(plan.merchant);
  const subscriberSigner = createNoopSigner(subscriber);
  const pullerSigner = createNoopSigner(addresses.puller);

  const createPlanInstruction = await getCreatePlanOverlayInstructionAsync({
    owner: merchantSigner,
    planId: plan.planId,
    mint: plan.tokenMint,
    amount: plan.amount,
    periodHours: plan.periodHours,
    endTs: 0n,
    destinations: plan.destinations,
    pullers: plan.pullers,
    metadataUri: plan.metadataUri,
    tokenProgram: TOKEN_PROGRAM_ADDRESS
  });

  const subscribeInstruction = await getSubscribeOverlayInstructionAsync({
    merchant: plan.merchant,
    planId: plan.planId,
    tokenMint: plan.tokenMint,
    subscriber: subscriberSigner,
    expectedAmount: plan.amount,
    expectedPeriodHours: plan.periodHours,
    expectedCreatedAt: 0n,
    expectedSubscriptionAuthorityInitId: 0n
  });

  const collectInstruction = await getTransferSubscriptionOverlayInstructionAsync(
    {
      amount: plan.amount,
      caller: pullerSigner,
      delegator: subscriber,
      tokenMint: plan.tokenMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
      planPda: addresses.planPda,
      subscriptionPda: addresses.subscriptionPda,
      receiverAta: addresses.receiverAta
    }
  );

  return {
    plan,
    addresses,
    instructions: [
      summarizeInstruction("merchant creates plan", createPlanInstruction),
      summarizeInstruction("agent subscribes", subscribeInstruction),
      summarizeInstruction("authorized puller collects", collectInstruction)
    ],
    safetyModel: [
      "The subscriber signs setup and can cancel the subscription delegation.",
      "The merchant cannot change amount or cadence for an existing subscriber.",
      "Only the merchant or a whitelisted puller can collect from the plan.",
      "Each transfer is bounded by the plan amount and billing period."
    ]
  };
}

function summarizeInstruction(
  label: string,
  instruction: Instruction
): DemoInstructionSummary {
  return {
    label,
    programAddress: instruction.programAddress,
    accountCount: instruction.accounts?.length ?? 0,
    dataBytes: instruction.data?.byteLength ?? 0
  };
}
