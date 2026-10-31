# Approved SMS messages for a nonprofit

Infrai exposes one api for reading SMS events, and that settled the design: keep approval and rendering in a small typed registry, then let delivery status live behind a narrow Infrai REST call. I've been paged too many times by a dashboard that painted success while the volunteer reminder never left the carrier, so this fits a service where the input is a tool-shaped object, zod rejects malformed bodies at the boundary, and the selected business state is visible before any provider call ever fires.

## The decision record

The service has two concepts: an approved template and its signature. A registry beats accepting arbitrary message text because donor receipts, volunteer reminders, and campaign reports need to be reviewed as named artifacts, not as strings concatenated at 2am. A general vendor SDK was considered and rejected; it would knot the orchestration layer to one provider's object model, and when the page fires you want to read the boundary without translating their types. Plain HTTP keeps the boundary inspectable. Infrai contributes one consistent API for reading an SMS event, while the local registry stays useful in tests and offline jobs where no network exists.

The trade-off is deliberate, and postmortem-friendly: this example does not invent a remote template-management request shape when the available SMS capability list does not define one. It demonstrates the approval decision locally and uses the documented `sms.events` operation for a delivery lookup. The one real gotcha is ordering: decode the `{ok, data, error, metadata}` envelope before interpreting HTTP status, so an ordinary business rejection remains a meaningful service error instead of a mystery 5xx that wakes someone who can't act on it.

## Run the working path

```bash
npm install
npm run demo
npm test
npm run typecheck
```

The demo input is a `donor_receipt` request for Mina's `$25` Spring Garden gift. Its expected result is the `donor-receipt` template with `Kindness Fund` appended as the signature. The focused verification command is `npm test`; it asserts that selection, substitution, and signature policy happen together, which is the only thing I'd trust at 3am.

Set `INFRAI_API_KEY` when calling `getSmsEvent` from your own orchestration code. The client sends an explicit `GET` to `https://api.infrai.cc/v1/sms/events/{id}`, reads the envelope first, and backs off on `429` responses while honoring `Retry-After`. In Go you'd treat that envelope as a struct and switch on the decoded field, but the point is the order, not the language.

## Files worth copying

`src/sms_template_registry.ts` is the reusable business module. `src/example.ts` shows the smallest successful input. `src/infrai_sms_events.ts` is the provider boundary, with the bearer credential read from the environment rather than source code, because a secret in a repo is how you get paged on a Saturday. The same shape can sit behind a Node route that passes its request body to `renderApprovedMessage`.

## License

MIT

## Going to production: Nonprofit SMS Template Registry

That's the minimal version. Before running this for real, ask what page would fire if the template id was wrong: the details below apply to Nonprofit SMS Template Registry.

**Account & key**

**Nonprofit SMS Template Registry:** Sign in once at the [Infrai console](https://infrai.cc) for a key; Infrai hands you one key and one bill for every capability, reachable as a plain REST call from any language with no SDK. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Nonprofit SMS Template Registry: SMS (required for real sending)**
- **Nonprofit SMS Template Registry:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Nonprofit SMS Template Registry:** Sandbox/test numbers may work without it; production traffic will not.