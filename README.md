# Cloudflare Tutorial

An interactive learning platform for mastering Cloudflare's developer platform. Test your knowledge with AI-powered quiz evaluation, track your progress, and get personalized study recommendations.

![Cloudflare Tutorial](https://img.shields.io/badge/Cloudflare-Tutorial-F6821F?style=flat&logo=cloudflare&logoColor=white)
![SvelteKit](https://img.shields.io/badge/SvelteKit-5-FF3E00?style=flat&logo=svelte&logoColor=white)
![Workers AI](https://img.shields.io/badge/Workers-AI-F6821F?style=flat&logo=cloudflare&logoColor=white)

## Features

- **95+ Interactive Questions** covering Workers, KV, Durable Objects, D1, R2, Queues, Workflows, AI Gateway, and more
- **AI-Powered Evaluation** using Cloudflare Workers AI (Llama 3.1) to judge your answers
- **Follow-up Questions** - ask the AI to clarify any concept
- **Progress Tracking** with localStorage persistence
- **Performance Analytics** by category with study recommendations
- **Multiple Quiz Modes** - full quiz, quick 20-question, or by category

## Tech Stack

- **Frontend**: SvelteKit 5, Tailwind CSS 4
- **Backend**: Cloudflare Workers, D1 (SQLite), Durable Objects
- **AI**: Cloudflare Workers AI (Llama 3.1 8B Instruct)
- **Auth**: Better Auth (optional, included but not required for quiz)
- **Deployment**: [Alchemy](https://alchemy.run) for zero-config Cloudflare deployment

## Quick Start

```bash
# Clone the repo
git clone https://github.com/acoyfellow/cf-tutorial.git
cd cf-tutorial

# Install dependencies
bun install

# Set your Alchemy password
echo 'ALCHEMY_PASSWORD=your-secure-password' > .env

# Start development
bun run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── lib/
│   ├── flashcards.ts         # 95+ quiz questions and answers
│   ├── quiz-store.svelte.ts  # Svelte 5 reactive quiz state
│   ├── auth.ts               # Better Auth config (optional)
│   └── schema.ts             # D1 database schema
├── routes/
│   ├── +page.svelte          # Main quiz UI
│   └── data.remote.ts        # Server-side AI functions
└── hooks.server.ts           # Server hooks

worker/
└── index.ts                  # Durable Objects (extensible)

alchemy.run.ts                # Cloudflare deployment config
```

## Topics Covered

| Category | Questions | Key Concepts |
|----------|-----------|--------------|
| Workers Fundamentals | 8 | V8 isolates, CPU limits, handlers |
| Execution Context | 3 | waitUntil, lifecycle |
| Workers KV | 5 | Eventually consistent storage |
| Durable Objects | 6 | Strong consistency, WebSockets |
| D1 | 5 | SQLite at the edge |
| R2 | 4 | S3-compatible object storage |
| Queues | 4 | At-least-once delivery |
| Service Bindings | 5 | Worker-to-Worker RPC |
| Workflows | 8 | Durable execution |
| Agents SDK | 5 | AI agent framework |
| MCP | 4 | Model Context Protocol |
| Browser Rendering | 4 | Headless Chrome |
| Containers | 4 | Run any runtime |
| AI Gateway | 5 | AI proxy & guardrails |
| Workers AI | 4 | Edge inference |
| Vectorize | 3 | Vector database |
| Hyperdrive | 4 | Database connection pooling |
| Pipelines | 3 | Event ingestion |
| Pages | 3 | Static + functions |
| Wrangler | 4 | CLI tooling |
| HTMLRewriter | 4 | Streaming HTML transforms |
| Smart Placement | 3 | Auto-optimization |
| System Design | 4 | Architecture patterns |
| Gotchas | 5 | Common pitfalls |

## How It Works

1. **Choose a quiz mode** - Full (95 questions), Quick (20 random), or by category
2. **Answer questions** in your own words
3. **AI evaluates** your answer against the reference using Workers AI
4. **Ask follow-ups** to clarify concepts you're unsure about
5. **Review results** with category breakdowns and study recommendations
6. **Track progress** across sessions with localStorage

## Development

```bash
# Start dev server (auto-runs migrations)
bun run dev

# Type checking
bun run check

# Build for production
bun run build

# Deploy to Cloudflare
bun run deploy
```

## Deployment

Alchemy handles all Cloudflare infrastructure:

```bash
# Deploy everything
bun run deploy

# This creates:
# - D1 database with migrations
# - Durable Object namespace
# - Worker with AI binding
# - SvelteKit app on Workers
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ALCHEMY_PASSWORD` | Yes | Alchemy deployment password |
| `BETTER_AUTH_SECRET` | No | Auth secret (auto-generated) |
| `BETTER_AUTH_URL` | No | App URL (default: localhost:5173) |

## Adding Questions

Edit `src/lib/flashcards.ts`:

```typescript
export const flashcards: Flashcard[] = [
  {
    id: "NEW001",
    category: "Your Category",
    question: "Your question?",
    answer: "The correct answer with key details.",
    tags: ["tag1", "tag2", "important"]
  },
  // ...
];
```

Tags with `"important"` get highlighted in the UI.

## Contributing

Contributions welcome! Areas that could use help:

- [ ] More questions for newer Cloudflare products
- [ ] Improved AI evaluation prompts
- [ ] Additional quiz modes (spaced repetition, timed)
- [ ] Markdown/code formatting in answers
- [ ] Export/import progress

## License

MIT

## Acknowledgments

- Built with [Alchemy](https://alchemy.run) for Cloudflare deployment
- AI powered by [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com)
