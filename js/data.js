/**
 * Thought Alchemy — 数据层
 * 策划改关卡：编辑 CASES 数组（每则：emoji、汤面 HTML、recipes、starters、hints）。
 */

/** 难度：每次「无效碰撞」扣 1（含毫无关联 + 顺序未到的锁定提示） */
export const GAME_RULES = {
  maxFaults: 5,
  maxHints: 3,
  gameOverText:
    "【顾问出局】理据余量归零。听证备忘：你在虚实边界连续提交无效推演，浪费专案组注意力。本案卷宗对你关闭——程序已锁死。",
};

export const DETECTIVE_BRIEFING = `
<p class="briefing-kicker">临时顾问协议 · 只读卷宗</p>
<p class="briefing-body">卷宗里有多桩互不相干的短案。点<strong>emoji</strong>切换故事；其中一则为经典<strong>盲人悬崖</strong>海龟汤，其余为科技、职场、脑洞等小品。每则都要自己收词、对撞、按顺序解锁；错了或顺序错了都会<strong>消耗理据</strong>。</p>
<p class="briefing-body briefing-body--warn"><strong>理据归零</strong>即出局。<strong>锦囊</strong>每则独立计数（重来会补满）。</p>
`;

/**
 * @typedef {{
 *   id: string,
 *   text: string,
 *   newWord?: string,
 *   isWin?: boolean,
 *   requires?: string[],
 *   lockedText?: string
 * }} Recipe
 */

/**
 * @typedef {{
 *   id: string,
 *   emoji: string,
 *   title: string,
 *   tone: string,
 *   storyHtml: string,
 *   starters: string[],
 *   recipes: Record<string, Recipe>,
 *   hints: { collect: string, step1: string, step2: string, step3: string }
 * }} GameCase
 */

/** @type {GameCase[]} */
export const CASES = [
  {
    id: "tech",
    emoji: "🤖",
    title: "空路急刹",
    tone: "科技",
    storyHtml: `
<p class="story-lead tone-tech">无人车事故备案 · 科技</p>
<p>凌晨，<span class="clue" data-word="激光">激光</span>雷达的日志干净得过分——前十米路面空无一人。车却在毫秒级内<span class="clue" data-word="急刹">急刹</span>，后排乘客颈椎重伤。</p>
<p>公司公开的<span class="clue" data-word="策略">策略</span>只有一句话：宁可误停，不可漏检。</p>
`,
    starters: ["激光", "急刹", "策略"],
    recipes: {
      "激光+急刹": {
        id: "step_fall",
        text: "激光通道里曾短暂出现过极高置信度的「人形轮廓」——像幽灵行人。",
        newWord: "误报",
      },
      "策略+急刹": {
        id: "step_count",
        requires: ["step_fall"],
        lockedText: "先把「急刹」为何触发想清楚，再谈公司规则怎么叠加。",
        text: "安全策略在感知分歧时会选最保守的一档：哪怕毫米波说没事，激光一旦喊停，系统就全力刹车。",
        newWord: "保守",
      },
      "保守+误报": {
        id: "step_truth",
        requires: ["step_count"],
        lockedText: "两个新词都落地了，再收束成一句人话。",
        text: "【真相大白】路边巨幅广告里的人脸被激光雷达当成闯入行人；冗余策略选了最狠的制动。乘客栽在「过度保守」上。",
        isWin: true,
      },
    },
    hints: {
      collect: "先把三个技术向关键词都点进库：它们分别来自感知、动作、制度。",
      step1: "哪两个词能解释「空路为何刹车」的第一层——传感器看见了什么？",
      step2: "同一个「急刹」词，第二次要和「公司怎么说」并置。",
      step3: "把「误报」与「保守」合成最终责任叙事。",
    },
  },
  {
    id: "blind",
    emoji: "🧑‍🦯",
    title: "悬崖与八",
    tone: "经典海龟汤",
    storyHtml: `
<p class="story-lead">现场没有第二双脚印，只有风在岩壁上低语。</p>
<p>一具躯体横在<span class="clue" data-word="悬崖">悬崖</span>之下，衣角还沾着干燥的尘土。没有人记得他曾与人争执，只有人说，他最后像是朝着虚空迈出了一步——像要<span class="clue" data-word="跳下">跳下</span>，又像被什么拽住了呼吸。</p>
<p>他掌心扣着一张被汗浸软的纸条，上面只有一个<span class="clue" data-word="数字">数字</span>：<strong class="mono">8</strong>。</p>
`,
    starters: ["悬崖", "跳下", "数字"],
    recipes: {
      "悬崖+跳下": {
        id: "step_fall",
        text: "他并非自愿跳下，而是意外滑落。",
        newWord: "意外",
      },
      "数字+跳下": {
        id: "step_count",
        requires: ["step_fall"],
        lockedText:
          "数字在纸条上沉默：你还没弄清「跳下」在此案里的真正重量。先把坠落定性，再谈计数。",
        text: "这个数字代表了他数过的东西，到「8」时发生了惨剧。",
        newWord: "计数",
      },
      "意外+计数": {
        id: "step_truth",
        requires: ["step_count"],
        lockedText:
          "「意外」与「计数」都已浮现，但中间那环「他究竟在数什么」尚未钉死。顺序错了，炼金只会冒黑烟。",
        text: "【真相大白】他是一个盲人，每天把人推下悬崖并计数。今天数到 8 时，他不小心踏空了。",
        isWin: true,
      },
    },
    hints: {
      collect: "先把三个现场词都点进库：地点、动作、物证上的数。",
      step1: "第一步：先固定「坠到崖底」的性质——哪两个词能判断这一跳是自愿还是意外？",
      step2: "第二步：让纸条上的数字与同一条「跳下」叙事并置。",
      step3: "第三步：把两个新词合拢——谁在数什么？",
    },
  },
  {
    id: "light",
    emoji: "😸",
    title: "绿色旷工",
    tone: "轻松职场",
    storyHtml: `
<p class="story-lead tone-light">考勤异常工单 · 轻松</p>
<p>全组打卡面板里只有我的格子是绿的，老板却在群里@我：<span class="clue" data-word="旷工">旷工</span>？我明明坐在工位上啃包子。</p>
<p>我盯着自己的<span class="clue" data-word="手机">手机</span>日历，今天明明标着「休」。可人事的<span class="clue" data-word="服务器">服务器</span>回执写着「工作日」。</p>
`,
    starters: ["旷工", "手机", "服务器"],
    recipes: {
      "手机+旷工": {
        id: "step_fall",
        text: "手机按用户时区显示节假日——你看到的是「休」。",
        newWord: "假日",
      },
      "服务器+旷工": {
        id: "step_count",
        requires: ["step_fall"],
        lockedText: "先弄清「旷工」在谁眼里成立，再拉系统进场。",
        text: "公司考勤机直连总部服务器：那天是国家规定的补班日，算工作日。",
        newWord: "补班",
      },
      "假日+补班": {
        id: "step_truth",
        requires: ["step_count"],
        lockedText: "两个日历叙事都拿到了，合成。",
        text: "【真相大白】你按手机假日休息，公司按国定补班考勤——绿色是你没打卡，不是世界错了。",
        isWin: true,
      },
    },
    hints: {
      collect: "先把「指控、你的设备、公司后台」三个词收齐。",
      step1: "谁定义了你有没有旷工的第一层？",
      step2: "同一个「旷工」，和「服务器」再撞一次。",
      step3: "假日与补班对账。",
    },
  },
  {
    id: "brain",
    emoji: "🌀",
    title: "冰箱里的包裹",
    tone: "脑洞",
    storyHtml: `
<p class="story-lead tone-brain">物流客诉 · 脑洞</p>
<p>快递 App 显示「已投<span class="clue" data-word="冷柜">冷柜</span>」，我冲到楼下，打开的却是自家冰箱——里面只有昨天剩的沙拉。</p>
<p>单元门旁贴着一张崭新的<span class="clue" data-word="二维码">二维码</span>，扫码后和 App 上的柜号一致。可这一栋有两台<span class="clue" data-word="同款">同款</span>冰箱式寄存柜。</p>
`,
    starters: ["冷柜", "二维码", "同款"],
    recipes: {
      "冷柜+二维码": {
        id: "step_fall",
        text: "二维码只对应「某一格柜机」的逻辑地址，不是你家冰箱。",
        newWord: "柜号",
      },
      "同款+二维码": {
        id: "step_count",
        requires: ["step_fall"],
        lockedText: "先确认「码」指哪台机器，再让「同款」进场。",
        text: "两台外观一致的柜子共享同一批贴纸模板——扫到的是 B 单元那台的码。",
        newWord: "串户",
      },
      "串户+柜号": {
        id: "step_truth",
        requires: ["step_count"],
        lockedText: "逻辑地址与物理位置，该合拢了。",
        text: "【真相大白】你扫对了码，却开错了楼：包裹躺在邻居那台「同款」冷柜里。",
        isWin: true,
      },
    },
    hints: {
      collect: "物、码、可复制性——三个词先入库。",
      step1: "冷柜与二维码先定义「系统以为在哪」。",
      step2: "同款与二维码：想想复制带来的坑。",
      step3: "串户与柜号合成。",
    },
  },
  {
    id: "joke",
    emoji: "🥶",
    title: "沙漠企鹅",
    tone: "冷笑话",
    storyHtml: `
<p class="story-lead tone-joke">片场花絮 · 冷笑话</p>
<p>纪录片预告里，一只<span class="clue" data-word="绒毛">绒毛</span>蓬松的企鹅在烈日下踱步，弹幕刷「剧组虐待动物」。导演紧急<span class="clue" data-word="开机">开机</span>澄清会。</p>
<p>场记板写着：<span class="clue" data-word="剧组">剧组</span>外景第 17 条，「假冰山」道具组待命。</p>
`,
    starters: ["绒毛", "开机", "剧组"],
    recipes: {
      "开机+剧组": {
        id: "step_fall",
        text: "镜头一开，阳光、反光板、人造雪——都是可控的。",
        newWord: "片场",
      },
      "绒毛+剧组": {
        id: "step_count",
        requires: ["step_fall"],
        lockedText: "先承认「在拍」，再谈企鹅的毛是什么做的。",
        text: "服装组领走预算：高仿真硅胶与植绒，不是南极户口。",
        newWord: "道具",
      },
      "片场+道具": {
        id: "step_truth",
        requires: ["step_count"],
        lockedText: "可以抖包袱了。",
        text: "【真相大白】没有真企鹅中暑，只有道具鹅在假沙漠里走台步——观众被绒毛骗了。",
        isWin: true,
      },
    },
    hints: {
      collect: "冷笑话也要线索：绒毛、开机、剧组。",
      step1: "谁把「假」变「真」的第一层？",
      step2: "剧组第二次要和「毛」对撞。",
      step3: "片场与道具收束。",
    },
  },
  {
    id: "warm",
    emoji: "💛",
    title: "织不完的围巾",
    tone: "温情",
    storyHtml: `
<p class="story-lead tone-warm">家庭记事 · 温情</p>
<p>奶奶每年冬天都给我织<span class="clue" data-word="毛线">毛线</span>围巾。今年柜子里空了，她却笑说「老了，<span class="clue" data-word="老花">老花</span>，针脚丑」。</p>
<p>晚上视频通话，她镜头里摆着毛线筐，背景音却是我在城里常用的那款<span class="clue" data-word="视频">视频</span>软件提示音。</p>
`,
    starters: ["毛线", "老花", "视频"],
    recipes: {
      "老花+毛线": {
        id: "step_fall",
        text: "她看不清针眼了，线在手里发颤。",
        newWord: "手抖",
      },
      "视频+毛线": {
        id: "step_count",
        requires: ["step_fall"],
        lockedText: "先共情「织不了」，再让「远程」介入。",
        text: "她把针法拆成一步一步，对着屏幕教我绕线——线在她手里，也在我手里。",
        newWord: "远程",
      },
      "手抖+远程": {
        id: "step_truth",
        requires: ["step_count"],
        lockedText: "把遗憾与办法合成一句完整的话。",
        text: "【真相大白】奶奶织不动了，就换你在视频这头替她织完那条围巾——爱换了条路，还在。",
        isWin: true,
      },
    },
    hints: {
      collect: "温情线也需要三个词：身体、物、连接方式。",
      step1: "老花与毛线：她停下来的理由。",
      step2: "视频与毛线：爱怎么延续。",
      step3: "手抖与远程合拢。",
    },
  },
];

export function getRulesPageHtml() {
  const n = GAME_RULES.maxFaults;
  const nc = CASES.length;
  return `
<article class="rules-document">
  <h1 class="rules-title">思维炼金术</h1>
  <div class="rules-briefing">${DETECTIVE_BRIEFING}</div>
  <h2 class="rules-subtitle">怎么玩</h2>
  <ul class="rules-list">
    <li>进入卷宗后，顶部 <strong>${nc} 个 emoji</strong> 对应 ${nc} 则独立故事（含经典盲人海龟汤与科技、职场、脑洞、冷笑话、温情），点按切换。</li>
    <li>点正文<strong>青色词</strong>入库；下方<strong>两词碰撞</strong>，须<strong>按顺序解锁</strong>。「毫无关联」与「来得太早」都算失误。</li>
    <li>每次失误扣 <strong>1</strong> 点理据（上限 <strong>${n}</strong>）；归零出局。</li>
    <li><strong>锦囊</strong>每关 <strong>${GAME_RULES.maxHints}</strong> 次，每用一次少一次；<strong>重来</strong>或切换故事会重置进度与锦囊。</li>
  </ul>
  <p class="rules-foot">阅读完毕即视为知悉风险。点击下方按钮进入卷宗。</p>
</article>
`;
}

/**
 * @param {GameCase} caseDef
 * @param {{ has: (w: string) => boolean, completedIds: Set<string>, gameWon: boolean, gameLost: boolean }} ctx
 * @returns {{ text: string } | null}
 */
export function resolveHintForCase(caseDef, ctx) {
  if (ctx.gameWon || ctx.gameLost) return null;
  const { has, completedIds } = ctx;
  const { starters, hints } = caseDef;
  if (!starters.every((w) => has(w))) {
    return { text: hints.collect };
  }
  if (!completedIds.has("step_fall")) {
    return { text: hints.step1 };
  }
  if (!completedIds.has("step_count")) {
    return { text: hints.step2 };
  }
  if (!completedIds.has("step_truth")) {
    return { text: hints.step3 };
  }
  return null;
}
