<script lang="ts">
  import { Textarea } from "$lib/components/ui/textarea";

  type Props = {
    id: string;
    label?: string;
    initial: string;
    solution: string;
    tests: Array<{
      name: string;
      request: { method?: string; path: string; body?: string };
      expect: { status?: number; bodyContains?: string; bodyEquals?: string };
    }>;
    lightBg?: boolean;
  };

  let {
    id,
    label,
    initial,
    solution,
    tests,
    lightBg = false,
  }: Props = $props();

  let code = $state("");
  let initialValue = "";
  let textareaRef = $state<HTMLTextAreaElement | null>(null);

  $effect(() => {
    code = initial;
    initialValue = initial;
  });

  function autoResize() {
    if (!textareaRef) return;
    textareaRef.style.height = "auto";
    const newHeight = Math.max(200, Math.min(800, textareaRef.scrollHeight));
    textareaRef.style.height = `${newHeight}px`;
    textareaRef.style.overflowY = newHeight >= 800 ? "auto" : "hidden";
  }

  $effect(() => {
    if (textareaRef && code) {
      requestAnimationFrame(() => autoResize());
    }
  });
  let running = $state(false);
  let results = $state<
    Array<{
      name: string;
      passed: boolean;
      error?: string;
      response?: { status: number; body: string; duration: number };
    }>
  >([]);
  let showSolution = $state(false);

  async function run() {
    running = true;
    results = [];

    try {
      for (const test of tests) {
        const response = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            testRequest: test.request,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          results.push({
            name: test.name,
            passed: false,
            error: `Request failed: ${error}`,
          });
          continue;
        }

        const result = (await response.json()) as {
          status: number;
          body: string;
          duration: number;
        };
        const passed = checkTest(test, result);

        results.push({
          name: test.name,
          passed,
          response: result,
          error: passed ? undefined : getFailureReason(test, result),
        });
      }
    } catch (error: any) {
      results.push({
        name: "Execution",
        passed: false,
        error: error.message || "Failed to execute code",
      });
    } finally {
      running = false;
    }
  }

  function checkTest(
    test: Props["tests"][0],
    result: { status: number; body: string }
  ): boolean {
    if (test.expect.status && result.status !== test.expect.status) {
      return false;
    }
    if (test.expect.bodyEquals && result.body !== test.expect.bodyEquals) {
      return false;
    }
    if (
      test.expect.bodyContains &&
      !result.body.includes(test.expect.bodyContains)
    ) {
      return false;
    }
    return true;
  }

  function getFailureReason(
    test: Props["tests"][0],
    result: { status: number; body: string }
  ): string {
    if (test.expect.status && result.status !== test.expect.status) {
      return `Expected status ${test.expect.status}, got ${result.status}`;
    }
    if (test.expect.bodyEquals && result.body !== test.expect.bodyEquals) {
      return `Expected "${test.expect.bodyEquals}", got "${result.body}"`;
    }
    if (
      test.expect.bodyContains &&
      !result.body.includes(test.expect.bodyContains)
    ) {
      return `Expected body to contain "${test.expect.bodyContains}"`;
    }
    return "Test failed";
  }

  function reset() {
    code = initialValue;
    results = [];
    showSolution = false;
  }

  function revealSolution() {
    code = solution;
    showSolution = true;
  }

  const allPassed = $derived(
    results.length > 0 && results.every((r) => r.passed)
  );
</script>

<div class="code-block my-8">
  {#if label}
    <div
      class="mb-3 px-3 py-2 {lightBg
        ? 'bg-blue-50 border border-blue-200'
        : 'bg-blue-500/20 border border-blue-500/30'} rounded-lg"
    >
      <p
        class="text-sm {lightBg
          ? 'text-blue-700'
          : 'text-blue-300'} font-medium"
      >
        {label}
      </p>
    </div>
  {/if}
  <div class="flex items-center justify-between mb-2">
    <span class="text-sm {lightBg ? 'text-gray-600' : 'text-gray-400'}"
      >Your code</span
    >
    <div class="flex gap-2">
      <button
        onclick={reset}
        class="px-3 py-1 text-sm {lightBg
          ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          : 'bg-gray-700 hover:bg-gray-600 text-white'} rounded transition"
      >
        Reset
      </button>
      <button
        onclick={revealSolution}
        class="px-3 py-1 text-sm {lightBg
          ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          : 'bg-gray-700 hover:bg-gray-600 text-white'} rounded transition"
      >
        Solution
      </button>
      <button
        onclick={run}
        disabled={running}
        class="px-4 py-1 text-sm rounded font-medium transition text-white {running
          ? lightBg
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-orange-500 hover:bg-orange-600'}"
      >
        {running ? "Running..." : "Run"}
      </button>
    </div>
  </div>

  <div class="space-y-4">
    <Textarea
      bind:ref={textareaRef}
      bind:value={code}
      oninput={autoResize}
      spellcheck={false}
      class="w-full font-mono text-sm p-4 rounded-lg resize-none min-h-[200px] {lightBg
        ? 'bg-gray-50 text-gray-900 border-gray-300 focus-visible:border-orange-500'
        : 'bg-gray-900 text-white border-gray-700 focus-visible:border-orange-500'} focus-visible:ring-orange-500/20"
    />

    {#if results.length > 0}
      <div class="output-panel">
        <div class="mb-2">
          <span class="text-sm {lightBg ? 'text-gray-600' : 'text-gray-400'}"
            >Output</span
          >
          {#if allPassed}
            <span class="ml-2 text-sm text-green-600">✓ All tests passed!</span>
          {/if}
        </div>

        <div class="space-y-3 max-h-[300px] overflow-y-auto">
          {#each results as result}
            <div
              class="p-3 rounded-lg border {result.passed
                ? lightBg
                  ? 'bg-green-50 border-green-200'
                  : 'bg-green-500/10 border-green-500/50'
                : lightBg
                  ? 'bg-red-50 border-red-200'
                  : 'bg-red-500/10 border-red-500/50'}"
            >
              <div class="flex items-center gap-2 mb-2">
                {#if result.passed}
                  <span class={lightBg ? "text-green-600" : "text-green-400"}
                    >✓</span
                  >
                {:else}
                  <span class={lightBg ? "text-red-600" : "text-red-400"}
                    >✗</span
                  >
                {/if}
                <span
                  class="text-sm font-medium {lightBg
                    ? 'text-gray-900'
                    : 'text-white'}">{result.name}</span
                >
              </div>

              {#if result.error}
                <p class="text-sm {lightBg ? 'text-red-600' : 'text-red-400'}">
                  {result.error}
                </p>
              {:else if result.response}
                <div class="text-xs space-y-1">
                  <div>
                    <span class={lightBg ? "text-gray-600" : "text-gray-500"}
                      >Status:</span
                    >
                    <span
                      class="ml-2 {result.response.status === 200
                        ? lightBg
                          ? 'text-green-600'
                          : 'text-green-400'
                        : lightBg
                          ? 'text-yellow-600'
                          : 'text-yellow-400'}">{result.response.status}</span
                    >
                  </div>
                  <div>
                    <span class={lightBg ? "text-gray-600" : "text-gray-500"}
                      >Body:</span
                    >
                    <pre
                      class="mt-1 p-2 {lightBg
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-gray-900 text-gray-300'} rounded overflow-x-auto">{result
                        .response.body}</pre>
                  </div>
                  {#if result.response.duration}
                    <div>
                      <span class={lightBg ? "text-gray-600" : "text-gray-500"}
                        >Duration:</span
                      >
                      <span
                        class="ml-2 {lightBg
                          ? 'text-gray-700'
                          : 'text-gray-400'}">{result.response.duration}ms</span
                      >
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {:else if running}
      <div
        class="flex items-center justify-center h-[200px] {lightBg
          ? 'text-gray-600'
          : 'text-gray-400'}"
      >
        <div class="text-center">
          <div class="animate-spin mb-2">⟳</div>
          <div>Running tests...</div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .code-block {
    font-family: "Google Sans Code", monospace;
  }
</style>
