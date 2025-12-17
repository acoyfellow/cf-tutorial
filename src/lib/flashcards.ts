export type Flashcard = {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
};

export const flashcards: Flashcard[] = [
  // ==================== WORKERS FUNDAMENTALS ====================
  { id: "W001", category: "Workers Fundamentals", question: "What runtime do Cloudflare Workers use?", answer: "V8 isolates (Chrome's JavaScript engine), NOT Node.js. Each isolate is a lightweight sandboxed execution environment.", tags: ["runtime", "core"] },
  { id: "W002", category: "Workers Fundamentals", question: "Why V8 isolates instead of containers?", answer: "Isolates start in ~5ms vs containers' 100-500ms+. ~1000x less memory overhead. Multiple isolates share one OS process.", tags: ["performance"] },
  { id: "W003", category: "Workers Fundamentals", question: "What's the memory limit per Worker?", answer: "128 MB per isolate (shared across concurrent requests in same isolate)", tags: ["limits"] },
  { id: "W009", category: "Workers Fundamentals", question: "What's the CPU time limit?", answer: "Free: 10ms. Paid: 30s default (up to 5 min HTTP, 15 min Cron). CPU time, not wall clock.", tags: ["limits", "important"] },
  { id: "W010", category: "Workers Fundamentals", question: "What's the difference between CPU time and duration?", answer: "CPU time = active processing. Duration = wall clock (includes waiting for I/O). You're billed on CPU time.", tags: ["limits", "billing"] },
  { id: "W014", category: "Workers Fundamentals", question: "What's the ES modules Worker signature?", answer: "export default { async fetch(request, env, ctx) { return new Response() } }", tags: ["handler", "basics"] },
  { id: "W015", category: "Workers Fundamentals", question: "What are the three parameters in fetch handler?", answer: "request (incoming Request), env (bindings), ctx (execution context with waitUntil)", tags: ["handler"] },
  { id: "W016", category: "Workers Fundamentals", question: "What languages can Workers run?", answer: "JavaScript, TypeScript, Python, Rust (via WASM), and any language that compiles to WebAssembly", tags: ["languages"] },

  // ==================== EXECUTION CONTEXT ====================
  { id: "E001", category: "Execution Context", question: "What does ctx.waitUntil() do?", answer: "Extends Worker lifetime to complete async tasks after response sent. Doesn't block response.", tags: ["context", "important"] },
  { id: "E002", category: "Execution Context", question: "Common use cases for waitUntil?", answer: "Logging to external services, cache population, analytics, cleanup tasks", tags: ["context", "patterns"] },
  { id: "E003", category: "Execution Context", question: "How do you import ExecutionContext in module syntax?", answer: "It's passed as the third parameter (ctx) to fetch handler. No import needed.", tags: ["context"] },

  // ==================== WORKERS KV ====================
  { id: "KV001", category: "Workers KV", question: "What is Workers KV?", answer: "Global, low-latency key-value store. Eventually consistent. Optimized for reads.", tags: ["kv", "overview"] },
  { id: "KV002", category: "Workers KV", question: "What consistency model does KV use?", answer: "Eventually consistent. Changes propagate globally in up to 60 seconds.", tags: ["kv", "consistency", "important"] },
  { id: "KV003", category: "Workers KV", question: "What's the max value size in KV?", answer: "25 MiB", tags: ["kv", "limits"] },
  { id: "KV006", category: "Workers KV", question: "When should you NOT use KV?", answer: "Frequent writes to same key, strong consistency needs, transactional requirements", tags: ["kv", "gotcha"] },
  { id: "KV007", category: "Workers KV", question: "How do you read/write KV?", answer: "await env.KV.get('key'), await env.KV.put('key', 'value'), await env.KV.delete('key')", tags: ["kv", "api"] },

  // ==================== DURABLE OBJECTS ====================
  { id: "DO001", category: "Durable Objects", question: "What problem do DOs solve?", answer: "Strong consistency, coordination, stateful compute, WebSocket management", tags: ["do", "important"] },
  { id: "DO002", category: "Durable Objects", question: "How is DO different from KV?", answer: "DO: strongly consistent, single-threaded, co-located storage. KV: eventually consistent, distributed.", tags: ["do", "comparison"] },
  { id: "DO004", category: "Durable Objects", question: "How to route requests to same DO instance?", answer: "env.DO_NAMESPACE.idFromName('unique-string') - deterministic, global routing", tags: ["do", "routing", "important"] },
  { id: "DO009", category: "Durable Objects", question: "What's WebSocket Hibernation?", answer: "DOs can hibernate while WebSocket connected. Wake on message. Saves duration cost.", tags: ["do", "websocket"] },
  { id: "DO010", category: "Durable Objects", question: "What storage backend do new DOs use?", answer: "SQLite storage (new_sqlite_classes in migrations). Provides sql.exec() API.", tags: ["do", "storage"] },
  { id: "DO011", category: "Durable Objects", question: "What's the DO Alarms API?", answer: "Schedule future execution at specific time. this.ctx.storage.setAlarm(timestamp)", tags: ["do", "alarms"] },

  // ==================== D1 ====================
  { id: "D1001", category: "D1", question: "What database engine powers D1?", answer: "SQLite", tags: ["d1"] },
  { id: "D1002", category: "D1", question: "What's D1's consistency model?", answer: "Strong consistency for writes (single leader), eventually consistent reads via replicas", tags: ["d1", "consistency"] },
  { id: "D1004", category: "D1", question: "What's the max D1 database size?", answer: "10 GB per database", tags: ["d1", "limits"] },
  { id: "D1005", category: "D1", question: "What is D1 Time Travel?", answer: "Point-in-time recovery - restore database to any minute within last 30 days", tags: ["d1", "backup"] },
  { id: "D1006", category: "D1", question: "How is D1 designed to scale?", answer: "Horizontal scale-out across many smaller databases (per-user, per-tenant). No extra cost for multiple DBs.", tags: ["d1", "design"] },

  // ==================== R2 ====================
  { id: "R2001", category: "R2", question: "What API is R2 compatible with?", answer: "S3 API", tags: ["r2"] },
  { id: "R2002", category: "R2", question: "What's unique about R2 pricing?", answer: "Zero egress fees", tags: ["r2", "pricing", "important"] },
  { id: "R2005", category: "R2", question: "How to access R2 from Worker?", answer: "await env.BUCKET.get('key'), .put(), .delete(), .list()", tags: ["r2", "api"] },
  { id: "R2006", category: "R2", question: "What are R2 Location Hints?", answer: "Optional parameter during bucket creation to indicate expected primary access region", tags: ["r2", "config"] },

  // ==================== QUEUES ====================
  { id: "Q001", category: "Queues", question: "What delivery guarantee do Queues provide?", answer: "At-least-once delivery", tags: ["queues", "important"] },
  { id: "Q003", category: "Queues", question: "How to send message to queue?", answer: "await env.MY_QUEUE.send({ data: 'hello' })", tags: ["queues", "api"] },
  { id: "Q004", category: "Queues", question: "What's a Dead Letter Queue?", answer: "Queue that receives messages after delivery failures. Prevents message loss.", tags: ["queues", "dlq"] },
  { id: "Q005", category: "Queues", question: "What are Pull Consumers?", answer: "Pull messages over HTTP from outside Workers (external infrastructure)", tags: ["queues", "consumers"] },

  // ==================== SERVICE BINDINGS & RPC ====================
  { id: "SB001", category: "Service Bindings", question: "What are Service Bindings?", answer: "Zero-latency Worker-to-Worker communication without HTTP overhead", tags: ["service-bindings", "important"] },
  { id: "SB003", category: "Service Bindings", question: "How to expose RPC methods?", answer: "Extend WorkerEntrypoint: export class MyService extends WorkerEntrypoint { myMethod() {} }", tags: ["rpc"] },
  { id: "SB004", category: "Service Bindings", question: "What's a Named Entrypoint?", answer: "Multiple WorkerEntrypoints per Worker. Bind to specific one via entrypoint config.", tags: ["rpc", "entrypoints"] },
  { id: "SB005", category: "Service Bindings", question: "What methods are reserved in WorkerEntrypoint?", answer: "fetch, connect, dup, constructor - can't be used as RPC method names", tags: ["rpc", "gotcha"] },

  // ==================== WORKFLOWS ====================
  { id: "WF001", category: "Workflows", question: "What is Cloudflare Workflows?", answer: "Durable execution engine - multi-step apps that retry, persist state, run for days/weeks", tags: ["workflows", "important"] },
  { id: "WF002", category: "Workflows", question: "Key workflow step methods?", answer: "step.do() - execute code, step.sleep() - pause, step.sleepUntil() - pause until time, step.waitForEvent() - wait for external event", tags: ["workflows", "api"] },
  { id: "WF003", category: "Workflows", question: "What happens when a step fails?", answer: "Automatic retry from that step only. Previous steps not re-executed.", tags: ["workflows", "retry"] },
  { id: "WF004", category: "Workflows", question: "What's NonRetryableError?", answer: "Throw to signal terminal failure - no more retries, workflow fails immediately", tags: ["workflows", "errors"] },
  { id: "WF005", category: "Workflows", question: "Key workflow rule: side effects?", answer: "Don't put side effects outside steps. Engine may restart workflow, re-running non-step code.", tags: ["workflows", "gotcha", "important"] },
  { id: "WF006", category: "Workflows", question: "Should workflow steps be idempotent?", answer: "Yes - steps may retry. Check if operation completed before acting.", tags: ["workflows", "important"] },
  { id: "WF007", category: "Workflows", question: "What's step.waitForEvent() for?", answer: "Human-in-the-loop, webhooks, external approvals. Workflow pauses until event received.", tags: ["workflows", "events"] },
  { id: "WF008", category: "Workflows", question: "What powers Workflows under the hood?", answer: "Durable Objects - each workflow instance is a SQLite-backed DO", tags: ["workflows", "architecture"] },

  // ==================== AGENTS SDK ====================
  { id: "AG001", category: "Agents SDK", question: "What is the Agents SDK?", answer: "SDK for building AI agents on Workers. Built on Durable Objects. Handles state, scheduling, WebSockets, AI calls.", tags: ["agents", "important"] },
  { id: "AG002", category: "Agents SDK", question: "How do you define an Agent?", answer: "export class MyAgent extends Agent { } - extends the Agent base class from 'agents' package", tags: ["agents", "api"] },
  { id: "AG003", category: "Agents SDK", question: "What built-in capabilities do Agents have?", answer: "this.setState, this.sql (SQLite), this.schedule (scheduling), WebSocket support, HTTP handling", tags: ["agents", "features"] },
  { id: "AG004", category: "Agents SDK", question: "How are Agents deployed?", answer: "As Durable Objects - add binding to wrangler config with new_sqlite_classes migration", tags: ["agents", "deployment"] },
  { id: "AG005", category: "Agents SDK", question: "What's the useAgent hook?", answer: "React hook from Agents SDK for client-side Agent communication and state sync", tags: ["agents", "client"] },

  // ==================== MCP ====================
  { id: "MCP001", category: "MCP", question: "What is MCP (Model Context Protocol)?", answer: "Open standard connecting AI systems to external apps. Like USB-C for AI - standardized way to connect agents to services.", tags: ["mcp", "important"] },
  { id: "MCP002", category: "MCP", question: "What are MCP Hosts, Clients, and Servers?", answer: "Hosts = AI assistants (Claude, Cursor). Clients = embedded connectors. Servers = apps exposing tools/prompts/resources.", tags: ["mcp", "terminology"] },
  { id: "MCP003", category: "MCP", question: "Remote vs Local MCP connections?", answer: "Remote: HTTP + SSE over internet with OAuth. Local: stdio transport on same machine.", tags: ["mcp", "transport"] },
  { id: "MCP004", category: "MCP", question: "MCP best practice for tool design?", answer: "Don't wrap full API schema. Build tools optimized for specific user goals. Fewer well-designed tools > many granular ones.", tags: ["mcp", "best-practices"] },

  // ==================== BROWSER RENDERING ====================
  { id: "BR001", category: "Browser Rendering", question: "What is Browser Rendering?", answer: "Headless Chrome on Cloudflare's edge. For automation, scraping, screenshots, PDFs.", tags: ["browser", "important"] },
  { id: "BR002", category: "Browser Rendering", question: "What REST API endpoints does Browser Rendering offer?", answer: "content, markdown, screenshot, pdf, scrape, links, json, snapshot endpoints", tags: ["browser", "api"] },
  { id: "BR003", category: "Browser Rendering", question: "What automation libraries work with Browser Rendering?", answer: "Puppeteer (Cloudflare fork), Playwright (Cloudflare fork), Stagehand (for AI agents)", tags: ["browser", "libraries"] },
  { id: "BR004", category: "Browser Rendering", question: "How to improve Browser Rendering performance?", answer: "Reuse browser sessions across requests. Use Durable Objects to persist sessions.", tags: ["browser", "performance"] },

  // ==================== CONTAINERS ====================
  { id: "CT001", category: "Containers", question: "What are Cloudflare Containers?", answer: "Run any language/runtime as part of Workers apps. Deploy container images, controlled by Worker code.", tags: ["containers", "important"] },
  { id: "CT002", category: "Containers", question: "How do you define a Container?", answer: "export class MyContainer extends Container { defaultPort = 4000; sleepAfter = '10m'; }", tags: ["containers", "api"] },
  { id: "CT003", category: "Containers", question: "How are Containers managed?", answer: "Built on Durable Objects. Worker code controls lifecycle. getContainer(env.MY_CONTAINER, sessionId)", tags: ["containers", "architecture"] },
  { id: "CT004", category: "Containers", question: "When to use Containers vs Workers?", answer: "Containers: resource-intensive apps, specific runtimes, existing container images. Workers: JS/TS, fast startup, edge compute.", tags: ["containers", "comparison"] },

  // ==================== AI GATEWAY ====================
  { id: "AIG001", category: "AI Gateway", question: "What is AI Gateway?", answer: "Proxy for AI providers. Caching, rate limiting, logging, fallbacks, cost tracking for OpenAI, Anthropic, etc.", tags: ["ai-gateway", "important"] },
  { id: "AIG002", category: "AI Gateway", question: "What are AI Gateway Guardrails?", answer: "Real-time content moderation. Detect/block harmful content in prompts and responses.", tags: ["ai-gateway", "safety"] },
  { id: "AIG003", category: "AI Gateway", question: "What is AI Gateway DLP?", answer: "Data Loss Prevention - scan prompts/responses for PII, financial data, sensitive info.", tags: ["ai-gateway", "security"] },
  { id: "AIG004", category: "AI Gateway", question: "What's AI Gateway Unified Billing?", answer: "Pay for multiple AI providers (OpenAI, Anthropic) through single Cloudflare invoice.", tags: ["ai-gateway", "billing"] },
  { id: "AIG005", category: "AI Gateway", question: "What's AI Gateway Dynamic Routing?", answer: "Visual flow-based routing. Route by user segments, geography, A/B testing, with automatic fallbacks.", tags: ["ai-gateway", "routing"] },

  // ==================== WORKERS AI ====================
  { id: "AI001", category: "Workers AI", question: "What is Workers AI?", answer: "Serverless AI inference at edge. 50+ models, pay-per-use, GPUs in 180+ cities.", tags: ["workers-ai"] },
  { id: "AI002", category: "Workers AI", question: "How to run inference?", answer: "const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { prompt })", tags: ["workers-ai", "api"] },
  { id: "AI003", category: "Workers AI", question: "What's the Infire engine?", answer: "Cloudflare's Rust-based inference engine. 7% faster than vLLM, lower CPU overhead.", tags: ["workers-ai", "performance"] },
  { id: "AI004", category: "Workers AI", question: "Is Workers AI data private?", answer: "Yes - private by default. Cloudflare doesn't train on user data.", tags: ["workers-ai", "privacy"] },

  // ==================== VECTORIZE ====================
  { id: "VZ001", category: "Vectorize", question: "What is Vectorize?", answer: "Cloudflare's vector database for embeddings and similarity search. Powers RAG applications.", tags: ["vectorize"] },
  { id: "VZ002", category: "Vectorize", question: "Max Vectorize dimensions?", answer: "Up to 3072 dimensions per vector", tags: ["vectorize", "limits"] },
  { id: "VZ003", category: "Vectorize", question: "What filtering does Vectorize support?", answer: "Namespace filtering and metadata filtering on vector queries", tags: ["vectorize", "features"] },

  // ==================== HYPERDRIVE ====================
  { id: "HD001", category: "Hyperdrive", question: "What is Hyperdrive?", answer: "Connection pooling at edge for PostgreSQL and MySQL. Accelerates queries to existing databases.", tags: ["hyperdrive", "important"] },
  { id: "HD002", category: "Hyperdrive", question: "Why is Hyperdrive needed?", answer: "Eliminates TCP/TLS handshake per request. Maintains warm connections to your database.", tags: ["hyperdrive", "performance"] },
  { id: "HD003", category: "Hyperdrive", question: "What databases work with Hyperdrive?", answer: "PostgreSQL, MySQL, and Postgres-compatible (Neon, Supabase, CockroachDB, Timescale)", tags: ["hyperdrive", "compatibility"] },
  { id: "HD004", category: "Hyperdrive", question: "Does Hyperdrive cache queries?", answer: "Yes - default-on query caching for frequently executed queries", tags: ["hyperdrive", "caching"] },

  // ==================== PIPELINES ====================
  { id: "PL001", category: "Pipelines", question: "What is Cloudflare Pipelines?", answer: "Ingest events, transform with SQL, deliver to R2 as Iceberg tables or Parquet/JSON files.", tags: ["pipelines", "important"] },
  { id: "PL002", category: "Pipelines", question: "What are the three Pipelines components?", answer: "Streams (ingestion via HTTP/Workers), Pipelines (SQL transforms), Sinks (R2/Iceberg output)", tags: ["pipelines", "architecture"] },
  { id: "PL003", category: "Pipelines", question: "What's R2 Data Catalog?", answer: "Manages Apache Iceberg tables stored in R2. Queryable with R2 SQL.", tags: ["pipelines", "r2"] },

  // ==================== PAGES ====================
  { id: "PG001", category: "Pages", question: "What's the difference between Workers and Pages?", answer: "Pages = static assets + functions, git integration, deploy previews. Workers = pure serverless compute.", tags: ["pages", "comparison"] },
  { id: "PG002", category: "Pages", question: "Where do Pages Functions live?", answer: "/functions directory with file-based routing", tags: ["pages", "functions"] },
  { id: "PG003", category: "Pages", question: "What are Pages Rollbacks?", answer: "Instantly revert to previous production deployment", tags: ["pages", "deployment"] },

  // ==================== WRANGLER ====================
  { id: "WR002", category: "Wrangler", question: "How to test locally?", answer: "wrangler dev - uses Miniflare simulator", tags: ["wrangler"] },
  { id: "WR005", category: "Wrangler", question: "What's compatibility_date?", answer: "Locks runtime behavior to avoid breaking changes. Set to date you tested.", tags: ["wrangler", "important"] },
  { id: "WR007", category: "Wrangler", question: "How to view live logs?", answer: "wrangler tail - streams logs from deployed Worker", tags: ["wrangler"] },
  { id: "WR008", category: "Wrangler", question: "What config formats does Wrangler support?", answer: "wrangler.toml (TOML) or wrangler.jsonc (JSON with comments)", tags: ["wrangler", "config"] },

  // ==================== HTMLREWRITER ====================
  { id: "HR001", category: "HTMLRewriter", question: "What is HTMLRewriter?", answer: "Streaming HTML parser with jQuery-like selectors. Modify HTML on the fly.", tags: ["htmlrewriter", "important"] },
  { id: "HR002", category: "HTMLRewriter", question: "What powers HTMLRewriter?", answer: "LOL HTML - Cloudflare's open-source Rust-based parser. ~10x faster than traditional parsers.", tags: ["htmlrewriter", "performance"] },
  { id: "HR003", category: "HTMLRewriter", question: "Key HTMLRewriter element methods?", answer: "setAttribute, getAttribute, prepend, append, before, after, replace, remove", tags: ["htmlrewriter", "api"] },
  { id: "HR004", category: "HTMLRewriter", question: "HTMLRewriter gotcha with text?", answer: "Text arrives in chunks. Check lastInTextNode boolean to know when text is complete.", tags: ["htmlrewriter", "gotcha"] },

  // ==================== SMART PLACEMENT ====================
  { id: "SP001", category: "Smart Placement", question: "What is Smart Placement?", answer: "Automatically moves Worker near backend (not user) for lower latency to origin.", tags: ["smart-placement", "important"] },
  { id: "SP002", category: "Smart Placement", question: "How does Smart Placement decide location?", answer: "Analyzes subrequests, compares candidate locations, needs traffic from multiple regions.", tags: ["smart-placement", "algorithm"] },
  { id: "SP003", category: "Smart Placement", question: "Smart Placement limitation?", answer: "Only affects fetch handler - NOT RPC methods or named entrypoints", tags: ["smart-placement", "gotcha"] },

  // ==================== SYSTEM DESIGN ====================
  { id: "SYS001", category: "System Design", question: "How to build global rate limiter?", answer: "Durable Object per key with sliding window. Single instance = no races.", tags: ["design"] },
  { id: "SYS002", category: "System Design", question: "When to use DO vs D1 vs KV vs R2?", answer: "KV: config/sessions. D1: relational data. DO: real-time/coordination. R2: files/blobs.", tags: ["design", "important"] },
  { id: "SYS003", category: "System Design", question: "How to handle WebSockets at scale?", answer: "DO with Hibernation API - hibernates while connected, wakes on message", tags: ["design", "websocket"] },
  { id: "SYS004", category: "System Design", question: "How to build RAG on Cloudflare?", answer: "Workers AI (embeddings) + Vectorize (vector DB) + AI Search or custom retrieval", tags: ["design", "ai"] },

  // ==================== GOTCHAS ====================
  { id: "CG001", category: "Gotchas", question: "Why does my global variable reset?", answer: "Isolate may be recycled. Never rely on global state between requests.", tags: ["gotcha"] },
  { id: "CG002", category: "Gotchas", question: "Why is KV stale?", answer: "Eventually consistent - up to 60s propagation. Use DO for strong consistency.", tags: ["gotcha", "kv"] },
  { id: "CG005", category: "Gotchas", question: "ctx.waitUntil not a function?", answer: "Handler args are (request, env, ctx) not (request, ctx, env)", tags: ["gotcha"] },
  { id: "CG006", category: "Gotchas", question: "Request body already used error?", answer: "Request body is a stream - can only be read once. Clone request if needed twice.", tags: ["gotcha", "request"] },
  { id: "CG007", category: "Gotchas", question: "Why can't I import Node.js modules?", answer: "Workers use V8, not Node. Use nodejs_compat flag for Node.js API compatibility layer.", tags: ["gotcha", "node"] },
];

export const categories = [...new Set(flashcards.map(c => c.category))];

