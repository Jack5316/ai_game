'use client';

import React from 'react';
import Link from 'next/link';
import { GameProvider } from '@/contexts/GameContext';
import {
  StoryCard,
  WordLibrary,
  CombinationArea,
  PhaseIndicator,
  ResourceDisplay,
  FeedbackDisplay,
  GameOverModal,
  LevelTabs,
} from '@/components/game/GameComponents';
import { BookOpen, Sparkles } from 'lucide-react';

function GameContent() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[var(--accent)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-[var(--text-primary)]">思维炼金术</h1>
                <p className="text-[10px] text-[var(--text-tertiary)]">两词组合，解锁真相</p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              规则
            </Link>
          </div>
          <LevelTabs />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr,340px] gap-5">
          {/* Left Column - Story */}
          <div className="space-y-4">
            <StoryCard />
            <FeedbackDisplay />
          </div>

          {/* Right Column - Game Controls */}
          <div className="space-y-4">
            <PhaseIndicator />
            <WordLibrary />
            <CombinationArea />
            <ResourceDisplay />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4 mt-5">
          <PhaseIndicator />
          <WordLibrary />
          <CombinationArea />
          <ResourceDisplay />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-4 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            收集关键词 · 两词组合 · 解开真相
          </p>
        </div>
      </footer>

      <GameOverModal />
    </div>
  );
}

export default function GamePage() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
