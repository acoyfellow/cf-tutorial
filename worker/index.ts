import { DurableObject } from 'cloudflare:workers'

type WorkerLoader = {
  get(
    id: string,
    getCodeCallback: () => Promise<{
      compatibilityDate: string;
      mainModule: string;
      modules: Record<string, string>;
      globalOutbound?: any;
    }>
  ): {
    getEntrypoint(): {
      fetch(request: Request): Promise<Response>;
    };
  };
};

type Env = {
  MY_DO: DurableObjectNamespace<MyDO>;
  LOADER: WorkerLoader;
}

// TODO: Implement your Durable Object
// This is a basic key-value store example
export class MyDO extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const key = url.pathname.slice(1); // Remove leading slash

      if (request.method === 'GET') {
        // Get a value from storage
        const value = await this.ctx.storage.get(key);
        return Response.json({
          key,
          value: value || null,
          id: this.ctx.id.toString()
        });
      }

      if (request.method === 'POST') {
        // Set a value in storage
        const body = await request.json() as { value: any };
        await this.ctx.storage.put(key, body.value);
        return Response.json({
          key,
          value: body.value,
          id: this.ctx.id.toString()
        });
      }

      if (request.method === 'DELETE') {
        // Delete a key from storage
        await this.ctx.storage.delete(key);
        return Response.json({
          key,
          deleted: true,
          id: this.ctx.id.toString()
        });
      }

      return new Response('Method not allowed', { status: 405 });

    } catch (error) {
      console.error('Durable Object error:', error);
      return new Response(
        JSON.stringify({ error: 'Storage temporarily unavailable' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
}

// Worker entry point - routes requests to your Durable Objects
export default {
  async fetch(request: Request, env: Env) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Execute user code via Worker Loader
      if (pathname === '/api/run') {
        try {
          const { code, testRequest } = await request.json() as {
            code: string;
            testRequest: { method?: string; path: string; body?: string };
          };

          if (!code || typeof code !== 'string') {
            return new Response('Invalid code', { status: 400 });
          }

          // Create unique ID for this execution (prevents caching issues)
          const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

          const worker = env.LOADER.get(runId, async () => ({
            compatibilityDate: '2025-01-01',
            mainModule: 'worker.js',
            modules: {
              'worker.js': code,
            },
            globalOutbound: null, // Sandboxed - no network access
          }));

          const testReq = new Request(`http://test${testRequest.path}`, {
            method: testRequest.method || 'GET',
            body: testRequest.body,
          });

          const start = Date.now();
          let response: Response;
          let body: string;

          try {
            response = await worker.getEntrypoint().fetch(testReq);
            body = await response.text();
          } catch (error: any) {
            return Response.json({
              status: 500,
              body: `Error: ${error.message}`,
              duration: Date.now() - start,
            });
          }

          const duration = Date.now() - start;

          return Response.json({
            status: response.status,
            body,
            duration,
          });
        } catch (error: any) {
          console.error('Run endpoint error:', error);
          return Response.json(
            { error: error.message || 'Failed to execute code' },
            { status: 500 }
          );
        }
      }

      // TODO: Add your routing logic here
      // Example: Route /api/storage/{key} to your Durable Object
      if (pathname.startsWith('/api/storage/')) {
        const key = pathname.replace('/api/storage/', '');

        if (!key || key.length > 50) {
          return new Response('Invalid key', { status: 400 });
        }

        // Create or get existing Durable Object instance
        const id = env.MY_DO.idFromName(key);
        const doInstance = env.MY_DO.get(id);

        // Forward request to Durable Object
        return await doInstance.fetch(request);
      }

      return new Response("Not found", { status: 404 });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
};
