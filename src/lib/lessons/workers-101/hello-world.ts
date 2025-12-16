import type { Lesson } from "../types";

export const helloWorld: Lesson = {
  slug: "hello-world",
  title: "Your First Worker",
  description: "Write and run your first Cloudflare Worker",
  course: "workers-101",
  order: 1,
  blocks: [
    {
      type: "text",
      content: `Every Worker exports a \`fetch\` handler. Edit the code below to return "Hello World!" and click **Run** to test it.`,
    },
    {
      type: "code",
      id: "playground",
      initial: `export default {
  async fetch(request) {
    return new Response("Change me!");
  }
}`,
      solution: `export default {
  async fetch(request) {
    return new Response("Hello World!");
  }
}`,
      tests: [
        {
          name: "Returns Hello World",
          request: { path: "/" },
          expect: { status: 200, bodyEquals: "Hello World!" },
        },
      ],
    },
    {
      type: "text",
      content: `Perfect! Now try changing the response to include your name instead of "Hello World!".`,
    },
  ],
};
