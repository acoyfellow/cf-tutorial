<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { quizStore } from "$lib/quiz-store.svelte";
  import Quiz from "$lib/components/Quiz.svelte";
  import SEO from "$lib/components/SEO.svelte";
  import { onMount } from "svelte";

  const validLevels = ["easy", "quick", "full"] as const;
  type Level = (typeof validLevels)[number];

  let level = $derived(page.params.level as Level);
  let isValid = $derived(validLevels.includes(level));
  let initialized = $state(false);

  onMount(() => {
    if (!isValid) {
      goto("/");
      return;
    }

    if (level === "easy") {
      quizStore.startQuiz("quick", undefined, "easy");
    } else if (level === "quick") {
      quizStore.startQuiz("quick", undefined, "normal");
    } else if (level === "full") {
      quizStore.startQuiz("full", undefined, "normal");
    }
    initialized = true;
  });

  // Redirect to home when quiz finishes
  $effect(() => {
    if (initialized && quizStore.mode === "analysis") {
      goto("/");
    }
  });

  const titles: Record<Level, string> = {
    easy: "Easy Mode - Multiple Choice",
    quick: "Quick Quiz - 20 Questions",
    full: "Full Quiz - All Questions",
  };
</script>

<SEO
  title="Cloudflare Tutorial - {titles[level] || 'Quiz'}"
  description="Test your Cloudflare knowledge with interactive quizzes"
/>

<div class="min-h-screen bg-gray-900 text-white">
  <Quiz />
</div>
