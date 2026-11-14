---
name: founder-board
description: >-
  Your board of directors. Puts a business idea in front of a three-member board,
  each a sub-agent reading the idea through one published framework: the Offers
  lens (from Alex Hormozi's $100M Offers), the Monopoly lens (from Peter Thiel's
  Zero to One) and the Product lens (from Walter Isaacson's biography of Steve
  Jobs). Each member scores the idea, names the risks that would kill it and votes
  fund, fund with conditions, or pass. Use when the user says "test my business
  idea", "would this work", "pressure-test this", "what would a board say", "is
  this a good business", or starts the founder pack on a new idea.
argument-hint: "<the business idea, or leave blank to use the conversation>"
---

# founder-board

The first meeting. Before anyone builds a website or signs a lease, three board
members tear the idea apart, each from a different angle, and vote.

What the user typed after `/founder-board`: `$ARGUMENTS`. If that is blank, take
the idea from the conversation.

## The rule about the three names

The lenses are summaries of **published frameworks**, nothing more. The board
members are not those people, never speak as them, never quote them, never claim
they would endorse anything. Write "the Offers lens", never "Alex Hormozi says".
If the user asks what one of them really thinks, say you can only apply their
public frameworks.

## Step 0: the idea file

Everything in the founder pack reads `founder/idea.md` in the user's project. If
it does not exist, write it now from the conversation:

```markdown
# <business name, or a working name>

- What it is: one sentence.
- Who it is for: the target customer, as specific as the user can make it.
- What it sells, at what price: the core product and its price.
- Where and how: city or online, how customers find it, how it is delivered.
- Budget and constraints: money, time, skills, anything already decided.
```

If the name, the customer, the product or the price is missing, ask for those (at
most three questions in one message), then write the file. Do not invent a
budget, a market size or a competitor.

## Step 1: brief the board

Write `founder/board/brief.md`: the idea file plus anything else the user said
that a stranger would need. **Sub-agents cannot see this conversation**, so the
brief must stand on its own. Do not add your own opinion of the idea to it.

## Step 2: convene

Launch three sub-agents in ONE message (Agent tool, `subagent_type:
general-purpose`, one per member), each told: `Read founder/board/brief.md and
founder-board's lenses.md (path below), apply ONLY the <lens> lens, and write
your memo to founder/board/<lens>.md.` The lens file is `lenses.md` in this
skill's folder (`${CLAUDE_SKILL_DIR}/lenses.md`; if that path is not expanded,
use the base directory Claude Code printed for this skill).

Each memo, in this shape:

```markdown
# <Lens> lens
Score: <1-10> | Vote: FUND / FUND IF / PASS
## What is strong
## What would kill it (the top 3, most dangerous first)
## The questions I would ask the founder
## If FUND IF: the conditions
```

## Step 3: the chair's summary

Read the three memos (they are short) and write `founder/board.md`:

1. Exact vote tally and average score. Show the arithmetic and use only the three memos.
2. Risks raised by more than one member. Name which members raised each risk.
3. A short checklist of realistic next steps. Remove duplicates and resolve conflicts.
   Do not make every suggestion a strict condition. Mark unsupported numbers as
   "proposed test target, not a proven benchmark".
4. The strongest focused version of the business.
5. Disagreements and open questions that still need evidence.

Keep the members' disagreements. A board that agrees on everything was not doing
its job. Use simple everyday English, short sentences and clear explanations.
Avoid jargon and long paragraphs.

## Rules

- Score the business, not the founder.
- No made-up facts. If a lens needs a number nobody has yet (market size, customer
  acquisition cost, booking value or margins), say "Not known yet" and name the
  skill that can help estimate or test it (`/founder-competitors`,
  `/founder-consumer`, `/founder-cfo`).
- Do not confuse bookings, total booking value and commission revenue.
- Do not require a patent or proprietary technology by default. A small business
  can build an advantage through trust, reliable service, supplier relationships
  and local knowledge.
- Do not set large revenue or provider targets without evidence. Suggest small,
  measurable pilot tests instead, and label them as proposals.
- Prefer one city and one service type for the first pilot unless the founder
  has evidence and resources to support a wider launch.
- A PASS is a result, not a failure. Say it plainly.
- Write for a non-expert: use plain English, short sentences, explain business
  terms, and avoid jargon, hype and unnecessary complexity.

## Output

`founder/idea.md`, `founder/board/` (brief and three memos), `founder/board.md`.
Then say the vote in one line and suggest the next step: `/founder-competitors`
to see who is already there, or `/founder-consumer` to put it in front of 100
simulated buyers.

## Where the pack goes next

```
board -> competitors -> consumer -> pricing -> offer -> cfo -> marketing -> brand -> ops -> launch -> plan
```

Every skill can also run on its own; each reads whatever is already in `founder/`.
