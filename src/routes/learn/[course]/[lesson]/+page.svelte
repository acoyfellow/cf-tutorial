<script lang="ts">
  import { Splitpanes, Pane } from "svelte-splitpanes";
  import CodeBlock from "$lib/components/CodeBlock.svelte";
  import Markdown from "$lib/components/Markdown.svelte";
  import SEO from "$lib/components/SEO.svelte";
  import { page } from "$app/state";

  let { data } = $props();

  const lesson = $derived(data.lesson);
  const nextLesson = $derived(data.nextLesson);
  const previousLesson = $derived(data.previousLesson);

  // Separate blocks into instructions and playground
  const instructions = $derived(lesson.blocks.filter((b) => b.type === "text"));
  const playgroundBlock = $derived(
    lesson.blocks.find((b) => b.type === "code")
  );

  const course = $derived(page.params.course);
</script>

<SEO
  title="{lesson.title} - Cloudflare Tutorial"
  description={lesson.description}
/>

<!-- Desktop: Split panes layout -->
<div class="hidden lg:block min-h-screen">
  <Splitpanes style="height: 100vh" class="splitpanes-custom">
    <!-- Left: Instructions -->
    <Pane minSize={25} size={40}>
      <div class="h-full overflow-y-auto bg-gray-900">
        <header
          class="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-10"
        >
          <nav class="text-sm text-gray-400 mb-2">
            <a href="/" class="hover:text-white transition">Home</a>
            <span class="mx-2">/</span>
            <a
              href="/learn/{course}"
              class="hover:text-white text-orange-400 font-medium">Chapters</a
            >
          </nav>
          <div class="flex items-center gap-2 mb-1">
            <span
              class="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-medium"
            >
              Lesson {lesson.order}
            </span>
            <span class="text-gray-500 text-xs">{lesson.course}</span>
          </div>
          <h1 class="text-xl font-bold text-white">
            {lesson.title}
          </h1>
        </header>

        <div class="p-6">
          <div class="space-y-6 text-gray-300 leading-relaxed">
            {#each instructions as instruction}
              <div class="prose-dark">
                <Markdown content={instruction.content} />
              </div>
            {/each}
          </div>

          <!-- Navigation -->
          <div
            class="mt-12 pt-8 border-t border-gray-700 flex items-center justify-between"
          >
            {#if previousLesson}
              <a
                href="/learn/{course}/{previousLesson.slug}"
                class="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Previous</span>
              </a>
            {:else}
              <div></div>
            {/if}

            {#if nextLesson}
              <a
                href="/learn/{course}/{nextLesson.slug}"
                class="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition font-medium"
              >
                <span>Next: {nextLesson.title}</span>
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            {:else}
              <a
                href="/learn/{course}"
                class="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition"
              >
                <span>Back to Chapters</span>
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            {/if}
          </div>
        </div>
      </div>
    </Pane>

    <!-- Right: Playground -->
    {#if playgroundBlock && playgroundBlock.type === "code"}
      <Pane minSize={30} size={60}>
        <div class="h-full overflow-y-auto bg-gray-950">
          <div class="p-8">
            <CodeBlock
              id={playgroundBlock.id}
              initial={playgroundBlock.initial}
              solution={playgroundBlock.solution}
              tests={playgroundBlock.tests}
            />
          </div>
        </div>
      </Pane>
    {/if}
  </Splitpanes>
</div>

<!-- Mobile: Stacked layout -->
<div class="lg:hidden min-h-screen bg-gray-900">
  <header
    class="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-10"
  >
    <nav class="text-sm text-gray-400 mb-2">
      <a href="/" class="hover:text-white transition">Home</a>
      <span class="mx-2">/</span>
      <a
        href="/learn/{course}"
        class="hover:text-white text-orange-400 font-medium">Chapters</a
      >
    </nav>
    <div class="flex items-center gap-2 mb-1">
      <span
        class="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-medium"
      >
        Lesson {lesson.order}
      </span>
      <span class="text-gray-500 text-xs">{lesson.course}</span>
    </div>
    <h1 class="text-xl font-bold text-white">{lesson.title}</h1>
  </header>

  <div class="p-6">
    <!-- Instructions -->
    <div class="space-y-6 text-gray-300 leading-relaxed mb-8">
      {#each instructions as instruction}
        <div class="prose-dark">
          <Markdown content={instruction.content} />
        </div>
      {/each}
    </div>

    <!-- Playground -->
    {#if playgroundBlock && playgroundBlock.type === "code"}
      <div class="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-8">
        <CodeBlock
          id={playgroundBlock.id}
          initial={playgroundBlock.initial}
          solution={playgroundBlock.solution}
          tests={playgroundBlock.tests}
        />
      </div>
    {/if}

    <!-- Navigation -->
    <div
      class="pt-8 border-t border-gray-700 flex items-center justify-between"
    >
      {#if previousLesson}
        <a
          href="/learn/{course}/{previousLesson.slug}"
          class="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Previous</span>
        </a>
      {:else}
        <div></div>
      {/if}

      {#if nextLesson}
        <a
          href="/learn/{course}/{nextLesson.slug}"
          class="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition font-medium"
        >
          <span>Next: {nextLesson.title}</span>
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      {:else}
        <a
          href="/learn/{course}"
          class="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition"
        >
          <span>Back to Chapters</span>
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(.splitpanes-custom) {
    background-color: rgb(17 24 39);
  }

  :global(.splitpanes-custom .splitpanes__splitter) {
    background-color: rgb(31 41 55);
    width: 6px;
    transition: background-color 0.2s;
    position: relative;
  }

  :global(.splitpanes-custom .splitpanes__splitter:before) {
    content: "";
    position: absolute;
    left: -2px;
    top: 0;
    width: 10px;
    height: 100%;
    cursor: col-resize;
    z-index: 1;
  }

  :global(.splitpanes-custom .splitpanes__splitter:after) {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 32px;
    background-color: rgb(75 85 99);
    border-radius: 1px;
    transition: background-color 0.2s;
  }

  :global(.splitpanes-custom .splitpanes__splitter:hover) {
    background-color: rgb(55 65 81);
  }

  :global(.splitpanes-custom .splitpanes__splitter:hover:after) {
    background-color: rgb(251 146 60);
  }

  /* Dark prose styles */
  :global(.prose-dark h1) {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: rgb(255 255 255);
  }
  :global(.prose-dark h2) {
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: 600;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    color: rgb(255 255 255);
  }
  :global(.prose-dark h3) {
    font-size: 1.125rem;
    line-height: 1.5rem;
    font-weight: 600;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: rgb(255 255 255);
  }
  :global(.prose-dark p) {
    margin-bottom: 1rem;
    color: rgb(209 213 219);
    line-height: 1.75;
  }
  :global(.prose-dark code) {
    background-color: rgb(31 41 55);
    border: 1px solid rgb(55 65 81);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    color: rgb(251 146 60);
    font-family: "Google Sans Code", monospace;
    font-size: 0.875rem;
    font-weight: 500;
  }
  :global(.prose-dark pre) {
    background-color: rgb(17 24 39);
    border: 1px solid rgb(55 65 81);
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
    margin: 1rem 0;
  }
  :global(.prose-dark pre code) {
    background: none;
    border: none;
    padding: 0;
    color: rgb(209 213 219);
  }
  :global(.prose-dark strong) {
    font-weight: 600;
    color: rgb(255 255 255);
  }
  :global(.prose-dark a) {
    color: rgb(251 146 60);
    text-decoration: none;
    font-weight: 500;
  }
  :global(.prose-dark a:hover) {
    text-decoration: underline;
  }
  :global(.prose-dark ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
    color: rgb(209 213 219);
  }
  :global(.prose-dark ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
    color: rgb(209 213 219);
  }
  :global(.prose-dark li) {
    margin-bottom: 0.5rem;
  }
  :global(.prose-dark blockquote) {
    border-left: 4px solid rgb(251 146 60);
    padding-left: 1rem;
    margin: 1rem 0;
    color: rgb(156 163 175);
    font-style: italic;
  }

  :global(.splitpanes__splitter) {
    background-color: black !important;
  }
</style>
