# Founder Studio web app

This application layer is additive. The original Founder Skill README, MIT license, skills, examples, Python tools and tests remain in their original locations and are not rewritten.

## Requirements

- Node.js 20.9 or newer
- Python 3.10 or newer
- An OpenAI API key with API billing enabled

## Local setup

1. Clone this repository and enter the project directory.
2. Install JavaScript dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local`.
4. Set `OPENAI_API_KEY` in `.env.local`. Keep this file private; never put the key in client-side code or commit it.
5. Optionally set `OPENAI_MODEL`, `PANEL_CONCURRENCY`, and `PYTHON_BIN`.
6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open http://localhost:3000.

The Python tools use only the Python standard library. The app invokes them from the repository root and stores working data in `founder/`. That folder is runtime data and should be backed up separately. On ephemeral hosting, local filesystem writes may be lost on restart; use persistent storage before production deployment.

## Validation

Run the original Python tests:

```bash
python3 -m unittest discover -s tests
```

Run TypeScript checks and a production build:

```bash
npm run typecheck
npm run build
```

## Workflow and data

Each agent loads its corresponding original `skills/founder-*/SKILL.md` file on the server. Agent outputs are saved under `founder/`. The CFO endpoint invokes `unit_economics.py`; the consumer workflow invokes `panel.py` and, where enough valid price observations exist, `van_westendorp.py`; the plan endpoint invokes `compile.py`.

The consumer panel consists of model-generated synthetic personas. It is not a substitute for interviews, surveys, or actual market validation. The displayed cost is an estimate, not a quote.

## Security and deployment

- Keep `OPENAI_API_KEY` server-side.
- Do not deploy this app publicly without adding authentication, authorization, request limits and persistent storage. The starter app does not yet include user accounts or tenant isolation.
- Treat generated business outputs as hypotheses. Verify external market facts and all financial assumptions.
- PDF and Markdown exports are generated server-side.

## Attribution and license

The underlying Founder Skill project is by Jake Schincariol: https://github.com/Jakeschincariol/founder-skill. Its original MIT `LICENSE` and copyright notice are retained in this repository. New web-app code is an additional layer and does not replace or rewrite the upstream materials.