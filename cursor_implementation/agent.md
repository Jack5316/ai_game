# Agent 规格：Thought Alchemy（思维炼金术 / ai_game）

本文档是从现有仓库 **逆向工程** 得到的「生成整套游戏」用说明：把一名 coding agent 当作实现者，按下列约束从零产出与本项目行为等价的静态站点（无构建步骤、纯 HTML/CSS/ESM）。

---

## 0. 你的角色与交付物

你是全栈前端实现代理。目标：交付一个可在任意静态托管（含 EdgeOne Pages）上运行的中文浏览器游戏，品牌名为 **Thought Alchemy**，中文可称 **思维炼金术**，副主题 **临时顾问 / 卷宗 / 海龟汤式推理**。

**必须产出的文件树：**

- `index.html` — 规则与协议页（可滚动）
- `game.html` — 主游戏页（固定视口高度、上下分栏）
- `css/style.css` — 唯一样式表（Solarized Dark 色系）
- `js/data.js` — 导出规则常量、`CASES` 关卡数据、`getRulesPageHtml`、`resolveHintForCase`
- `js/engine.js` — 游戏主循环与 DOM 绑定（`import` from `./data.js`）
- `js/rules-page.js` — 规则页注入（`import { getRulesPageHtml } from "./data.js"`）
- `README.md` — 本地预览 `python3 -m http.server`、部署说明（纯静态）

**技术约束：** ES modules、`lang="zh-CN"`、移动端 safe-area、触控友好（最小约 44px 点击目标）、无第三方依赖。

---

## 1. 玩法与叙事包装（产品真相）

这是一款 **多关卡、每关独立** 的「词汇收集 + 两两合成」推理小游戏，包装成 **卷宗听证 / 顾问推演**：

- 顶部用 **emoji** 切换多则互不相干的短案（默认 **6 则**）。
- 正文中可点击的 **青色词**（`span.clue` + `data-word`）点一次进入下方 **词库**（inventory）。
- 玩家在词库中 **依次点选两个词** 触发 **碰撞**；若该组合在数据里存在配方，则判定；否则视为 **无效碰撞**。
- **顺序解锁**：部分配方带 `requires`，必须先完成前置配方的 `id`，否则视为 **来得太早**，与无效碰撞一样 **扣理据**。
- **理据**：有上限（默认 5），每次无效碰撞或顺序错误扣 1；归零则 **出局**，展示 `GAME_RULES.gameOverText`，并进入终局 UI 状态。
- **锦囊**：每关独立计数（默认每关 3 次）；使用后递减；用尽则按钮禁用。**重来** 或 **切换故事** 重置本关进度与锦囊。
- **胜利**：某配方 `isWin: true` 时本关胜利，`body` 加 `game-won`，反馈区高亮胜利文案（含前缀 `【真相大白】` 的惯例）。

关卡内容包含：一则经典 **盲人悬崖** 海龟汤变体，以及科技、职场、脑洞、冷笑话、温情等 **小品风格** 案件（具体故事可由你创作，但必须遵守第 3 节数据契约与第 4 节关卡结构）。

---

## 2. 全局规则常量（`GAME_RULES`）

在 `js/data.js` 导出：

```js
export const GAME_RULES = {
  maxFaults: 5,       // 理据上限；每次失误扣 1
  maxHints: 3,        // 每关锦囊次数；重来/切关重置
  gameOverText: "…",  // 出局时长文本，语气：顾问出局、卷宗关闭、程序锁死（中文）
};
```

`DETECTIVE_BRIEFING`：多段 HTML 字符串，用于规则页 `getRulesPageHtml()` 内嵌，说明：多案并列、点 emoji 切换、青色词入库、两词碰撞、顺序解锁、失误扣理据、锦囊每关计数、重来补满锦囊等。**不要**在 `game.html` 重复维护同一段长文案（由 `data.js` 单一来源生成规则页）。

---

## 3. 数据模型（必须一致）

### 3.1 `Recipe`

| 字段 | 类型 | 含义 |
|------|------|------|
| `id` | string | 配方完成节点 id，用于链式 `requires` 与 `completedRecipeIds` |
| `text` | string | 碰撞成功后反馈区展示的 HTML |
| `newWord` | string? | 成功后加入词库的新词（胜利配方通常不加新词） |
| `isWin` | boolean? | 为 true 时本关胜利 |
| `requires` | string[]? | 前置 `Recipe.id` 列表，须全部已完成 |
| `lockedText` | string? | 顺序未到时反馈文案（替代默认「来得太早」） |

### 3.2 `GameCase`

| 字段 | 类型 | 含义 |
|------|------|------|
| `id` | string | 关卡 slug |
| `emoji` | string | 导航按钮展示 |
| `title` | string | 短标题 |
| `tone` | string | 题材标签（显示在 `case-title`） |
| `storyHtml` | string | 注入 `#story-board .story-board__inner` 的 HTML |
| `starters` | string[] | 三个初始可点词，必须与 `storyHtml` 里 `data-word` 一致 |
| `recipes` | Record<string, Recipe> | 键为 `"词A+词B"`（实现时须 **按词排序归一化**，见引擎） |
| `hints` | object | `collect`, `step1`, `step2`, `step3` 四个字符串 |

### 3.3 `storyHtml` 约定

- 使用 `<p>`；首行可用 `<p class="story-lead tone-…">` 作分类抬头。
- 可点击词：`<span class="clue" data-word="词">词</span>`。
- 需要等宽强调时用 `<strong class="mono">…</strong>`。

### 3.4 `recipes` 链式结构（每关统一三段解锁）

每关 **恰好三条有效配方**，且 `id` 与依赖关系固定为：

1. `step_fall` — 第一步合成，无 `requires`。
2. `step_count` — 第二步，`requires: ["step_fall"]`。
3. `step_truth` — 第三步，`requires: ["step_count"]`，且 `isWin: true`。

第一步、第二步配方应提供 `newWord`；第三步胜利配方不强制 `newWord`。  
`recipes` 的 **键** 在数据里可写任意 `A+B` 顺序；引擎用 **localeCompare('zh-CN') 排序** 后匹配，故 `B+A` 与 `A+B` 等价。

**六组键名模式（与参考实现一致）：**

- 关1：`激光+急刹` → `策略+急刹` → `保守+误报`
- 关2：`悬崖+跳下` → `数字+跳下` → `意外+计数`
- 关3：`手机+旷工` → `服务器+旷工` → `假日+补班`
- 关4：`冷柜+二维码` → `同款+二维码` → `串户+柜号`
- 关5：`开机+剧组` → `绒毛+剧组` → `片场+道具`
- 关6：`老花+毛线` → `视频+毛线` → `手抖+远程`

新创作关卡时可换词，但必须保持 **三阶段两条新词 + 最终合成** 的结构与 `id` 命名，以便 `resolveHintForCase` 复用。

---

## 4. 锦囊逻辑（`resolveHintForCase`）

输入：`caseDef`、`ctx = { has(word), completedIds: Set, gameWon, gameLost }`。  
若已胜或已败，返回 `null`。

否则按序：

1. 若 `starters` 中有任一未 `has`，返回 `{ text: hints.collect }`。
2. 若未完成 `step_fall`，返回 `{ text: hints.step1 }`。
3. 若未完成 `step_count`，返回 `{ text: hints.step2 }`。
4. 若未完成 `step_truth`，返回 `{ text: hints.step3 }`。
5. 否则返回 `null`。

点击锦囊时：清空当前两词选择、扣减 `hintsRemaining`、把返回的 `text` 显示在反馈区并加 `feedback--hint` 类。

---

## 5. 引擎行为（`engine.js`）

### 5.1 配方键归一化

```js
function normalizeRecipeKey(key) {
  const parts = key.split("+").map((s) => s.trim()).filter(Boolean);
  if (parts.length !== 2) return key;
  return parts.sort((a, b) => a.localeCompare(b, "zh-CN")).join("+");
}
```

构建 `RECIPES_NORMALIZED`：对当前关 `recipes` 的每个条目，以归一化键存入查找表。

### 5.2 碰撞流程

当已选两个词：

1. 查表；无配方 → 反馈「毫无关联的思绪…」（`feedback--muted`），扣理据，1 秒后清空选择。
2. 有配方但 `requires` 未全满足 → `lockedText` 或默认早到文案（`feedback--locked`），扣理据，1 秒后清空选择。
3. 成功 → 将 `recipe.id` 加入 `completedRecipeIds`；展示 `recipe.text`；若 `isWin` 则进入胜利态；否则若有 `newWord` 且词库未有则加入。

### 5.3 理据与终局

- `faultsUsed` 自增；`renderFaultMeter` 显示 `●`（剩余）与 `○`（已消耗）。
- 达到 `maxFaults`：`gameLost = true`，`body` 加 `game-lost`，反馈 `gameOverText`（`feedback--lose`）。

### 5.4 故事切换与持久化

- `localStorage` 键：`thought-alchemy-case`，存当前关索引。
- URL 查询：`?c=0` 形式优先于 localStorage（合法范围 `0 .. CASES.length-1`）。
- `setActiveCase(i)`：更新索引、持久化、`rebuildRecipesNormalized`、`resetGame()`。

### 5.5 `resetGame`

清空 inventory、`completedRecipeIds`、选择、胜负标记、理据；锦囊恢复满；去掉 `game-won` / `game-lost`；把当前关 `storyHtml` 写入 `.story-board__inner` 并重新绑定 `.clue` 点击；反馈区设为引导 HTML（见下）。

**引导 HTML 常量（与参考一致）：**

先点顶部 emoji 选故事；再点文中青色词入库，下方两词碰撞；顺序要解锁；失误扣理据；锦囊次数有限。（允许微调措辞，须保留机制说明。）

---

## 6. 页面与 DOM 契约

### 6.1 `index.html`

- `html`/`body` 加 class `rules-page`。
- `#rules-root` 由 `rules-page.js` 写入 `getRulesPageHtml()`。
- 页脚链接 `game.html`，文案类似「同意并进入卷宗」。

### 6.2 `game.html`

- `.app` 包裹。
- `header.case-header`：`nav#case-nav.case-nav`（emoji 由 JS 生成）、`p#case-title.case-title`。
- `main#story-board.story-board` > `.story-board__inner`。
- `section.thought-panel`：工具栏（返回 `index.html`、`#btn-hint`、`#btn-restart`）、短提示语、`#fault-meter`、`#inventory`、`#feedback`。

### 6.3 可访问性

- 适当 `aria-label`、`aria-live`、`role="status"` / `toolbar`。
- 当前关 emoji 按钮 `aria-current="true"`。

---

## 7. 视觉与样式（`css/style.css`）

- **主题：** Solarized Dark（参考 `:root`：`#002b36` 背景、`#839496` 正文、`#2aa198` 青、`#b58900` 黄、`#dc322f` 红）。
- **布局：** `game.html` 全屏 `overflow: hidden`；`.app` 纵向 flex；故事区与思维面板约 **各半屏**，故事区可纵向滚动。
- **规则页：** `html.rules-page, body.rules-page` 允许纵向滚动。
- **线索 `.clue`：** 青色、下划线、可 hover；`body.game-won` / `game-lost` 时禁用或弱化点击。
- **词库 `.tag`：** 胶囊按钮；选中 `.tag--selected`。
- **反馈区：** `.feedback--muted` / `--locked` / `--hint` / `--win` / `--lose`。

---

## 8. `getRulesPageHtml()` 契约

返回完整 `<article class="rules-document">…</article>` HTML 字符串，包含：

- 标题「思维炼金术」
- 内嵌 `DETECTIVE_BRIEFING`
- 小节「怎么玩」：列表项中 **动态插入** `CASES.length` 与 `GAME_RULES.maxFaults`、`maxHints`（勿写死数字，便于改数据）
- 底部风险提示与进入卷宗提示（实际按钮在 `index.html` footer）

---

## 9. 验收清单（agent 自检）

- [ ] 根目录 `python3 -m http.server` 可打开 `/` 与 `/game.html`，控制台无报错。
- [ ] 六则故事切换正常，刷新后通过 `?c=` 或 localStorage 恢复关卡的逻辑可用。
- [ ] 每关三个 starter 词皆可点入词库；非法组合与顺序错误均扣理据；满理据出局。
- [ ] 每关三条配方链能打通至 `【真相大白】`。
- [ ] 锦囊四句与进度严格对应 `resolveHintForCase`。
- [ ] 重来与切换故事重置进度与锦囊。
- [ ] 移动端竖屏可用，触控热区足够。

---

## 10. 可选扩展（非必须）

- 新增 `GameCase` 只需追加 `CASES` 并保证 `hints` 与 `recipes` 链一致。
- 多语言：保持数据结构不变，替换文案与 `localeCompare` 语言参数。

---

*本文件由仓库当前实现抽象而来；若代码与文档冲突，以你交付时的交互验收为准。*
