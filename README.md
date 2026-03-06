# AVORA — GTM & Sales Strategy Platform by Enigma Sales

AI-powered SaaS for B2B Go-To-Market strategy generation. Next.js 16, Prisma 7, Claude AI.

## Features

- **AI Strategy Generation** (Claude claude-sonnet-4-6): ICP, DMU Map, ABM Strategy, Outreach Playbook, Lookalike Criteria
- **7-Step Onboarding Wizard** with confidence scoring and autosave
- **Strict Gate** (ICP + DMU ≥ 90%) required before lead ordering
- **LITE Plan**: Strategy generation, 2 PDF exports, $15/lead
- **PLUS Plan**: $5/lead, Leads Dashboard, XLSX download (Export Pack)
- **Multilingual**: English & Arabic (regenerate, not translate)
- **Admin Panel**: Payment confirmation, order management, lead upload, audit log

## Quick Start

```bash
npm install
cp .env.example .env  # add your ANTHROPIC_API_KEY
npx prisma migrate dev
npm run dev
```

## Environment Variables

```
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_SECRET=your-secret-min-32-chars
ANTHROPIC_API_KEY=sk-ant-...
ADMIN_EMAIL=admin@enigmasales.com
```

## Routes

- `/` Landing page
- `/register` & `/login` Auth
- `/onboarding` 7-step wizard
- `/dashboard` Strategy dashboard
- `/admin` Admin panel (set ADMIN_EMAIL first)

## Tech Stack

Next.js 16 · Prisma 7 + SQLite/libsql · Anthropic Claude API · jsPDF · xlsx · Tailwind CSS v4

## Brand

- Teal `#1E6663` · Coral `#FF6B63` · White `#FFFFFF` · Dark `#1F2A2A`
