# Founder Studio - Web application

This is an additive Next.js interface for the original Founder Skill project by Jake Schincariol. The upstream README, MIT license, 11 skill instructions, four Python tools, examples, plugin metadata and tests are preserved byte-for-byte.

## Requirements

- Node.js 20.9+
- Python 3.10+
- An OpenRouter API key (free models are available; usage is rate-limited)

## Run locally

```bash
git clone https://github.com/Joeybuilds043/founder-studio..git
cd founder-studio.
bash scripts/setup-local.sh
npm install
cp .env.example .env.local
```

Create an API key at https://openrouter.ai/settings/keys. Add it to `.env.local`:

```dotenv
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openrouter/free
PANEL_CONCURRENCY=1
MODEL_INPUT_USD_PER_MILLION=0
MODEL_OUTPUT_USD_PER_MILLION=0
```

Keep the key private. Never paste it into browser code, commit `.env.local`, or include it in screenshots. Then start:

```bash
npm run dev
```

Open http://localhost:3000.

To use Gemini or OpenAI instead, change `AI_PROVIDER` and set the corresponding server-side API key and model variables.

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

## Free-model limits and privacy

The `openrouter/free` router selects from currently available free models; the selected model can change between requests. OpenRouter documents free-model rate limits, including 20 requests per minute and typically 50 requests per day for free-tier accounts that have not purchased credits. Limits and model availability can change. Failed attempts may count toward the daily limit. A 5- or 10-person synthetic panel already consumes 5 or 10 model requests, before running the other agents. Keep panel concurrency at 1 and use small test panels. Do not configure paid-model fallbacks if the app must remain free.

Free models can be slower, less consistent, or temporarily unavailable. Outputs from different underlying models may vary. Review important outputs rather than treating them as verified research. Check OpenRouter's current [free model catalogue](https://openrouter.ai/collections/free-models) and [rate-limit documentation](https://openrouter.ai/docs/api-reference/limits) before relying on a quota.

Review OpenRouter's current data and privacy terms before submitting confidential business, customer or personal information. Free access is not unlimited and does not guarantee production availability.

## App caveats

- The four original Python scripts run server-side using fixed, allow-listed script paths.
- Workspace data is stored in `founder/`; ephemeral hosting may lose it after restart.
- The starter app has no login, tenant isolation, request throttling or persistent hosted database. Do not expose it publicly until these are added.
- Consumer-panel outputs are synthetic and must not be presented as actual interviews.
- The cost display is an estimate, not a billing guarantee.

## Attribution

Original project: [Jake Schincariol - founder-skill](https://github.com/Jakeschincariol/founder-skill). The original MIT license and copyright notice are retained. The web application is an additive layer.
