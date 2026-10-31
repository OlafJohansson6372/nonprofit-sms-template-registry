import assert from "node:assert/strict";
import test from "node:test";
import { renderApprovedMessage } from "./sms_template_registry.ts";

test("a donor receipt selects the approved template and appends its signature", () => {
  const result = renderApprovedMessage({
    kind: "donor_receipt",
    recipient: "+15550100",
    values: { donor: "Mina", campaign: "Spring Garden", amount: "$25" },
  });
  assert.deepEqual(result, {
    to: "+15550100",
    template: "donor-receipt",
    text: "Thank you, Mina. Your Spring Garden gift of $25 was received. Kindness Fund",
  });
});
