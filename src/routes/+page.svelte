<script lang="ts">
  import { quizStore, flashcards, categories } from '$lib/quiz-store.svelte';
  import { judgeAnswer as judgeAnswerRemote, askFollowUp as askFollowUpRemote } from './data.remote';
  import SEO from '$lib/components/SEO.svelte';

  let loading = $state(false);

  async function judgeAnswer() {
    if (!quizStore.userAnswer.trim()) return;
    loading = true;
    try {
      const card = quizStore.currentCard;
      const result = await judgeAnswerRemote({
        question: card.question,
        correctAnswer: card.answer,
        userAnswer: quizStore.userAnswer
      });
      quizStore.judgeResult = result;
      quizStore.saveResponse(result.score, quizStore.userAnswer, result.feedback);
    } catch (e: any) {
      quizStore.judgeResult = { score: 0, feedback: 'Error: ' + e.message };
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
        followUp: quizStore.followUp
      });
      quizStore.followUpResult = result.answer;
    } catch (e: any) {
      quizStore.followUpResult = 'Error: ' + e.message;
    }
    loading = false;
  }

  function getStats(responses: typeof quizStore.responses) {
    const answered = responses.filter(r => !r.skipped);
    const skipped = responses.filter(r => r.skipped);
    const avgScore = answered.length ? answered.reduce((s, r) => s + r.score, 0) / answered.length : 0;
    const categoryStats: Record<string, { total: number; score: number; count: number }> = {};
    responses.forEach(r => {
      const card = flashcards.find(c => c.id === r.cardId);
      if (!card) return;
      if (!categoryStats[card.category]) categoryStats[card.category] = { total: 0, score: 0, count: 0 };
      categoryStats[card.category].total++;
      if (!r.skipped) {
        categoryStats[card.category].score += r.score;
        categoryStats[card.category].count++;
      }
    });
    const weakAreas = Object.entries(categoryStats)
      .filter(([, s]) => s.count > 0 && s.score / s.count < 6)
      .sort((a, b) => a[1].score / a[1].count - b[1].score / b[1].count);
    const strongAreas = Object.entries(categoryStats)
      .filter(([, s]) => s.count > 0 && s.score / s.count >= 7)
      .sort((a, b) => b[1].score / b[1].count - a[1].score / a[1].count);
    const reviewCards = responses
      .filter(r => !r.skipped && r.score < 6)
      .map(r => ({ ...r, card: flashcards.find(c => c.id === r.cardId)! }))
      .filter(r => r.card);
    return { answered, skipped, avgScore, categoryStats, weakAreas, strongAreas, reviewCards };
  }

  function getGrade(avg: number) {
    if (avg >= 9) return { grade: 'A+', color: 'text-green-400', msg: "Outstanding! You've mastered this material." };
    if (avg >= 8) return { grade: 'A', color: 'text-green-400', msg: 'Excellent understanding. Minor gaps remain.' };
    if (avg >= 7) return { grade: 'B+', color: 'text-green-400', msg: 'Good foundation. Review weak areas to level up.' };
    if (avg >= 6) return { grade: 'B', color: 'text-yellow-400', msg: 'Solid basics. Some topics need more study.' };
    if (avg >= 5) return { grade: 'C', color: 'text-yellow-400', msg: 'Room for improvement. Focus on fundamentals.' };
    return { grade: 'D', color: 'text-red-400', msg: 'Keep learning! Start with the basics.' };
  }
</script>

<SEO 
  title="Cloudflare Tutorial"
  description="Interactive learning platform for Cloudflare Workers, D1, Durable Objects, KV, R2 and more. {flashcards.length} topics across {categories.length} categories."
  keywords="cloudflare, workers, d1, durable objects, pages, kv, r2, tutorial, quiz, learning"
/>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Code:wght@300..800&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap" rel="stylesheet" />
</svelte:head>

<style>
  :global(body) { font-family: 'Google Sans Flex', sans-serif; }
  code, .mono { font-family: 'Google Sans Code', monospace; }
  .scrollbar-thin::-webkit-scrollbar { width: 6px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: #1f2937; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
</style>

{#if quizStore.pendingResume}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
      <h2 class="text-xl font-bold mb-4">Resume Quiz?</h2>
      <p class="text-gray-400 mb-6">You have an unfinished quiz ({quizStore.pendingResume.responses.length} answered). Resume?</p>
      <div class="flex gap-3">
        <button onclick={() => quizStore.resumeQuiz(quizStore.pendingResume!)} class="flex-1 bg-orange-500 hover:bg-orange-600 py-2 rounded font-medium">Resume</button>
        <button onclick={() => quizStore.dismissResume()} class="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded">Start Fresh</button>
      </div>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-gray-900 text-white">
  {#if quizStore.mode === 'menu'}
    <!-- MENU -->
    <div class="min-h-screen flex items-center justify-center p-6">
      <div class="max-w-2xl w-full">
        <div class="text-center mb-12">
          <div class="flex items-center justify-center gap-3 mb-4">
            <img src="/cloudflare.svg" alt="Cloudflare" class="h-12" />
          </div>
          <h1 class="text-4xl font-bold mb-2">Cloudflare Tutorial</h1>
          <p class="text-xl text-gray-400">Interactive Learning & Quiz System</p>
          <p class="text-sm text-gray-500 mt-2">{flashcards.length} topics across {categories.length} categories</p>
        </div>

        <div class="space-y-4">
          <button onclick={() => quizStore.startQuiz('full')} class="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-lg font-medium text-lg transition flex items-center justify-center gap-3">
            <span>Full Quiz ({flashcards.length} cards)</span>
            <span class="text-orange-200 text-sm">~{Math.ceil(flashcards.length * 1.5)} min</span>
          </button>

          <button onclick={() => quizStore.startQuiz('quick')} class="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 px-6 rounded-lg font-medium text-lg transition flex items-center justify-center gap-3">
            <span>Quick Quiz (20 random)</span>
            <span class="text-gray-400 text-sm">~25 min</span>
          </button>

          <div class="pt-4">
            <p class="text-sm text-gray-500 mb-3">Or select a category:</p>
            <div class="flex flex-wrap gap-2">
              {#each categories as cat}
                <button onclick={() => quizStore.startQuiz('category', cat)} class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                  {cat} <span class="text-gray-500">({flashcards.filter(c => c.category === cat).length})</span>
                </button>
              {/each}
            </div>
          </div>
        </div>

        {#if quizStore.sessions.length > 0}
          <div class="mt-8 p-4 bg-gray-800/50 rounded-lg">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium">Recent Sessions</h3>
              <button onclick={() => quizStore.goToHistory()} class="text-sm text-orange-400 hover:text-orange-300">View All</button>
            </div>
            <div class="space-y-2">
              {#each quizStore.sessions.slice(0, 3) as s}
                {@const answered = s.responses.filter(r => !r.skipped)}
                {@const avg = answered.length ? (answered.reduce((sum, r) => sum + r.score, 0) / answered.length).toFixed(1) : '-'}
                <button onclick={() => quizStore.viewSession(s.id)} class="w-full flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition text-left">
                  <div>
                    <div class="text-sm">{new Date(s.startTime).toLocaleDateString()} - {s.mode}</div>
                    <div class="text-xs text-gray-500">{s.responses.length} answered</div>
                  </div>
                  <div class="text-lg font-bold {avg !== '-' && parseFloat(avg) >= 7 ? 'text-green-400' : avg !== '-' && parseFloat(avg) >= 5 ? 'text-yellow-400' : 'text-gray-400'}">{avg}</div>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <div class="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <h3 class="font-medium mb-2">How it works:</h3>
          <ul class="text-sm text-gray-400 space-y-1">
            <li>1. Answer each question in your own words</li>
            <li>2. AI evaluates your answer against the reference</li>
            <li>3. Ask follow-up questions to learn more</li>
            <li>4. Get a full analysis & study plan at the end</li>
          </ul>
        </div>
      </div>
    </div>

  {:else if quizStore.mode === 'quiz'}
    <!-- QUIZ -->
    {@const card = quizStore.currentCard}
    {@const avgStr = quizStore.avgScore ? quizStore.avgScore.toFixed(1) : '-'}
    <header class="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button onclick={() => quizStore.goToMenu()} class="text-gray-400 hover:text-white transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span class="text-lg font-medium">Quiz Progress</span>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <span class="text-gray-400">{quizStore.currentIndex + 1}/{quizStore.cards.length}</span>
          <span class="text-gray-400">Avg: <span class="{quizStore.avgScore >= 7 ? 'text-green-400' : quizStore.avgScore >= 4 ? 'text-yellow-400' : 'text-gray-400'}">{avgStr}</span></span>
          <button onclick={() => quizStore.finishQuiz()} class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition">Finish & Analyze</button>
        </div>
      </div>
      <div class="max-w-4xl mx-auto mt-2">
        <div class="h-1 bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-orange-500 transition-all duration-300" style="width: {quizStore.progress}%"></div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-6 py-8">
      <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div class="p-8">
          <div class="flex items-center gap-2 mb-4">
            <span class="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">{card.category}</span>
            <span class="text-gray-500 text-xs">{card.id}</span>
            {#if card.tags.includes('important')}
              <span class="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span>
            {/if}
          </div>

          <h2 class="text-2xl font-semibold mb-6 leading-relaxed">{card.question}</h2>

          {#if !quizStore.judgeResult}
            <div class="space-y-4">
              <textarea bind:value={quizStore.userAnswer} placeholder="Type your answer..." class="w-full bg-gray-900 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none resize-none" rows="4"></textarea>
              <div class="flex gap-3">
                <button onclick={judgeAnswer} disabled={loading} class="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium transition">
                  {loading ? 'Judging...' : 'Submit Answer'}
                </button>
                <button onclick={() => quizStore.skipCard()} class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition">Skip</button>
                <button onclick={() => quizStore.showAnswer()} class="px-4 py-2 text-gray-400 hover:text-white transition">Show Answer</button>
              </div>
            </div>
          {:else}
            <div class="space-y-4">
              <div class="bg-gray-900 rounded-lg p-4 border-l-4 {quizStore.judgeResult.score >= 7 ? 'border-green-500' : quizStore.judgeResult.score >= 4 ? 'border-yellow-500' : 'border-red-500'}">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-3xl font-bold {quizStore.judgeResult.score >= 7 ? 'text-green-400' : quizStore.judgeResult.score >= 4 ? 'text-yellow-400' : 'text-red-400'}">{quizStore.judgeResult.score}/10</span>
                </div>
                <p class="text-sm text-gray-400 mb-2">Your answer:</p>
                <p class="text-gray-300 mb-3">{quizStore.userAnswer || '(skipped)'}</p>
                <p class="text-gray-200">{quizStore.judgeResult.feedback}</p>
              </div>

              <div class="bg-gray-900/50 rounded-lg p-4">
                <p class="text-xs text-gray-500 mb-1">Reference answer</p>
                <p class="mono text-gray-200 text-sm">{card.answer}</p>
              </div>

              <div class="pt-4 border-t border-gray-700">
                <p class="text-sm text-gray-400 mb-2">Have a follow-up question?</p>
                <div class="flex gap-2">
                  <input bind:value={quizStore.followUp} onkeydown={(e) => e.key === 'Enter' && askFollowUp()} placeholder="Ask anything about this topic..." class="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none" />
                  <button onclick={askFollowUp} disabled={loading} class="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded transition">{loading ? '...' : 'Ask'}</button>
                </div>
                {#if quizStore.followUpResult}
                  <div class="mt-4 bg-gray-900 rounded-lg p-4 text-gray-300 text-sm whitespace-pre-wrap">{quizStore.followUpResult}</div>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <div class="px-8 py-4 bg-gray-900/50 flex justify-between">
          <button onclick={() => quizStore.prevCard()} disabled={quizStore.currentIndex === 0} class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
          <button onclick={() => quizStore.nextCard()} class="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded font-medium transition">
            {quizStore.currentIndex === quizStore.cards.length - 1 ? 'Finish Quiz' : 'Next'}
          </button>
        </div>
      </div>
    </main>

  {:else if quizStore.mode === 'analysis'}
    <!-- ANALYSIS -->
    {@const stats = getStats(quizStore.responses)}
    {@const gradeInfo = getGrade(stats.avgScore)}
    {@const totalTime = quizStore.startTime ? Math.round((Date.now() - quizStore.startTime) / 60000) : 0}
    <div class="min-h-screen">
      <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
          <h1 class="text-xl font-bold">Quiz Analysis</h1>
          <div class="flex gap-2">
            <button onclick={() => quizStore.goToHistory()} class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition">View History</button>
            <button onclick={() => quizStore.goToMenu()} class="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded transition">New Quiz</button>
          </div>
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 text-center">
          <div class="text-8xl font-bold {gradeInfo.color} mb-4">{gradeInfo.grade}</div>
          <div class="text-2xl font-medium mb-2">Average Score: {stats.avgScore.toFixed(1)}/10</div>
          <p class="text-gray-400">{gradeInfo.msg}</p>
          <div class="mt-6 flex justify-center gap-8 text-sm">
            <div><div class="text-2xl font-bold text-white">{stats.answered.length}</div><div class="text-gray-500">Answered</div></div>
            <div><div class="text-2xl font-bold text-gray-500">{stats.skipped.length}</div><div class="text-gray-500">Skipped</div></div>
            <div><div class="text-2xl font-bold text-white">{totalTime}</div><div class="text-gray-500">Minutes</div></div>
          </div>
        </div>

        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-lg font-semibold mb-4">Performance by Category</h2>
          <div class="space-y-3">
            {#each Object.entries(stats.categoryStats).sort((a, b) => {
              const avgA = a[1].count > 0 ? a[1].score / a[1].count : 0;
              const avgB = b[1].count > 0 ? b[1].score / b[1].count : 0;
              return avgB - avgA;
            }) as [cat, s]}
              {@const avg = s.count > 0 ? (s.score / s.count).toFixed(1) : '-'}
              {@const pct = s.count > 0 ? (s.score / s.count) * 10 : 0}
              {@const color = parseFloat(avg) >= 7 ? 'bg-green-500' : parseFloat(avg) >= 5 ? 'bg-yellow-500' : 'bg-red-500'}
              <div class="flex items-center gap-4">
                <div class="w-36 text-sm text-gray-400 truncate">{cat}</div>
                <div class="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full {color} transition-all" style="width: {pct}%"></div>
                </div>
                <div class="w-12 text-right text-sm {parseFloat(avg) >= 7 ? 'text-green-400' : parseFloat(avg) >= 5 ? 'text-yellow-400' : avg === '-' ? 'text-gray-500' : 'text-red-400'}">{avg}</div>
              </div>
            {/each}
          </div>
        </div>

        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-lg font-semibold mb-4">Study Recommendations</h2>
          {#if stats.weakAreas.length > 0}
            <div class="mb-6">
              <h3 class="text-sm font-medium text-red-400 mb-2">Priority Areas (Need Work)</h3>
              <div class="space-y-2">
                {#each stats.weakAreas as [cat, s]}
                  <div class="flex items-center justify-between bg-red-500/10 p-3 rounded-lg">
                    <span>{cat}</span>
                    <span class="text-red-400">{(s.score / s.count).toFixed(1)}/10</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          {#if stats.strongAreas.length > 0}
            <div class="mb-6">
              <h3 class="text-sm font-medium text-green-400 mb-2">Strong Areas</h3>
              <div class="flex flex-wrap gap-2">
                {#each stats.strongAreas as [cat, s]}
                  <span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">{cat} ({(s.score / s.count).toFixed(1)})</span>
                {/each}
              </div>
            </div>
          {/if}
          <div class="mt-6 p-4 bg-gray-900 rounded-lg">
            <h3 class="font-medium mb-3">Next Steps</h3>
            <ol class="text-sm text-gray-400 space-y-2 list-decimal list-inside">
              {#if stats.weakAreas.length > 0}<li>Focus on <strong class="text-white">{stats.weakAreas[0][0]}</strong> - your weakest area</li>{/if}
              {#if stats.reviewCards.length > 0}<li>Review the {stats.reviewCards.length} cards you scored below 6</li>{/if}
              {#if stats.skipped.length > 0}<li>Go back and attempt the {stats.skipped.length} skipped questions</li>{/if}
              <li>Re-read official Cloudflare docs for weak categories</li>
              <li>Practice explaining concepts out loud</li>
            </ol>
          </div>
        </div>

        {#if stats.reviewCards.length > 0}
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 class="text-lg font-semibold mb-4">Cards to Review ({stats.reviewCards.length})</h2>
            <div class="space-y-4 max-h-96 overflow-y-auto scrollbar-thin pr-2">
              {#each stats.reviewCards as r}
                <div class="bg-gray-900 rounded-lg p-4 border-l-4 {r.score >= 4 ? 'border-yellow-500' : 'border-red-500'}">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-bold {r.score >= 4 ? 'text-yellow-400' : 'text-red-400'}">{r.score}/10</span>
                    <span class="text-xs text-gray-500">{r.card.category}</span>
                  </div>
                  <p class="font-medium mb-2">{r.card.question}</p>
                  <p class="text-sm text-gray-400 mb-1">Your answer: {r.userAnswer}</p>
                  <p class="text-sm text-green-400/80">Correct: {r.card.answer}</p>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <div class="flex gap-4">
          <button onclick={() => quizStore.startQuiz('weak')} disabled={stats.weakAreas.length === 0} class="flex-1 bg-orange-500 hover:bg-orange-600 py-3 rounded-lg font-medium transition disabled:opacity-50">Practice Weak Areas</button>
          <button onclick={() => quizStore.goToMenu()} class="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-medium transition">New Quiz</button>
        </div>
      </main>
    </div>

  {:else if quizStore.mode === 'history'}
    <!-- HISTORY -->
    <div class="min-h-screen">
      <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button onclick={() => quizStore.goToMenu()} class="text-gray-400 hover:text-white transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <h1 class="text-xl font-bold">Quiz History</h1>
          </div>
          {#if quizStore.sessions.length > 0}
            <button onclick={() => confirm('Clear all history?') && quizStore.clearHistory()} class="px-3 py-1 text-red-400 hover:text-red-300 text-sm transition">Clear All</button>
          {/if}
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-6 py-8">
        {#if quizStore.sessions.length === 0}
          <div class="text-center py-16">
            <div class="text-gray-500 text-lg mb-4">No quiz history yet</div>
            <button onclick={() => quizStore.goToMenu()} class="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition">Start Your First Quiz</button>
          </div>
        {:else}
          <div class="space-y-4">
            {#each quizStore.sessions as s}
              {@const answered = s.responses.filter(r => !r.skipped)}
              {@const avg = answered.length ? (answered.reduce((sum, r) => sum + r.score, 0) / answered.length).toFixed(1) : '-'}
              {@const duration = s.endTime ? Math.round((s.endTime - s.startTime) / 60000) : '?'}
              {@const grade = parseFloat(avg) >= 9 ? 'A+' : parseFloat(avg) >= 8 ? 'A' : parseFloat(avg) >= 7 ? 'B+' : parseFloat(avg) >= 6 ? 'B' : parseFloat(avg) >= 5 ? 'C' : 'D'}
              <button onclick={() => quizStore.viewSession(s.id)} class="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition text-left">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium">{new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                    <div class="text-sm text-gray-500 mt-1">{s.mode} - {s.totalCards} cards - {duration} min</div>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold {parseFloat(avg) >= 7 ? 'text-green-400' : parseFloat(avg) >= 5 ? 'text-yellow-400' : avg === '-' ? 'text-gray-500' : 'text-red-400'}">{grade}</div>
                    <div class="text-sm text-gray-500">{avg}/10 avg</div>
                  </div>
                </div>
                <div class="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>{answered.length} answered</span>
                  <span>{s.responses.filter(r => r.skipped).length} skipped</span>
                  <span>{s.responses.filter(r => !r.skipped && r.score >= 7).length} correct</span>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </main>
    </div>

  {:else if quizStore.mode === 'session-detail'}
    <!-- SESSION DETAIL -->
    {@const session = quizStore.viewingSession}
    {#if session}
      {@const answered = session.responses.filter(r => !r.skipped)}
      {@const avg = answered.length ? (answered.reduce((sum, r) => sum + r.score, 0) / answered.length).toFixed(1) : '-'}
      <div class="min-h-screen">
        <header class="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div class="max-w-4xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button onclick={() => quizStore.goToHistory()} class="text-gray-400 hover:text-white transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <div>
                <h1 class="text-lg font-bold">{new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h1>
                <div class="text-sm text-gray-500">{session.mode} - Average: {avg}/10</div>
              </div>
            </div>
            <button onclick={() => confirm('Delete this session?') && quizStore.deleteSession(session.id)} class="px-3 py-1 text-red-400 hover:text-red-300 text-sm transition">Delete</button>
          </div>
        </header>

        <main class="max-w-4xl mx-auto px-6 py-8">
          <div class="space-y-4">
            {#each session.responses as r, i}
              {@const card = flashcards.find(c => c.id === r.cardId)}
              {#if card}
                <div class="bg-gray-800 rounded-lg p-4 border border-gray-700 border-l-4 {r.skipped ? 'border-l-gray-500' : r.score >= 7 ? 'border-l-green-500' : r.score >= 4 ? 'border-l-yellow-500' : 'border-l-red-500'}">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-gray-500">#{i + 1}</span>
                      <span class="px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">{card.category}</span>
                    </div>
                    <span class="font-bold {r.skipped ? 'text-gray-500' : r.score >= 7 ? 'text-green-400' : r.score >= 4 ? 'text-yellow-400' : 'text-red-400'}">
                      {r.skipped ? 'Skipped' : r.score + '/10'}
                    </span>
                  </div>
                  <p class="font-medium mb-3">{card.question}</p>
                  {#if !r.skipped}
                    <div class="text-sm space-y-2">
                      <div><span class="text-gray-500">Your answer:</span><p class="text-gray-300 mt-1">{r.userAnswer}</p></div>
                      <div><span class="text-gray-500">Reference:</span><p class="text-green-400/80 mt-1">{card.answer}</p></div>
                      {#if r.feedback}<div><span class="text-gray-500">Feedback:</span><p class="text-gray-400 mt-1">{r.feedback}</p></div>{/if}
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        </main>
      </div>
    {/if}
  {/if}
</div>
