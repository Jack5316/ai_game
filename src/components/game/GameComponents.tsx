'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { levels } from '@/data/levels';

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
    }, 20);

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
          <span key={`text-${lastIndex}`} className="text-foreground/90 leading-relaxed">
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
            transition-all duration-300
            mx-0.5
          `}
        >
          {word}
        </span>
      );

      lastIndex = endIndex;
    }

    if (lastIndex < displayedStory.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="text-foreground/90 leading-relaxed">
          {displayedStory.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className="alchemy-border p-6 min-h-[300px] max-h-[400px] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--alchemy-accent)]/20">
        <Sparkles className="w-5 h-5 text-[var(--alchemy-accent)]" />
        <h2 className="font-serif text-lg text-[var(--alchemy-accent)]">{currentLevel.title}</h2>
        <span className="ml-auto text-xs text-[var(--alchemy-text-secondary)]">
          {currentLevel.description}
        </span>
      </div>
      <div className="prose prose-invert prose-lg max-w-none font-serif leading-loose">
        <p className="text-[var(--alchemy-text)] whitespace-pre-wrap">{renderStory()}</p>
      </div>
      {!state.collectedWords.length && !isAnimating && (
        <p className="mt-4 text-center text-[var(--alchemy-text-secondary)] text-sm animate-pulse">
          点击高亮词汇开始收集线索...
        </p>
      )}
    </div>
  );
}

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
    <div className="alchemy-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-serif text-[var(--alchemy-accent)]">关键词库</h3>
        <span className="ml-auto text-xs text-[var(--alchemy-text-secondary)]">
          {state.collectedWords.length} 个已收集
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2 min-h-[60px]">
        {state.collectedWords.length === 0 ? (
          <p className="text-[var(--alchemy-text-secondary)] text-sm w-full text-center py-4">
            收集关键词开始推理
          </p>
        ) : (
          state.collectedWords.map((word) => (
            <button
              key={word}
              onClick={() => handleToggleWord(word)}
              disabled={state.isComplete || state.isFailed}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-mono
                border transition-all duration-200
                ${isWordSelected(word)
                  ? 'bg-[var(--alchemy-accent)] text-[var(--alchemy-bg)] border-[var(--alchemy-accent)] shadow-[0_0_15px_rgba(212,165,116,0.5)]'
                  : 'bg-transparent text-[var(--alchemy-text)] border-[var(--alchemy-accent)]/40 hover:border-[var(--alchemy-accent)] hover:bg-[var(--alchemy-accent)]/10'
                }
                ${state.isComplete || state.isFailed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {word}
            </button>
          ))
        )}
      </div>

      {state.unlockedWords.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--alchemy-accent)]/20">
          <p className="text-xs text-[var(--alchemy-success)] mb-2">新解锁：</p>
          <div className="flex flex-wrap gap-2">
            {state.unlockedWords.map((word) => (
              <span
                key={word}
                className="px-3 py-1 rounded-lg text-sm font-mono bg-[var(--alchemy-success)]/20 text-[var(--alchemy-success)] border border-[var(--alchemy-success)]/40 animate-scale-in"
              >
                + {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CombinationArea() {
  const { state, dispatch } = useGame();
  const [wordA, wordB] = state.selectedWords;
  const canCombine = wordA !== null && wordB !== null;

  const handleCombine = () => {
    if (!canCombine || state.isComplete || state.isFailed) return;
    dispatch({ type: 'ATTEMPT_COMBINATION' });
  };

  return (
    <div className="alchemy-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-serif text-[var(--alchemy-accent)]">炼金组合</h3>
      </div>

      <div className={`
        min-h-[60px] rounded-lg border-2 border-dashed flex items-center justify-center gap-3 p-4
        transition-all duration-300
        ${canCombine 
          ? 'border-[var(--alchemy-accent)] bg-[var(--alchemy-accent)]/10' 
          : 'border-[var(--alchemy-accent)]/30 bg-transparent'
        }
      `}>
        {canCombine ? (
          <>
            <span className="px-3 py-1.5 rounded-lg bg-[var(--alchemy-accent)] text-[var(--alchemy-bg)] font-mono text-sm animate-scale-in">
              {wordA}
            </span>
            <span className="text-[var(--alchemy-accent)] text-xl font-bold">+</span>
            <span className="px-3 py-1.5 rounded-lg bg-[var(--alchemy-accent)] text-[var(--alchemy-bg)] font-mono text-sm animate-scale-in">
              {wordB}
            </span>
          </>
        ) : (
          <span className="text-[var(--alchemy-text-secondary)] text-sm">
            选择两个词进行炼金
          </span>
        )}
      </div>

      <button
        onClick={handleCombine}
        disabled={!canCombine || state.isComplete || state.isFailed}
        className={`
          w-full mt-4 py-3 px-6 rounded-lg font-serif text-base
          transition-all duration-300 flex items-center justify-center gap-2
          ${canCombine && !state.isComplete && !state.isFailed
            ? 'bg-gradient-to-r from-[var(--alchemy-accent)] to-[var(--alchemy-accent-dark)] text-[var(--alchemy-bg)] hover:shadow-[0_0_20px_rgba(212,165,116,0.4)] hover:-translate-y-0.5 active:translate-y-0'
            : 'bg-[var(--alchemy-bg)] text-[var(--alchemy-text-secondary)] cursor-not-allowed'
          }
        `}
      >
        <Sparkles className="w-5 h-5" />
        炼 金
      </button>
    </div>
  );
}

export function PhaseIndicator() {
  const { state, currentLevel } = useGame();

  if (!currentLevel) return null;

  const totalPhases = currentLevel.phases.length;

  return (
    <div className="alchemy-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-serif text-[var(--alchemy-accent)]">推理阶段</h3>
      </div>

      <div className="flex items-center justify-between">
        {Array.from({ length: totalPhases }).map((_, index) => {
          const isComplete = index < state.currentPhase || state.isComplete;
          const isCurrent = index === state.currentPhase && !state.isComplete;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all duration-500
                    ${isComplete
                      ? 'bg-[var(--alchemy-accent)] border-[var(--alchemy-accent)] text-[var(--alchemy-bg)]'
                      : isCurrent
                        ? 'border-[var(--alchemy-accent)] bg-transparent text-[var(--alchemy-accent)] animate-pulse-glow'
                        : 'border-[var(--alchemy-text-secondary)]/30 bg-transparent text-[var(--alchemy-text-secondary)]/30'
                    }
                  `}
                >
                  {isComplete ? '✓' : index + 1}
                </div>
                <span className={`
                  mt-2 text-xs
                  ${isComplete ? 'text-[var(--alchemy-accent)]' : 'text-[var(--alchemy-text-secondary)]'}
                `}>
                  {index === 0 ? 'Opening' : index === totalPhases - 1 ? '真相' : '收束'}
                </span>
              </div>
              {index < totalPhases - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 transition-all duration-500
                    ${index < state.currentPhase || state.isComplete
                      ? 'bg-[var(--alchemy-accent)]'
                      : 'bg-[var(--alchemy-text-secondary)]/30'
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
    <div className="alchemy-border p-4">
      <div className="flex items-center gap-4">
        {/* Mistakes / Hearts */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--alchemy-text-secondary)] text-sm">耐心:</span>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <svg
                key={index}
                className={`w-6 h-6 transition-all duration-300 ${
                  index < state.mistakes
                    ? 'text-[var(--alchemy-error)] fill-current'
                    : 'text-[var(--alchemy-text-secondary)]/30'
                }`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Hints / Candles */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--alchemy-text-secondary)] text-sm">提示:</span>
          <button
            onClick={handleUseHint}
            disabled={!canShowHint}
            className={`
              relative flex gap-0.5 transition-all duration-200
              ${canShowHint ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'}
            `}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <svg
                key={index}
                className={`w-5 h-6 transition-all duration-300 ${
                  index < state.hints
                    ? 'text-[var(--alchemy-warning)]'
                    : 'text-[var(--alchemy-text-secondary)]/30'
                }`}
                viewBox="0 0 24 32"
                fill="currentColor"
              >
                <rect x="9" y="18" width="6" height="14" rx="1" />
                <ellipse
                  cx="12"
                  cy="12"
                  rx="5"
                  ry="7"
                  className={index < state.hints ? 'fill-current' : 'opacity-30'}
                />
                {index < state.hints && (
                  <ellipse cx="12" cy="6" rx="2" ry="4" className="fill-[var(--alchemy-accent)]/60 animate-pulse" />
                )}
              </svg>
            ))}
          </button>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => dispatch({ type: 'RESET_LEVEL' })}
          className="ml-auto p-2 rounded-lg text-[var(--alchemy-text-secondary)] hover:text-[var(--alchemy-accent)] hover:bg-[var(--alchemy-accent)]/10 transition-all"
          title="重来"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Hint Display */}
      {showHint && canShowHint && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--alchemy-warning)]/10 border border-[var(--alchemy-warning)]/30 animate-slide-up">
          <p className="text-[var(--alchemy-warning)] text-sm">{getHintText()}</p>
          <button
            onClick={() => setShowHint(false)}
            className="mt-2 text-xs text-[var(--alchemy-text-secondary)] hover:text-[var(--alchemy-warning)]"
          >
            知道了
          </button>
        </div>
      )}
    </div>
  );
}

export function FeedbackDisplay() {
  const { state } = useGame();

  if (!state.lastFeedback) return null;

  return (
    <div
      className={`
        mt-4 p-4 rounded-lg border animate-slide-up
        ${state.feedbackType === 'success'
          ? 'bg-[var(--alchemy-success)]/10 border-[var(--alchemy-success)]/50'
          : state.feedbackType === 'error'
            ? 'bg-[var(--alchemy-error)]/10 border-[var(--alchemy-error)]/50 animate-shake'
            : 'bg-[var(--alchemy-accent)]/10 border-[var(--alchemy-accent)]/50'
        }
      `}
    >
      <p className={`
        whitespace-pre-wrap leading-relaxed
        ${state.feedbackType === 'success' ? 'text-[var(--alchemy-success)]' : ''}
        ${state.feedbackType === 'error' ? 'text-[var(--alchemy-error)]' : ''}
      `}>
        {state.lastFeedback}
      </p>
    </div>
  );
}

export function GameOverModal() {
  const { state, currentLevel, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state.isComplete || state.isFailed) {
      setIsOpen(true);
    }
  }, [state.isComplete, state.isFailed]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET_LEVEL' });
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-scale-in">
      <div className={`
        max-w-md w-full rounded-2xl p-8 text-center animate-slide-up
        ${state.isComplete
          ? 'bg-gradient-to-b from-[var(--alchemy-accent)]/20 to-[var(--alchemy-bg-secondary)] border-2 border-[var(--alchemy-accent)]'
          : 'bg-gradient-to-b from-[var(--alchemy-error)]/20 to-[var(--alchemy-bg-secondary)] border-2 border-[var(--alchemy-error)]'
        }
      `}>
        <div className={`
          w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
          ${state.isComplete
            ? 'bg-[var(--alchemy-accent)]/20 text-[var(--alchemy-accent)]'
            : 'bg-[var(--alchemy-error)]/20 text-[var(--alchemy-error)]'
          }
        `}>
          {state.isComplete ? (
            <Sparkles className="w-10 h-10" />
          ) : (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </div>

        <h2 className={`
          text-2xl font-serif mb-4
          ${state.isComplete ? 'text-[var(--alchemy-accent)]' : 'text-[var(--alchemy-error)]'}
        `}>
          {state.isComplete ? '真相揭示' : '耐心耗尽'}
        </h2>

        <p className="text-[var(--alchemy-text)] mb-2 font-serif leading-relaxed">
          {state.isComplete
            ? '你已经解开了"' + currentLevel?.title + '"的谜题！'
            : '很遗憾，你的耐心已经耗尽了...'}
        </p>

        <p className="text-[var(--alchemy-text-secondary)] text-sm mb-8">
          {state.isComplete
            ? '你的推理能力令人钦佩'
            : '也许下次会有不同的结果'}
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleRestart}
            className="flex-1 py-3 px-6 rounded-lg bg-[var(--alchemy-accent)] text-[var(--alchemy-bg)] font-serif hover:bg-[var(--alchemy-accent-dark)] transition-colors"
          >
            重新挑战
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-6 rounded-lg border border-[var(--alchemy-text-secondary)]/30 text-[var(--alchemy-text)] font-serif hover:bg-[var(--alchemy-text)]/10 transition-colors"
          >
            继续探索
          </button>
        </div>
      </div>
    </div>
  );
}

export function LevelTabs() {
  const { state, dispatch } = useGame();

  return (
    <div className="flex gap-2 flex-wrap">
      {levels.map((level: typeof levels[0]) => {
        const isActive = level.id === state.currentLevelId;
        const isCompleted = state.isComplete && level.id === state.currentLevelId;

        return (
          <button
            key={level.id}
            onClick={() => dispatch({ type: 'SELECT_LEVEL', levelId: level.id })}
            className={`
              px-4 py-2 rounded-lg text-sm font-serif transition-all duration-300
              relative overflow-hidden
              ${isActive
                ? 'bg-[var(--alchemy-accent)] text-[var(--alchemy-bg)] shadow-[0_0_15px_rgba(212,165,116,0.3)]'
                : 'bg-[var(--alchemy-bg-secondary)] text-[var(--alchemy-text)] border border-[var(--alchemy-accent)]/20 hover:border-[var(--alchemy-accent)]/50'
              }
            `}
          >
            {level.title}
            {isCompleted && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--alchemy-success)] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
