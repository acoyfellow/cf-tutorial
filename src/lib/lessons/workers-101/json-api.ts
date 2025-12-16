import type { Lesson } from "../types";

export const jsonApi: Lesson = {
  slug: "json-api",
  title: "JSON APIs",
  description: "Return JSON responses with proper content-type",
  course: "workers-101",
  order: 4,
  blocks: [
    {
      type: "text",
      content: `Use \`Response.json()\` to return JSON data. It automatically sets the \`Content-Type\` header to \`application/json\`. Return a JSON object with a \`message\` field set to "Hello from API!".`,
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
    return Response.json({ message: "Hello from API!" });
  }
}`,
      tests: [
        {
          name: "Returns JSON with message",
          request: { path: "/" },
          expect: { status: 200, bodyContains: "Hello from API!" },
        },
        {
          name: "Has correct content-type",
          request: { path: "/" },
          expect: { status: 200, bodyContains: "message" },
        },
      ],
    },
    {
      type: "text",
      content: `You can also parse JSON from request bodies using \`await request.json()\`. This is useful for POST requests that send data.`,
    },
  ],
};
