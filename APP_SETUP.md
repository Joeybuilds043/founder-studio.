# Founder Studio web app

This application layer is additive. The original Founder Skill README, MIT license, skills, examples, Python tools and tests remain in their original locations and are not rewritten.

## Requirements

- Node.js 20.9 or newer
- Python 3.10 or newer
- A Gemini API key from Google AI Studio (free tier available for selected models)

## Local setup

1. Clone this repository and enter the project directory.
2. Run the local ignore helper before creating secrets:

   ```bash
   bash scripts/setup-local.sh
   ```

   It adds generated files, runtime workspace data and `.env.local` to your local Git exclude file.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env.local`.
5. Create a free Gemini API key at https://aistudio.google.com/app/apikey.
6. Open `.env.local` and set:

   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_actual_key
   GEMINI_MODEL=gemini-3.8-flash
   PANEL_CONCURRENCY=2
   MODEL_INPUT_USD_PER_MILLION=0
   MODEL_OUTPUT_USD_PER_MILLION=0
   ```

   Do not add quotation marks around the key. Never paste it into React components, commit it, or share it in screenshots. Keep `.env.local` private.
7. Start the app:

   ```bash
   npm run dev
   ```

8. Open http://localhost:3000.

### Optional: use OpenAI instead

Set `AI_PROVIDER=openai`, then provide `OPENAI_API_KEY` and `OPENAI_MODEL`. The key remains server-side.

## Using Founder Studio

1. Start at the dashboard and write a concrete business idea: customer, problem, proposed solution, location and current stage.
2. Open Board first. Ask it to challenge the assumptions, not simply endorse the idea.
3. Continue through Competitors and Consumer. The Consumer panel creates AI-generated synthetic buyer personas; these are hypotheses, not real customer interviews.
4. Use Pricing after you have a clear product, currency and price assumptions. Van Westendorp results need at least five complete price responses.
5. Use Offer to define exactly what is sold, to whom, and why they would choose it.
6. Complete the CFO inputs using the example schema in `skills/founder-cfo/example.json`. Use real costs and realistic sales capacity. The Python calculator performs the arithmetic.
7. Continue with Marketing, Brand, Ops and Launch. Challenge each output and correct assumptions before moving on.
8. Open Plan last. Read missing evidence and the verdict; do not treat a model-generated verdict as investment advice or proof of demand.
9. Export the plan as Markdown or PDF when ready.

The consumer panel is synthetic. It is not a substitute for real interviews, surveys, supplier quotes or market research. Verify all external facts and financial assumptions.

## Python tools and validation

The Python tools use the standard library. The app invokes them from the repository root and stores working data in `founder/`. Back up this folder separately.

Run tests and checks:

```bash
python3 -m unittest discover -s tests
npm run typecheck
npm run build
```

## Free-tier limits and privacy

Gemini free-tier access is limited by model-specific requests-per-minute, tokens-per-minute and requests-per-day quotas. Check your current quotas in Google AI Studio. A free tier is not unlimited; if a quota is reached, wait for reset or reduce panel size/concurrency. Google states that content submitted on the free tier may be used to improve its products. Do not send confidential business, customer or personal data unless you accept the provider's terms.

## Security and deployment

- Keep API keys in server-side environment variables only.
- Do not deploy publicly without authentication, authorization, request limits and persistent storage. The starter app does not include user accounts or tenant isolation.
- On ephemeral hosting, local filesystem writes may be lost on restart; use persistent storage before production deployment.
- PDF and Markdown exports are generated server-side.

## Attribution and license

The underlying Founder Skill project is by Jake Schincariol: https://github.com/Jakeschincariol/founder-skill. Its original MIT license and copyright notice are retained. The web app is an additive layer.