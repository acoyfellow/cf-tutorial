import type { Lesson } from "../types";

export const routing: Lesson = {
  slug: "routing",
  title: "URL Routing",
  description: "Route requests based on URL pathname",
  course: "workers-101",
  order: 3,
  blocks: [
    {
      type: "text",
      content: `Use \`url.pathname\` to route different paths to different responses. Create a simple router that returns "Home" for \`/\`, "About" for \`/about\`, and "API" for \`/api\`.`,
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
    const path = url.pathname;
    
    if (path === "/") {
      return new Response("Home");
    } else if (path === "/about") {
      return new Response("About");
    } else if (path === "/api") {
      return new Response("API");
    }
    
    return new Response("Not found", { status: 404 });
  }
}`,
      tests: [
        {
          name: "Root path returns Home",
          request: { path: "/" },
          expect: { status: 200, bodyEquals: "Home" },
        },
        {
          name: "/about returns About",
          request: { path: "/about" },
          expect: { status: 200, bodyEquals: "About" },
        },
        {
          name: "/api returns API",
          request: { path: "/api" },
          expect: { status: 200, bodyEquals: "API" },
        },
        {
          name: "Unknown path returns 404",
          request: { path: "/unknown" },
          expect: { status: 404 },
        },
      ],
    },
    {
      type: "text",
      content: `Perfect! You can also use a \`switch\` statement or a routing library for more complex routing. For now, simple conditionals work great for most cases.`,
    },
  ],
};
