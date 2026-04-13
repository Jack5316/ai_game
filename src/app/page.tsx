'use client';

import React, { useState } from 'react';
import { Sparkles, BookOpen, Heart, Lightbulb, ArrowRight, Layers, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="min-h-screen hex-pattern flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-[var(--alchemy-accent)]/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--alchemy-accent)] to-[var(--alchemy-accent-dark)] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[var(--alchemy-bg)]" />
              </div>
              <div>
                <h1 className="text-xl font-serif text-[var(--alchemy-accent)]">思维炼金术</h1>
                <p className="text-xs text-[var(--alchemy-text-secondary)]">文字推理游戏</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Hero Card */}
          <div className="alchemy-border p-8 text-center mb-8 animate-scale-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--alchemy-accent)]/20 to-[var(--alchemy-accent-dark)]/20 flex items-center justify-center animate-float">
              <Sparkles className="w-10 h-10 text-[var(--alchemy-accent)]" />
            </div>
            
            <h2 className="text-3xl font-serif text-[var(--alchemy-accent)] mb-4 gradient-text">
              思维炼金术
            </h2>
            <p className="text-[var(--alchemy-text)] mb-8 leading-relaxed">
              在神秘的故事碎片中收集关键词，通过两词组合解锁真相。每一次炼金都是一次推理的冒险。
            </p>

            <Link
              href="/game"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--alchemy-accent)] to-[var(--alchemy-accent-dark)] text-[var(--alchemy-bg)] font-serif text-lg hover:shadow-[0_0_30px_rgba(212,165,116,0.4)] hover:-translate-y-1 transition-all duration-300"
            >
              开始游戏
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Rules Preview */}
          <div className="alchemy-border p-6">
            <button
              onClick={() => setShowRules(!showRules)}
              className="w-full flex items-center justify-between text-[var(--alchemy-accent)] mb-4"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span className="font-serif">游戏规则</span>
              </div>
              <span className={`transition-transform ${showRules ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showRules && (
              <div className="space-y-6 animate-slide-up">
                <RuleSection
                  icon={<Sparkles className="w-5 h-5" />}
                  title="收集关键词"
                  description="阅读故事，点击高亮的词汇（琥珀色下划线）将其收集到词库中。"
                />
                <RuleSection
                  icon={<Layers className="w-5 h-5" />}
                  title="两词组合"
                  description="从词库中选择两个关键词，点击「炼金」按钮进行组合尝试。正确的组合会推进剧情。"
                />
                <RuleSection
                  icon={<RotateCcw className="w-5 h-5" />}
                  title="分阶段解锁"
                  description="每个谜题分为多个阶段（Opening → 收束 → 真相）。必须按顺序完成当前阶段，才能触发下一阶段的组合。"
                />
                <RuleSection
                  icon={<Heart className="w-5 h-5" />}
                  title="耐心消耗"
                  description="错误的组合会消耗一点耐心（3次机会）。用完则挑战失败，需要重新开始。"
                />
                <RuleSection
                  icon={<Lightbulb className="w-5 h-5" />}
                  title="使用提示"
                  description="遇到困难时可以消耗提示次数（3次）获得引导。提示会根据当前进度给出不同的指引。"
                />
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--alchemy-text-secondary)]">
              共 4 个风格各异的谜题等待挑战
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--alchemy-accent)]/10 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-[var(--alchemy-text-secondary)]">
            点击高亮词收集 · 选两词组合炼金 · 解开真相
          </p>
        </div>
      </footer>
    </div>
  );
}

function RuleSection({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--alchemy-accent)]/10 flex items-center justify-center text-[var(--alchemy-accent)]">
        {icon}
      </div>
      <div>
        <h3 className="font-serif text-[var(--alchemy-text)] mb-1">{title}</h3>
        <p className="text-sm text-[var(--alchemy-text-secondary)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
