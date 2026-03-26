# GutBut Trigger Tool — Master Handover Document
## Session 11 Start

---

## 1. Who We Are Working With

| Field | Detail |
|---|---|
| Name | Shreyansh Kanoongo |
| Location | Jaipur, India |
| Machine | MacBook M5 |
| Gmail | shreyansh.kanoongo@gmail.com |
| Claude Pro account | shreyanshkanoongo2005@gmail.com |

---

## 2. The Product

**GutBut Trigger Tool** — a personal gut health tracker that uses AI to analyse meal, symptom, sleep, stress, and supplement logs and surface personalised insights and experiments.

| Field | Detail |
|---|---|
| Live URL | https://gutbut-trigger-tool.vercel.app |
| GitHub | https://github.com/shreyanshkanoongo-git/gutbut-trigger-tool |
| Local path | `/Users/shreyanshsmac/Hire Interactive/gutbut-trigger-tool` |

---

## 3. Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS + inline styles (design system: cream `#f5f0e8`, dark green `#1e4d35`) |
| Fonts | Playfair Display (headings), DM Sans (body) |
| Database | Supabase (Mumbai region) |
| Hosting | Vercel |
| AI | OpenAI `gpt-4o-mini` |
| CLI | Claude Code v2.1.83 |

---

## 4. All Accounts

| Service | Account |
|---|---|
| GitHub | shreyanshkanoongo-git |
| Supabase | shreyansh.kanoongo@gmail.com |
| Vercel | shreyansh.kanoongo@gmail.com |
| OpenAI | shreyansh.kanoongo@gmail.com |
| Claude Code | shreyanshkanoongo2005@gmail.com |

---

## 5. How to Start Every Session

Open two terminal tabs in the project root `/Users/shreyanshsmac/Hire Interactive/gutbut-trigger-tool`:

**Tab 1 — Claude Code:**
```bash
claude
```

**Tab 2 — Dev server:**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run dev
```

App runs at `http://localhost:3000`.

---

## 6. Environment Variables

Set in `.env.local` and mirrored in Vercel dashboard under project settings.

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (Mumbai) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Always use the **legacy** anon key, not the new JWT-format key |
| `OPENAI_API_KEY` | OpenAI secret key for `gpt-4o-mini` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — used in API routes only, never exposed client-side |

---

## 7. Critical Notes

- **`proxy.ts` not `middleware.ts`** — the auth session refresh file is `proxy.ts`. Do not rename or create `middleware.ts` or it will conflict.
- **Always use the legacy anon key** — the newer JWT-format Supabase anon key causes auth failures. Use the original legacy key in `.env.local` and Vercel.
- **`adminSupabase` in API routes** — all server-side Supabase calls (in `/app/api/`) must use the service role client (`createClient` with `SUPABASE_SERVICE_ROLE_KEY`), not the public client.
- **Type `yes` to accept edits** — when Claude Code proposes file edits in the terminal, type `yes` to confirm.

---

## 8. Complete Feature List

| Feature | Route | Status |
|---|---|---|
| Authentication (sign up / sign in / sign out) | `/auth` | Live |
| Landing page | `/` | Live |
| Log — 5 entry types: meal, symptom, sleep, stress, supplement | `/log` | Live |
| History — view and delete past logs | `/history` | Live |
| Insights — AI pattern analysis, date filter (7/14/30/all), loading spinner card, personalised with My Info data | `/insights` | Live |
| Experiments — AI-generated gut health experiments with verdict tracking | `/experiments` | Live |
| My Info — personal profile (name, age, gender, diet, goals, symptoms) | `/my-info` | Live |
| Onboarding — first-run flow to collect My Info | `/onboarding` | Live |
| Profile — account overview and settings | `/profile` | Live |

---

## 9. Session History Summary

### Session 1 — Project Bootstrap
Set up Next.js 16 project, Tailwind, Supabase connection, Vercel deployment. Created the initial file structure and confirmed live deployment.

### Session 2 — Auth + Landing
Built sign up / sign in flows with Supabase Auth. Created the landing page with the GutBut brand identity (cream background, dark green, Playfair Display headings).

### Session 3 — Log Page
Built the main logging interface supporting 5 entry types: meal, symptom (with severity slider), sleep (hours), stress (severity + note), supplement. Entries saved to `logs` table in Supabase.

### Session 4 — History Page
Built the history view — chronological list of all user logs with delete functionality. Added empty state and confirmation on delete.

### Session 5 — Insights v1
Built the `/insights` route with OpenAI `gpt-4o-mini` integration. First version returned raw AI analysis. Added date range filter (7 / 14 / 30 / All Time).

### Session 6 — Insights Polish + Cards
Redesigned insights output into structured cards grouped by category (food, sleep, stress, supplement, positive) with severity badges (high/medium/low), recommendations, and a weekly summary card.

### Session 7 — Experiments
Built the `/experiments` page. AI generates personalised gut health experiments (e.g. "Remove dairy for 7 days"). Users can mark experiments active, complete them, and record a verdict. Fixed service role client usage in experiments API.

### Session 8 — My Info + Onboarding
Built `/my-info` page for users to save first name, age, gender, diet type, wellness goals, and current symptoms. Built `/onboarding` first-run flow that captures the same data on initial sign up and redirects to `/log`.

### Session 9 — Profile Page + Navigation Polish
Built `/profile` page with account overview, My Info summary, and sign out. Added avatar initial to insights and other pages. General navigation and UX polish across the app.

### Session 10 — Insights Loading Spinner + My Info Personalisation
- Replaced the three-dot loading animation on `/insights` with a centered white card containing a CSS spinner and "Analysing your data..." text in DM Sans, colour `#1e4d35`.
- Changed the insights API from `GET` to `POST`.
- Page now fetches the user's profile (`first_name`, `age`, `gender`, `diet_type`, `wellness_goals`, `current_symptoms`) from `user_profiles` after auth resolves.
- Profile is sent in the POST body and injected at the top of the OpenAI system prompt as structured user context so all insights are personalised to the individual.

---

## 10. Fellowship Status

**Waiting.** Application submitted. No decision received as of end of Session 10. Follow up if no response by end of Session 11.

---

## 11. What to Build in Session 11

1. **Demo video and writeup** — record a walkthrough of the full app for fellowship/portfolio use. Write a short product description covering the problem, solution, and tech stack.
2. **Empty states polish** — review all pages for missing or rough empty states (history with no logs, experiments with no active experiments, insights with no data for selected range). Make them on-brand and encouraging.
3. **Bug hunt during demo** — run through the full user journey (sign up → onboard → log → insights → experiments → profile) and fix any bugs found during the demo recording.
