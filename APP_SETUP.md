# Founder Studio web app

This application layer is additive. The original Founder Skill README, MIT license, skills, examples, Python tools and tests remain in their original locations and are not rewritten.

## Requirements

- Node.js 20.9 or newer
- Python 3.10 or newer
- An OpenRouter API key; free models are available with usage limits

## Local setup

1. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/Joeybuilds043/founder-studio..git
   cd founder-studio.
   ```

2. Run the local ignore helper before creating secrets:

   ```bash
   bash scripts/setup-local.sh
   ```

   It excludes generated files, runtime workspace data and `.env.local` from local Git changes.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env.local`.
5. Create an API key at https://openrouter.ai/settings/keys.
6. Open `.env.local` and set:

   ```env
   AI_PROVIDER=openrouter
   OPENROUTER_API_KEY=your_actual_key
   OPENROUTER_MODEL=openrouter/free
   PANEL_CONCURRENCY=1
   MODEL_INPUT_USD_PER_MILLION=0
   MODEL_OUTPUT_USD_PER_MILLION=0
   ```

   Do not add quotation marks around the key. Never paste it into React components, commit it, or share it in screenshots. Keep `.env.local` private.
7. Start the app:

   ```bash
   npm run dev
   ```

8. Open http://localhost:3000.

### Optional: use another provider

Set `AI_PROVIDER=gemini` and provide `GEMINI_API_KEY` and `GEMINI_MODEL`, or set `AI_PROVIDER=openai` and provide `OPENAI_API_KEY` and `OPENAI_MODEL`. Keys remain server-side.

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

## Free model limits and privacy

The `openrouter/free` router selects from currently available free models, so the underlying model can change between requests. OpenRouter documents free-model limits, including 20 requests per minute and typically 50 requests per day for accounts that have not purchased credits. Limits and model availability can change, and failed attempts may count. A panel of 10 synthetic personas uses 10 model calls; a panel of 50 uses 50 calls before any other agent requests. Start with 5 personas, keep concurrency at 1, and avoid paid-model fallbacks if zero-cost usage is required.

Free models can be slower, less consistent, or temporarily unavailable. Check the current [free model catalogue](https://openrouter.ai/collections/free-models) and [rate-limit documentation](https://openrouter.ai/docs/api-reference/limits). Review OpenRouter's data and privacy terms before sending confidential business, customer or personal information.

## Python tools and validation

The Python tools use the standard library. The app invokes them from the repository root and stores working data in `founder/`. Back up this folder separately.

Run checks:

```bash
python3 -m unittest discover -s tests
npm run typecheck
npm run build
```

## Security and deployment

- Keep API keys in server-side environment variables only.
- Add `AI_PROVIDER`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` and `PANEL_CONCURRENCY` to the hosting platform's private environment-variable settings. Never add the real key to GitHub files.
- Do not deploy publicly without authentication, authorization, request limits and persistent storage. The starter app does not include user accounts or tenant isolation.
- On ephemeral hosting, local filesystem writes may be lost on restart; use persistent storage before production deployment.
- PDF and Markdown exports are generated server-side.

## Attribution and license

The underlying Founder Skill project is by Jake Schincariol: https://github.com/Jakeschincariol/founder-skill. Its original MIT license and copyright notice are retained. The web app is an additive layer.
