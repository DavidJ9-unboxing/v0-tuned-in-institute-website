// One-off, idempotent importer for the "Tuned In Parenting for Sensitive Teens"
// course transcripts (https://www.rootedrhythm.com/transcriptsteens).
//
// These are imported as a HIDDEN collection: they never appear in the library,
// but Remi uses them as background knowledge when answering questions.
//
// Safe to re-run: it deletes any existing collection with the same slug and
// recreates it from the content below.
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const SECTION = {
  slug: 'parenting-teens-transcripts',
  title: 'Tuned In Parenting for Sensitive Teens (Course Transcripts)',
  description:
    'Full transcripts of the Tuned In Parenting for Sensitive Teens course. Hidden from the library — used by Remi as background knowledge only.',
}

const LESSONS = [
  {
    title: 'Introduction — Tuned In Parenting for Sensitive Teens',
    body: `Hello, and welcome to Tuned In Parenting for Sensitive Teens. I'm so excited you're here. This has been a long time coming.

As a little bit of background: my name is Sophie Schuermann. I'm a licensed clinical social worker, and I started Rooted Rhythm Therapy in 2019. I spent time with children and teens in the therapy room, and the kids and teens who found me were ones who just seemed to be a little bit more sensitive. They were showing up with emotional struggles — whether that was being very hyper, having attention issues, getting angry easily, having outbursts, or the opposite: being very shut down, with a lot of internal anxiety. I've worked with young people who just seem to have a tougher time staying regulated and connected to who they really are.

I found very quickly that working with parents was absolutely crucial. It's all great and good for me to provide a space for a child or teen to feel comfortable being themselves within the confines of a therapy room — but what's the point if, when they go back to their families and their schools, they're not feeling that same space to thrive? And after all, parents know their children better than anyone. So I found ways to really include parents.

Rooted Rhythm has grown in incredible ways. At the time of this recording, in summer 2026, we have about 40 therapists working with kids in Colorado, Texas, and Georgia, and we continue to create spaces for sensitive children and teens to be themselves, know themselves, and function more peacefully in their environments. We created the Tuned In Parenting course for kids ages two to 12 as a way to empower parents to know their children and support them for the long run. And now it's time to bring this same model to our teens. Parents are ready. We're ready. We want to create a template that parents can use to feel really, really confident in supporting their teens — which is where a lot of stuck points can come up again.

This course has 10 modules. Plan for about an hour a week over a 10-week process — listen to the recording, go through the resources, study the presentation, and integrate it in your family between sessions. It really only takes about 10 hours to get through this material.

In this course we'll support you in understanding your teen's neurobiology in a new way. There are a lot of changes happening in the brain and the nervous system during the teenage years, so we need to adjust how we orient to our teen. We'll look at our own triggers, history, and patterns as parents, which can be especially activated when our kiddo hits the teenage years. Boundaries, connection, and repair are more important than ever. Even though teenagers push boundaries more than anyone, they also need them more than anyone.

There's a lot of parallel between toddlers and teenagers, and there's brain science behind it: the prefrontal cortex, where executive functioning lives, develops at its highest rate of speed during the toddler years (age two to four) and then again during the early teen years (age 12 to 14). The prefrontal cortex doesn't fully develop until the mid-twenties.

We talk a lot about the sensitive person, the sensitive child, the sensitive teen — but this content is for anyone. We've honed in on the map of the sensitive person, originally researched by Dr. Elaine Aron, because we wanted a way to describe our kids without anything too pathologizing. Sensitive people make up about 15 to 20% of the population. We live in a very overstimulating world, so this content can help anyone.

A few principles to let land now:
1. Your teen is not broken. They're wired differently, their brain is changing at rapid rates, and we want them to learn to carry their sensitivities in a way that honors both the challenge and the extraordinary gift of being more sensitive.
2. Your nervous system is the most powerful parenting tool you have. Any opportunity to regulate yourself first will help you show up more authentically and helpfully for your teen.
3. Connection is the container. Every limit, boundary, lesson, and consequence works better inside a connected relationship.
4. The struggle is the development. It's through struggle and challenge that we grow. Your sensitive teen's intensity, depth, and radical honesty are not obstacles — they are gifts the world needs.

Imagine your teenager at 25: confident, deeply connected to who they are, empathetic but discerning, able to process deeply, feel fully, and know their needs, limits, and gifts. This future is made more likely by every choice you make to learn, regulate, stay curious, set boundaries, and connect during these years. You're not just parenting a teenager — you're shaping the nervous system of an adult.`,
  },
  {
    title: "Module 1 — Your Sensitive Teen Is Not Your Sensitive Child Anymore",
    body: `The stakes feel higher in the teenage years — and they are higher. This is where identity development is really forming, and the support we give now sets our teens up for adult life. That's why parents of teenagers feel such urgency; we intuitively know this time is important.

Your 13-year-old used to cry when their crayon broke; now they slam their door for two hours. Your 15-year-old once curled into your lap; now they say, "You don't understand anything." The same sensitivity is there, but adolescence turns it up a dial.

There are five essential areas to understand your sensitive teen, and we revisit the five Tuned In principles applied to teens. Dr. Elaine Aron's decades of research found sensitive people make up about 15 to 20% of the population. A key concept is differential susceptibility — sensitive people respond more to their environment than non-sensitive people. The thalamus (the gatekeeper of incoming information) receives more data; sensitive brains show more thalamus activation. Offered ideal conditions (going slow, structure, dim lights, feeling safe), a sensitive teen thrives and becomes their best self. In less-than-ideal conditions (overstimulation, strained relationships), they struggle even more than a non-sensitive person. So small tweaks toward tuned-in parenting have an outsized payoff.

What's new with teens vs. kids is the prefrontal cortex — the top/front of the brain for executive functioning, logic, good choices, and impulse control. It's grown a lot but isn't fully online until the mid-twenties, and it's under dramatic renovation now (fastest growth ages 2–4 and 12–14). This is why teens often present like toddlers. Add puberty (hormones amplifying emotional intensity), heavy reliance on peers for belonging, an expanded and complex social landscape, and a phone mediating much of it — and your sensitive teen is processing their place in the world at full volume, 24/7.

The key insight: your sensitive teen isn't being difficult. They're navigating the same sensitivity, in a harder environment, with a brain literally under construction, while figuring out who they are. That's not defiance — it's an enormous amount to carry, and all the more reason for more support.

The five Tuned In principles applied to teens:
1. Relax into the present moment. We don't parent well with the energy of urgency. Softening even 5% into a more regulated nervous system lets us make better choices. Teens don't actually want us to fix what they're going through (research suggests over-fixing can lead to more drug and screen addiction). Meet the moment with them from a regulated, connected space.
2. Trust and honor the process, including the ugly parts. The teen years bring the most disruptive developmental process outside infancy. Erikson's stage here is identity vs. role confusion. Becoming is messy; it's not a crisis. Zoom out and take a bird's-eye view.
3. Prioritize connection. Growth comes from healthy connection. The paradox: the moments teens most need connection are often when they're pushing you away. Connection often looks like proximity, not conversation — being nearby, available, not smothering. Add one no-agenda daily connection moment.
4. Loving boundaries. Teens are meant to push limits, and they need containment more than ever. The "fence on the playground" study: kids explored and connected more with a fence than in an open field. Teens need explanation and some negotiation, but the expectation is set that you can and will hold boundaries — which also teaches them to set their own. Identify one limit you hold through control rather than conversation, and bring curiosity to it.
5. Show up authentically, especially when it's hard. Sensitive teens have a fine-tuned radar for inauthenticity (incongruence). Show up with regulated truth ("I'm actually scared right now") without dumping feelings on them. The key is regulation.

Summary: principles 1–2 = presence over panic; principles 3–5 = connection, limits, and truth.

Core practice — the gaze of adoration: find a moment when your teen is just being (not in conflict). Notice the depth of who they are, see the magnificent adult they're becoming without projecting, and let that turn into love on your face. You won't need to say anything; they'll feel it. Ask yourself: what does relaxing into the present moment actually look like with my specific teenager?`,
  },
  {
    title: 'Module 2 — The Adolescent Brain and Nervous System on Fire',
    body: `Your teen isn't choosing this. Their brain is under construction, puberty is a nervous-system event, and hormones amplify an already-sensitive system. Kids carry emotions all day and dump them out by evening; for teens that load is even more vast, so emotional release becomes imperative.

Much of this draws on Dr. Dan Siegel (The Whole-Brain Child), Lisa Dion (Synergetic Play Therapy Institute), and Polyvagal Theory.

Three brain sections: the reptilian brain/brainstem (survival — sleep, eat, cry), the limbic system in the middle (emotions and memory — highly active in toddlers and again in teens), and the prefrontal cortex at the top (executive functioning, under heavy renovation in the teen years; fastest growth ages 2–4 and 12–14; not complete until the mid-to-late twenties). When teens make choices that defy adult logic, they often weren't "thinking" — they were operating from the emotional middle brain.

Sensitive teens show more activity in the brain's emotional systems. In one study, sensitive people viewing positive images (cakes, puppies) and negative ones (crashes, snakes) had emotional brains that lit up more and stayed lit longer. About 15–20% of people simply have bigger emotions — higher highs and lower lows. Beautiful and challenging.

When very triggered, the "lid" (prefrontal cortex) flips off and we operate from lower brain regions. Sensitive teens reach dysregulation faster, often with minimal warning, and may need longer recovery time. The positive side: they also experience deeper joy, love, and excitement.

Puberty: shifting estrogen, testosterone, cortisol, and adrenaline directly affect the nervous system — like turning up the volume on everything and taking away the remote. Emotions amplify, sleep needs increase (physiology, not laziness), social stakes feel enormous (peer approval is neurologically rewarding), and sensory/physical sensitivities intensify.

Nervous System 101: In a regulated (ventral vagal) state, teens can think clearly, take perspective, and have meaningful conversations — this is where real talk and vulnerability happen, and our regulated presence is the quickest path there. Dysregulation goes two ways: hyperarousal (fight/flight — slamming doors, "I hate this family," frantic texting, spiraling, or internal anxiety) and hypoarousal (shutdown — won't get out of bed, won't talk, "I'm fine" when they're not). Shutdown is often missed because it looks like attitude, but it's just as alarming. Watch for sustained shutdown (withdrawn, numb, not eating) and seek more support if needed — sensitive teens are more prone to bigger mental-health struggles. That's science, not parental failure.

Sensitive people often have higher cortisol and high functioning. The "L's and T's" study: sensitive people identified targets quickly and accurately, but with significantly more cortisol pumping. Add the teen stage (more cortisol, adrenaline, hormones), and we must help them de-stress.

When a teen is in the red zone (hyper) or blue zone (hypo), it is NOT the time for a logical conversation. Help them find their way back to center (green) first.

The "basket of rocks" for kids becomes a "dumpster" for teens — academic and social pressure, social media and comparison, identity confusion, romantic pressures, world events, existential weight. The dumpster needs emptying, often as an after-school explosion, dinner breakdown, or bedtime tears. They release at home because home is safe — that's healthy attachment, not a problem. You can still set boundaries (release is okay; aggression or cruel words toward you or siblings are not).

Once the lid is flipped, you cannot reason with them — explaining, repeating logic, or "calm down" will escalate things. The only option is co-regulation: regulate yourself first, then co-regulate (let them be angry in their room with "I'm out here when you're ready," or take a no-interrogation walk if caught early).
- Do: stay physically nearby without demanding engagement, keep your voice low and slow, say less, regulate yourself first, and return to conversation when both nervous systems are settled.
- Don't: explain logic mid-escalation, remind them of consequences, tell them to calm down, match their intensity, or try to fix the problem in the moment.

Reflect: Where do I see my teen most often (centered, hyperaroused, or shutdown)? What triggers dysregulation? What does MY nervous system do? How can I hold space for their release without it becoming my emergency? Before significant interactions, check your own nervous system (1 = shut down, 5 = regulated, 10 = hyperaroused); if you're not at a 4–6, use one regulation tool (breath, movement, cold water, humming, a song) first. From a regulated place, you'll know what your teen needs — sometimes more trust and space, sometimes more connection.`,
  },
  {
    title: 'Module 3 — Who You Are as the Parent of a Teen',
    body: `This module requires the most self-reflection and can bring up triggers. Sensitive teens have a high radar for inauthenticity and will call you out, so self-awareness helps them feel met and held.

With almost every teen, the teen's developmental stage activates something in the parent — usually connected to how the parent felt as a teen. Whatever you didn't finish, process, or get to feel in your own adolescence is likely to surface now. Most of this generation of parents weren't offered space to process feelings, so giving our teens that space can be very challenging in practice.

The mirror dynamic: when your teen struggles with identity, belonging, worth, independence, shame, or fear of not being enough, the parts of you that struggle with those themes get activated. Awareness alone is enough — "Ooh, that hit a triggered part of me." Staying connected to your body helps you notice triggers. Ask: if my teen struggles with perfectionism, where does perfectionism live in me? When did I learn "good enough" wasn't enough? If they withdraw socially, when did I learn it wasn't safe to belong? Softening around those moments increases your capacity to support your teen.

Look back at your own adolescence (ages 12–18): Were you sensitive? Was the way you related to feelings ever named, or were you told "you're being dramatic"? Was there space for intensity? How did you relate to fitting in? What messages did you receive about your emotions, needs, and worth?

Four parenting styles:
- Authoritative (the goal): warmth + structure, responsive + with expectations. Best for sensitive teens. Sounds like: "I completely understand how anxious you feel about tomorrow — and we also need to move toward bed, because being tired will make it harder."
- Authoritarian: control/firmness without warmth; rules without relationship. Produces compliance through fear, at the cost of connection and self-trust; teens usually rebel.
- Permissive: warmth without boundaries; "best friend," no structure. Creates more anxiety and dysregulation, and teaches teens to merge with others and not know their own limits.
- Uninvolved: detached; leaves sensitive teens unanchored.

Most conscious-parenting parents lean permissive (they care deeply about feelings and may be sensitive themselves, scared to set boundaries) and need to firm things up; some lean military and need to soften. Knowing your default is powerful, and there's no shame in it — especially knowing we lean permissive when tired and unregulated, so we must try extra hard to hold the boundary then.

The pause between stimulus and response is where we change our lives and our teens' lives (it also helps reverse impulsive ADHD patterns). Awareness creates options where there used to be automatic reactions. Mirror neurons mean teens reflect what they see — if your teen sees you slow down, self-reflect, and respond with choice, they'll try it too.

Authentic sharing vs. emotional offloading:
- Authentic sharing: honest, regulated sharing of your own experience, taking responsibility — e.g., after a rupture, "I felt hurt when you said that. I need some time, then let's talk." Don't overshare things still in process (divorce, job stress) — process with a friend or therapist first.
- Emotional offloading: processing your unresolved feelings onto your teen in real time, making them the therapist. Avoid shaming lines like "After everything I do for you?" We don't want sensitive teens feeling responsible for regulating us; they'll shut down, over-function, or escalate.

Reflect: What do I remember about my own adolescence? Where do I see myself in my teen, and how do I feel about it? What's my default when things get hard — stricter/meaner, or softer with dropped boundaries? Is there anything in my history that needs therapeutic support so it stops showing up here? (Example: a mom doing EMDR realized her own ungrieved tragedy was why she couldn't hold space for her child's emotions.)

Closing exercise: imagine yourself at your teen's exact age. What were you feeling? What did you need? What did you wish your parent had said or done? Sit with that younger self for five minutes, let them know they matter, and consider how to offer your teen now what you needed then. This isn't about becoming your teen's therapist — it's about becoming the parent you'd have liked to have: regulated, present, genuinely curious.`,
  },
  {
    title: 'Module 4 — Understanding Your Sensitive Teen',
    body: `This module understands the sensitive teen through the framework of the highly sensitive person. Even if you're unsure whether your teen is sensitive, the content helps, because we live in a sensory-overloaded world.

Dr. Elaine Aron's decades of research found that feelings are felt bigger, deeper, and held longer, with more brain activity, in about 20% of the population. The easiest framework is DOES: Depth of processing, Overstimulation, Empathy and emotional responsiveness, Sensing the subtle. Most highly sensitive people show all four; in adolescence they become more complex, visible, and overwhelming. Caveat: some sensitive teens don't outwardly show empathy (often self-protective walls); it usually grows later.

D — Depth of processing. The thalamus lets in more information. Your teen doesn't have a quick thought; they have essays, still processing a lunch comment from September a month later. "Just decide what to wear" feels huge. This is their operating system; telling them to "snap out of it" minimizes. A helpful tool: loving containment — "I hear you, it feels really big, and I promise you've got this, let's move on" (supportive, not shaming). Looks like overthinking, rumination, difficulty deciding, asking "why" about everything. Validate the depth, help them think it through, give time. The gift: mature conclusions about relationships and meaning; the friend people turn to in a crisis.

O — Overstimulation. School hallways, social hierarchies, social media, packed schedules — anyone would be overstimulated, but sensitive teens have a narrower window of tolerance (Dan Siegel). Pushed outside it, they can't cope and often don't realize until they're freaking out. Looks like after-school shutdown or irritability, exploding over something small, avoiding social situations, needing alone time. Help: protect downtime as non-negotiable, create a sensory-supportive home, normalize decompressing. Build a 30–60 minute buffer when they come home before adding demands.

E — Empathy and emotional responsiveness. Empathy rises around age 13 in girls and 15 in boys. It can become emotional labor: absorbing friends' pain, constant texting, feeling responsible for fixing others, depletion, existential stress about injustice. Avoid minimizing ("just worry about yourself") or amplifying urgency. Teach empathy without merging: care about the person while staying grounded ("right now you're safe; that person has support; how will we feel in five or ten years?"). Model one foot in, one foot out — caring without becoming the situation.

S — Sensing the subtle. Your teen notices what others miss and detects pretending. Be honest and open ("I had a hard day at work; I'm still processing and won't put it on you"). Trust their read even when inconvenient ("You have a point — I'm stressed because I didn't sleep; that's on me"). Then help them distinguish real sensing from catastrophizing, because they (like all of us) can build a narrative that isn't true. Balance: "I think you have a point — and let's also consider it might be simpler than the whole story." If they say "so-and-so totally hates me," validate while offering an alternative (maybe the friend was just having a bad day).

There's a documented link between high sensitivity and low self-esteem: sensitive teens feel things so deeply they may turn situations on themselves ("it's my fault"), with big swings between confidence and low self-esteem. Our culture celebrates being easygoing, so feeling deeply can make them think "I'm too much, something's wrong with me," leading more easily to anxiety, depression, and people-pleasing.

Your most powerful intervention: keep saying, in your own way, "Who you are is perfect. Your sensitivity is a gift — your depth, your empathy, your perception are extraordinary, and I can't wait to see who you become." Even more important, actually feel it and celebrate them; they'll feel the difference.

Reflect: Which DOES traits show up most? Where have I been in resistance, wishing my teen would just calm down? How can I name one trait this week as a specific strength ("I love how deeply you perceive everything")? Tell your teen one specific thing you admire about how they experience the world, and notice both responses.`,
  },
  {
    title: 'Module 5 — Shame, Identity, and the Teen Years',
    body: `Shame is a big feeling teens go through, alongside an intense search for identity: Who am I? What are my values? It can look messy.

Erikson's stage for teens is identity vs. role confusion. Teens face: Who am I? What do I stand for? Where do I belong? For a sensitive teen who processes deeply and feels belonging/exclusion intensely, this can be destabilizing. They'll shift friend groups, interests, styles, and values inconsistently — that's the process. Our role is to stay present, not manage or speed it up. The outcome Erikson describes is fidelity: the capacity to trust oneself, be authentic, and commit in relationships.

Guilt vs. shame:
- Guilt = "I did something bad." It can motivate change and points toward repair. Model authentic apologies: "I could have done better; let me own it, say sorry, move on."
- Shame = "I am bad." It makes us hide or escape and focuses on the whole self; it does the opposite of motivating change. Sensitive teens internalize deeply and convert ordinary mistakes into verdicts about their worth. Name it: "We all experience shame. There's nothing you can do that would take my love away. Let's own mistakes and move through them — no need to carry shame."

In adolescence, "I made a mistake" becomes "I am the mistake." Teens may feel shame about being "too much," too emotional, or too intense; replaying social missteps with their active brains makes shame bigger.

The shame-anger cycle: a teen feels exposed (shame), withdraws or it becomes a fight, stuffs it down, has an anger outburst, then feels more shame — and it continues. When a teen says something cruel and you respond with hurt/anger, they feel exposed, stuff it down, rage to escape the shame, then feel more shame. Instead of labeling "anger problems," look at the shame underneath.

Break the cycle by naming the shame in a CALM moment (not mid-storm): "I wonder if part of what happened earlier was that you were feeling really bad about something." Use tentative language ("I wonder if…", "It seemed like maybe…"), expect resistance, and don't require confirmation — just plant the seed.

Conscious discipline: the root of "discipline" means "to teach," not "to punish." Look for teaching moments AFTER regulation, never during the explosion. Yelling is far more likely to create lasting rupture than to change behavior. Once there's ground and connection (do something connecting together), have the real talk: explain the boundary and why ("because I said so" won't cut it). Repair and own your part genuinely ("I know I lost it; here's where I was coming from"). Give teens a sense of power and input ("We need a curfew because I can't sleep until you're safe — what do you feel is fair? Let's decide together"). Use the redo: "Can we start that conversation over from a grounded place?"

Reflect: Where is my teen most caught in shame? How does shame move through them (anger, shutdown, people-pleasing)? What discipline strategy isn't working, and what could I do differently? Next time your teen triggers a strong response, before responding say to yourself: "Underneath this behavior, my teen is probably feeling ___." Every behavior is rooted in a feeling, need, or desire — get curious about what's underneath (frustration, shame, sadness; hunger, tiredness, a need for connection; a desire like "I wish my parents would chill"). Boundaries still happen, but from a place of understanding, which builds relationships where teens respect limits.`,
  },
  {
    title: 'Module 6 — Boundaries',
    body: `Boundaries are tricky and loaded — most of us have history with having too many or too few. Keep it simple. Teenagers need boundaries; pushing them is also how they ask for them. Lack of containment is dysregulating, so even as teens push, they're looking for you to hold the line with confidence.

Remember the Tuned In phrase: every behavior is rooted in a feeling, need, or desire. With teens, ask what feeling, need (hungry, tired, lonely), or desire is under the surface — then set the boundary with compassion.

With young kids it was simple ("I see you want the cookie. We're not having cookies. I hear you're upset"). With teens it's more complex — negotiation, philosophical debate, feeling like your values are questioned, a door slam. But the underlying formula doesn't change: nervous systems need clear structure; sensitive teens feel more secure knowing the limits. Firmness about your line + warmth and compassion = loving boundaries. The difference with teens is the delivery and the pushback.

The paradox: teens are biologically driven toward autonomy and will push every limit, yet are neurologically less able to self-regulate, so they need the container precisely because they're trying to break out of it. A sensitive teen with no structure doesn't feel free; they feel unsafe. Holding limits communicates: "I'm here. I'm not afraid of you. I won't abandon the limit just because you're upset, and I won't abandon you for pushing against it."

Allow your teen to react and have a voice ("I don't agree with it"), with healthy negotiation — but ultimately it must be clear that you make the final decision (this shifts when they're an adult).

A four-part loving-boundary structure (more about your emotional ground and self-trust than scripts):
1. Acknowledge where they're coming from: "I understand you feel midnight is too early, and your friends have later curfews."
2. Set the limit: "The curfew is 11 p.m., and that's not changing tonight."
3. Offer a choice: "You can decide how the last hour goes — we talk when you're home, or you head to your room for alone time."
4. Explain why, briefly and once: "I know our nervous systems after a night out — I won't sleep until you're home, and we all need sleep." The "why" is a window into your values and care, not a justification to defend.

When they argue (and they will, often sophisticatedly), don't treat it as manipulation — they're developing executive skills and testing the structure, with real feelings underneath. Listen and hear them out with confidence ("I hear you. I feel you. Got it"), then "The answer is still no," without emotion. Avoid JADE — justifying, arguing, defending, or explaining excessively. Curiosity, not defensiveness: "That's an interesting argument. I still need to hold the limit. Let's talk more tomorrow." Step out of the right/wrong game; if they want a fight and you give one, they'll fight.

Technology and social media: there's no black-and-white guide — connect with your own values. Social media is designed to exploit the very traits that make sensitive teens who they are (depth, social sensitivity, empathy, rumination) and to deliver dopamine hits and overload. Sensitive teens generally need some limits. But the all-or-nothing "take the phone away" approach often backfires because it severs the social connection they biologically need.
Ideas: screen-free before sleep (framed as shared family values — phones in a basket, parents included), phones away at family meals, and lots of curious conversation rather than constant surveillance ("Let's check in on how social media feels"). Having access (or your teen knowing you have access) without reading everything is fine — trust your intuition, but avoid the energy of "I'm tracking everything." Co-created agreements work well ("What do you think is fair? A daily time limit? A nightly shutoff?"). Limits differ a lot for a 12–13-year-old vs. a 17–18-year-old. Name the need and build awareness ("It seems like you reach for your phone when you feel lonely or anxious — I do too; let's talk about it. It's not a punishment; it's being better humans together").

Repair is essential because we all slip — dropping a limit when tired, or going too hard and rupturing. The problem is leaving it unaddressed (which creates drift). Name it: "I let that go the other night — I was tired. The limit is back. It all comes from care, not control." Or after overreacting: "I was stressed and looking for control. Let's get back to a clear boundary that makes sense." Repair takes about 45 seconds from a grounded place. You always get to repair.

Reflect: Which limits do I hold firmly, and which do I abandon under pushback? What feeling in me gets activated (out of control? doubting the boundary?)? Where does warmth disappear in a boundary conversation, and how do I stay connected to the care underneath? How do I repair after conflict — is there a repair I've been putting off? Is there a limit I avoid setting because I avoid conflict, and what need might it serve? Sometimes it's okay for a teen to feel a little misunderstood: "You'll meet people who don't see eye to eye with you your whole life, and we're here to help you practice." A loving limit, held with warmth and explained with care, tells your teen: I see you. I'm not afraid of you. I'm not going anywhere.`,
  },
  {
    title: 'Module 7 — Connection Across Disconnection',
    body: `Teens naturally pull away and disconnect — and just when they seem to not need you, that's when they need you most. This is the developmental task of individuation (forming an independent identity). Their push-pull is healthy and not personal: they push off to find themselves, get scared, come back, then push off again.

Be a secure base so they feel MORE confident in their independence. Attachment theory says adolescents need the same secure base they needed as infants; what changes is how they seek and use it. It's often indirect — testing by being difficult ("Will you still be there if I act like this?"). They may confide in friends instead of you (a therapist can be a great added support). The question they're asking is: "Is my parent available if I need them?" Studies show teens with at least ONE consistently available, non-reactive parent are significantly more resilient to peer pressure, mental-health challenges, and high-risk behavior. So: consistent, available, emotionally open, and non-reactive (regulate yourself; your tone reveals your state).

The hardest thing parents report: "I'm available, but they won't let me in." Common for sensitive teens — direct, face-to-face conversation can feel too vulnerable or overstimulating. What they CAN handle is proximity — "parallel being" (driving, watching something, sitting in the same room), present and available with no demands. That's relational tissue, not wasted time. Texting is a great bridge ("Proud of you. Here if you want to talk"). Follow their passions with genuine curiosity (photography, art, sport, gaming) — it signals "you care about what I care about." Quality over quantity: 15 seconds of dialed-in attunement beats five minutes of trying hard without attuning.

The 20-second rule: when your teen walks in, offer 20 seconds of genuine presence — brief eye contact, warm unhurried attention, maybe "Want a snack?" — not "How was your day?" or "Do the dishes." The adolescent brain scans for belonging and safety cues; a low-pressure greeting signals safety.

Repair is the most underused relational tool. Lisa Dion: relationship is entirely rupture and repair — little moments of rupture, then reconnecting and growing. We want teens to learn that conflict doesn't mean abandonment.
1. Model it first and own the specific behavior: "I totally dismissed you and invalidated your experience," or "I completely overreacted; I was stressed." (You can take time and come back.)
2. Acknowledge the impact: "I imagine that felt ___. Let me know if I got it right."
3. Name what you wish you'd done (the redo): "What I wish I'd done was ___."
4. Invite a path forward without demanding it; let them come back in their own time.

Teens almost always come back as they push away and explore — the exception is when a parent is so attached they leave no space, so the teen has no choice but to keep pushing. Hold the stance that they'll come back. Every act of repair becomes a lesson they carry into adult relationships: disagreement doesn't mean disconnection, accountability is strength, and "you are worth coming back to."

Co-parenting: sensitive teens feel inter-parental conflict deeply and are more likely to take responsibility for managing the tension. That stress belongs to us adults. Coordinate limits and keep them consistent (within each household at least), don't recruit your teen as an emotional ally against the other parent (that's offloading), and protect your own nervous system (especially single parents). You don't need perfect harmony — just don't make your teen feel responsible for your pain.

Reflect: What are my teen's preferred low-agenda connection activities, and am I using them? How do I respond when they push back or withdraw — do I stay available? Is there a repair I owe them? How is my regulation (or lack of it) showing up?
Takeaways: Be the secure base (presence and predictability over perfection). Keep the door open with low-agenda connection. Quality over quantity. Protect your own regulation — you are your teen's co-regulation resource. The distance your teen creates isn't a verdict on the relationship; it's the development asking you to hold on.`,
  },
  {
    title: 'Module 8 — Sensitive Teens at School and in the World',
    body: `Good job getting to this point of parenting a teenager. In the teen years, the world beyond home suddenly gets much bigger. Up to about age 12, schools and communities keep things contained; as teens, kids are treated more like adults and exposed to far more. Our role shifts from navigator/controller to a really good coach on the sideline — essential and influential, but no longer playing the game.

One framing: at birth there's an energetic "cord" between your root and your child's; they look to you for safety constantly. Around age 12, it's time to unhook that cord and let them find their own ground — clumsily, with you on the sideline. Many cultures and religions mark this with rites of passage (vision quests, bar/bat mitzvah). It's important we allow space for the transition, and trust that your years of hands-on parenting built an epic foundation.

Areas to keep in mind as we loosen the leash:

Academic pressure, perfectionism, and performance anxiety. Sensitive teens hold incredibly high internal standards, which can produce distress and even school refusal ("I just can't go"). Signs of overwhelm are usually NOT laziness — they're perfectionism-driven procrastination ("If I can't do it perfectly, I'll ignore it"), plus physical symptoms (headaches, stomachaches, fatigue) and tearful meltdowns over fine grades. Disconnect self-worth from grades: "The grade indicates how you did on that assignment; it has nothing to do with who you are." Avoid "Just try harder" or "You're too smart to be struggling." But attune — some driven teens find "the grade doesn't matter" invalidating. If anxiety is clinically significant (preventing functioning), consider accommodations (extended time, reduced load), and lean on a therapist. Sometimes we step in.

Friendships. Sensitive teens often prefer one or two deep friendships over many casual ones (not always). Friendship dynamics around ages 8–10 and into the teen years feed into future romantic relationships — big, messy work (anxious? avoidant? hurt?). Anchor and support deep friendships rather than pushing "go get more friends." Validate social exhaustion instead of labeling it "antisocial." Watch (without overstepping) for one-sided dynamics — sensitive teens can become the emotional caretaker and burn out, or take up all the space as the "victim." Mostly there's nothing to "do" — it's a gift to notice and celebrate while being honest about how exhausting it is.

Social media / phone connection. Deep processing of every comment, overstimulation, overloaded empathy, reading between the lines. Don't eliminate it (it's a real way teens connect) — track it, stay aware and curious, and have ongoing dialogue: "I'm not taking it away, but I want an open conversation about how it makes you feel." This models the same questions adults struggle with, and creates a container so your teen comes to you when things go downhill — sometimes leading them to choose a break themselves.

Self-advocacy. A key outcome of parenting a sensitive teen is a blueprint to articulate their own needs — at school, work, and in relationships. Make feelings-identification and naming needs a priority at home ("I'm feeling rejected and lonely, also hungry, and sad about what you said"). Role-play hard asks ("You're scared to tell the teacher this — let's practice"). Reframe asking for help: they can always ask, the answer might be no, and you're always there for their reaction. Vulnerably share your own stories (without dumping).

Knowing when to step in vs. step back (seek support; trust intuition):
- Step IN: sustained distress (not just one hard situation), a worrying one-sided dynamic over time, academic anxiety to the point of not functioning (vomiting, can't go to school), and ALWAYS if your teen says "I think I need more help" or shows signs of asking.
- Step BACK: when discomfort is appropriate ("this is awkward, and that's okay — let's sit with it"); when you'd only manage it because watching the struggle is hard for YOU, they haven't asked, and they don't seem overwhelmed; and when there's a safe, instructive natural consequence (a speeding ticket, missing a game for breaking a rule, saving up to replace a phone they shattered).

Reflect: Where is my teen most overwhelmed (school, friendships, social media, extracurriculars)? Am I over-managing any part of their external life because watching them struggle is hard for me? What would it look like to coach from the sideline this week instead of running onto the field?`,
  },
  {
    title: 'Module 9 — Building Your Village',
    body: `It takes a village — a little cliché, but true. Parenting a teenager is hard and can trigger you in unexpected ways, and no parent was meant to do this alone. As your sensitive teen gets older, neither are they — they need support and a sense of belonging in disconnected times. Part of conscious parenting is going against the grain toward real, in-person connection. (We use AI and online resources at the Tuned In Institute as tools, but the goal is to connect people with in-person support.)

Build your own support system. Lean on therapy and coaching now — there are great options covered by insurance, so find someone who takes yours. Stay connected to other parents in similar situations; it normalizes what you're going through (sensitive people tend to isolate under stress, so seek connection anyway). Lean on your own regulation practices — recognize when your nervous system is off and know what brings you back to center.

Reduce the stigma of mental-health care: many teens have therapists now, like having a mentor. If your teen has any opening to a trusted adult to confide in weekly or biweekly, therapy can be amazing — not a replacement for you, but a resource alongside you. Definitely pursue therapy soon if your teen is shut down for extended periods, using substances to cope, self-harming, having eating issues, refusing school, or expressing deep hopelessness.

Help your teen build their village — trusted adults beyond you (relatives, coaches, family friends, slightly older mentors). Even one trusted adult outside your house is a protective factor in child development. Peer community matters, especially around shared depth and shared interests (art, martial arts, debate, community service). Sensitive teens finding their people and a shared purpose can make all the difference.

Your language matters: "I'm always here for you, AND I want you to have people who are just yours. It makes sense you're comfortable with me; I also want you to practice trusting other people."

Trust that your teen will come back to you. (Sophie's dad got advice: "Your child will always come back to you. Give them space" — and leaned on other parents during her own twenties of finding her footing.)

Reflect: Who's in my support system right now — is it enough? Is my teen in therapy, and if not, what stopped me? (It's fine if not, as long as it's not stigma blocking needed one-on-one support.) Who are the trusted adults in my teen's life beyond me? What would it look like to invest in my own support system this month?`,
  },
  {
    title: 'Module 10 — Raising a Thriving Sensitive Teen',
    body: `This final module integrates everything. You won't finish and suddenly have a teen who doesn't challenge you — what changes is that you'll relate to yourself, your world, and your teenager with more ease. When we show up more regulated, curious, boundaried, and connected, the relationships around us change. That's the whole point.

Core principles to return to:
1. Your teen is not broken. They're wired differently and going through big nervous-system and brain changes, especially if highly sensitive. Their sensitivities are not a flaw to fix — they come with superpowers to celebrate, building self-esteem instead of shame.
2. Your nervous system is the tool. Explore meditations and grounding content, and find regulation in relationships, hobbies, and joy. It doesn't have to be sitting and meditating — it might be work or a hobby that connects you to a purpose bigger than the day's stress.
3. Connection is the container. Every limit, lesson, and consequence works better inside a connected relationship.
4. Your work is parenting. Your unprocessed experience will surface; doing your inner work is one of the most powerful things you can do for your teen. Get your own support.
5. The struggle is the development. Trust the process — a contraction before an expansion. Deeper understanding follows struggle.

Imagine your teen at 25: they've navigated adolescence with their sensitivity as one of their greatest gifts, not despite it — empathetic, discerning, with boundaries, processing deeply and feeling fully, knowing their worth, needs, limits, and gifts. They got there because you chose to parent in an educated, aware, attuned way. You're shaping the nervous system of a future adult.

Exercise — write a letter to your teenager (suggested: keep it for yourself rather than giving it to them). Write as if from you 20 years in the future, looking back with love and wisdom. Mention how hard you tried, even on days it didn't show ("I took this course, I talked to therapists; I was trying my best to do right by you"). Mention who you saw them becoming — from hindsight, "I was rooting for you on the sidelines; I could already see the person you were becoming." Read it back and sit with it.

Build sustainable family patterns: a home where stress gets addressed rather than avoided, where we give each other room to regulate and co-regulate, and where teens feel safe being authentically themselves.
- Ritualize connection: protect one weekly ritual fiercely (Sunday ice cream, a walk, Friday night). It can be a game changer.
- Keep repairing, over and over. A rupture becomes an opportunity to strengthen the relationship. Repair can be 45 seconds, not a 15-minute lecture: "The way I approached this, I imagine it felt pretty icky — will you let me know? Super sorry. How can we move forward?"
- Continue your own therapeutic work; your growth as a parent is lifelong, and your teen feels you practicing self-awareness and self-healing.
- Celebrate what's working. Take a beat to say, "We're doing a pretty good job." (When kids are grown, you'll look back and see excitement and amazing chaos.)

Sensitive people become some of the most extraordinary adults — artists, healers, researchers, leaders; the ones who feel most deeply are often the ones we want leading. The hardest traits transform over time:
- Overwhelming emotional intensity → deep empathy and emotional intelligence.
- Refusal to accept surface answers → rigorous thinking and intellectual integrity.
- Hypersensitivity to injustice → courageous advocacy.
- Exhausting depth in every conversation → rich, meaningful relationships.
- Radical (sometimes brutal) honesty → the voice that changes the room.

We have these last few years to help our teens see their potential and feel their gifts — to move their experience from intensity to superpower, and arrive at adulthood knowing that what makes them hard to parent is also what makes them remarkable.`,
  },
]

async function main() {
  // Idempotent: remove any prior import of this collection, then recreate.
  const existing = await sql`select id from section where slug = ${SECTION.slug}`
  if (existing.length) {
    const id = existing[0].id
    await sql`delete from lesson where "sectionId" = ${id}`
    await sql`delete from section where id = ${id}`
    console.log(`Removed existing collection #${id} (${SECTION.slug}) for a clean re-import.`)
  }

  // Place it after the other sections so position ordering stays tidy.
  const [{ max }] = await sql`select coalesce(max(position), 0) as max from section`
  const position = Number(max) + 1

  const [created] = await sql`
    insert into section (slug, title, description, hidden, position)
    values (${SECTION.slug}, ${SECTION.title}, ${SECTION.description}, true, ${position})
    returning id
  `
  const sectionId = created.id

  let pos = 0
  for (const l of LESSONS) {
    pos += 1
    await sql`
      insert into lesson ("sectionId", kind, title, body, hidden, position)
      values (${sectionId}, 'article', ${l.title}, ${l.body}, true, ${pos})
    `
  }

  console.log(
    `Imported hidden collection "${SECTION.title}" (#${sectionId}) with ${LESSONS.length} lessons.`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
