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

**Rooted Rhythm is a therapy provider, and it takes insurance.** A practice
providing therapy to fee-paying clients is a *healthcare provider*. Under HIPAA
it becomes a **covered entity** if it transmits any "standard electronic
transaction" — in practice, electronic insurance billing, eligibility checks, or
claims. A strictly cash-pay practice that never does any of that is often *not*
a covered entity.

**Rooted Rhythm's team has now confirmed that it takes insurance.** That
effectively answers the question: the practice is almost certainly a covered
entity, and the analysis below should be read on that basis rather than as a
hypothetical. A lawyer should still confirm formally, but planning should now
assume HIPAA applies.

**The practical consequence: this platform is very likely already in scope
today — before any memory feature is built.** The obligations described in this
document are not triggered by adding memory. They already exist, and they
already apply to 640 existing client records.

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

**Actual account numbers, as of this assessment:**

| Role | Count |
| --- | --- |
| `client` | 640 |
| `admin` | 10 |
| `therapist` | 1 |

Two things stand out, and both are more urgent than the memory question:

**1. Ten admin accounts can see all 640 client records.** HIPAA's *minimum
necessary* principle expects access to be limited to what each person needs to
do their job. Ten full-access administrators for a single therapy practice is
very likely more than that standard allows — especially when the client list is
itself protected information. Note also that `admin` is a single all-or-nothing
tier: there is no "can edit library content but cannot see the client list"
role, so anyone who needs to manage lessons is given access to every member
record as a side effect.

**2. There is no audit logging anywhere in the codebase.** No record of which
admin viewed, changed, or exported which member's data. Under HIPAA this is not
optional — it is required, and it is also the only way to answer "whose data was
affected?" after an incident. Right now that question would be unanswerable.

Neither of these is caused by Remi, and neither would be fixed by declining to
build memory.

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

### The PostHog finding — now fixed

This was the most significant issue found, and it had nothing to do with Remi.
**It has been remediated in this change set** (details in §4, Priority 1). The
description below is what the code did beforehand, kept as a record of what was
exposed and for how long.

`components/analytics/posthog-provider.tsx` called `posthog.identify()` for every
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
else it was a live exposure rather than a hypothetical one.

### Two further leaks found in the same file

While fixing the above, two more were found in the page-view capture, which
appended the full query string to every recorded URL:

1. **Password-reset tokens.** `/reset-password?token=…` was sent to PostHog
   verbatim. This is a **security issue, not just a privacy one**: a live
   single-use credential for taking over a member's account was being copied to
   a third-party vendor and stored in its event log.
2. **Free-text library searches.** `/library?q=…` was captured verbatim. Search
   text is written by the member about their own family and is often more
   revealing than anything else on the platform.

Both are now redacted at the point of capture.

**Recommended follow-up:** because reset tokens were logged externally, they
should be treated as potentially exposed. Consider shortening reset-token
lifetime and, with the lawyer, whether historical PostHog event data should be
purged. Deleting the historical PostHog data is worth doing regardless — the
code fix stops new collection but does not remove what was already sent.

---

## 4. The gaps, in priority order

### Priority 1 — Stop sending identifiable member data to analytics ✅ DONE
Fixed in `components/analytics/posthog-provider.tsx`:

- **`email` and `name` removed** from `identify()`. Only the opaque user id and
  role are sent, which preserves essentially all product analytics value.
- **`q` and `token` query params redacted** before capture.
- **Session recording explicitly disabled in code.** It was not enabled, but it
  could have been switched on remotely from the PostHog dashboard at any time,
  which would have captured the text of Remi conversations. Disabling it in code
  makes that reviewable rather than a dashboard setting nobody is watching.
- Lesson paths are deliberately **still captured** — knowing which resources get
  used is legitimate product analytics, and it is no longer tied to a name.

**Remaining:** purge historical PostHog data (see §3), which the code fix does
not do.

### Priority 2 — Formal legal confirmation ⚠️ LARGELY ANSWERED
Rooted Rhythm takes insurance, so it is almost certainly a covered entity and
this platform is almost certainly in scope. A lawyer should confirm formally and
define the boundary, but this is no longer an open question for planning
purposes — **assume HIPAA applies.**

### Priority 3 — Put BAAs in place
Required for every vendor that touches member data. Based on the code, that
means at minimum:

| Vendor | What it handles |
| --- | --- |
| Neon | The database — all 640 client records |
| Vercel | Hosting, logs, AI Gateway |
| OpenAI (`openai/gpt-5.4-mini`, via AI Gateway) | Remi conversation content |
| Resend | Transactional email to members |
| PostHog | Product analytics |

BAAs are generally available on paid/enterprise tiers, but **the specific tier
requirements need confirming per vendor — do not assume your current plans
qualify.** For model traffic, a BAA also needs to be paired with **zero data
retention**; check how that is configured when routing through the AI Gateway
rather than calling OpenAI directly.

PostHog is the one to question rather than paper over: now that it no longer
receives names or emails, consider whether it needs a BAA or whether the
pseudonymised data puts it outside the boundary. That is a lawyer call, and it
is cheaper than an enterprise upgrade.

### Priority 4 — Access controls and audit logging
The largest *engineering* gap, and the audit found it was worse than a missing
log file.

**✅ DONE — Audit logging is now implemented.** See "Audit logging" below for
what it covers. This was the piece that blocked everything else, and it is in
place.

**Still outstanding — and these are decisions, not code:**

- **⚠️ 56 accounts have effective staff access, not 11.** This is the most
  important finding in this document. `isStaffEmail()` in `lib/session.ts`
  grants therapist-level powers to *any* `@rootedrhythm.com` address,
  independent of the `role` column. So the real count of people who can onboard
  members and reset passwords is:

  | Path to staff access | Count |
  | --- | --- |
  | `role = 'admin'` | 10 |
  | `role = 'therapist'` | 1 |
  | `role = 'client'` but staff email domain | 45 |
  | **Effective total** | **56** |

  Those 45 are almost certainly staff who signed up as ordinary members and were
  never given an elevated role — but the email-domain check grants it anyway.
  Under *minimum necessary*, 56 people with access to member accounts at a
  practice this size is very hard to defend. **Recommend removing the
  email-domain fallback and granting staff access only through an explicit
  role.** That is a small code change gated on an operational decision about who
  genuinely needs access.

- **10 admin accounts can see all 640 client records.** Review whether all ten
  need it. Costs nothing and is the fastest risk reduction available.

- **`admin` is all-or-nothing.** Splitting it into a content-management role
  (library, no client list) and a true administrator role would let most of
  those ten keep working with far less access.

- **✅ Therapist scoping verified.** `app/therapist/page.tsx` filters on
  `createdById = staff.id`, so a therapist sees only clients they onboarded, and
  `resetMemberPassword` refuses cross-caseload resets. Confirmed correct; the
  refusal is now logged as a `denied` event.

### Audit logging — what was built
`audit_log` table (`lib/db/schema.ts`), helper (`lib/audit.ts`), viewer at
`/admin/audit` → "Activity" in the admin nav, admin-only.

Currently records:

| Event | Trigger |
| --- | --- |
| `member_list.view` | An admin loads the full member list |
| `member_list.view_scoped` | A therapist loads their own caseload |
| `member.create` | Account created (success and failure) |
| `member.role_change` | Role changed, with `old -> new` |
| `member.delete` | Account removed |
| `member.password_reset` | Reset performed, **or denied** |

Design decisions worth knowing:

- **No foreign keys on `actorId`/`targetId`.** A cascade would erase a member's
  audit trail at the exact moment their account is deleted — the event most
  worth keeping. Email and role are snapshotted onto the row instead.
  *Verified:* after deleting a test account through the real UI, the `user` row
  was gone but the log still named who was deleted and by whom.
- **Never contains PHI.** The log records *that* an access happened, never the
  sensitive content. `detail` holds only non-sensitive context like
  `role: client -> admin`.
- **Failures never break the request.** A logging error is caught and reported
  to the server console rather than blocking a password reset.
- **Denied attempts are logged.** A therapist repeatedly probing clients who
  aren't theirs is only visible if refusals are recorded.
- **List views dedupe within 30s; mutations never do.** `revalidatePath` re-runs
  server components, which produced 2+ identical view rows per visit and four
  rows for one delete. Mutations and denials are always written — two password
  resets are two real events.

Not yet covered: sign-in/sign-out, and Remi conversation access (nothing is
stored yet). **When memory ships, reads and writes of member memory must be
added here** — that is the point of having built this first.

### Remaining gap — log retention and tamper-resistance
The table is append-only *by convention* (no update or delete path exists in the
app), but a database-level actor could still alter it. HIPAA expects a six-year
retention period. Worth deciding: periodic export to write-once storage, and
whether a DB-level rule should block `UPDATE`/`DELETE` outright.

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

**Recommended sequencing — and the key point of this whole document:**

Memory should **not** be enabled yet. But the reason is not that memory is
uniquely dangerous. It is that **the foundations it depends on are not in place,
and those foundations are already required without it.**

Concretely, do not enable memory until:

1. **BAAs are signed** (Priority 3) — otherwise conversation-derived notes flow
   to vendors with no legal cover. *Still outstanding.*
2. ~~**Audit logging exists**~~ — **✅ done.** Member access is now logged, and
   memory reads/writes must be added to it when the feature is built.
3. **Staff access is narrowed** (Priority 4) — otherwise you are handing **56
   accounts** a readable history of 640 families' mental-health concerns. *Still
   outstanding, and larger than first assessed.*

Every one of those is needed **anyway**, for the 640 records that already exist.
Memory does not create the obligation; it raises the cost of not having met it.

The healthy way to read this: the blocker is not the feature, it is the
infrastructure around it. Do items 1–3 and memory becomes a small, safe
increment. Skip them and memory is the change that converts a paperwork gap into
a breach-notification event.

Building it now behind an **off-by-default flag** is still worthwhile — the code
gets written and reviewed while the compliance work proceeds in parallel, and
nothing accumulates until someone deliberately turns it on.

---

## 6. The honest summary

Remi itself is in **good shape**. It stores nothing, its framing is careful
(explicitly not a therapist, not a clinical record, with a real crisis
protocol), and the analytics leak that did exist has been closed in code. The
remaining item there is purging historical PostHog data — an operational task in
their dashboard, not a code change.

**The finding that matters most is not about Remi or about memory.** Rooted
Rhythm takes insurance, which means this platform is very likely already inside
a HIPAA boundary — today, with 640 client records, 10 full-access admin
accounts, and no audit logging. That gap exists right now and would still exist
if the memory feature were never built.

So the answer to *"should we therefore not enable memory?"* is: **correct, not
yet — but memory is not the problem to solve first.** The prerequisites are
required regardless.

**Audit logging is now built** (`/admin/audit`), which removes the largest
engineering blocker and means an access question is now answerable. Two things
remain, and both are decisions rather than code:

1. **Narrow staff access.** The audit surfaced that **56 accounts**, not 11,
   have effective staff access — `isStaffEmail()` grants it by email domain, so
   45 accounts with `role = 'client'` can onboard members and reset passwords.
   This is free to fix and the highest-value item on the list.
2. **Get BAAs signed** with Neon, Vercel, OpenAI, and Resend.

Declining to build memory would not make the platform compliant. It would only
leave the existing gap unaddressed while also giving up the member experience
Sophie is asking for. Both are worth having — in the right order.

---

## 7. Questions for the lawyer

1. ~~Does Rooted Rhythm transmit electronic healthcare transactions?~~
   **Answered: yes, it takes insurance.** Please confirm formally that this makes
   it a covered entity, and identify the effective date from which the
   obligations applied.
2. Given Rooted Rhythm owns Tuned In, is the platform inside the practice's
   compliance boundary, or separable as a wellness/education product?
2b. **If in scope, what is our position on the period already elapsed?**
   Member names and emails were being sent to PostHog alongside records of which
   mental-health resources they viewed. That has been stopped, but historical
   data was collected. Does this require notification, and should the historical
   PostHog data be purged?
3. Does restricting access to fee-paying clients make the membership list itself
   PHI?
4. If members opt in to storing their own conversation summaries, does that
   record become part of the designated record set — and therefore subject to
   access and amendment rights?
5. Do any state-level privacy or mental-health confidentiality laws apply
   independently of HIPAA in the states where clients are located?
