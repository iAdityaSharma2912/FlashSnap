# FlashSnap

FlashSnap is a modern flashcard application powered by AI. It transforms PDFs or topics into high-quality study decks with built-in spaced repetition for effective learning.

## Features

- **PDF to Flashcards** — Upload any PDF and get AI-generated Q&A cards
- **Topic Generation** — Type any topic for comprehensive flashcard coverage
- **SM-2 Spaced Repetition** — Science-backed algorithm that adapts to your recall performance
- **Study Mode** — Flip cards and rate retention (Again/Hard/Good/Easy)
- **Progress Tracking** — View mastery stats and due cards per deck
- **Export** — Download as PDF, CSV (Anki-compatible), or JSON
- **Authentication** — Email/password registration and login
- **Demo Mode** — Generate and preview cards without signing up

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS + Radix UI components
- **AI**: OpenRouter API (supports multiple providers)
- **PDF Processing**: pdf-parse

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon or Supabase recommended)
- OpenRouter API key

### Installation

```bash
npm install --legacy-peer-deps
```

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure these variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon/Supabase) |
| `OPENROUTER_API_KEY` | Get from [openrouter.ai](https://openrouter.ai/keys) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate |
| `NEXTAUTH_URL` | `http://localhost:3000` (dev) or your domain (prod) |

### Database Setup

```bash
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (includes Prisma generate) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
flashsnap/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── generate/           # Flashcard generation
│   ├── decks/              # Deck management
│   ├── study/[id]/         # Study mode
│   ├── login/              # Authentication
│   ├── register/           # User registration
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # Base UI components
│   ├── layout/             # Navbar, PageHeader
│   ├── generate/           # PDF upload, generation
│   ├── flashcards/         # Flashcard components
│   └── decks/              # Deck components
├── lib/                    # Core utilities
│   ├── prisma.ts           # Database client
│   ├── auth.ts             # NextAuth config
│   ├── openrouter.ts       # AI integration
│   ├── sm2.ts              # Spaced repetition algorithm
│   └── export.ts           # Export utilities
└── prisma/
    └── schema.prisma       # Database schema
```

## Deployment

Deploy to Vercel (free):

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The `vercel.json` file configures the build to include Prisma generation.

## License

MIT
