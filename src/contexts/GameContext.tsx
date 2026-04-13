'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { GameState, GameAction, Phase } from '@/types/game';
import { levels, getLevelById, INITIAL_MISTAKES, INITIAL_HINTS } from '@/data/levels';

interface GameContextType {
  state: GameState;
  currentLevel: ReturnType<typeof getLevelById>;
  dispatch: React.Dispatch<GameAction>;
  getHintText: () => string;
  getPhaseProgress: () => number;
}

const GameContext = createContext<GameContextType | null>(null);

function createInitialState(levelId: string = levels[0].id): GameState {
  const level = getLevelById(levelId);
  return {
    currentLevelId: levelId,
    collectedWords: level ? [...level.initialWords] : [],
    selectedWords: [null, null],
    currentPhase: 0,
    mistakes: INITIAL_MISTAKES,
    hints: INITIAL_HINTS,
    isComplete: false,
    isFailed: false,
    lastFeedback: null,
    feedbackType: null,
    unlockedWords: [],
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  const level = getLevelById(state.currentLevelId);
  if (!level) return state;

  switch (action.type) {
    case 'SELECT_LEVEL': {
      const newLevel = getLevelById(action.levelId);
      if (!newLevel) return state;
      return {
        ...createInitialState(action.levelId),
        currentLevelId: action.levelId,
      };
    }

    case 'COLLECT_WORD': {
      if (state.collectedWords.includes(action.word)) return state;
      return {
        ...state,
        collectedWords: [...state.collectedWords, action.word],
      };
    }

    case 'TOGGLE_WORD_SELECTION': {
      const word = action.word;
      const [first, second] = state.selectedWords;

      if (first === word) {
        return {
          ...state,
          selectedWords: [null, second],
        };
      }
      if (second === word) {
        return {
          ...state,
          selectedWords: [first, null],
        };
      }

      if (first === null) {
        return {
          ...state,
          selectedWords: [word, second],
        };
      }
      if (second === null) {
        return {
          ...state,
          selectedWords: [first, word],
        };
      }

      return state;
    }

    case 'CLEAR_SELECTION': {
      return {
        ...state,
        selectedWords: [null, null],
      };
    }

    case 'ATTEMPT_COMBINATION': {
      const [wordA, wordB] = state.selectedWords;
      if (!wordA || !wordB || state.isComplete || state.isFailed) return state;

      const currentPhaseData: Phase | undefined = level.phases[state.currentPhase];
      if (!currentPhaseData) return state;

      const selectedPair = [wordA, wordB].sort() as [string, string];
      const isValidCombination = currentPhaseData.combinations.some(
        (combo) => [...combo].sort()[0] === selectedPair[0] && [...combo].sort()[1] === selectedPair[1]
      );

      if (isValidCombination) {
        const newPhase = state.currentPhase + 1;
        const isComplete = newPhase >= level.phases.length;
        const newUnlockedWords = currentPhaseData.unlockWords || [];
        
        return {
          ...state,
          currentPhase: isComplete ? state.currentPhase : newPhase,
          isComplete,
          selectedWords: [null, null],
          lastFeedback: currentPhaseData.feedback,
          feedbackType: 'success',
          unlockedWords: [...state.unlockedWords, ...newUnlockedWords.filter(w => !state.unlockedWords.includes(w))],
          collectedWords: state.collectedWords.includes(wordA) 
            ? state.collectedWords 
            : [...state.collectedWords, wordA],
        };
      }

      const isEarlyCombination = level.phases.some((phase, idx) => {
        if (idx <= state.currentPhase) return false;
        return phase.combinations.some(
          (combo) => {
            const comboSorted = [...combo].sort();
            return comboSorted[0] === selectedPair[0] && comboSorted[1] === selectedPair[1];
          }
        );
      });

      const newMistakes = state.mistakes - 1;
      const isFailed = newMistakes <= 0;

      return {
        ...state,
        mistakes: newMistakes,
        isFailed,
        selectedWords: [null, null],
        lastFeedback: isEarlyCombination 
          ? '时机未到...这对词还需要更多线索才能触发共鸣。' 
          : '这对词无法产生共鸣。也许它们之间没有隐藏的联系。',
        feedbackType: 'error',
      };
    }

    case 'USE_HINT': {
      if (state.hints <= 0 || state.isComplete || state.isFailed) return state;
      return {
        ...state,
        hints: state.hints - 1,
      };
    }

    case 'RESET_LEVEL': {
      return createInitialState(state.currentLevelId);
    }

    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, levels[0].id, createInitialState);
  const currentLevel = useMemo(() => getLevelById(state.currentLevelId), [state.currentLevelId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alchemy-game-state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.currentLevelId) {
            dispatch({ type: 'SELECT_LEVEL', levelId: parsed.currentLevelId });
          }
        } catch {
          console.warn('Failed to load saved state');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alchemy-game-state', JSON.stringify({
        currentLevelId: state.currentLevelId,
      }));
    }
  }, [state.currentLevelId]);

  const getHintText = useCallback((): string => {
    if (!currentLevel) return '';
    const { currentPhase, collectedWords } = state;

    if (currentPhase === 0) {
      const initialWords = currentLevel.initialWords.filter(w => !collectedWords.includes(w));
      if (initialWords.length > 0) {
        return `提示：仔细阅读故事，收集关键词。试试找找"${initialWords[0]}"...`;
      }
      return '提示：收集关键词后，尝试不同的两词组合。';
    }

    if (currentPhase < currentLevel.phases.length) {
      const currentCombo = currentLevel.phases[currentPhase].combinations[0];
      const hintWords = currentCombo.filter(w => !collectedWords.includes(w));
      if (hintWords.length > 0) {
        return `提示：下一阶段需要"${hintWords[0]}"，在故事中找找线索...`;
      }
      return `提示：试试将"${currentCombo[0]}"和"${currentCombo[1]}"组合...`;
    }

    return '你已经完成了所有阶段！';
  }, [currentLevel, state]);

  const getPhaseProgress = useCallback((): number => {
    if (!currentLevel) return 0;
    return ((state.currentPhase + (state.isComplete ? 1 : 0)) / currentLevel.phases.length) * 100;
  }, [currentLevel, state.currentPhase, state.isComplete]);

  const value = useMemo(
    () => ({ state, currentLevel, dispatch, getHintText, getPhaseProgress }),
    [state, currentLevel, getHintText, getPhaseProgress]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
