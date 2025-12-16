import type { Lesson } from "../types";

export const queryParams: Lesson = {
  slug: "query-params",
  title: "Query Parameters",
  description: "Read and use URL query parameters",
  course: "workers-101",
  order: 5,
  blocks: [
    {
      type: "text",
      content: `Use \`url.searchParams.get()\` to read query parameters from the URL. Make the worker return "Hello, {name}!" when a \`name\` query parameter is provided, or "Hello, World!" if no name is provided.`,
    },
    {
      type: "code",
      id: "playground",
      initial: `export default {
  async fetch(request) {
    return new Response("Hello");
  }
}`,
      solution: `export default {
  async fetch(request) {
    const url = new URL(request.url);
    const name = url.searchParams.get("name");
    
    if (name) {
      return new Response(\`Hello, \${name}!\`);
    }
    
    return new Response("Hello, World!");
  }
}`,
      tests: [
        {
          name: "Returns default greeting",
          request: { path: "/" },
          expect: { status: 200, bodyEquals: "Hello, World!" },
        },
        {
          name: "Returns personalized greeting",
          request: { path: "/?name=Jordan" },
          expect: { status: 200, bodyEquals: "Hello, Jordan!" },
        },
        {
          name: "Handles different names",
          request: { path: "/?name=Alex" },
          expect: { status: 200, bodyEquals: "Hello, Alex!" },
        },
      ],
    },
    {
      type: "text",
      content: `Query parameters are great for optional configuration. You can also use \`url.searchParams.getAll()\` for parameters that appear multiple times, or iterate with \`url.searchParams.entries()\`.`,
    },
  ],
};
