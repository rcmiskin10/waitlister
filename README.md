# Saasify - AI-Powered SaaS Boilerplate

A production-ready SaaS boilerplate with AI-powered multi-agent system for landing page generation, market research, analytics insights, and social listening.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/saasify&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_PRICE_PRO,ANTHROPIC_API_KEY,NEXT_PUBLIC_POSTHOG_KEY,NEXT_PUBLIC_POSTHOG_HOST,RESEND_API_KEY,NEXT_PUBLIC_APP_URL)

## Features

- **4 AI Agents** - Landing page generator, market researcher, metrics analyst, and social listener
- **Stripe Billing** - Subscriptions, webhooks, and customer portal
- **Supabase Auth** - Email, OAuth (Google, GitHub), row-level security
- **PostHog Analytics** - Product analytics and event tracking
- **Resend Email** - Transactional emails with beautiful templates
- **Landing Page Builder** - AI-generated pages with live preview
- **One-Click Deploy** - Deploy to Vercel in minutes

## Tech Stack

- **Framework**: Next.js 16.1 (App Router, Turbopack)
- **Language**: TypeScript 5.7 (strict mode)
- **Styling**: Tailwind CSS 4.1 + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **AI**: Claude via Vercel AI SDK

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-org/saasify.git
cd saasify
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
```

Fill in your environment variables (see [Environment Setup](#environment-setup)).

### 3. Set Up Database

```bash
# Start local Supabase (optional)
npx supabase start

# Run migrations
npx supabase db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Setup

### Required Services

1. **Supabase** ([dashboard](https://supabase.com/dashboard))
   - Create a new project
   - Get URL and keys from Settings > API

2. **Stripe** ([dashboard](https://dashboard.stripe.com))
   - Get API keys from Developers > API keys
   - Create products and prices for Pro/Team tiers
   - Set up webhook endpoint

3. **Anthropic** ([console](https://console.anthropic.com))
   - Get API key for AI agents

### Optional Services

4. **PostHog** ([app](https://app.posthog.com))
   - Create project, get API keys from Settings

5. **Resend** ([dashboard](https://resend.com))
   - Get API key for transactional emails

6. **Grok/X** (for social listening)
   - Grok API from [console.x.ai](https://console.x.ai)

## Project Structure

```
/app
  /(marketing)       # Public pages (home, pricing, features)
  /(auth)            # Auth flows (login, signup)
  /(dashboard)       # Protected app
  /api               # API routes
  /deploy            # One-click deploy
/components
  /ui                # shadcn/ui components
  /landing           # Landing page sections
  /dashboard         # Dashboard components
/lib
  /supabase          # Database clients
  /stripe            # Payment logic
  /agents            # AI agent system
  /posthog           # Analytics
  /resend            # Email
```

## Available Scripts

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
```

## Subscription Tiers

| Feature | Free | Pro ($19/mo) | Team ($49/mo) |
|---------|------|--------------|---------------|
| AI Agents | 1 | 4 | 4 |
| Conversations | 10/mo | Unlimited | Unlimited |
| Landing Pages | 1 | 10 | Unlimited |
| Team Members | - | - | 5 |
| Priority Support | - | Yes | Yes |

## AI Agents

1. **Landing Page Generator** - Creates landing page structures from descriptions
2. **Market Researcher** - Validates ideas, analyzes competitors
3. **Metrics Analyst** - Provides insights from PostHog data
4. **Social Listener** - Monitors X/Twitter, Reddit, Hacker News

## Deployment

### Vercel (Recommended)

1. Click the "Deploy with Vercel" button above
2. Fill in environment variables
3. Deploy!

### Manual Deployment

1. Set up a PostgreSQL database
2. Run migrations
3. Configure environment variables
4. Deploy to your preferred platform

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Project overview for AI assistance
- [lib/agents/CLAUDE.md](./lib/agents/CLAUDE.md) - Agent system docs
- [components/landing/CLAUDE.md](./components/landing/CLAUDE.md) - Landing page components
- [supabase/CLAUDE.md](./supabase/CLAUDE.md) - Database schema

## License

MIT
