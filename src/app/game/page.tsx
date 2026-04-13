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
    <div className="min-h-screen hex-pattern">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-[var(--alchemy-accent)]/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--alchemy-accent)] to-[var(--alchemy-accent-dark)] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[var(--alchemy-bg)]" />
              </div>
              <div>
                <h1 className="text-xl font-serif text-[var(--alchemy-accent)]">思维炼金术</h1>
                <p className="text-xs text-[var(--alchemy-text-secondary)]">两词组合，解锁真相</p>
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-sm text-[var(--alchemy-text-secondary)] hover:text-[var(--alchemy-accent)] hover:bg-[var(--alchemy-accent)]/10 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              规则说明
            </Link>
          </div>
          <LevelTabs />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-6">
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
        <div className="lg:hidden space-y-4 mt-6">
          <PhaseIndicator />
          <WordLibrary />
          <CombinationArea />
          <ResourceDisplay />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--alchemy-accent)]/10 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-[var(--alchemy-text-secondary)]">
            收集关键词 · 两两组合 · 解开谜题真相
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
