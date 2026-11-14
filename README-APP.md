# Founder Studio - Web application

This is an additive Next.js interface for the original Founder Skill project by Jake Schincariol. The upstream README, MIT license, 11 skill instructions, four Python tools, examples, plugin metadata and tests are preserved byte-for-byte.

## Requirements

- Node.js 20.9+
- Python 3.10+
- Gemini API key from Google AI Studio (free tier available for selected models)

## Run locally

```bash
git clone https://github.com/Joeybuilds043/founder-studio..git
cd founder-studio.
bash scripts/setup-local.sh
npm install
cp .env.example .env.local
```

Create a free Gemini API key at https://aistudio.google.com/app/apikey, then add it to `.env.local`:

```dotenv
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.8-flash
PANEL_CONCURRENCY=2
MODEL_INPUT_USD_PER_MILLION=0
MODEL_OUTPUT_USD_PER_MILLION=0
```

Never commit `.env.local` or expose the key in browser code. Then start:

```bash
npm run dev
```

Open http://localhost:3000.

To use OpenAI instead, set `AI_PROVIDER=openai`, `OPENAI_API_KEY`, and `OPENAI_MODEL`.

## Using the app

1. Start on the dashboard and describe the business idea, target customer, problem, solution, location and current stage.
2. Run Board first to challenge the idea and expose weak assumptions.
3. Continue through Competitors and Consumer. The panel generates synthetic personas, not real customers.
4. Use Pricing once the offer, currency and price assumptions are clear. At least five complete price responses are needed for Van Westendorp analysis.
5. Use Offer to define the product, target buyer and reason to choose it.
6. Complete CFO inputs using `skills/founder-cfo/example.json` as the schema reference. Enter realistic costs and sales capacity.
7. Continue through Marketing, Brand, Ops and Launch. Correct assumptions before accepting outputs.
8. Open Plan last, review missing evidence and the verdict, then export Markdown or PDF.

The model's outputs are hypotheses, not proof of demand or investment advice. Verify market facts and financial assumptions independently.

## Validation

```bash
python3 -m unittest discover -s tests
npm run typecheck
npm run build
```

## Free-tier limits and privacy

Gemini free-tier quotas depend on the selected model and can include requests-per-minute, tokens-per-minute and requests-per-day limits. Check the current quota in Google AI Studio. Free access is not unlimited. Google states that content submitted on the free tier may be used to improve its products. Do not submit confidential business, customer or personal data unless you accept the provider's terms.

## App caveats

- The four original Python scripts run server-side using fixed, allow-listed script paths.
- Workspace data is stored in `founder/`; ephemeral hosting may lose it after restart.
- The starter app has no login, tenant isolation, request throttling or persistent hosted database. Do not expose it publicly until these are added.
- Consumer-panel outputs are synthetic and must not be presented as actual interviews.
- The cost display is an estimate, not a billing guarantee.

## Attribution

Original project: [Jake Schincariol - founder-skill](https://github.com/Jakeschincariol/founder-skill). The original MIT license and copyright notice are retained. The web application is an additive layer.