import { browser } from '$app/environment';
import { flashcards, categories, type Flashcard } from './flashcards';

export type QuizResponse = {
  cardId: string;
  userAnswer: string;
  score: number;
  feedback: string;
  skipped: boolean;
  timeSpent: number;
};

export type QuizSession = {
  id: string;
  mode: string;
  startTime: number;
  endTime: number | null;
  totalCards: number;
  cardIds: string[];
  responses: QuizResponse[];
};

type Mode = 'menu' | 'quiz' | 'analysis' | 'history' | 'session-detail';
type Difficulty = 'easy' | 'normal';

const STORAGE_KEYS = {
  SESSIONS: 'cf-quiz-sessions',
  CURRENT: 'cf-quiz-current'
};

function loadSessions(): QuizSession[] {
  if (!browser) return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
  } catch { return []; }
}

function saveSessions(sessions: QuizSession[]) {
  if (browser) localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

function loadCurrentSession(): QuizSession | null {
  if (!browser) return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function saveCurrentSession(session: QuizSession) {
  if (browser) localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(session));
}

function clearCurrentSession() {
  if (browser) localStorage.removeItem(STORAGE_KEYS.CURRENT);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

class QuizStore {
  mode = $state<Mode>('menu');
  difficulty = $state<Difficulty>('normal');
  cards = $state<Flashcard[]>([]);
  currentIndex = $state(0);
  responses = $state<QuizResponse[]>([]);
  startTime = $state<number | null>(null);
  cardStartTime = $state<number | null>(null);
  userAnswer = $state('');
  judgeResult = $state<{ score: number; feedback: string } | null>(null);
  followUp = $state('');
  followUpResult = $state<string | null>(null);
  loading = $state(false);
  quizMode = $state('');
  sessionId = $state('');
  sessions = $state<QuizSession[]>([]);
  viewingSession = $state<QuizSession | null>(null);
  choices = $state<string[]>([]);
  selectedChoice = $state<string | null>(null);

  constructor() {
    if (browser) {
      this.sessions = loadSessions();
      const saved = loadCurrentSession();
      if (saved?.responses?.length) {
        // Will prompt user to resume
        this.pendingResume = saved;
      }
    }
  }

  pendingResume: QuizSession | null = null;

  get currentCard() {
    return this.cards[this.currentIndex];
  }

  get progress() {
    return this.cards.length ? ((this.currentIndex + 1) / this.cards.length) * 100 : 0;
  }

  get avgScore() {
    const answered = this.responses.filter(r => !r.skipped);
    return answered.length ? answered.reduce((s, r) => s + r.score, 0) / answered.length : 0;
  }

  startQuiz(mode: 'full' | 'quick' | 'category' | 'weak', category?: string, difficulty: Difficulty = 'normal') {
    this.mode = 'quiz';
    this.difficulty = difficulty;
    this.responses = [];
    this.currentIndex = 0;
    this.startTime = Date.now();
    this.cardStartTime = Date.now();
    this.sessionId = `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    this.quizMode = mode === 'category' ? category! : (difficulty === 'easy' ? `${mode} (easy)` : mode);
    this.resetCardState();

    if (mode === 'full') {
      this.cards = [...flashcards];
    } else if (mode === 'quick') {
      this.cards = shuffle(flashcards).slice(0, 20);
    } else if (mode === 'category' && category) {
      this.cards = flashcards.filter(c => c.category === category);
    } else if (mode === 'weak') {
      const weakCats = new Set<string>();
      this.responses.forEach(r => {
        if (!r.skipped && r.score < 6) {
          const card = flashcards.find(c => c.id === r.cardId);
          if (card) weakCats.add(card.category);
        }
      });
      this.cards = flashcards.filter(c => weakCats.has(c.category));
      if (!this.cards.length) this.cards = [...flashcards];
    }

    if (difficulty === 'easy') {
      this.generateChoices();
    }

    this.persistCurrentSession();
  }

  generateChoices() {
    const card = this.currentCard;
    if (!card) return;

    // Get wrong answers from other cards (prefer same category, then others)
    const sameCat = flashcards.filter(c => c.id !== card.id && c.category === card.category);
    const otherCat = flashcards.filter(c => c.id !== card.id && c.category !== card.category);
    const pool = shuffle([...sameCat, ...otherCat]);

    const wrongAnswers = pool.slice(0, 3).map(c => c.answer);
    this.choices = shuffle([card.answer, ...wrongAnswers]);
    this.selectedChoice = null;
  }

  selectChoice(choice: string) {
    if (this.judgeResult) return; // Already answered

    this.selectedChoice = choice;
    const card = this.currentCard;
    const isCorrect = choice === card.answer;

    this.judgeResult = {
      score: isCorrect ? 10 : 0,
      feedback: isCorrect ? 'Correct!' : `Incorrect. The answer is: ${card.answer}`
    };
    this.userAnswer = choice;
    this.saveResponse(this.judgeResult.score, choice, this.judgeResult.feedback);
  }

  resumeQuiz(session: QuizSession) {
    this.mode = 'quiz';
    this.sessionId = session.id;
    this.quizMode = session.mode;
    this.startTime = session.startTime;
    this.cards = session.cardIds.map(id => flashcards.find(c => c.id === id)!).filter(Boolean);
    this.currentIndex = Math.min(session.responses.length, this.cards.length - 1);
    this.responses = session.responses;
    this.cardStartTime = Date.now();
    this.resetCardState();
    this.pendingResume = null;
  }

  resetCardState() {
    this.userAnswer = '';
    this.judgeResult = null;
    this.followUp = '';
    this.followUpResult = null;
    this.cardStartTime = Date.now();
    this.selectedChoice = null;
    if (this.difficulty === 'easy') {
      this.generateChoices();
    }
  }

  saveResponse(score: number, answer: string, feedback = '') {
    const card = this.currentCard;
    const timeSpent = this.cardStartTime ? Date.now() - this.cardStartTime : 0;
    const response: QuizResponse = { cardId: card.id, userAnswer: answer, score, feedback, skipped: false, timeSpent };
    const idx = this.responses.findIndex(r => r.cardId === card.id);
    if (idx >= 0) this.responses[idx] = response;
    else this.responses.push(response);
    this.persistCurrentSession();
  }

  skipCard() {
    const card = this.currentCard;
    const response: QuizResponse = {
      cardId: card.id, userAnswer: '', score: 0, feedback: '', skipped: true,
      timeSpent: this.cardStartTime ? Date.now() - this.cardStartTime : 0
    };
    const idx = this.responses.findIndex(r => r.cardId === card.id);
    if (idx >= 0) this.responses[idx] = response;
    else this.responses.push(response);
    this.persistCurrentSession();
    this.nextCard();
  }

  showAnswer() {
    this.userAnswer = '(viewed answer)';
    this.judgeResult = { score: 0, feedback: 'You viewed the answer without attempting.' };
    this.saveResponse(0, '(viewed answer)', this.judgeResult.feedback);
  }

  nextCard() {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.resetCardState();
    } else {
      this.finishQuiz();
    }
  }

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      const prev = this.responses.find(r => r.cardId === this.currentCard.id);
      if (prev && !prev.skipped) {
        this.userAnswer = prev.userAnswer;
        this.judgeResult = { score: prev.score, feedback: prev.feedback };
      } else {
        this.resetCardState();
      }
    }
  }

  finishQuiz() {
    const session: QuizSession = {
      id: this.sessionId,
      mode: this.quizMode,
      startTime: this.startTime!,
      endTime: Date.now(),
      totalCards: this.cards.length,
      cardIds: this.cards.map(c => c.id),
      responses: this.responses
    };
    this.sessions = [session, ...this.sessions.filter(s => s.id !== session.id)];
    saveSessions(this.sessions);
    clearCurrentSession();
    this.mode = 'analysis';
  }

  persistCurrentSession() {
    const session: QuizSession = {
      id: this.sessionId,
      mode: this.quizMode,
      startTime: this.startTime!,
      endTime: null,
      totalCards: this.cards.length,
      cardIds: this.cards.map(c => c.id),
      responses: this.responses
    };
    saveCurrentSession(session);
  }

  goToMenu() {
    this.mode = 'menu';
  }

  goToHistory() {
    this.mode = 'history';
  }

  viewSession(sessionId: string) {
    this.viewingSession = this.sessions.find(s => s.id === sessionId) || null;
    this.mode = 'session-detail';
  }

  deleteSession(sessionId: string) {
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    saveSessions(this.sessions);
    this.mode = 'history';
    this.viewingSession = null;
  }

  clearHistory() {
    this.sessions = [];
    saveSessions([]);
  }

  dismissResume() {
    this.pendingResume = null;
    clearCurrentSession();
  }
}

export const quizStore = new QuizStore();
export { flashcards, categories };

