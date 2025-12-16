<script lang="ts">
  import { quizStore, flashcards } from "$lib/quiz-store.svelte";
  import {
    judgeAnswer as judgeAnswerRemote,
    askFollowUp as askFollowUpRemote,
  } from "../../routes/data.remote";
  import { goto } from "$app/navigation";

  let loading = $state(false);

  async function judgeAnswer() {
    if (!quizStore.userAnswer.trim()) return;
    loading = true;
    try {
      const card = quizStore.currentCard;
      const result = await judgeAnswerRemote({
        question: card.question,
        correctAnswer: card.answer,
        userAnswer: quizStore.userAnswer,
      });
      quizStore.judgeResult = result;
      quizStore.saveResponse(
        result.score,
        quizStore.userAnswer,
        result.feedback
      );
    } catch (e: any) {
      quizStore.judgeResult = { score: 0, feedback: "Error: " + e.message };
    }
    loading = false;
  }

  async function askFollowUp() {
    if (!quizStore.followUp.trim()) return;
    loading = true;
    try {
      const card = quizStore.currentCard;
      const result = await askFollowUpRemote({
        question: card.question,
        correctAnswer: card.answer,
        followUp: quizStore.followUp,
      });
      quizStore.followUpResult = result.answer;
    } catch (e: any) {
      quizStore.followUpResult = "Error: " + e.message;
    }
    loading = false;
  }

  function handleFinish() {
    quizStore.finishQuiz();
    goto("/");
  }

  function handleBack() {
    goto("/");
  }
</script>

{#if quizStore.mode === "quiz" && quizStore.currentCard}
  {@const card = quizStore.currentCard}
  {@const avgStr = quizStore.avgScore ? quizStore.avgScore.toFixed(1) : "-"}
  <header
    class="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-10"
  >
    <div class="max-w-4xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          onclick={handleBack}
          class="text-gray-400 hover:text-white transition"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            /></svg
          >
        </button>
        <span class="text-lg font-medium">Quiz Progress</span>
      </div>
      <div class="flex items-center gap-4 text-sm">
        <span class="text-gray-400"
          >{quizStore.currentIndex + 1}/{quizStore.cards.length}</span
        >
        <span class="text-gray-400"
          >Avg: <span
            class={quizStore.avgScore >= 7
              ? "text-green-400"
              : quizStore.avgScore >= 4
                ? "text-yellow-400"
                : "text-gray-400"}>{avgStr}</span
          ></span
        >
        <button
          onclick={handleFinish}
          class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition"
          >Finish & Analyze</button
        >
      </div>
    </div>
    <div class="max-w-4xl mx-auto mt-2">
      <div class="h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-orange-500 transition-all duration-300"
          style="width: {quizStore.progress}%"
        ></div>
      </div>
    </div>
  </header>

  <main class="max-w-4xl mx-auto px-6 py-8">
    <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div class="p-8">
        <div class="flex items-center gap-2 mb-4">
          <span
            class="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-medium"
            >{card.category}</span
          >
          <span class="text-gray-500 text-xs">{card.id}</span>
          {#if card.tags.includes("important")}
            <span
              class="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs"
              >Important</span
            >
          {/if}
        </div>

        <h2 class="text-2xl font-semibold mb-6 leading-relaxed">
          {card.question}
        </h2>

        {#if !quizStore.judgeResult}
          <div class="space-y-4">
            {#if quizStore.difficulty === "easy"}
              <!-- Multiple Choice -->
              <div class="grid gap-3">
                {#each quizStore.choices as choice, i}
                  <button
                    onclick={() => quizStore.selectChoice(choice)}
                    class="w-full text-left p-4 rounded-lg border transition {quizStore.selectedChoice ===
                    choice
                      ? 'bg-orange-500/20 border-orange-500'
                      : 'bg-gray-900 border-gray-600 hover:border-gray-500'}"
                  >
                    <span class="text-gray-500 mr-3"
                      >{String.fromCharCode(65 + i)}.</span
                    >
                    <span class="text-gray-200">{choice}</span>
                  </button>
                {/each}
              </div>
              <div class="flex gap-3">
                <button
                  onclick={() => quizStore.skipCard()}
                  class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
                  >Skip</button
                >
              </div>
            {:else}
              <!-- Free-form Answer -->
              <textarea
                bind:value={quizStore.userAnswer}
                placeholder="Type your answer..."
                class="w-full bg-gray-900 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none resize-none"
                rows="4"
              ></textarea>
              <div class="flex gap-3">
                <button
                  onclick={judgeAnswer}
                  disabled={loading}
                  class="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium transition"
                >
                  {loading ? "Judging..." : "Submit Answer"}
                </button>
                <button
                  onclick={() => quizStore.skipCard()}
                  class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
                  >Skip</button
                >
                <button
                  onclick={() => quizStore.showAnswer()}
                  class="px-4 py-2 text-gray-400 hover:text-white transition"
                  >Show Answer</button
                >
              </div>
            {/if}
          </div>
        {:else}
          <div class="space-y-4">
            {#if quizStore.difficulty === "easy"}
              <!-- Easy Mode Result -->
              <div class="grid gap-3">
                {#each quizStore.choices as choice, i}
                  {@const isCorrect = choice === card.answer}
                  {@const isSelected = quizStore.selectedChoice === choice}
                  <div
                    class="w-full text-left p-4 rounded-lg border transition {isCorrect
                      ? 'bg-green-500/20 border-green-500'
                      : isSelected
                        ? 'bg-red-500/20 border-red-500'
                        : 'bg-gray-900 border-gray-700 opacity-50'}"
                  >
                    <span class="text-gray-500 mr-3"
                      >{String.fromCharCode(65 + i)}.</span
                    >
                    <span
                      class={isCorrect
                        ? "text-green-400"
                        : isSelected
                          ? "text-red-400"
                          : "text-gray-400"}>{choice}</span
                    >
                    {#if isCorrect}
                      <span class="ml-2 text-green-400">&#10003;</span>
                    {:else if isSelected}
                      <span class="ml-2 text-red-400">&#10007;</span>
                    {/if}
                  </div>
                {/each}
              </div>
              <div
                class="bg-gray-900 rounded-lg p-4 border-l-4 {quizStore
                  .judgeResult.score === 10
                  ? 'border-green-500'
                  : 'border-red-500'}"
              >
                <span
                  class="text-2xl font-bold {quizStore.judgeResult.score === 10
                    ? 'text-green-400'
                    : 'text-red-400'}"
                >
                  {quizStore.judgeResult.score === 10
                    ? "Correct!"
                    : "Incorrect"}
                </span>
              </div>
            {:else}
              <!-- Normal Mode Result -->
              <div
                class="bg-gray-900 rounded-lg p-4 border-l-4 {quizStore
                  .judgeResult.score >= 7
                  ? 'border-green-500'
                  : quizStore.judgeResult.score >= 4
                    ? 'border-yellow-500'
                    : 'border-red-500'}"
              >
                <div class="flex items-center gap-3 mb-2">
                  <span
                    class="text-3xl font-bold {quizStore.judgeResult.score >= 7
                      ? 'text-green-400'
                      : quizStore.judgeResult.score >= 4
                        ? 'text-yellow-400'
                        : 'text-red-400'}"
                    >{quizStore.judgeResult.score}/10</span
                  >
                </div>
                <p class="text-sm text-gray-400 mb-2">Your answer:</p>
                <p class="text-gray-300 mb-3">
                  {quizStore.userAnswer || "(skipped)"}
                </p>
                <p class="text-gray-200">{quizStore.judgeResult.feedback}</p>
              </div>

              <div class="bg-gray-900/50 rounded-lg p-4">
                <p class="text-xs text-gray-500 mb-1">Reference answer</p>
                <p class="mono text-gray-200 text-sm">{card.answer}</p>
              </div>
            {/if}

            <div class="pt-4 border-t border-gray-700">
              <p class="text-sm text-gray-400 mb-2">
                Have a follow-up question?
              </p>
              <div class="flex gap-2">
                <input
                  bind:value={quizStore.followUp}
                  onkeydown={(e) => e.key === "Enter" && askFollowUp()}
                  placeholder="Ask anything about this topic..."
                  class="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                />
                <button
                  onclick={askFollowUp}
                  disabled={loading}
                  class="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded transition"
                  >{loading ? "..." : "Ask"}</button
                >
              </div>
              {#if quizStore.followUpResult}
                <div
                  class="mt-4 bg-gray-900 rounded-lg p-4 text-gray-300 text-sm whitespace-pre-wrap"
                >
                  {quizStore.followUpResult}
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>

      <div class="px-8 py-4 bg-gray-900/50 flex justify-between">
        <button
          onclick={() => quizStore.prevCard()}
          disabled={quizStore.currentIndex === 0}
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >Previous</button
        >
        <button
          onclick={() => {
            if (quizStore.currentIndex === quizStore.cards.length - 1) {
              handleFinish();
            } else {
              quizStore.nextCard();
            }
          }}
          class="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded font-medium transition"
        >
          {quizStore.currentIndex === quizStore.cards.length - 1
            ? "Finish Quiz"
            : "Next"}
        </button>
      </div>
    </div>
  </main>
{/if}

<style>
  code,
  .mono {
    font-family: "Google Sans Code", monospace;
  }
</style>
