import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";

export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    const body = await request.json();

    // Call the worker's /api/run endpoint
    const workerResponse = await callWorker(platform, "/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!workerResponse.ok) {
      const error = await workerResponse.text();
      return json({ error: error || "Failed to execute code" }, { status: 500 });
    }

    const result = await workerResponse.json();
    return json(result);
  } catch (error: any) {
    return json({ error: error.message || "Failed to execute code" }, { status: 500 });
  }
};

async function callWorker(
  platform: App.Platform | undefined,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  if (dev) {
    // Development: HTTP call to local worker
    return fetch(`http://localhost:1337${endpoint}`, options);
  }

  // Production: Service binding
  return platform!.env!.WORKER.fetch(new Request(`http://worker${endpoint}`, options));
}
