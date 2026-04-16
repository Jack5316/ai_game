'use client';

import React, { useState } from 'react';
import { Sparkles, BookOpen, Heart, Lightbulb, ArrowRight, Layers, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[var(--accent)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-[var(--text-primary)]">思维炼金术</h1>
                <p className="text-[10px] text-[var(--text-tertiary)]">文字推理游戏</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Hero Card */}
          <div className="linear-card p-8 text-center mb-6 animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-[rgba(94,106,210,0.15)] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[var(--accent)]" />
            </div>
            
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
              思维炼金术
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
              在神秘的故事碎片中收集关键词，通过两词组合解锁真相。
            </p>

            <Link
              href="/game"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-all"
            >
              开始游戏
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Rules Preview */}
          <div className="linear-card p-5">
            <button
              onClick={() => setShowRules(!showRules)}
              className="w-full flex items-center justify-between text-[var(--text-primary)] mb-0"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span className="text-sm font-medium">游戏规则</span>
              </div>
              <span className={`text-[var(--text-tertiary)] text-xs transition-transform ${showRules ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showRules && (
              <div className="space-y-4 mt-4 pt-4 border-t border-[var(--border)] animate-slide-up">
                <RuleSection
                  icon={<Sparkles className="w-4 h-4" />}
                  title="收集关键词"
                  description="点击故事中高亮词（紫色标记）收集到词库中。"
                />
                <RuleSection
                  icon={<Layers className="w-4 h-4" />}
                  title="两词组合"
                  description="从词库中选择两个词，点击「炼金」按钮进行组合。"
                />
                <RuleSection
                  icon={<RotateCcw className="w-4 h-4" />}
                  title="分阶段解锁"
                  description="必须按顺序完成当前阶段，才能触发下一阶段。"
                />
                <RuleSection
                  icon={<Heart className="w-4 h-4" />}
                  title="耐心消耗"
                  description="错误的组合会消耗一点耐心（3次机会）。"
                />
                <RuleSection
                  icon={<Lightbulb className="w-4 h-4" />}
                  title="使用提示"
                  description="遇到困难时可以消耗提示次数（3次）获得引导。"
                />
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-4 text-center">
            <p className="text-xs text-[var(--text-tertiary)]">
              共 4 个风格各异的谜题等待挑战
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-4">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            收集关键词 · 两词组合 · 解开真相
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
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)]">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-0.5">{title}</h3>
        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
