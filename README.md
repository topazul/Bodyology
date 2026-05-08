# Bodyology

Personalised training platform connecting coaches and clients — programs, progress, PRs, and AI-powered guidance in one place.

## Stack

- **Next.js 14** (App Router)
- **Supabase** — PostgreSQL, Auth, Realtime, Storage
- **Tailwind CSS**
- **Anthropic Claude API** — AI fitness & nutrition assistant
- **Vercel** — deployment

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/topazul/Bodyology.git
cd Bodyology
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://qdmlfddbsewqyywzilma.supabase.co/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbWxmZGRic2V3cXl5d3ppbG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzQwNTAsImV4cCI6MjA5MzgxMDA1MH0.z9oxCSevQ8wRrUHFh1TVOCOd-BtySE2i9KyA48fkGI8
ANTHROPIC_API_KEY=sk-ant-your-key
```

- Supabase URL and anon key: **Supabase Dashboard → Settings → API**
- Anthropic key: **console.anthropic.com → API Keys**

### 3. Set up the database

1. Open your **Supabase Dashboard → SQL Editor**
2. Paste the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**

This creates all tables, triggers, Row Level Security policies, and enables Realtime for messages.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push your repo to GitHub
2. Import the repo in **Vercel Dashboard → New Project**
3. Add your three environment variables in Vercel project settings
4. Deploy

---

## Project structure

```
app/
  auth/           Login + signup pages
  dashboard/
    coach/        Clients, program builder, profile, AI
    client/       Today, week, PRs, AI
  api/
    ai/           Streaming Claude API route
    reviews/      Review submission

components/
  shared/         Sidebar, MessageThread, BodyMap, PRModal
  coach/          Coach-specific components
  client/         Client-specific components

lib/
  supabase/       Browser, server, middleware clients
  types.ts        TypeScript types
  utils.ts        Helpers, constants

supabase/
  migrations/     SQL schema
```

---

## Features

| Feature | Status |
|---|---|
| Coach & client auth with roles | ✅ |
| Coach client roster | ✅ |
| Weekly program builder with day types | ✅ |
| Per-exercise intensity (% 1RM) | ✅ |
| Client today view + exercise check-off | ✅ |
| Animated body muscle map | ✅ |
| Personal record logging | ✅ |
| Real-time coach ↔ client messaging | ✅ |
| AI fitness & nutrition assistant | ✅ |
| Coach profile & rating system | 🔜 Phase 5 |
| Video demo upload | 🔜 Phase 6 |
| Weekly progress view | 🔜 Phase 3 |
| Mobile responsive | 🔜 Phase 6 |
