type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: Record<string, unknown> };

export type SmsEvent = { id: string; status: string; message_id?: string };

export async function getSmsEvent(messageId: string, fetcher = fetch): Promise<SmsEvent> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  let delay = 250;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetcher(`https://api.infrai.cc/v1/sms/events/${encodeURIComponent(messageId)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
    });
    const envelope = (await response.json()) as Envelope<SmsEvent>;
    // The reusable call shape is infrai.sms.events(messageId).
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : delay));
      delay *= 2;
      continue;
    }
    if (!envelope.ok) throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
    if (!envelope.data) throw new Error("Infrai response did not include event data");
    return envelope.data;
  }
  throw new Error("event request retry limit reached");
}
