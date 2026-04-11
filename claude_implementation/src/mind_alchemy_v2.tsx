import { useState, useEffect, useRef } from "react";

type GameStatus = "playing" | "won" | "lost";
type ToastKind = "ok" | "err" | "hint";

type HistoryItem =
  | { t: "ok"; text: string; label: string }
  | { t: "err"; text: string };

type ComboToastFx = { type: ToastKind; text: string; dur: number; shake?: boolean };

interface GameState {
  bank: string[];
  stage: number;
  mistakes: number;
  hintsUsed: number;
  sel: string[];
  history: HistoryItem[];
  status: GameStatus;
}

interface StageDef {
  combo: string[];
  label: string;
  fb: string;
  unlocks: string[];
}

interface CaseDef {
  id: number;
  title: string;
  tag: string;
  icon: string;
  accent: string;
  accentDim: string;
  accentBorder: string;
  desc: string;
  maxMistakes: number;
  maxHints: number;
  story: string;
  hints: string[];
  stages: StageDef[];
}

const CASES: CaseDef[] = [
  {
    id: 1, title: "消失的算法", tag: "科技悬案", icon: "◈", accent: "#818cf8",
    accentDim: "rgba(129,140,248,0.12)", accentBorder: "rgba(129,140,248,0.3)",
    desc: "天才程序员的最后四个字，究竟指向了什么？",
    maxMistakes: 4, maxHints: 3,
    story: `深夜十一点，首席算法工程师陈默的工位上，屏幕还亮着。他的最后一次[提交记录]显示时间为 23:47，备注只有四个字——"我找到了。"

第二天清晨，HR 收到了一封据称由陈默本人发出的[辞职信]，措辞平静，称因个人原因离职，即日生效。

公司安保调取监控录像，却发现陈默工位附近恰好存在一个[监控盲区]——据说是装修时留下的设计死角，从未修复。`,
    hints: [
      "先把文中所有标记词都点击收集到词库中吧。",
      "辞职信和提交记录的时间顺序，有没有什么奇怪的地方？",
      "时间戳能和监控的漏洞之间产生什么联系？"
    ],
    stages: [
      { combo: ["提交记录","辞职信"], label:"开局",
        fb: "⚡ 关键矛盾：辞职信的文件元数据显示，创建时间是 23:30——比陈默最后一次提交代码整整早了 17 分钟。一个已经决定离职的人，为何还在认真提交工作代码？",
        unlocks: ["时间戳"] },
      { combo: ["时间戳","监控盲区"], label:"收束",
        fb: "🔍 轨迹还原：通过服务器日志的精确时间戳，结合监控盲区的物理位置，可以确定：23:48 到 00:15，陈默一直在服务器机房内操作——而机房恰好完全落在监控盲区之内。",
        unlocks: ["备份服务器"] },
      { combo: ["备份服务器","提交记录"], label:"真相",
        fb: "◈ 真相：陈默最后的那次提交，是向一台隐藏的异地备份服务器上传了完整数据包。那份「算法」，是公司长达三年的用户数据违规使用证据。陈默消失了——但他把一切都留下来了。",
        unlocks: [] }
    ]
  },
  {
    id: 2, title: "升职的棋子", tag: "职场谜题", icon: "◉", accent: "#fbbf24",
    accentDim: "rgba(251,191,36,0.10)", accentBorder: "rgba(251,191,36,0.3)",
    desc: "业绩更差的人得到晋升，三个月后悄然离去。",
    maxMistakes: 4, maxHints: 3,
    story: `季度末，销售部公布晋升名单。所有人都以为会是业绩第一的李明，结果却是排名第三的张伟。附上的[绩效报告]显示，张伟本季度业绩仅为李明的 67%。

李明愤而申诉，翻出了每周例会的[会议纪要]，逐条核查，试图找出张伟走后门的蛛丝马迹。

三个月后，张伟突然发出[离职邮件]，措辞平静，但字里行间透出一丝如释重负。`,
    hints: [
      "先把全部词语收集到词库里。",
      "会议纪要里记录了一次关键的临时替补——结合绩效报告，那次会议意味着什么？",
      "客户合同的条款和张伟离职的时间点，有没有一种「利用完毕」的关系？"
    ],
    stages: [
      { combo: ["绩效报告","会议纪要"], label:"开局",
        fb: "📋 线索浮现：会议纪要第 11 周记录了一条异常事项——核心客户临时取消了与李明的签约会议。张伟当天恰好在场，临时顶替完成接待。那场会议，拿下了今年最大的一笔合同。",
        unlocks: ["客户合同"] },
      { combo: ["客户合同","离职邮件"], label:"收束",
        fb: "🔗 关联浮现：那份合同藏着一条特殊条款——「关键对接人」须在公司任职满一年，否则合同自动进入违约审查期。张伟被晋升为「关键对接人」，是合同正常履约的法律前提。",
        unlocks: ["竞业协议"] },
      { combo: ["竞业协议","绩效报告"], label:"真相",
        fb: "◉ 真相：公司晋升张伟，不是因为他的业绩，而是为了用「关键对接人」身份触发随职级附带的竞业协议，将他锁死。一旦客户续签完成，张伟的利用价值便告终结。他的离职邮件，是他终于看清这一切的那一刻写下的。",
        unlocks: [] }
    ]
  },
  {
    id: 3, title: "最后一口汤", tag: "海龟汤", icon: "◎", accent: "#34d399",
    accentDim: "rgba(52,211,153,0.10)", accentBorder: "rgba(52,211,153,0.3)",
    desc: "一碗汤，让一个男人结束了自己的生命。",
    maxMistakes: 4, maxHints: 3,
    story: `一个男人走进餐厅，点了一碗[海龟汤]。

他只喝了一口，便放下汤匙，沉默许久。随后付账，回到家中，翻出抽屉底层一张压了多年的[老照片]，看了很久。

当晚，他自杀了。

警察整理遗物时，在书架上发现了一本他珍藏多年的[船难记录]——一本封皮已经泛黄的航海日志。`,
    hints: [
      "先把全部词语收集完毕。",
      "一碗汤和一张老照片，它们共同指向一段什么样的过去旅程？",
      "「幸存者名单」上的缺席，与日志中「必须做的事」——那究竟是什么？"
    ],
    stages: [
      { combo: ["海龟汤","老照片"], label:"开局",
        fb: "🌊 线索浮现：照片里，男人与一位女性并肩站在客轮甲板上。背面有一行字：「1987 年，与爱人同行。」这是他最后一次出海的记录。",
        unlocks: ["幸存者名单"] },
      { combo: ["幸存者名单","船难记录"], label:"收束",
        fb: "⚓ 深入调查：1987 年，那艘船在风暴中沉没。官方幸存者名单只有五人——男人在列，他的妻子不在。航海日志用极为隐晦的语言记录了漂流第十一天：「我们做了必须做的事。我独自活了下来。」",
        unlocks: ["求生日记"] },
      { combo: ["求生日记","海龟汤"], label:"真相",
        fb: "◎ 真相：漂流中，为了存活，幸存者们食用了……难以言说的东西。男人一直告诉自己，那是「海龟汤」。三十年后，他第一次在餐厅喝到真正的海龟汤——那个味道，和他记忆深处的完全不同。他终于知道，当年填进嘴里的，是什么。",
        unlocks: [] }
    ]
  }
];

function initState(): Record<number, GameState> {
  const s: Record<number, GameState> = {};
  CASES.forEach(c => {
    s[c.id] = { bank: [], stage: 0, mistakes: 0, hintsUsed: 0, sel: [], history: [], status: "playing" };
  });
  return s;
}

function applyCombo(
  prev: Record<number, GameState>,
  caseId: number,
  caseConfig: CaseDef,
  words: string[],
  activeCaseId: number | null
): { next: Record<number, GameState>; toast: ComboToastFx | null } {
  if (activeCaseId !== caseId) return { next: prev, toast: null };

  const cur = prev[caseId];
  if (!cur || cur.status !== "playing") return { next: prev, toast: null };

  const stage = caseConfig.stages[cur.stage];
  if (!stage) return { next: prev, toast: null };

  const hit =
    stage.combo.includes(words[0]) &&
    stage.combo.includes(words[1]) &&
    words[0] !== words[1];

  let isFuture = false;
  if (!hit) {
    for (let i = cur.stage + 1; i < caseConfig.stages.length; i++) {
      const fc = caseConfig.stages[i].combo;
      if (fc.includes(words[0]) && fc.includes(words[1]) && words[0] !== words[1]) {
        isFuture = true;
        break;
      }
    }
  }

  if (hit) {
    const ns = cur.stage + 1;
    const nb = [...new Set([...cur.bank, ...stage.unlocks])];
    const won = ns >= caseConfig.stages.length;
    return {
      next: {
        ...prev,
        [caseId]: {
          ...cur,
          stage: ns,
          bank: nb,
          sel: [],
          status: won ? "won" : "playing",
          history: [...cur.history, { t: "ok", text: stage.fb, label: stage.label }],
        },
      },
      toast: { type: "ok", text: stage.fb, dur: 7000 },
    };
  }

  const nm = cur.mistakes + 1;
  const lost = nm >= caseConfig.maxMistakes;
  const msg = isFuture
    ? "⏳ 时机尚未到来——这个组合现在还无法激活。"
    : "✗ 这两个词之间，目前找不到有效联系。";
  return {
    next: {
      ...prev,
      [caseId]: {
        ...cur,
        mistakes: nm,
        sel: [],
        status: lost ? "lost" : "playing",
        history: [...cur.history, { t: "err", text: msg }],
      },
    },
    toast: { type: "err", text: msg, dur: 3500, shake: true },
  };
}

export default function App() {
  const [screen, setScreen] = useState<"select" | "game">("select");
  const [cid, setCid] = useState<number | null>(null);
  const [gs, setGs] = useState<Record<number, GameState>>(() => initState());
  const [toast, setToast] = useState<{ type: ToastKind; text: string } | null>(null);
  const [shake, setShake] = useState(false);
  const [pulse, setPulse] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cidRef = useRef<number | null>(null);

  useEffect(() => {
    cidRef.current = cid;
  }, [cid]);

  const c = cid != null ? CASES.find(x => x.id === cid) : undefined;
  const s = cid != null ? gs[cid] : undefined;

  function patch(id: number, obj: Partial<GameState>) {
    setGs(prev => ({ ...prev, [id]: { ...prev[id], ...obj } }));
  }

  function showToast(type: ToastKind, text: string, dur = 5000) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = setTimeout(() => setToast(null), dur);
  }

  function collectWord(word: string) {
    if (cid == null) return;
    setGs(prev => {
      const cur = prev[cid];
      if (cur.bank.includes(word)) return prev;
      return { ...prev, [cid]: { ...cur, bank: [...cur.bank, word] } };
    });
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
  }

  function toggleWord(word: string) {
    if (cid == null || !s || s.status !== "playing") return;
    const caseId = cid;
    if (s.sel.includes(word)) {
      const nsel = s.sel.filter(w => w !== word);
      patch(caseId, { sel: nsel });
    } else if (s.sel.length < 2) {
      const nsel = [...s.sel, word];
      patch(caseId, { sel: nsel });
      if (nsel.length === 2) {
        setTimeout(() => tryCombo(nsel, caseId), 250);
      }
    }
  }

  function tryCombo(words: string[], caseId: number) {
    const caseConfig = CASES.find(x => x.id === caseId);
    if (!caseConfig) return;

    setGs(prev => {
      const { next, toast } = applyCombo(prev, caseId, caseConfig, words, cidRef.current);
      if (toast) {
        queueMicrotask(() => {
          showToast(toast.type, toast.text, toast.dur);
          if (toast.shake) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
          }
        });
      }
      return next;
    });
  }

  function useHint() {
    if (cid == null || !c || !s || s.status !== "playing" || s.hintsUsed >= c.maxHints) return;
    const h = c.hints[Math.min(s.hintsUsed, c.hints.length - 1)];
    patch(cid, { hintsUsed: s.hintsUsed + 1 });
    showToast("hint", "💡 " + h, 6000);
  }

  function resetCase() {
    if (cid == null) return;
    patch(cid, { bank: [], stage: 0, mistakes: 0, hintsUsed: 0, sel: [], history: [], status: "playing" });
    setToast(null);
  }

  function renderStory(text: string, caseConfig: CaseDef, state: GameState) {
    const parts = text.split(/\[([^\]]+)\]/g);
    return parts.map((p, i) => {
      if (i % 2 === 1) {
        const col = state.bank.includes(p);
        return (
          <span key={i} onClick={() => !col && collectWord(p)}
            style={{ cursor: col ? "default" : "pointer", padding: "1px 7px", borderRadius: 5,
              background: col ? "rgba(100,100,120,0.18)" : caseConfig.accentDim,
              border: `1px solid ${col ? "rgba(100,100,120,0.25)" : caseConfig.accentBorder}`,
              color: col ? "rgba(200,200,220,0.4)" : caseConfig.accent,
              fontWeight: 500, textDecoration: col ? "line-through" : "none",
              transition: "all 0.2s", userSelect: "none" }}>
            {p}
          </span>
        );
      }
      return <span key={i}>{p}</span>;
    });
  }

  const stageBar = (id: number) => {
    const st = gs[id];
    const cc = CASES.find(x => x.id === id);
    if (!cc) return null;
    return (
      <div style={{ display: "flex", gap: 3, marginTop: 10 }}>
        {cc.stages.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 2, borderRadius: 2,
            background: i < st.stage ? cc.accent : "rgba(255,255,255,0.08)" }} />
        ))}
      </div>
    );
  };

  if (screen === "select") {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0d15", color: "#dde1f0", fontFamily: "'PingFang SC','Microsoft YaHei',system-ui,sans-serif", padding: "28px 16px" }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 11, letterSpacing: 6, color: "rgba(200,200,255,0.3)", marginBottom: 8, textTransform: "uppercase" }}>Mind Alchemy</div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 3, color: "#e8eaf8" }}>思维炼金术</div>
            <div style={{ fontSize: 12, color: "rgba(180,185,220,0.4)", marginTop: 8, letterSpacing: 1 }}>收集线索 · 两词组合 · 拨开迷雾</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CASES.map(cc => {
              const st = gs[cc.id];
              return (
                <div key={cc.id} onClick={() => { setCid(cc.id); setScreen("game"); }}
                  style={{ background: "#13131f", border: `1px solid ${st.status === "won" ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 14, padding: "18px 20px", cursor: "pointer",
                    transition: "border-color 0.2s, background 0.2s", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: cc.accent }} />
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ fontSize: 24, color: cc.accent, lineHeight: 1, paddingTop: 2, flexShrink: 0 }}>{cc.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "#e8eaf8" }}>{cc.title}</span>
                        <span style={{ fontSize: 10, color: cc.accent, background: cc.accentDim, border: `1px solid ${cc.accentBorder}`, padding: "2px 8px", borderRadius: 20, letterSpacing: 0.5 }}>{cc.tag}</span>
                        {st.status === "won" && <span style={{ fontSize: 10, color: "#34d399", marginLeft: "auto" }}>已解开 ✓</span>}
                        {st.status === "lost" && <span style={{ fontSize: 10, color: "#f87171", marginLeft: "auto" }}>推理中断</span>}
                      </div>
                      <div style={{ fontSize: 13, color: "rgba(200,205,230,0.5)", marginTop: 5 }}>{cc.desc}</div>
                      {stageBar(cc.id)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 28, fontSize: 11, color: "rgba(180,185,220,0.2)", lineHeight: 1.8 }}>
            点击文中高亮词以收集 · 选择两个词尝试组合<br/>机会有限，锦囊不多，慎思方行
          </div>
        </div>
      </div>
    );
  }

  if (!c || !s) {
    return null;
  }

  const hintLeft = c.maxHints - s.hintsUsed;
  const allCollectable = c.story.match(/\[([^\]]+)\]/g)?.map(x => x.slice(1, -1)) ?? [];
  const allCollected = allCollectable.every(w => s.bank.includes(w));

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d15", color: "#dde1f0", fontFamily: "'PingFang SC','Microsoft YaHei',system-ui,sans-serif" }}>

      <div style={{ background: "#10101a", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 580, margin: "0 auto", height: 52, display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => setScreen("select")} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.4)", cursor: "pointer", fontSize: 18, padding: "4px 6px", lineHeight: 1 }}>←</button>
          <span style={{ fontSize: 18, color: c.accent }}>{c.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#e0e3f5" }}>{c.title}</div>
            <div style={{ fontSize: 10, color: "rgba(180,185,220,0.35)", letterSpacing: 0.5 }}>{c.tag}</div>
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {c.stages.map((st, i) => (
              <div key={st.label + i} style={{ width: 7, height: 7, borderRadius: "50%",
                background: i < s.stage ? c.accent : "rgba(255,255,255,0.08)",
                border: i === s.stage && s.status === "playing" ? `1.5px solid ${c.accent}` : "none",
                transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, fontSize: 12, marginLeft: 8 }}>
            {[...Array(c.maxMistakes)].map((_, i) => (
              <span key={i} style={{ fontSize: 10, opacity: i < s.mistakes ? 0.18 : 1 }}>♥</span>
            ))}
          </div>
          <span style={{ fontSize: 12, color: hintLeft > 0 ? "#fbbf24" : "rgba(180,180,200,0.25)", marginLeft: 4 }}>
            💡{hintLeft}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "16px 16px 40px" }}>

        {toast && (
          <div style={{ background: toast.type === "ok" ? "#0a1a14" : toast.type === "hint" ? "#14120a" : "#160a0a",
            border: `1px solid ${toast.type === "ok" ? "rgba(52,211,153,0.35)" : toast.type === "hint" ? "rgba(251,191,36,0.35)" : "rgba(248,113,113,0.35)"}`,
            borderRadius: 12, padding: "14px 16px", marginBottom: 14,
            fontSize: 13, lineHeight: 1.75, color: "#e0e3f5",
            animation: "fadeSlide 0.3s ease" }}>
            {toast.text}
          </div>
        )}

        {s.status === "won" && (
          <div style={{ background: "#071510", border: "1px solid rgba(52,211,153,0.4)", borderRadius: 14, padding: "20px", marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 22, color: "#34d399", fontWeight: 600, marginBottom: 6 }}>真相大白</div>
            <div style={{ fontSize: 13, color: "rgba(52,211,153,0.6)", marginBottom: 14 }}>你拨开了迷雾，看见了真实。</div>
            <button type="button" onClick={resetCase} style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.4)", borderRadius: 8, padding: "8px 22px", color: "#34d399", cursor: "pointer", fontSize: 13 }}>重新挑战</button>
          </div>
        )}
        {s.status === "lost" && (
          <div style={{ background: "#150707", border: "1px solid rgba(248,113,113,0.35)", borderRadius: 14, padding: "20px", marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 22, color: "#f87171", fontWeight: 600, marginBottom: 6 }}>推理中断</div>
            <div style={{ fontSize: 13, color: "rgba(248,113,113,0.5)", marginBottom: 14 }}>线索在迷雾中消散，真相依然隐匿。</div>
            <button type="button" onClick={resetCase} style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.35)", borderRadius: 8, padding: "8px 22px", color: "#f87171", cursor: "pointer", fontSize: 13 }}>重新开始</button>
          </div>
        )}

        <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "20px", marginBottom: 12, animation: shake ? "shake 0.4s ease" : "none" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(200,200,220,0.25)", marginBottom: 14, textTransform: "uppercase" }}>案情档案</div>
          <div style={{ fontSize: 14.5, lineHeight: 2.1, color: "rgba(220,225,245,0.85)", whiteSpace: "pre-wrap" }}>
            {renderStory(c.story, c, s)}
          </div>
          {!allCollected && (
            <div style={{ marginTop: 14, fontSize: 11, color: "rgba(200,200,220,0.25)", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 12 }}>
              点击高亮词语以收集至词库
            </div>
          )}
        </div>

        <div style={{ background: "#13131f", border: `1px solid ${pulse ? c.accentBorder : "rgba(255,255,255,0.05)"}`, borderRadius: 14, padding: "16px", marginBottom: 12, transition: "border-color 0.3s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(200,200,220,0.25)", textTransform: "uppercase" }}>词库</span>
            <span style={{ fontSize: 11, color: "rgba(200,200,220,0.3)" }}>{s.bank.length} 词</span>
          </div>
          {s.bank.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(200,200,220,0.2)", fontSize: 13, padding: "12px 0" }}>尚无收集词语</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {s.bank.map(w => {
                const isSel = s.sel.includes(w);
                return (
                  <button key={w} type="button" onClick={() => toggleWord(w)} disabled={s.status !== "playing"}
                    style={{ background: isSel ? c.accent : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isSel ? c.accent : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 8, padding: "7px 14px", color: isSel ? "#0d0d15" : "#dde1f0",
                      cursor: s.status === "playing" ? "pointer" : "default",
                      fontSize: 14, fontWeight: isSel ? 600 : 400,
                      transform: isSel ? "scale(1.04)" : "scale(1)",
                      transition: "all 0.15s" }}>
                    {w}
                  </button>
                );
              })}
            </div>
          )}
          {s.sel.length > 0 && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderRadius: 8, fontSize: 12, color: "rgba(200,200,220,0.5)", letterSpacing: 1 }}>
              {s.sel.join("  +  ")} {s.sel.length < 2 && "  →  ?"}
            </div>
          )}
        </div>

        {s.history.length > 0 && (
          <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px", marginBottom: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(200,200,220,0.25)", marginBottom: 12, textTransform: "uppercase" }}>推理记录</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {s.history.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 2, background: h.t === "ok" ? c.accent : "rgba(248,113,113,0.4)", borderRadius: 2, alignSelf: "stretch", flexShrink: 0 }} />
                  <div style={{ fontSize: 13, lineHeight: 1.75, color: h.t === "ok" ? "rgba(220,225,245,0.8)" : "rgba(248,113,113,0.6)" }}>{h.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {s.status === "playing" && (
          <button type="button" onClick={useHint} disabled={hintLeft === 0}
            style={{ width: "100%", background: hintLeft > 0 ? "rgba(251,191,36,0.06)" : "transparent",
              border: `1px solid ${hintLeft > 0 ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: 12, padding: "13px", color: hintLeft > 0 ? "#fbbf24" : "rgba(180,180,200,0.2)",
              cursor: hintLeft > 0 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 500, letterSpacing: 0.5 }}>
            使用锦囊 · 剩余 {hintLeft} 次
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeSlide { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
      `}</style>
    </div>
  );
}
