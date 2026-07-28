# GRUPO — Learn. Build. Split the Upside.

A landing page for an AI-era online school with a twist: students don't just take courses, they post real projects/business ideas, recruit co-builders from the student body to fill skill gaps (marketing, editing, dev, etc.), and split the resulting revenue through a built-in agreement system.

Static site, no build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

## Structure

```
index.html         All markup + copy
css/style.css       Design system (dark, sci-fi/HUD aesthetic)
js/main.js          Nav, scroll reveal, stat counters, split simulator, WebGL hero scene
js/vendor/three.min.js   Three.js r128, vendored locally (no CDN dependency)
```

## The core idea: the Build Marketplace

Beyond courses, GRUPO adds a marketplace where:

1. **Post a Build** — a student describes their project/idea, its stage, and which roles are missing (e.g. "I can build the app, I need a marketer and an editor").
2. **Get Matched** — other students apply using verified skill badges (earned from graded course work) and a Builder Score (reputation from past collaborations).
3. **Auto-Contract** — accepting an applicant generates a plain-English Collaboration Agreement with the split, vesting, and IP terms pre-filled.
4. **Ship** — a shared build workspace tracks milestones so progress is visible to every co-builder.
5. **Split** — revenue is divided automatically per the agreement the moment money lands.

## Recommended revenue/equity-sharing model

The hardest part of any co-founder marketplace is "how do we split fairly," so the product ships an opinionated default rather than leaving it to chat threads:

- **Revenue Share** (best for pre-revenue ideas): everyone takes a % of net revenue for a fixed window (12–24 months). No valuation needed.
- **Milestone Equity** (best for long-term ventures): ownership vests as agreed deliverables ship, not just with time — protects founders from co-builders who vanish early.
- **Hybrid Vesting / "Split Sheet"** (recommended default): contributors earn revenue share immediately, which converts into real equity once they cross a milestone threshold. Functions like a SAFE, but for collaboration instead of capital — no upfront valuation fight, but real ownership for people who actually deliver.

Supporting mechanics:
- **Platform fee only on realized revenue** (5% standard / 3% on the Founder tier) — the platform only gets paid when builders get paid, aligning incentives.
- **Reputation over enforcement** — Builder Score tracks split history, deadlines hit, and disputes, so bad actors can't just create a new account.
- **Escrow on first payout** — the first revenue event on any build is held for a short window so co-builders can confirm the split matches the signed agreement before funds release.

An interactive "Split Simulator" on the page (`#simulator` in `index.html`, logic in `js/main.js`) lets a visitor model this live: set monthly revenue, adjust each role's %, see the platform fee and per-builder payout update in real time.
