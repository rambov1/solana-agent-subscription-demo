import { buildDemoInstructions } from "./subscriptionDemo.js";

const demo = await buildDemoInstructions();

console.log(
  JSON.stringify(
    {
      plan: {
        name: demo.plan.name,
        amountUsdc: Number(demo.plan.amount) / 1_000_000,
        periodHours: demo.plan.periodHours.toString(),
        metadataUri: demo.plan.metadataUri
      },
      addresses: demo.addresses,
      instructions: demo.instructions,
      safetyModel: demo.safetyModel
    },
    null,
    2
  )
);
