import { query, command, getRequestEvent } from '$app/server';
import { dev } from '$app/environment';

type JudgeResult = { score: number; feedback: string };
type FollowUpResult = { answer: string };

// Helper function to call your Durable Object via the worker
// In development: HTTP calls to localhost:1337
// In production: Service binding (no network latency)
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

async function callWorkerJSON<T>(
  platform: App.Platform | undefined,
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await callWorker(platform, endpoint, options);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Service error');
      throw new Error(`Service error (${response.status}): ${errorText}`);
    }
    
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Service temporarily unavailable. Please try again.');
    }
    throw error;
  }
}

// Example query function (no auth required)
// TODO: Replace with your actual query functions
export const getHello = query('unchecked', async (): Promise<{ message: string; timestamp: string }> => {
  const platform = getRequestEvent().platform;
  
  try {
    // Example: Call your Durable Object
    return await callWorkerJSON<{ message: string; timestamp: string }>(platform, '/api/storage/hello');
  } catch (err) {
    console.error('Failed to get hello:', err);
    return {
      message: 'Hello from your remote app!',
      timestamp: new Date().toISOString()
    };
  }
});

// Example command function (requires authentication)
// TODO: Replace with your actual command functions
export const setMessage = command('unchecked', async (message: string): Promise<{ success: boolean; message: string }> => {
  const platform = getRequestEvent().platform;
  const event = getRequestEvent();
  
  // Check if user is authenticated
  if (!event.locals.session) {
    throw new Error('Please sign in to set messages');
  }
  
  try {
    // Example: Call your Durable Object with POST
    return await callWorkerJSON<{ success: boolean; message: string }>(
      platform, 
      '/api/storage/message', 
      { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: message })
      }
    );
  } catch (err) {
    console.error('Failed to set message:', err);
    throw new Error('Unable to set message. Please try again.');
  }
});

// Judge a quiz answer using Workers AI
export const judgeAnswer = command('unchecked', async (params: { question: string; correctAnswer: string; userAnswer: string }): Promise<JudgeResult> => {
  const platform = getRequestEvent().platform;
  const ai = platform?.env?.AI;
  
  if (!ai) throw new Error('AI not available');
  
  const prompt = `You're evaluating a Cloudflare tutorial answer.

Question: ${params.question}
Correct answer: ${params.correctAnswer}
User's answer: ${params.userAnswer}

Respond in this exact format:
SCORE: X/10
FEEDBACK: [2-3 sentences max. Be helpful. If wrong, explain what they missed. If right, confirm and add a useful detail.]`;

  const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500
  }) as { response: string };

  const text = result.response;
  const scoreMatch = text.match(/SCORE:\s*(\d+)/);
  const feedbackMatch = text.match(/FEEDBACK:\s*(.+)/s);

  return {
    score: scoreMatch ? parseInt(scoreMatch[1]) : 5,
    feedback: feedbackMatch ? feedbackMatch[1].trim() : text
  };
});

// Ask a follow-up question using Workers AI
export const askFollowUp = command('unchecked', async (params: { question: string; correctAnswer: string; followUp: string }): Promise<FollowUpResult> => {
  const platform = getRequestEvent().platform;
  const ai = platform?.env?.AI;
  
  if (!ai) throw new Error('AI not available');

  const prompt = `Context: Cloudflare tutorial learning.
Topic: ${params.question}
Reference: ${params.correctAnswer}

User asks: ${params.followUp}

Give a concise, helpful answer. 3-5 sentences max. Include code snippets if relevant.`;

  const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500
  }) as { response: string };

  return { answer: result.response };
});
