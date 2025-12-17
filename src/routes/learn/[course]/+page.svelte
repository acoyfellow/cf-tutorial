<script lang="ts">
  import { getAllLessons } from "$lib/lessons";
  import SEO from "$lib/components/SEO.svelte";

  let { data } = $props();
  let { course } = data;

  const lessons = $derived(getAllLessons().filter((l) => l.course === course));
</script>

<SEO title="{course} - Table of Contents" description="Course lessons" />

<div class="min-h-screen bg-gray-900">
  <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
    <div class="max-w-4xl mx-auto">
      <nav class="text-sm text-gray-400 mb-4">
        <a href="/" class="hover:text-white transition">Home</a>
        <span class="mx-2">/</span>
        <span class="text-white font-medium">Table of Contents</span>
      </nav>
      <h1 class="text-3xl font-bold text-white">{course}</h1>
      <p class="text-gray-400 mt-1">Select a lesson to begin</p>
    </div>
  </header>

  <main class="max-w-4xl mx-auto px-6 py-8">
    <div class="space-y-3">
      {#each lessons as lesson, i}
        <a
          href="/learn/{lesson.course}/{lesson.slug}"
          class="block p-5 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-lg transition group"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-medium"
                >
                  Lesson {lesson.order}
                </span>
              </div>
              <h2
                class="text-lg font-semibold text-white group-hover:text-orange-400 transition"
              >
                {lesson.title}
              </h2>
              <p class="text-sm text-gray-400 mt-1">{lesson.description}</p>
            </div>
            <svg
              class="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition"
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
          </div>
        </a>
      {/each}
    </div>
  </main>
</div>


