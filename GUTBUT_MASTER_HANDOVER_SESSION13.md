# GutBut Trigger Tool — Master Handover Document
## Session 13 Start

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

**GutBut Trigger Tool** — a personal gut health tracker that uses AI to analyse meal, symptom, sleep, stress, and supplement logs and surface personalised insights and experiments. Users discover their personal gut triggers through structured AI-powered experiments.

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
| Styling | Inline styles only — no new CSS files. Design system: cream `#f5f0e8`, dark green `#1e4d35`, Playfair Display + DM Sans |
| Fonts | Playfair Display (headings/italic accents), DM Sans (body/labels/UI) |
| Database | Supabase (Mumbai region) |
| Hosting | Vercel |
| AI | OpenAI `gpt-4o-mini` |
| Auth | Supabase Auth |
| CLI | Claude Code |

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

## 7. Critical Rules — Read Before Touching Anything

- **`proxy.ts` not `middleware.ts`** — the auth session refresh file is `proxy.ts`. Do not rename or create `middleware.ts` or it will conflict.
- **Always use the legacy anon key** — the newer JWT-format Supabase anon key causes auth failures. Use the original legacy key in `.env.local` and Vercel.
- **`adminSupabase` in API routes only** — all `SUPABASE_SERVICE_ROLE_KEY` usage lives in `/app/api/` routes. Client components (`'use client'`) use the public supabase client from `lib/supabase.ts`.
- **Do not touch `app/insights/page.tsx`** — this file is the most complex in the codebase (caching system, AI integration, personalisation). Treat it as read-only unless there is a specific targeted bug fix. Do not include it in bulk redesigns.
- **Do not touch `proxy.ts`, `lib/supabase.ts`, or any file in `app/api/`** unless there is a specific reason. All data fetching logic is stable.
- **Inline styles only** — no new CSS files, no Tailwind utility class additions. All styles are inline or in `<style>` blocks inside components.

---

## 8. Supabase Tables

| Table | Purpose |
|---|---|
| `logs` | All user log entries (meal, symptom, sleep, stress, supplement) |
| `experiments` | Gut health experiments with status, result, verdict |
| `experiment_logs` | Daily entries inside an active experiment |
| `user_profiles` | Personal data: first_name, age, gender, diet_type, wellness_goals[], current_symptoms[] |
| `insight_cache` | Cached AI insights results keyed by (user_id, date_range). TTL enforced in the UI (6 hours). |

---

## 9. Complete Feature List

| Feature | Route | Status |
|---|---|---|
| Authentication (sign up / sign in / sign out) | `/auth` | Live |
| Landing page — 9-section marketing page | `/` | Live |
| Log — 5 entry types with greeting, streak indicator | `/log` | Live |
| History — timeline grouped by day with stats strip | `/history` | Live |
| Insights — AI pattern analysis, caching, personalisation with My Info | `/insights` | Live |
| Experiments — active + completed with before/after bars, AI verdict | `/experiments` | Live |
| My Info — personal health profile | `/my-info` | Live |
| Onboarding — first-run My Info capture | `/onboarding` | Live |
| Profile — avatar, journey stats, action cards | `/profile` | Live |

---

## 10. Design System (as of Session 12)

Applied uniformly across all internal screens. Do not deviate from this.

### Colours
| Token | Value | Use |
|---|---|---|
| Page background | `#f5f0e8` | All page backgrounds |
| Card background | `#ffffff` | All cards |
| Primary green | `#1e4d35` | Headings, borders, active states, buttons |
| Card border | `1px solid rgba(30,77,53,0.08)` | Standard card border |
| Card shadow | `0 2px 12px rgba(30,77,53,0.06)` | Standard card shadow |
| Text primary | `#1a1a18` | Body text |
| Text muted | `#5a5a52` | Secondary body text |
| Text soft | `#8a8a7e` | Labels, captions, placeholders |
| Divider | `rgba(30,77,53,0.06)` | Horizontal rules, separators |
| Symptom red | `#c0392b` | Symptom type, error states |
| Sleep blue | `#1a3a5c` | Sleep type |
| Stress amber | `#b7770d` | Stress type |
| Supplement violet | `#5b3d8a` | Supplement type |

### Typography
- **Headings / accents**: `var(--font-playfair, 'Playfair Display', serif)` — italic for soft emphasis, 700 weight for titles
- **All body / UI text**: `var(--font-dm-sans, 'DM Sans', sans-serif)` — clean, no-nonsense

### Header (AppHeader component)
- File: `app/components/AppHeader.tsx`
- Fixed positioned, z-index 50, background `#f5f0e8`
- Top bar 56px: GutBut wordmark left (Playfair 20px 700 `#1e4d35`), page name centered (DM Sans 11px letter-spacing 2px uppercase `#8a8a7e`), 32px avatar right → `/profile`
- Nav bar: 5 pills (Log · History · Experiments · Insights · My Info). Active: `#1e4d35` bg, white text, no border. Inactive: transparent bg, `#8a8a7e` text, `1px solid rgba(30,77,53,0.12)` border.
- All pages use `paddingTop: '104px'` on their main element to clear the fixed header.

### Buttons
- **Primary action**: outline style — white background, `1.5px solid #1e4d35` border, `#1e4d35` text, `border-radius: 100px`, hover: `rgba(30,77,53,0.04)` background
- **Destructive**: transparent background, `#c0392b` text, `rgba(192,57,43,0.25)` border

### Cards
Standard card: `backgroundColor: '#ffffff'`, `borderRadius: '16px'`, `border: '1px solid rgba(30,77,53,0.08)'`, `boxShadow: '0 2px 12px rgba(30,77,53,0.06)'`

Type-accented card: add `borderLeft: '3px solid [typeColor]'`

---

## 11. Session History Summary

### Session 1 — Project Bootstrap
Set up Next.js 16 project, Tailwind, Supabase connection, Vercel deployment. Created the initial file structure and confirmed live deployment.

### Session 2 — Auth + Landing v1
Built sign up / sign in flows with Supabase Auth. Created the first landing page with the GutBut brand identity (cream background, dark green, Playfair Display).

### Session 3 — Log Page
Built the main logging interface: 5 entry types (meal, symptom with severity slider, sleep with hours input, stress with severity + note, supplement). Entries saved to `logs` table.

### Session 4 — History Page
Built chronological history view with delete. Added empty state and delete confirmation.

### Session 5 — Insights v1
Built `/insights` with OpenAI `gpt-4o-mini`. First version returned raw AI text. Added date range filter (7 / 14 / 30 / All Time).

### Session 6 — Insights Cards
Structured insights into category cards (food, sleep, stress, supplement, positive) with severity badges (HIGH / MEDIUM / LOW), recommendations, and a weekly summary card.

### Session 7 — Experiments
Built `/experiments`. Users create a hypothesis (e.g. "Remove dairy for 7 days"), log daily entries, then end the experiment to receive an AI verdict (confirmed trigger / not a trigger / inconclusive). Fixed service role client usage in experiments API.

### Session 8 — My Info + Onboarding
Built `/my-info` to save first_name, age, gender, diet_type, wellness_goals[], current_symptoms[]. Built `/onboarding` first-run flow that captures the same data and redirects to `/log` after completion.

### Session 9 — Profile + Navigation Polish
Built `/profile` with account overview, My Info link, export data, and sign out. Added user avatar (initial letter) across pages. General nav and UX polish.

### Session 10 — Insights Personalisation
- Added a CSS spinner loading card to `/insights` (replaced three-dot animation).
- Changed the insights API from GET to POST.
- Page fetches user profile (first_name, age, gender, diet_type, wellness_goals, current_symptoms) and sends it in the POST body.
- OpenAI prompt now begins with a structured "User context:" prefix, making all insights personal to the individual user.

### Session 11 — Landing Page Redesign + Insights Caching + AppHeader
Three major changes:

**Landing page full redesign** (`app/page.tsx`):
- 9 sections: fixed nav, hero with browser frame mockup, stats row, How It Works (faded background numbers), quote strip, What You'll Discover (dark green bg), Experiment Mode 2-col, final CTA with trust signals, footer.
- IntersectionObserver `.reveal` / `.is-visible` scroll animations.
- Mobile: browser frame hidden, single-column layout.

**Insights caching system** (`app/insights/page.tsx` + `app/api/insight-cache/route.ts`):
- AI analysis no longer runs automatically on page load. Only runs when user explicitly clicks "Analyse my data".
- Cache stored in `insight_cache` table keyed by (user_id, date_range).
- Three cache states: `none` (show Analyse button) → `fresh` (<6h, green "Analysed X hours ago" bar) → `stale` (≥6h, amber warning bar with "Run fresh analysis" button).
- `app/api/insight-cache/route.ts` is a dedicated server route for cache reads/writes because `SUPABASE_SERVICE_ROLE_KEY` cannot be used in client components.

**AppHeader component** (`app/components/AppHeader.tsx`):
- Created as a shared fixed header used by all 6 internal pages.
- Contains GutBut wordmark, centered page name, avatar → `/profile`, and 5 horizontal nav pills with `usePathname()` active detection.

### Session 12 — Full Internal Screen Premium Redesign
Complete visual redesign of all 5 mutable internal screens. `app/insights/page.tsx` was explicitly preserved untouched.

**AppHeader updated** to final design spec:
- 24px horizontal padding, border `rgba(30,77,53,0.08)`, 32px avatar, DM Sans 11px/2px letter-spacing page name, inactive nav pills now show a border (`rgba(30,77,53,0.12)`).

**`app/log/page.tsx`**:
- Time-based greeting ("Good morning/afternoon/evening,") + first name from `user_profiles` in Playfair italic 32px.
- Vertical card list (was 2-col grid) — each card has `border-left` in type colour, 40px emoji icon circle, Playfair 18px title, DM Sans 12px subtitle, › arrow.
- Streak indicator: counts distinct log dates in last 30 days, shows "🔥 X day streak" pill if > 0.
- Form redesign: coloured header band (type colour at 4% opacity) with `border-left`, outline save button (white bg, green border).
- Success state: white card with large ✓, Playfair italic "Logged.", auto-dismiss after 2 seconds.

**`app/history/page.tsx`**:
- Stats strip card at top: total logs / days tracked / top type — fetched and computed client-side.
- Playfair italic date header (e.g. "Saturday, 28 March 2025").
- Day labels: 10px, 2px letter-spacing, uppercase `#8a8a7e`.
- Entry cards: `border-left: 3px solid [typeColor]`, full-colour emoji badge circles (40px), content text in type colour, severity dots in type colour.

**`app/experiments/page.tsx`**:
- New before/after severity bars on completed experiment cards — red "Before" bar + green "During" bar with severity values parsed from AI result (fallback: 4 and 1).
- Confirmed trigger experiments show an italic Playfair sentence: "[name] is a confirmed gut trigger for you."
- Outline-style buttons throughout (white bg, green border).
- New experiment form: Playfair italic 20px title, 10px uppercase labels, cleaner input styling.

**`app/my-info/page.tsx`**:
- Three white section cards: About You / Wellness Goals / Current Symptoms.
- Inputs use cream `#f5f0e8` background → white on focus, `border-color rgba(30,77,53,0.25)` on focus.
- Section labels: DM Sans 10px, 2px letter-spacing, uppercase.
- Pills: white bg when inactive, `#1e4d35` when active.
- Inline "Profile saved ✓" success text in green.

**`app/profile/page.tsx`**:
- Fetches firstName from `user_profiles` — shown in Playfair italic 26px above email.
- Journey stats card: total logs / active days / top trigger (from completed experiments with 'confirmed' verdict).
- Three action cards: My Info (→ `/my-info`), Export my data (CSV download), Sign out (red).

---

## 12. Key Files Reference

| File | Purpose |
|---|---|
| `app/page.tsx` | Landing page — 9-section marketing site |
| `app/components/AppHeader.tsx` | Shared fixed header + nav tabs — used by all 6 internal pages |
| `app/log/page.tsx` | Logging UI with greeting, type cards, form, streak |
| `app/history/page.tsx` | Chronological log history with stats strip |
| `app/experiments/page.tsx` | Experiments manager — active, completed, new form |
| `app/insights/page.tsx` | AI insights with caching — **DO NOT TOUCH in bulk redesigns** |
| `app/my-info/page.tsx` | User health profile form |
| `app/profile/page.tsx` | Account page with journey stats |
| `app/onboarding/page.tsx` | First-run onboarding flow |
| `app/api/insights/route.ts` | POST — fetches logs + runs OpenAI analysis, injects user context |
| `app/api/insight-cache/route.ts` | GET/POST — reads/writes insight_cache table via service role client |
| `app/api/experiment-result/route.ts` | GET — runs AI verdict on a completed experiment |
| `lib/supabase.ts` | Public Supabase client for client components |
| `proxy.ts` | Auth session refresh (NOT middleware.ts — do not rename) |
| `.env.local` | Local environment variables (not committed) |

---

## 13. Git Log (Most Recent)

```
72ac58d  Internal screens premium redesign — minimal, cohesive, production ready
d02664a  Checkpoint before internal screen redesign
7b0cf52  Insights caching — manual analyse button, 6 hour cache, no auto-analysis
f902b4e  Landing page complete redesign
a17b8c4  docs: Session 10 handover document
633e9d4  feat: insights loading state + My Info personalisation
9c087a6  fix: service role client for insights and experiment APIs, fix verdict button
835491a  session 9 progress: my info page, onboarding, experiments rebuild, share result
```

---

## 14. Session 13 Priorities

### 1. Send Outreach
Reach out to potential users and fellowship contacts about GutBut. The app is production-ready with a polished landing page, full feature set, and premium UI. Draft and send messages to:
- Gut health communities (Reddit: r/SIBO, r/ibs, r/GutHealth)
- Fellowship programme contacts (follow up on application if no response)
- Personal network — people who have mentioned digestive or gut issues

### 2. Record the Demo Video
Record a clean walkthrough of the full app for fellowship/portfolio/social use. Suggested flow:
1. Landing page scroll-through (show the hero, How It Works, Discover section)
2. Sign up / onboarding
3. Log a meal, a symptom, and a supplement
4. Switch to History — show the stats strip and entries
5. Go to My Info — fill in name, goals, symptoms
6. Go to Insights — click "Analyse my data", wait for results, show insight cards
7. Go to Experiments — create a new experiment, show an existing completed one with verdict + before/after bars
8. Profile page — show journey stats

**Recording tips:**
- Use a clean browser window, full screen, no tabs visible
- Loom or QuickTime for screen recording
- Keep it under 3 minutes for social sharing; 5–7 minutes for fellowship submission
- Narrate each section: problem → feature → what it shows about your health

### 3. Polish Pass (optional, if time allows)
- Add a `404.tsx` not-found page on-brand
- Add toast confirmation on successful experiment log entry
- Consider adding a simple date picker to History to filter by month

---

## 15. Fellowship Status

**Pending.** Application submitted before Session 10. No decision received as of Session 12. Follow up if no response received by end of Session 13.

---

*Last updated: Session 12 end. Next session: Session 13.*
