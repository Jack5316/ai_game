import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '思维炼金术 | 文字推理游戏',
    template: '%s | 思维炼金术',
  },
  description:
    '在神秘的故事碎片中收集关键词，通过两词组合解锁真相。每一场炼金都是一次推理的冒险。',
  keywords: [
    '思维炼金术',
    '文字推理',
    '推理游戏',
    '文字游戏',
    '解谜游戏',
    '海龟汤',
  ],
  authors: [{ name: 'Alchemy Studio' }],
  generator: 'Coze Code',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
