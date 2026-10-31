import { renderApprovedMessage } from "./sms_template_registry.ts";

const message = renderApprovedMessage({
  kind: "donor_receipt",
  recipient: "+15550100",
  values: { donor: "Mina", campaign: "Spring Garden", amount: "$25" },
});

console.log(JSON.stringify(message, null, 2));
