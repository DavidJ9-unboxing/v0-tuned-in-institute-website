# Brief: Put Business Associate Agreements in place for the Tuned In Institute platform

**Prepared:** 7 September 2026, for Claude Cowork, on behalf of David (owner) and Sophie (CEO, Rooted Rhythm).
**Context doc:** `docs/remi-privacy-and-hipaa-assessment.md` in this repo — read §3 and Priority 3 first.

## Why this matters

Rooted Rhythm is a paediatric therapy practice that takes insurance, so it is almost certainly a HIPAA covered entity. The Tuned In Institute platform holds ~640 client records and runs Remi, an AI assistant that staff use daily for case reviews, parent handouts, client emails and intake screening. Clinical detail about named children flows through Remi routinely.

Every third-party vendor that touches that data needs a signed Business Associate Agreement (BAA). Today none are signed. This brief gets them signed, or gets the vendor removed.

**Most of this work is not code.** It is checking plan tiers, clicking "accept BAA" in vendor dashboards, and one vendor swap. Sophie must be the signatory. You research, draft, and prepare; she signs.

## Vendors, verified 7 Sep 2026

| Vendor | What it receives | BAA position | Action |
| --- | --- | --- | --- |
| **Neon** (Postgres) | All 640 client records, at rest | Available **only on the Scale plan**. Accepted in-console under organisation settings. Free/Launch plans must not hold PHI. Currently free of charge; Neon reserves a possible 15% surcharge with notice. | Confirm current plan. Upgrade to Scale if needed. Accept BAA in console. |
| **Vercel** (hosting, logs, AI Gateway) | Every request; Remi conversation content in transit | BAA available on **Pro and Enterprise**. | Confirm the team is on Pro. Request BAA via Vercel dashboard / support. |
| **OpenAI** (`openai/gpt-5.4-mini` via Vercel AI Gateway) | Remi conversation content | Covered by the Vercel BAA **only if** requests route through a provider with a verified zero-data-retention agreement. **Tested 7 Sep 2026: Remi's traffic currently goes to OpenAI direct, which is NOT in the Gateway's ZDR set. With `zeroDataRetention: true` the same model routes via Azure OpenAI, which IS.** | Code change, one line — see "Code changes" below. v0 can ship this. |
| **Resend** (transactional email) | Member email addresses; welcome emails also contain the member's name and a temporary password | **Resend does not sign BAAs.** Full stop. | **Replace it.** See "Resend replacement" below. |
| **PostHog** (product analytics) | Since 24 Aug 2026: opaque user IDs and page URLs only. No names, emails, or reset tokens. | BAA on **Boost, Scale or Enterprise** plans; there is a BAA generator in the account. | Lawyer question first: with names/emails removed, is PostHog still inside the HIPAA boundary? If yes, upgrade + generate BAA. If no, document the reasoning and leave it. Cheaper to ask than to upgrade. |
| **Vercel Blob** (file storage) | Library media only — no member data | Covered by the Vercel BAA | Nothing extra. |
| **Upstash Redis** | Provisioned but **unused in code** (verified by grep, 7 Sep 2026) | — | Remove the integration so it can't drift into use. |

## Tasks, in order

### 1. Confirm plan tiers (30 minutes, read-only)

For each of Neon, Vercel and PostHog, log into the dashboard and record the current plan name. Do not upgrade anything yet. Write the three plan names into a short table and give it to Sophie with the price of the qualifying tier next to each. She decides.

### 2. Neon

1. If not on Scale, upgrade. This is the database — there is no alternative to signing here.
2. Organisation settings → HIPAA / Compliance → accept the BAA.
3. Download the countersigned PDF. File it (see "Filing" below).
4. Confirm the project `NEON_PROJECT_ID` (in the Vercel env vars) sits inside the organisation that accepted the BAA.

### 3. Vercel

1. Confirm the team `dwolfej9-8761s-projects` is on Pro or above.
2. Request the BAA. Vercel handles this through the dashboard for Pro; if the option isn't visible, open a support ticket at vercel.com/help asking for "HIPAA BAA for team `team_Tg3XcSMocAiEB9h8iNM1snJm`".
3. Once signed, file the PDF.
4. In the Vercel dashboard → AI Gateway → Settings, check whether **team-wide Zero Data Retention** is available and what it costs ($0.10 per 1,000 requests at time of writing). Per-request ZDR is free; team-wide is belt-and-braces. Recommend per-request only unless Sophie prefers the global switch.

### 4. OpenAI via AI Gateway — code change

**Do not call OpenAI directly and do not add an OpenAI API key.** The whole point is that Vercel's BAA covers the model traffic *because* it routes through Vercel's ZDR-negotiated providers.

The change, in `app/api/library/remi/route.ts`, inside the `streamText({ ... })` call:

```ts
providerOptions: {
  gateway: { zeroDataRetention: true },
},
```

Tested 7 Sep 2026 with the live model: succeeds, `finalProvider: "azure"`, `planningReasoning: "ZDR requested: 2 attempts → 1 ZDR attempts"`. Same model, same output quality. If Vercel later adds OpenAI direct to its ZDR set, routing will follow automatically.

**v0 has already verified this works and can ship it as a one-file PR to `main` on request.** If Cowork ships it instead: open a PR to `main`, do not touch anything else in the file, and check the response metadata in a test call shows a ZDR provider.

Also check whether the Gateway offers a `hipaaCompliant` provider option (a search result mentioned it; the docs read on 7 Sep did not show it). If it exists and is documented, add it alongside `zeroDataRetention`. If not documented, leave it out.

### 5. Resend replacement

Resend will not sign a BAA, so it cannot carry member emails. What it sends today (from `lib/email.ts`):

- **Welcome email**: member's first name, email address, temporary password, sign-in link
- **Auth emails**: password-reset links (token in the URL), email-change confirmations

Options, in preference order:

1. **Postmark** — signs BAAs on request; transactional-focused; simple API. Best like-for-like swap.
2. **SendGrid (Twilio)** — signs BAAs on paid plans.
3. **Amazon SES** — covered by the AWS BAA (the project already has an AWS integration for Aurora, so an AWS account exists). More setup, lowest cost.

Whatever is chosen:

- Verify `tunedininstitute.org` as a sending domain (SPF, DKIM, DMARC) **before** switching, so delivery doesn't break.
- The code surface is small: `lib/email.ts` is the only file that imports `resend`. Keep the two exported functions (`sendWelcomeEmail`, `sendAuthEmail`) with identical signatures and swap the implementation. Nothing else in the codebase needs to change.
- Remove `RESEND_API_KEY` from the Vercel project env vars after the swap, and remove the Resend integration.
- Get the new vendor's BAA signed **before** the first production send.

Flag for Sophie: the welcome email puts a **plaintext temporary password** in an email. That is a separate weakness from the BAA question and is worth fixing at the same time (send a set-your-password link instead). Note it; don't scope-creep into it without her say-so.

### 6. PostHog — lawyer question, then act

Since 24 Aug 2026 PostHog receives only opaque user IDs and page paths (PR #126). Draft a one-paragraph question for the lawyer:

> "Our analytics vendor receives a random user identifier and the URL paths a user visits on our member library. It receives no names, emails, or health content. The library is used by parents of children in paediatric therapy. Is this vendor a business associate requiring a BAA, or is the data sufficiently de-identified?"

If **yes**: upgrade to Boost or above, use the BAA generator in the PostHog account, file the PDF.
If **no**: write the lawyer's answer into `docs/remi-privacy-and-hipaa-assessment.md` under Priority 3 and stop.

### 7. Upstash Redis — remove

Unused. Remove the integration from the Vercel project so it never quietly becomes a PHI store. Confirm afterwards that no `KV_*` or `REDIS_URL` env vars remain.

### 8. Filing

Create a folder Sophie controls (not in this repo — it's a public-ish codebase) containing:

- Each signed BAA PDF, named `BAA-<vendor>-<date>.pdf`
- A one-page register: vendor, what data, plan tier, BAA date, renewal/review date, who signed
- The lawyer's PostHog answer

Then update `docs/remi-privacy-and-hipaa-assessment.md` Priority 3 with a dated line per vendor: signed / removed / out of scope.

## What NOT to do

- Do not add any direct AI-provider API key (OpenAI, Anthropic, etc.) to the project. It would bypass the Vercel BAA.
- Do not change Remi's prompt, model, tools or library. Nothing in this brief requires it.
- Do not deploy via the v0 "Publish" button — it ships the whole `remi` branch, which has untested work on it. Use narrow PRs to `main`.
- Do not delete PostHog historical data as part of this work; that's a separate, already-scoped task with low urgency.
- Do not sign anything. Sophie signs.

## Done looks like

- Neon: Scale plan, BAA accepted, PDF filed
- Vercel: BAA signed, PDF filed
- Remi: `zeroDataRetention: true` live on `main`, test call shows ZDR provider
- Resend: gone; replacement live with BAA signed and domain verified
- PostHog: lawyer answer on file; BAA signed **or** documented as out of scope
- Redis: integration removed
- Register: one page, in Sophie's hands
- Assessment doc: Priority 3 updated with dates
