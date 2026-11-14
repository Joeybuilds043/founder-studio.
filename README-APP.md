# Founder Studio - Web application

This is an additive Next.js interface for the original Founder Skill project by Jake Schincariol. The upstream README, MIT license, 11 skill instructions, four Python tools, examples, plugin metadata and tests are preserved byte-for-byte.

## Requirements

- Node.js 20.9+
- Python 3.10+
- OpenAI API key with API billing enabled

## Run locally

```bash
git clone https://github.com/Joeybuilds043/founder-studio..git
cd founder-studio.
bash scripts/setup-local.sh
npm install
cp .env.example .env.local
```

Add your key to `.env.local`:

```dotenv
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
PANEL_CONCURRENCY=4
```

Never commit `.env.local`. Then start:

```bash
npm run dev
```

Open http://localhost:3000.

## Validation

```bash
python3 -m unittest discover -s tests
npm run typecheck
npm run build
```

## How the pipeline works (10 lines)

1. **Board** reads the founder's idea and constraints; writes `founder/idea.md`, board member lens memos and `founder/board.md`.
2. **Competitors** reads the idea and market context; writes `founder/competitors.csv` and `founder/competitors.md`.
3. **Consumer** reads the customer profile and pitch; creates `founder/customer.json`, `founder/pitch.md`, buyer personas, briefs and answer files under `founder/panel/`.
4. **Pricing** reads the panel's four price responses and competitor prices; writes a Van Westendorp price curve and `founder/pricing.md`.
5. **Offer** reads the idea, pitch, objections, board conditions and economics; writes `founder/offer.md` and may refine the pitch.
6. **CFO** reads `founder/numbers.json`; writes unit contribution, margin, break-even, year-one projections, cash requirement and payback to `founder/cfo.md`.
7. **Marketing** reads the panel, competitors, offer, pricing and economics; writes `founder/marketing.md` with positioning, channels and campaign tests.
8. **Brand** reads the positioning, competitors and customer preferences; writes `founder/brand.md` with name, voice, promise and visual direction.
9. **Ops** reads the idea, offer and cost assumptions; writes `founder/ops.md` and can update `founder/numbers.json`.
10. **Launch → Plan**: Launch writes `founder/launch.md`; Plan reads the accumulated files and compiles `founder/business-plan.md` with a computed verdict.

## App behavior and caveats

- Each agent page loads the corresponding original `skills/founder-*/SKILL.md` on the server and calls the OpenAI API. The key is never sent to the browser.
- The four original Python scripts run as server-side subprocesses using fixed, allow-listed script paths. Workspace data is stored in `founder/`.
- The consumer panel is explicitly synthetic, uses bounded concurrency, and does not represent real customer interviews. Its cost display is an estimate.
- The app requires all core workflow outputs, including panel results, before it will display a positive verdict. This is stricter than the original compiler's permissive handling of absent panel evidence.
- Markdown and PDF exports are generated server-side.
- This starter has no login, tenant isolation, or persistent hosted database. Do not expose it publicly until authentication, rate limiting, durable storage and deployment-specific Python support are added.

## Attribution

Original project: [Jake Schincariol - founder-skill](https://github.com/Jakeschincariol/founder-skill). The original MIT `LICENSE` and copyright notice are retained. The web application is a separate additive layer.