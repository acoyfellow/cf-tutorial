import type { Lesson } from "../types";

export const errorHandling: Lesson = {
  slug: "error-handling",
  title: "Error Handling",
  description: "Handle errors with try/catch and proper status codes",
  course: "workers-101",
  order: 7,
  blocks: [
    {
      type: "text",
      content: `Wrap risky operations in \`try/catch\` blocks. Parse JSON from the request body, but return a 400 status code if parsing fails. If successful, return the parsed data with a 200 status.`,
    },
    {
      type: "code",
      id: "playground",
      initial: `export default {
  async fetch(request) {
    const data = await request.json();
    return Response.json(data);
  }
}`,
      solution: `export default {
  async fetch(request) {
    try {
      const data = await request.json();
      return Response.json(data, { status: 200 });
    } catch (error) {
      return Response.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }
  }
}`,
      tests: [
        {
          name: "Valid JSON returns 200",
          request: { method: "POST", path: "/", body: '{"name":"test"}' },
          expect: { status: 200, bodyContains: "name" },
        },
        {
          name: "Invalid JSON returns 400",
          request: { method: "POST", path: "/", body: "invalid json" },
          expect: { status: 400 },
        },
        {
          name: "Error response contains error message",
          request: { method: "POST", path: "/", body: "not json" },
          expect: { status: 400, bodyContains: "error" },
        },
      ],
    },
    {
      type: "text",
      content: `Perfect! Always handle errors gracefully. Use appropriate HTTP status codes: 400 for bad requests, 404 for not found, 500 for server errors. This helps clients understand what went wrong.`,
    },
  ],
};



