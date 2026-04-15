# FlashSnap — Setup Guide

## Quick Start

### 1. Clone and install

```bash
npm install --legacy-peer-deps
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | [neon.tech](https://neon.tech) (free) or [supabase.com](https://supabase.com) (free) |
| `OPENROUTER_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) (free tier available) |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` for dev, your domain in prod |

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel (free)

1. Push code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → import your repo
3. Add all environment variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `OPENROUTER_API_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel deployment URL)
4. Deploy

The `vercel.json` file already configures the build command with Prisma.

---

## Project Structure

```
flashsnap/
├── app/
│   ├── page.tsx              # Landing page
│   ├── generate/             # Generate flashcards (PDF + Topic)
│   ├── decks/                # Deck library
│   ├── decks/[id]/           # Deck detail
│   ├── study/[id]/           # Study mode
│   ├── history/              # Study history
│   ├── login/                # Auth
│   ├── register/             # Auth
│   └── api/                  # API routes
│       ├── generate/         # AI generation
│       ├── extract-pdf/      # PDF text extraction
│       ├── decks/            # CRUD for decks
│       ├── flashcards/       # Review + SM-2
│       ├── users/            # Registration
│       └── auth/             # NextAuth
├── components/
│   ├── ui/                   # Base components
│   ├── layout/               # Navbar, PageHeader
│   ├── generate/             # PdfUpload, GenerationProgress
│   ├── flashcards/           # FlashcardCard, FlashcardGrid, StudyMode
│   └── decks/                # DeckCard, StatsBar, ExportPanel
├── lib/
│   ├── prisma.ts             # DB client
│   ├── auth.ts               # NextAuth config
│   ├── openrouter.ts         # AI generation
│   ├── sm2.ts                # Spaced repetition algorithm
│   ├── export.ts             # PDF/CSV/JSON export
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Helpers
└── prisma/
    └── schema.prisma         # Database schema
```

---

## Features

- **PDF → Flashcards**: Upload any PDF, AI extracts key concepts into Q&A cards
- **Topic → Flashcards**: Type any topic, get comprehensive coverage
- **SM-2 Spaced Repetition**: Cards surface based on your recall performance
- **Study Mode**: Flip cards, rate (Again/Hard/Good/Easy), track session stats
- **Progress Tracking**: Mastery breakdown per deck, due today alerts
- **Export**: PDF (printable), CSV (Anki-compatible), JSON
- **Auth**: Email/password registration and login
- **Demo Mode**: Works without login for generating and previewing cards

## Security Notes

- API keys are server-side only — never exposed to the browser
- Passwords are hashed with bcrypt (12 rounds)
- NextAuth sessions use JWT strategy
- Never commit `.env` to git (it is gitignored)
