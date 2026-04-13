# 思维炼金术 - 项目规范

## 项目概览

- **项目名称**: 思维炼金术
- **项目类型**: 文字推理游戏（Next.js 16 App Router）
- **核心功能**: 玩家通过收集故事中的关键词，使用两词组合推进推理，分阶段解锁真相
- **访问地址**: http://localhost:5000

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + CSS Variables (炼金术主题)
- **State**: React Context + useReducer
- **UI**: Shadcn/ui 组件

## 目录结构

```
src/
├── app/
│   ├── globals.css           # 全局样式 + 炼金术主题变量
│   ├── layout.tsx            # 根布局
│   ├── page.tsx              # 首页（规则说明）
│   └── game/
│       └── page.tsx         # 游戏主页面
├── components/
│   ├── game/
│   │   └── GameComponents.tsx  # 所有游戏组件
│   └── ui/                  # Shadcn UI 组件库
├── contexts/
│   └── GameContext.tsx       # 游戏状态管理
├── data/
│   └── levels.ts            # 关卡数据
├── types/
│   └── game.ts             # TypeScript 类型定义
└── lib/
    └── utils.ts             # 通用工具函数
```

## 开发命令

```bash
pnpm install      # 安装依赖
pnpm dev          # 启动开发服务器 (端口 5000)
pnpm build        # 构建生产版本
pnpm lint         # ESLint 检查
pnpm ts-check     # TypeScript 类型检查
```

## 核心玩法

### 关键词收集
- 故事文本中以 `<<词>>` 标记的词汇为可收集词
- 点击高亮词汇（琥珀色下划线）收集到词库
- 已收集词在原位变暗

### 两词组合
- 从词库选择两个词，点击"炼金"按钮尝试组合
- 正确的组合推进阶段并显示反馈
- 错误的组合消耗耐心（3次机会）

### 分阶段解锁
- 每关3阶段：Opening → 收束 → 真相
- 必须在当前阶段成功组合后，才能触发下一阶段
- 完成第3阶段显示"真相揭示"

### 资源系统
- **耐心**: 3次，错误组合消耗，归零则失败
- **提示**: 3次，显示当前进度指引

## 组件清单

| 组件 | 功能 |
|------|------|
| StoryCard | 故事文本展示，支持打字机效果 |
| WordLibrary | 收集的词库，支持词的选择 |
| CombinationArea | 组合区域，显示已选词 + 炼金按钮 |
| PhaseIndicator | 阶段进度指示器 |
| ResourceDisplay | 耐心/提示资源显示 |
| FeedbackDisplay | 组合结果反馈 |
| GameOverModal | 终局弹窗（胜利/失败） |
| LevelTabs | 关卡切换标签 |

## 数据格式

```typescript
interface Level {
  id: string;
  title: string;
  description: string;
  story: string; // 含 <<word>> 标记
  initialWords: string[];
  phases: Phase[];
}

interface Phase {
  combinations: [string, string][]; // 可成功的组合
  feedback: string;
  unlockWords?: string[];
}
```

## 设计主题

- **配色**: 深墨绿 + 琥珀金 + 羊皮纸白
- **风格**: 炼金术士书房，神秘但温暖
- **动效**: 脉冲光晕、打字机、滑入动画
- **字体**: Serif 系列衬线体

## 注意事项

1. 所有交互目标需足够大（移动端友好）
2. 规则说明页可折叠展开
3. 切换关卡保持进度独立
4. 胜利后显示金色终局弹窗
5. 失败后显示暗红色弹窗 + 重来选项
