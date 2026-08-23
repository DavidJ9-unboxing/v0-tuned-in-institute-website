# Remi & Tuned In — Privacy and HIPAA Gap Assessment

**Date:** 23 August 2026
**Prepared for:** Sophie / Tuned In Institute leadership
**Status:** Engineering assessment — **not legal advice**

This is a plain-English description of what member data the Tuned In platform
actually collects, where it goes, and what would need to change if the platform
has to align with HIPAA. Every claim below was verified against the running code
and the live database, not from memory or assumption.

The final call on whether HIPAA applies is a lawyer's, not ours. This document
exists so that conversation can start from facts.

---

## 1. The fact that changes the analysis

> "Rooted Rhythm owns Tuned In and makes it available to fee-paying clients and
> the therapists."

This matters more than anything else in this document, for three reasons.

**Rooted Rhythm is a therapy provider.** A practice providing therapy to
fee-paying clients is a *healthcare provider*. Under HIPAA it becomes a
**covered entity** if it transmits any "standard electronic transaction" —
in practice, electronic insurance billing, eligibility checks, or claims. A
strictly cash-pay practice that never does any of that is often *not* a covered
entity. **This is the single question that decides everything below, and only
Rooted Rhythm's team can answer it.**

**Tuned In is not a vendor — it is the same organisation.** Because Rooted
Rhythm *owns* Tuned In, there is no Business Associate Agreement to lean on
between them. Tuned In is an internal system of the practice. If the practice is
a covered entity, this platform is inside the compliance boundary by default.

**Membership itself is sensitive.** Access is restricted to Rooted Rhythm's
fee-paying clients. That means "this person has a Tuned In account" reveals
"this person is a therapy client." Under HIPAA, **the fact that someone is
receiving treatment is itself protected** — you do not need the contents of a
session for it to count. This is the point most easily missed: the sensitive
data isn't only what members type into Remi, it's the membership list.

---

## 2. What the platform stores today

Verified against the live schema.

| Data | Where | Sensitivity |
| --- | --- | --- |
| Member name, email | `user` table | Identifies a therapy client |
| Role (`client` / `therapist` / `admin`) | `user` table | Distinguishes clients from staff |
| `createdById` — the staff member who onboarded them | `user` table | **Links a named client to a specific therapist** |
| Password hash, sessions, IP address, user agent | `account`, `session` | Standard auth data |
| Content library (287 lessons) | `lesson`, `section` | Not personal data |

**Remi conversations are not stored anywhere.** There is no message or
conversation table. Remi's own privacy statement to members — *"this chat is
private and NOT saved or stored… no one at the Institute can read these
conversations"* — is currently **factually true**. This is the platform's
strongest privacy property and it should not be given up casually.

The `createdById` link deserves attention: combined with name and email, the
database already holds *"this named individual is a client of this named
therapist."* That is clinically meaningful information about a care
relationship, and it exists today, independent of Remi.

---

## 3. Where member data flows

| Recipient | What it receives | BAA available? |
| --- | --- | --- |
| **Neon** (database) | All stored member data | Yes, on paid plans |
| **Vercel** (hosting) | Requests, logs | Yes, on Enterprise |
| **OpenAI** (via Vercel AI Gateway) | Remi conversation content, in transit | Yes, via OpenAI Enterprise/API |
| **Resend** (email) | Member email addresses | Needs confirmation |
| **Vercel Blob** (files) | Library media only — no member data | Yes, with Vercel |
| **PostHog** (analytics) | **See below — this is the main gap** | Yes, on paid plans |

### The PostHog finding

This is the most significant issue found, and it has nothing to do with Remi.

`components/analytics/posthog-provider.tsx` calls `posthog.identify()` for every
signed-in member, sending:

- their **user id**
- their **email address**
- their **full name**
- their **role**

It also captures every page view with the full URL, plus a `remi_opened` event.

Because library URLs describe their content, the resulting analytics profile
reads approximately as:

> *[Full name], [email], a client of a therapy practice, read "PDA-Informed
> Sleep Support for Teens" and "Supporting a Teen Who Struggles with Sleep &
> Eating," then opened the mental-health chat assistant.*

That is a named individual, identified as a therapy client, with a behavioural
record of the mental-health topics they are seeking help with — sitting in a
third-party analytics tool. If Rooted Rhythm is a covered entity, this is
very likely a disclosure of PHI without a BAA.

**It is also the cheapest thing on this list to fix**, and unlike everything
else it is a live exposure rather than a hypothetical one.

---

## 4. The gaps, in priority order

### Priority 1 — Stop sending identifiable member data to analytics
Remove `email` and `name` from the `identify()` call. The pseudonymous user id
alone preserves essentially all the product analytics value. Consider also not
sending full library URLs for authenticated pages, or excluding member-facing
routes from analytics entirely. **Low effort, high impact, no product cost.**

### Priority 2 — Confirm whether HIPAA applies at all
A lawyer question, driven by: does Rooted Rhythm bill insurance or transmit
electronic healthcare transactions? Everything else depends on the answer, and
it is cheap to establish.

### Priority 3 — Put BAAs in place for what remains
If in scope: Neon, Vercel, OpenAI, Resend. Most offer BAAs on paid tiers. Note
that a BAA with OpenAI also requires configuring **zero data retention** for
API traffic.

### Priority 4 — Access controls and audit logging
There is currently no audit log of which staff member viewed which client's
record. HIPAA's Security Rule expects that. Worth confirming that therapists can
only see clients they onboarded, and that admin access is logged.

### Priority 5 — Encryption, retention, and breach process
Data is encrypted in transit and at rest by Neon and Vercel by default. What is
missing is the *paperwork*: a written retention policy, a documented breach
notification procedure, and a risk analysis. This is largely a documentation
exercise, not an engineering one.

---

## 5. What changes if we add member memory

Adding opt-in memory inside Tuned In is the right call — far better than routing
this data through a consumer ChatGPT account, where it would sit under consumer
terms, outside your control, with no BAA possible. But it is not free, and it
should be entered into deliberately.

**What you give up:** the ability to say "nothing is stored." Once memory
exists, Remi's privacy statement must be rewritten, and the platform starts
holding a durable, identifiable record of parents' and children's mental-health
concerns. That record is squarely PHI-shaped if HIPAA applies, and it becomes
discoverable in litigation and reportable in a breach.

**What it must therefore include, non-negotiably:**

- **Off by default.** Explicit opt-in, with plain-language wording about what
  gets kept and for how long. Silence is not consent.
- **Member-visible.** They can read everything stored about them, in full.
- **Member-deletable.** Per-item and delete-all, honoured immediately.
- **Exportable.** They can take it with them.
- **Stored as summaries, not transcripts.** Keep the durable record as short
  distilled notes rather than full conversation logs. This is both better for
  prompt size and dramatically lower risk.
- **Excluded from analytics.** Memory content must never reach PostHog.
- **Never written during a crisis exchange.** If the safety protocol triggers,
  nothing from that turn should be persisted.

**Recommended sequencing:** build it behind a flag that stays **off** until
Priority 1 is fixed and Priority 2 is answered. That way the feature is ready
and reviewable, but no sensitive record accumulates before the compliance
position is understood.

---

## 6. The honest summary

Tuned In is in a **better position than most platforms handling this kind of
data**, largely because Remi stores nothing. The architecture has been cautious,
and Remi's framing — explicitly not a therapist, not a clinical record, with a
real crisis protocol — is the right defensive posture.

There is **one live gap that should be closed regardless** of how the HIPAA
question resolves: identifiable member data flowing to third-party analytics.
That is worth fixing this week, and it is a small change.

The memory feature is the real decision point. It is the moment the platform
stops being stateless and starts holding sensitive records. Building it inside
Tuned In rather than in ChatGPT keeps you in control of that — but the honest
trade is that you are choosing to take on obligations you do not currently have,
in exchange for a genuinely better member experience. That is a reasonable
trade to make deliberately, and a bad one to make by accident.

---

## 7. Questions for the lawyer

1. Does Rooted Rhythm transmit any electronic healthcare transactions
   (insurance billing, eligibility, claims)? I.e. is it a HIPAA covered entity?
2. Given Rooted Rhythm owns Tuned In, is the platform inside the practice's
   compliance boundary, or separable as a wellness/education product?
3. Does restricting access to fee-paying clients make the membership list itself
   PHI?
4. If members opt in to storing their own conversation summaries, does that
   record become part of the designated record set — and therefore subject to
   access and amendment rights?
5. Do any state-level privacy or mental-health confidentiality laws apply
   independently of HIPAA in the states where clients are located?
