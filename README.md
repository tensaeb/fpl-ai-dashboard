<div align="center">

# FPL//AI  ·  Gameweek Intelligence

**Structured AI-powered Fantasy Premier League briefings, fixture swing radars, and transfer intelligence — built with zero passwords, public data endpoints, and a ruthless availability filter.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-00ff87?style=flat-square)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## ⚡ Highlights

- 🧠 **Dual-Engine Briefings**: Powered by **Google Gemini (Free tier)** or **Anthropic Claude**, with deterministic rule-engine fallback.
- 🛡️ **Hard Availability Filter**: Injured, suspended, or ≤75% doubtful players are excluded before any weighting runs — never a suggestion that cannot play.
- ⏱️ **Short-Horizon Captaincy**: Single-fixture difficulty and recent form dominate the armband decision.
- 📈 **Medium-Horizon Transfers**: 5-gameweek fixture runs and price efficiency prevent knee-jerking on one-week hauls.
- 📱 **Progressive Web App (PWA)**: Installable directly on iOS (Safari) and Android (Chrome) as a native-feeling standalone app with offline fallback.
- 📊 **Post-Hoc Accuracy Tracker**: Automatically scores past captain suggestions and transfer deltas against actual finished gameweek outcomes.
- 🔒 **Zero Credentials Stored**: Connects using public FPL entry IDs only. Passwordless magic-link email authentication for followed squad digests.
- ⚡ **Graceful Degradation**: Seamlessly operates in stateless mode without a database or API keys, using local demo data fallback when live APIs are unreachable.

---

## 📱 Progressive Web App (PWA)

FPL//AI is fully installable on mobile and desktop:

- **iOS (Safari)**: Tap **Share** → **Add to Home Screen**
- **Android (Chrome)**: Tap **Install App** or **Add to Home Screen**
- **Offline Support**: Equipped with a custom service worker pre-caching essential assets and providing a branded offline fallback screen.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/fpl-ai-dashboard.git
cd fpl-ai-dashboard
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```ini
# (Optional) Supabase / PostgreSQL for caching, report archive, and accounts
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"

# HMAC Session Secret (random 32+ characters)
SESSION_SECRET="your-random-32-byte-hex-string"

# (Optional) Gemini AI (Free tier at https://aistudio.google.com/apikey)
GEMINI_API_KEY="AIzaSy..."

# (Optional) Claude AI
# ANTHROPIC_API_KEY="sk-ant-..."

# (Optional) Resend for magic-link auth & weekly digest emails
# RESEND_API_KEY="re_..."
# RESEND_FROM="FPL//AI <briefs@yourdomain.com>"
```

### 3. Database Setup (Optional)

If using a Postgres database:

```bash
# Push schema to database
npm run db:push

# Or view/manage tables in Drizzle Studio
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [`http://localhost:3000`](http://localhost:3000) or check the live demo squad at [`http://localhost:3000/dashboard/demo`](http://localhost:3000/dashboard/demo).

---

## 🧪 Testing & Validation

```bash
# Run unit & guard tests
npm test

# Type-check TypeScript
npm run typecheck

# Lint codebase
npm run lint

# Production build
npm run build
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS v4, Vanilla CSS Design System with Glassmorphism
- **Database / ORM**: PostgreSQL via Drizzle ORM
- **AI Models**: Google Gemini 2.5 Flash / Claude Sonnet / Deterministic Rules Engine
- **Icons**: Lucide React
- **Testing**: Vitest

---

## ⚖️ Disclaimer

Not affiliated with, maintained, authorized, or endorsed by the Premier League or Fantasy Premier League. All data is retrieved from publicly accessible FPL endpoints. Advice provided is for analytical purposes; transfer execution remains the sole decision of the manager on the official platform.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
