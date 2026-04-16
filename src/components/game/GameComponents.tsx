'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { levels } from '@/data/levels';

// Story Card - Linear Style
export function StoryCard() {
  const { state, currentLevel, dispatch } = useGame();
  const [displayedStory, setDisplayedStory] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!currentLevel) return;
    setDisplayedStory('');
    setIsAnimating(true);
    
    let index = 0;
    const story = currentLevel.story;
    const timer = setInterval(() => {
      if (index < story.length) {
        setDisplayedStory(story.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsAnimating(false);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [currentLevel]);

  if (!currentLevel) return null;

  const handleWordClick = (word: string) => {
    if (state.collectedWords.includes(word) || state.isComplete || state.isFailed) return;
    dispatch({ type: 'COLLECT_WORD', word });
  };

  const renderStory = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /<<([^>]+)>>/g;
    let match;

    while ((match = regex.exec(currentLevel.story)) !== null) {
      const word = match[1];
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;

      if (startIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="text-zinc-400 leading-7">
            {displayedStory.slice(lastIndex, startIndex)}
          </span>
        );
      }

      const isCollected = state.collectedWords.includes(word);
      const isAnimatingWord = isAnimating && displayedStory.indexOf(word) <= startIndex;
      
      parts.push(
        <span
          key={`word-${word}-${startIndex}`}
          onClick={() => handleWordClick(word)}
          className={`
            ${isCollected ? 'collected' : 'collectible-word'}
            ${isAnimatingWord ? 'opacity-0' : 'opacity-100'}
            transition-all duration-200
          `}
        >
          {word}
        </span>
      );

      lastIndex = endIndex;
    }

    if (lastIndex < displayedStory.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="text-zinc-400 leading-7">
          {displayedStory.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className="linear-card p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{currentLevel.title}</h2>
        </div>
        <span className="text-xs text-[var(--text-tertiary)]">{currentLevel.description}</span>
      </div>
      <div className="text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap font-medium">
        {renderStory()}
      </div>
      {!state.collectedWords.length && !isAnimating && (
        <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">
          点击高亮词收集线索
        </p>
      )}
    </div>
  );
}

// Word Library - Linear Style
export function WordLibrary() {
  const { state, dispatch } = useGame();

  const handleToggleWord = (word: string) => {
    if (state.isComplete || state.isFailed) return;
    dispatch({ type: 'TOGGLE_WORD_SELECTION', word });
  };

  const isWordSelected = (word: string) => {
    return state.selectedWords[0] === word || state.selectedWords[1] === word;
  };

  return (
    <div className="linear-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">词库</h3>
        <span className="text-xs text-[var(--text-muted)]">{state.collectedWords.length}</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {state.collectedWords.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] py-2">收集关键词开始推理</p>
        ) : (
          state.collectedWords.map((word) => (
            <button
              key={word}
              onClick={() => handleToggleWord(word)}
              disabled={state.isComplete || state.isFailed}
              className={`word-chip ${isWordSelected(word) ? 'selected' : ''}`}
            >
              {word}
            </button>
          ))
        )}
      </div>

      {state.unlockedWords.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--success)] mb-2">+ 新解锁</p>
          <div className="flex flex-wrap gap-2">
            {state.unlockedWords.map((word) => (
              <span key={word} className="word-chip border-[var(--success)] text-[var(--success)]">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Combination Area - Linear Style
export function CombinationArea() {
  const { state, dispatch } = useGame();
  const [wordA, wordB] = state.selectedWords;
  const canCombine = wordA !== null && wordB !== null;

  const handleCombine = () => {
    if (!canCombine || state.isComplete || state.isFailed) return;
    dispatch({ type: 'ATTEMPT_COMBINATION' });
  };

  return (
    <div className="linear-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">组合</h3>
      </div>

      <div className={`
        min-h-[48px] rounded-md border flex items-center justify-center gap-3 p-3
        transition-all duration-200
        ${canCombine 
          ? 'border-[var(--accent)] bg-[rgba(94,106,210,0.08)]' 
          : 'border-[var(--border)] bg-[var(--bg-primary)]'
        }
      `}>
        {canCombine ? (
          <>
            <span className="px-3 py-1 rounded text-xs font-mono font-medium bg-[var(--accent)] text-white">
              {wordA}
            </span>
            <span className="text-[var(--accent)] font-bold">+</span>
            <span className="px-3 py-1 rounded text-xs font-mono font-medium bg-[var(--accent)] text-white">
              {wordB}
            </span>
          </>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">选择两个词组合</span>
        )}
      </div>

      <button
        onClick={handleCombine}
        disabled={!canCombine || state.isComplete || state.isFailed}
        className={`
          w-full mt-3 py-2.5 px-4 rounded-md text-sm font-medium
          transition-all duration-200 flex items-center justify-center gap-2
          ${canCombine && !state.isComplete && !state.isFailed
            ? 'linear-btn-primary'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'
          }
        `}
      >
        <Sparkles className="w-4 h-4" />
        炼金
      </button>
    </div>
  );
}

// Phase Indicator - Linear Style
export function PhaseIndicator() {
  const { state, currentLevel } = useGame();

  if (!currentLevel) return null;

  const totalPhases = currentLevel.phases.length;
  const phaseLabels = ['Opening', '收束', '真相'];

  return (
    <div className="linear-card p-4">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalPhases }).map((_, index) => {
          const isComplete = index < state.currentPhase || state.isComplete;
          const isCurrent = index === state.currentPhase && !state.isComplete;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`
                    phase-node
                    ${isComplete ? 'complete' : isCurrent ? 'current' : 'incomplete'}
                  `}
                >
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`
                  text-[10px] font-medium
                  ${isComplete ? 'text-[var(--success)]' : isCurrent ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}
                `}>
                  {phaseLabels[index]}
                </span>
              </div>
              {index < totalPhases - 1 && (
                <div
                  className={`
                    flex-1 h-[2px] mx-3 rounded-full transition-all duration-500
                    ${index < state.currentPhase || state.isComplete
                      ? 'bg-[var(--accent)]'
                      : 'bg-[var(--border)]'
                    }
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Resource Display - Linear Style
export function ResourceDisplay() {
  const { state, dispatch, getHintText } = useGame();
  const [showHint, setShowHint] = useState(false);

  const handleUseHint = () => {
    if (state.hints <= 0 || state.isComplete || state.isFailed) return;
    dispatch({ type: 'USE_HINT' });
    setShowHint(true);
  };

  const canShowHint = state.hints > 0 && !state.isComplete && !state.isFailed;

  return (
    <div className="linear-card p-4">
      <div className="flex items-center gap-6">
        {/* Mistakes */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase">耐心</span>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`resource-dot ${index < state.mistakes ? 'active' : 'inactive'}`}
              />
            ))}
          </div>
        </div>

        {/* Hints */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase">提示</span>
          <button
            onClick={handleUseHint}
            disabled={!canShowHint}
            className="flex gap-1"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-sm transition-all ${
                  index < state.hints
                    ? 'bg-[var(--warning)]'
                    : 'bg-[var(--border)]'
                }`}
              />
            ))}
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={() => dispatch({ type: 'RESET_LEVEL' })}
          className="ml-auto p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
          title="重新开始"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {showHint && canShowHint && (
        <div className="mt-3 p-3 rounded-md bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] animate-slide-up">
          <p className="text-xs text-[var(--warning)] leading-relaxed">{getHintText()}</p>
          <button
            onClick={() => setShowHint(false)}
            className="mt-2 text-[10px] text-[var(--text-tertiary)] hover:text-[var(--warning)]"
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}

// Feedback Display - Linear Style
export function FeedbackDisplay() {
  const { state } = useGame();

  if (!state.lastFeedback) return null;

  return (
    <div
      className={`
        mt-4 p-4 rounded-md border animate-slide-up
        ${state.feedbackType === 'success'
          ? 'toast-success'
          : state.feedbackType === 'error'
            ? 'toast-error animate-shake'
            : 'toast-info'
        }
      `}
    >
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {state.lastFeedback}
      </p>
    </div>
  );
}

// Game Over Modal - Linear Style
export function GameOverModal() {
  const { state, currentLevel, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state.isComplete || state.isFailed) {
      setIsOpen(true);
    }
  }, [state.isComplete, state.isFailed]);

  if (!isOpen) return null;

  const handleClose = () => setIsOpen(false);
  const handleRestart = () => {
    dispatch({ type: 'RESET_LEVEL' });
    setIsOpen(false);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={handleClose}>
      <div 
        className="modal-content animate-scale-in" 
        onClick={e => e.stopPropagation()}
      >
        <div className={`
          w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center
          ${state.isComplete ? 'bg-[rgba(34,197,94,0.15)]' : 'bg-[rgba(239,68,68,0.15)]'}
        `}>
          {state.isComplete ? (
            <Sparkles className="w-6 h-6 text-[var(--success)]" />
          ) : (
            <svg className="w-6 h-6 text-[var(--destructive)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </div>

        <h2 className={`text-lg font-semibold text-center mb-2 ${
          state.isComplete ? 'text-[var(--success)]' : 'text-[var(--destructive)]'
        }`}>
          {state.isComplete ? '真相揭示' : '耐心耗尽'}
        </h2>

        <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
          {state.isComplete
            ? `你已解开 "${currentLevel?.title}" 的谜题`
            : '你的耐心已经耗尽'}
        </p>

        <div className="flex gap-3">
          <button onClick={handleRestart} className="linear-btn linear-btn-primary flex-1">
            重新挑战
          </button>
          <button onClick={handleClose} className="linear-btn linear-btn-secondary flex-1">
            继续探索
          </button>
        </div>
      </div>
    </div>
  );
}

// Level Tabs - Linear Style
export function LevelTabs() {
  const { state, dispatch } = useGame();

  return (
    <div className="flex gap-2 flex-wrap">
      {levels.map((level) => {
        const isActive = level.id === state.currentLevelId;
        const isCompleted = state.isComplete && level.id === state.currentLevelId;

        return (
          <button
            key={level.id}
            onClick={() => dispatch({ type: 'SELECT_LEVEL', levelId: level.id })}
            className={`level-tab ${isActive ? 'active' : 'inactive'} ${isCompleted ? 'completed' : ''}`}
          >
            {level.title}
          </button>
        );
      })}
    </div>
  );
}
