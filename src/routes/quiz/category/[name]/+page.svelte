<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { quizStore, categories } from "$lib/quiz-store.svelte";
  import Quiz from "$lib/components/Quiz.svelte";
  import SEO from "$lib/components/SEO.svelte";
  import { onMount } from "svelte";

  let categoryName = $derived(decodeURIComponent(page.params.name || ""));
  let isValid = $derived(
    categoryName !== "" && categories.includes(categoryName)
  );
  let initialized = $state(false);

  onMount(() => {
    if (!isValid) {
      goto("/");
      return;
    }

    quizStore.startQuiz("category", categoryName, "normal");
    initialized = true;
  });

  // Redirect to home when quiz finishes
  $effect(() => {
    if (initialized && quizStore.mode === "analysis") {
      goto("/");
    }
  });
</script>

<SEO
  title="Cloudflare Tutorial - {categoryName}"
  description="Test your knowledge of {categoryName} with interactive quizzes"
/>

<div class="min-h-screen bg-gray-900 text-white">
  <Quiz />
</div>
