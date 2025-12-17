import type { Lesson } from "../types";

export const fetchApi: Lesson = {
  slug: "fetch-api",
  title: "External APIs",
  description: "Fetch data from external APIs",
  course: "workers-101",
  order: 6,
  blocks: [
    {
      type: "text",
      content: `Use \`fetch()\` to make HTTP requests to external APIs. Fetch data from \`https://api.github.com/users/cloudflare\` and return the \`login\` field from the JSON response.`,
    },
    {
      type: "code",
      id: "playground",
      initial: `export default {
  async fetch(request) {
    return new Response("Not implemented");
  }
}`,
      solution: `export default {
  async fetch(request) {
    const response = await fetch("https://api.github.com/users/cloudflare");
    const data = await response.json();
    return Response.json({ login: data.login });
  }
}`,
      tests: [
        {
          name: "Returns login from GitHub API",
          request: { path: "/" },
          expect: { status: 200, bodyContains: "cloudflare" },
        },
        {
          name: "Returns valid JSON",
          request: { path: "/" },
          expect: { status: 200, bodyContains: "login" },
        },
      ],
    },
    {
      type: "text",
      content: `Great! You can use \`fetch()\` to call any HTTP API. Remember to handle errors with try/catch, and check response status codes before parsing JSON.`,
    },
  ],
};


