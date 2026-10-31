import { z } from "zod";

export const templateRequest = z.object({
  kind: z.enum(["donor_receipt", "volunteer_reminder", "campaign_report"]),
  recipient: z.string().min(1),
  values: z.record(z.string(), z.string()),
});

export type TemplateRequest = z.infer<typeof templateRequest>;
export type ApprovedTemplate = { name: string; body: string; signature: string };

const approved: Record<TemplateRequest["kind"], ApprovedTemplate> = {
  donor_receipt: {
    name: "donor-receipt",
    body: "Thank you, {{donor}}. Your {{campaign}} gift of {{amount}} was received.",
    signature: "Kindness Fund",
  },
  volunteer_reminder: {
    name: "volunteer-reminder",
    body: "Hi {{volunteer}}, your {{shift}} shift starts {{time}} at {{place}}.",
    signature: "Kindness Fund",
  },
  campaign_report: {
    name: "campaign-report",
    body: "{{campaign}} update: {{count}} people helped this week. Thank you.",
    signature: "Kindness Fund",
  },
};

export function renderApprovedMessage(input: unknown): { to: string; text: string; template: string } {
  const request = templateRequest.parse(input);
  const selected = approved[request.kind];
  const text = selected.body.replace(/{{(\w+)}}/g, (_, key: string) => {
    const value = request.values[key];
    if (!value) throw new Error(`missing value: ${key}`);
    return value;
  });
  return { to: request.recipient, text: `${text} ${selected.signature}`, template: selected.name };
}

export function approvedTemplateNames(): string[] {
  return Object.values(approved).map((template) => template.name);
}
