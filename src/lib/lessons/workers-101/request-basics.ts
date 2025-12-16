import type { Lesson } from "../types";

export const requestBasics: Lesson = {
  slug: "request-basics",
  title: "Request Basics",
  description: "Access request URL, method, and headers",
  course: "workers-101",
  order: 2,
  blocks: [
    {
      type: "text",
      content: `Every request contains useful information. Access \`request.method\` to get the HTTP method (GET, POST, etc.) and \`request.url\` to get the full URL. Edit the code to return a string that includes both the method and URL.`,
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
    return new Response(\`\${request.method} \${request.url}\`);
  }
}`,
      tests: [
        {
          name: "Returns method and URL",
          request: { method: "GET", path: "/" },
          expect: { status: 200, bodyContains: "GET" },
        },
        {
          name: "Contains URL",
          request: { method: "POST", path: "/api/test" },
          expect: { status: 200, bodyContains: "/api/test" },
        },
      ],
    },
    {
      type: "text",
      content: `Great! You can also access \`request.headers\` to read headers. Try accessing \`request.headers.get("user-agent")\` in your next worker.`,
    },
  ],
};
