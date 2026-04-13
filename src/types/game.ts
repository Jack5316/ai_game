export interface Phase {
  combinations: [string, string][];
  feedback: string;
  unlockWords?: string[];
}

export interface Level {
  id: string;
  title: string;
  description: string;
  story: string;
  initialWords: string[];
  phases: Phase[];
}

export interface GameState {
  currentLevelId: string;
  collectedWords: string[];
  selectedWords: [string | null, string | null];
  currentPhase: number;
  mistakes: number;
  hints: number;
  isComplete: boolean;
  isFailed: boolean;
  lastFeedback: string | null;
  feedbackType: 'success' | 'error' | 'info' | null;
  unlockedWords: string[];
}

export type GameAction =
  | { type: 'SELECT_LEVEL'; levelId: string }
  | { type: 'COLLECT_WORD'; word: string }
  | { type: 'TOGGLE_WORD_SELECTION'; word: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ATTEMPT_COMBINATION' }
  | { type: 'USE_HINT' }
  | { type: 'RESET_LEVEL' };
