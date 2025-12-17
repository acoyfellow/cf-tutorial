import alchemy from "alchemy";

import {
  SvelteKit,
  Worker,
  DurableObjectNamespace,
  D1Database,
  Ai
} from "alchemy/cloudflare";

import { CloudflareStateStore } from "alchemy/state";

const projectName = "cf-tutorial";

const project = await alchemy(projectName, {
  password: process.env.ALCHEMY_PASSWORD!,
  stateStore: (scope) => new CloudflareStateStore(scope)
});

// TODO: Create your Durable Object namespace
// Replace "MyDO" with your actual Durable Object class name
const MY_DO = DurableObjectNamespace(`${projectName}-do`, {
  className: "MyDO", // Change this to your DO class name
  scriptName: `${projectName}-worker`,
  sqlite: true
});

// Create D1 database for auth (required for Better Auth)
const DB = await D1Database(`${projectName}-db`, {
  name: `${projectName}-db`,
  migrationsDir: "migrations",
  adopt: true,
  jurisdiction: 'default'
});

// Create the worker that hosts your Durable Objects
export const WORKER = await Worker(`${projectName}-worker`, {
  name: `${projectName}-worker`,
  entrypoint: "./worker/index.ts",
  adopt: true,
  bindings: {
    MY_DO, // Add your DO bindings here
    LOADER: { type: "worker_loader" }, // Worker Loader for executing user code
  },
  url: false
});

// Workers AI binding
const AI = Ai();

// Create the SvelteKit app
export const APP = await SvelteKit(`${projectName}-app`, {
  name: `${projectName}-app`,
  bindings: {
    MY_DO,   // Make your DO available to SvelteKit
    WORKER,  // Make worker available for service bindings
    DB,      // Database for Better Auth
    AI,      // Workers AI for quiz judging
  },
  url: true,
  adopt: true,
  env: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "https://cf-tutorial.coey.dev",
  }
});

await project.finalize();
