import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Lightbulb,
  RotateCcw,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Trophy,
  History,
  Skull,
  Eye,
  Brain,
} from 'lucide-react';
// --- 词类型定义 ---
const WORD_TYPES = {
  线索: { label: '线索', color: 'cyan', icon: '🔍' },
  环境: { label: '环境', color: 'blue', icon: '🌐' },
  状态: { label: '状态', color: 'teal', icon: '💫' },
  物证: { label: '物证', color: 'amber', icon: '🔬' },
  人物: { label: '人物', color: 'rose', icon: '👤' },
  诡计: { label: '诡计', color: 'violet', icon: '🎭' },
};

// --- 色彩映射 (word type → tailwind color token) ---
const TYPE_COLORS = {
  线索: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  环境: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400' },
  状态: { bg: 'bg-teal-500/15', border: 'border-teal-500/30', text: 'text-teal-400' },
  物证: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' },
  人物: { bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-400' },
  诡计: { bg: 'bg-violet-500/15', border: 'border-violet-500/30', text: 'text-violet-400' },
};

// --- V2 游戏玩法配置 ---
const GAMEPLAY_V2 = {
  stageBanners: {
    0: '你先看到的，不一定是真的。',
    1: '你以为你已经理解了现场。',
    2: '你忽然意识到：理解本身就是陷阱。',
    3: '真相并不隐藏，它只是被你主动忽略了。',
  },
  progressionFeedback: {
    s1Prefix: '【初步成立】',
    s2Prefix: '【认知反噬】',
    s3Prefix: '【真相揭露】',
  },
};

// --- 浮动粒子组件 ---
function FloatingParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${15 + Math.random() * 20}s`,
      size: `${1 + Math.random() * 2}px`,
      opacity: 0.15 + Math.random() * 0.25,
    })),
  );

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
          }}
        />
      ))}
    </>
  );
}

// --- 案件陈述：逐字打字机（Array.from 按 Unicode 标量拆分，中文一字一字） ---
function pauseAfterChar(char, baseMs) {
  if (!char) return baseMs;
  if ('，。！？、；：…'.includes(char)) return Math.round(baseMs * 4.5);
  if ('\n' === char) return Math.round(baseMs * 2.5);
  return baseMs;
}

function TypewriterIntro({ text, charDelayMs = 38 }) {
  const chars = useMemo(() => (text ? Array.from(text) : []), [text]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= chars.length) return;
    const prev = count > 0 ? chars[count - 1] : '';
    const wait = pauseAfterChar(prev, charDelayMs);
    const id = window.setTimeout(() => setCount((c) => c + 1), wait);
    return () => clearTimeout(id);
  }, [count, chars, charDelayMs]);

  const done = chars.length > 0 && count >= chars.length;
  const visible = chars.slice(0, count).join('');

  return (
    <div className="relative min-h-[80px] w-full text-lg leading-8 text-neutral-200">
      <span className="whitespace-pre-wrap">{visible}</span>
      {!done && (
        <span
          className="ml-px inline-block h-[1.1em] w-0.5 translate-y-px cursor-blink bg-red-400 align-middle"
          aria-hidden
        />
      )}
    </div>
  );
}

// --- 游戏数据定义 ---
const LEVELS = [
  {
    id: 1,
    title: '孤岛童谣·鬼杀版',
    theme: '无人生还（恐怖认知版）',
    intro: '我和9人被困孤岛，每晚午夜童谣响起，就会有人惨死。最后只剩我一人，手上却沾着童谣碎片的血迹。',
    fullText:
      '我和9人被困[孤岛]，每晚午夜，[童谣]准时响起，紧接着就会有人按童谣死法惨死。岛上没有外人，门窗从内反锁，死者身边都放着一枚血色童谣碎片。我每晚都能看到走廊有[黑影]闪过，最后只剩我一人，却发现自己的手上沾着童谣碎片的血迹。',
    initialWords: [
      { text: '童谣', type: '线索' },
      { text: '孤岛', type: '环境' },
      { text: '黑影', type: '状态' },
    ],
    stages: [
      {
        id: 0,
        goal: 'S0 取证',
        pairs: [
          {
            a: '孤岛',
            b: '黑影',
            feedback: '孤岛无任何外来痕迹，黑影速度极快，每次出现都在童谣响起前，不像活人移动，更像残影。',
            unlock: [{ text: '血迹', type: '物证' }],
          },
        ],
        hint: {
          atmosphereHint: '走廊尽头又有什么在闪过……先关注孤岛的封闭性与黑影的矛盾。',
          logicHint: '黑影不是外来者，它藏在我们之中。',
          breakHint: '请组合「孤岛」与「黑影」。',
        },
      },
      {
        id: 1,
        goal: 'S1 初判',
        pairs: [
          {
            a: '童谣',
            b: '血迹',
            feedback: '血迹都是死者的，童谣碎片上的血迹与死者完全匹配，推测是凶手杀人后留下的标记，黑影就是凶手。',
            unlock: [{ text: '法官', type: '人物' }],
          },
        ],
        hint: {
          atmosphereHint: '童谣碎片上的血，冰冷而新鲜。',
          logicHint: '童谣与血迹是凶手的标记，黑影和死者的死法高度相关。',
          breakHint: '请组合「童谣」与「血迹」。',
        },
      },
      {
        id: 2,
        goal: 'S2 反转',
        pairs: [
          {
            a: '法官',
            b: '黑影',
            feedback: '法官"死"后，黑影依然出现。我偶然发现，法官的"尸体"手指有轻微抽动，他根本没真死——更恐怖的是，我每次看到的黑影，其实是我自己的倒影，因为孤岛走廊的灯光是镜面折射，我把自己看成了凶手。',
            unlock: [{ text: '镜像错觉', type: '诡计' }],
          },
        ],
        hint: {
          atmosphereHint: '你又看到了黑影，但这一次……它的轮廓和你自己很像。',
          logicHint: '灯光和镜面在误导你的视觉。',
          breakHint: '请组合「法官」与「黑影」。',
        },
      },
      {
        id: 3,
        goal: 'S3 定论',
        pairs: [
          {
            a: '镜像错觉',
            b: '童谣',
            feedback: '【真相】法官假死布局，利用走廊镜面折射和昏暗灯光，制造"黑影"假象，让我们互相猜忌、自相残杀。我手上的血迹，是昨晚被法官下药后，无意识参与杀人留下的。所谓"鬼杀"，不过是人心恶念+视觉诡计，最后法官自杀，我成了他最后的"帮凶"。',
            unlock: [],
          },
        ],
        hint: {
          atmosphereHint: '镜中的你，和童谣中的凶手，已经合为一体。',
          logicHint: '镜像错觉是法官的核心诡计。',
          breakHint: '请组合「镜像错觉」与「童谣」。',
        },
      },
    ],
    weakPairs: [
      { pair: ['童谣', '孤岛'], text: '童谣和孤岛氛围诡异，但还缺关键证据。' },
      { pair: ['法官', '血迹'], text: '法官的尸体上有血迹，但无法证明他还活着。' },
    ],
    trapProfile: {
      primaryTrapType: 'visual_bias',
      secondaryTrapType: 'identity_bias',
      surfaceAssumption: '黑影是外来入侵者，是真正的凶手',
      hiddenBreak: '黑影是镜面折射的自己的倒影，法官假死操控全局',
    },
    debrief: {
      surfaceTruth: '有一个隐藏的凶手在按童谣杀人',
      realTruth: '法官假死布局，利用镜面折射制造黑影，让众人互相残杀',
      coreBlindSpot: '你把自己的镜像倒影当成了外来威胁',
      bestTrapPair: ['黑影', '童谣'],
      whyYouWereMisled: '你从未怀疑过自己看到的"黑影"就是自己',
    },
    truth: '法官假死布局，利用走廊镜面折射和昏暗灯光，制造"黑影"假象，让众人互相猜忌、自相残杀。所谓"鬼杀"，不过是人心恶念加视觉诡计。',
    failText: '黑影越来越近，你的推理被恐惧吞噬，永远困在了这座孤岛。',
    maxMistakes: 5,
    maxHints: 3,
  },
  {
    id: 2,
    title: '列车密室·血色错觉',
    theme: '东方快车谋杀案（恐怖认知版）',
    intro: '大雪封停列车，富豪在反锁的包厢中被刺12刀身亡。所有人都有不在场证明，暗红色灯光下，每个人的手上都有可疑印记。',
    fullText:
      '大雪封停列车，我半夜听到惨叫，富豪包厢内被刺12刀身亡。包厢反锁，无任何闯入痕迹，形成完美[密室]。所有乘客都有不在场证明。更诡异的是，死者身上有深浅不一的[刀伤]，我看到每个人的手上都有暗红色印记，可他们都说那是[红灯]照的，列车上的灯光永远是暗红色的。',
    initialWords: [
      { text: '密室', type: '状态' },
      { text: '刀伤', type: '物证' },
      { text: '红灯', type: '环境' },
    ],
    stages: [
      {
        id: 0,
        goal: 'S0 取证',
        pairs: [
          {
            a: '密室',
            b: '红灯',
            feedback: '列车被大雪封死，密室无法破解。暗红色灯光笼罩全车，所有颜色都被染成暗红，无法区分血迹和普通污渍。',
            unlock: [{ text: '指印', type: '物证' }],
          },
        ],
        hint: {
          atmosphereHint: '暗红色灯光下，一切看起来都像沾了血……红灯在掩盖什么关键线索？',
          logicHint: '颜色混淆是本案的核心破绽。',
          breakHint: '请组合「密室」与「红灯」。',
        },
      },
      {
        id: 1,
        goal: 'S1 初判',
        pairs: [
          {
            a: '刀伤',
            b: '指印',
            feedback: '刀伤深浅不一，指印凌乱，推测是多人下手，但所有人的不在场证明都完美，指印也无法对应到具体的人。',
            unlock: [{ text: '12人', type: '人物' }],
          },
        ],
        hint: {
          atmosphereHint: '12道刀伤，深浅各异，像是12种不同的愤怒。',
          logicHint: '刀伤特征暗示凶手不止一人。',
          breakHint: '请组合「刀伤」与「指印」。',
        },
      },
      {
        id: 2,
        goal: 'S2 反转',
        pairs: [
          {
            a: '12人',
            b: '红灯',
            feedback: '我偷偷用手机手电筒照向众人的手——那些"暗红色印记"根本不是灯光，是未干的血迹！所有人都在撒谎，他们故意用红灯掩盖血迹，互相作伪证，因为他们每个人都捅了死者一刀，而红灯让我无法区分血迹和肤色。',
            unlock: [{ text: '血色伪装', type: '诡计' }],
          },
        ],
        hint: {
          atmosphereHint: '你用白光照了一下自己的手……什么都没有。再照向他们呢？',
          logicHint: '所有人都在利用灯光误导你。',
          breakHint: '请组合「12人」与「红灯」。',
        },
      },
      {
        id: 3,
        goal: 'S3 定论',
        pairs: [
          {
            a: '血色伪装',
            b: '密室',
            feedback: '【真相】死者是当年逃脱制裁的绑匪，车厢12人都是受害者亲属。他们提前串通，在密室中每人捅出一刀，再打开暗红色灯光，掩盖手上的血迹，互相作伪证。我看到的"灯光错觉"，是他们精心设计的认知陷阱，让我无法发现他们全员合谋的真相，完美的密室，其实是全员参与的血色复仇。',
            unlock: [],
          },
        ],
        hint: {
          atmosphereHint: '红灯下，密室里，12个人都在看着你微笑。',
          logicHint: '密室是为了困住所有人，掩盖合谋。',
          breakHint: '请组合「血色伪装」与「密室」。',
        },
      },
    ],
    weakPairs: [
      { pair: ['密室', '刀伤'], text: '密室和刀伤矛盾，但无法确定凶手人数。' },
      { pair: ['红灯', '指印'], text: '灯光影响指印识别，但还缺合谋证据。' },
    ],
    trapProfile: {
      primaryTrapType: 'visual_bias',
      secondaryTrapType: 'identity_bias',
      surfaceAssumption: '暗红色印记是灯光照射，凶手是某一个人',
      hiddenBreak: '暗红色印记全是真实血迹，12人全员行凶',
    },
    debrief: {
      surfaceTruth: '某个隐藏的杀手在密室中杀了人，红灯是偶然',
      realTruth: '12人全员合谋复仇，红灯是精心设计来掩盖全员血迹的',
      coreBlindSpot: '你默认了"灯光是环境因素"而非"故意工具"',
      bestTrapPair: ['红灯', '指印'],
      whyYouWereMisled: '红灯下血迹与肤色近乎一致，你的色觉被操控了',
    },
    truth: '12人全员合谋复仇，利用暗红灯光掩盖手上血迹，互相作伪证。完美的密室，其实是全员参与的血色复仇。',
    failText: '红灯越来越暗，惨叫声再次响起，你永远无法揭开列车上的血色秘密。',
    maxMistakes: 5,
    maxHints: 3,
  },
  {
    id: 3,
    title: '叙述者·记忆陷阱',
    theme: '罗杰疑案（恐怖认知版）',
    intro: '我是罗杰的好友，全程记录查案过程。可每晚我都梦见自己拿着刀站在他的尸体旁，醒来后手上有血腥味。',
    fullText:
      '我是罗杰的好友，作为[叙述者]全程协助查案，记录下每一个细节。罗杰在书房被杀，门窗反锁，现场有[录音机]，我发誓自己没有杀人。可每晚我都会做[噩梦]，梦见自己拿着刀站在罗杰的尸体旁，醒来后手上总会有淡淡的血腥味，我告诉自己那是幻觉。',
    initialWords: [
      { text: '叙述者', type: '人物' },
      { text: '录音机', type: '物证' },
      { text: '噩梦', type: '状态' },
    ],
    stages: [
      {
        id: 0,
        goal: 'S0 取证',
        pairs: [
          {
            a: '录音机',
            b: '噩梦',
            feedback: '录音机定时播放，伪造了死者的声音，我的噩梦内容，正好和录音机播放的时间吻合。血腥味真实存在，不是幻觉。',
            unlock: [{ text: '安眠药', type: '物证' }],
          },
        ],
        hint: {
          atmosphereHint: '每晚同一时间，录音机开始播放，你也总在同一时间惊醒……',
          logicHint: '录音机和你的噩梦有直接关联，血腥味不是幻觉。',
          breakHint: '请组合「录音机」与「噩梦」。',
        },
      },
      {
        id: 1,
        goal: 'S1 初判',
        pairs: [
          {
            a: '叙述者',
            b: '安眠药',
            feedback: '我发现自己的药瓶里有安眠药残留，推测是有人给我下药，让我产生噩梦和幻觉，凶手想嫁祸给我，我依然坚信自己不是凶手。',
            unlock: [{ text: '记忆断层', type: '状态' }],
          },
        ],
        hint: {
          atmosphereHint: '药瓶里有些东西不对……你最近总是记不清入睡前做了什么。',
          logicHint: '安眠药让你的记忆出现了空白。',
          breakHint: '请组合「叙述者」与「安眠药」。',
        },
      },
      {
        id: 2,
        goal: 'S2 反转',
        pairs: [
          {
            a: '记忆断层',
            b: '叙述者',
            feedback: '我找到自己的日记，上面的字迹是我的，却记录着我杀人的全过程——我没有被下药，安眠药是我自己吃的，目的是掩盖杀人后的记忆。我因为嫉妒罗杰，杀了他，再用录音机伪造不在场，用"记忆断层"欺骗自己，把自己当成了无辜的旁观者。',
            unlock: [{ text: '自我伪装', type: '诡计' }],
          },
        ],
        hint: {
          atmosphereHint: '你翻开日记，字迹是你的……但内容让你浑身发冷。',
          logicHint: '最无辜的叙述者，就是凶手。你一直在欺骗自己。',
          breakHint: '请组合「记忆断层」与「叙述者」。',
        },
      },
      {
        id: 3,
        goal: 'S3 定论',
        pairs: [
          {
            a: '自我伪装',
            b: '录音机',
            feedback: '【真相】我就是凶手。我因嫉妒罗杰的财富和爱人，策划了谋杀，用安眠药让自己暂时遗忘杀人过程，再用录音机伪造不在场证明，以"叙述者"的身份协助查案，欺骗所有人，也欺骗自己。噩梦不是幻觉，是潜意识里的罪恶在提醒我，手上的血腥味，从来都不是假的。',
            unlock: [],
          },
        ],
        hint: {
          atmosphereHint: '录音机里的声音……有一段，是你自己的。',
          logicHint: '你用自我伪装，掩盖了自己的罪行。',
          breakHint: '请组合「自我伪装」与「录音机」。',
        },
      },
    ],
    weakPairs: [
      { pair: ['叙述者', '录音机'], text: '你接触过录音机，但缺乏杀人动机。' },
      { pair: ['噩梦', '记忆断层'], text: '记忆有空白，但无法证明你是凶手。' },
    ],
    trapProfile: {
      primaryTrapType: 'narrative_bias',
      secondaryTrapType: 'memory_bias',
      surfaceAssumption: '叙述者是无辜的旁观者，有人在嫁祸他',
      hiddenBreak: '叙述者就是凶手，刻意遗忘自己的罪行',
    },
    debrief: {
      surfaceTruth: '有人给叙述者下药，试图嫁祸给他',
      realTruth: '叙述者自己吃安眠药遗忘杀人过程，以无辜者身份参与调查',
      coreBlindSpot: '你信任了叙述者的"第一人称视角"，从未怀疑叙述本身是谎言',
      bestTrapPair: ['叙述者', '安眠药'],
      whyYouWereMisled: '谁会怀疑讲故事的人呢？你的信任，就是最大的陷阱',
    },
    truth: '叙述者就是凶手。他用安眠药让自己暂时遗忘杀人过程，以"无辜旁观者"的身份参与调查，欺骗所有人，也欺骗自己。',
    failText: '记忆彻底混乱，你再也分不清自己是无辜者还是凶手，永远困在自我欺骗的牢笼里。',
    maxMistakes: 5,
    maxHints: 3,
  },
  {
    id: 4,
    title: '邮轮血色指甲油',
    theme: '尼罗河上的惨案（恐怖认知版）',
    intro: '邮轮上富家女遇害，舱房反锁。那瓶红色指甲油，白天和晚上竟然不一样。',
    fullText:
      '我在邮轮上见证了富家女被杀，她的舱房反锁，现场有一瓶红色[指甲油]，瓶口沾着血迹。她的[丈夫]腿部受伤，前女友情绪崩溃，所有人都有不在场证明。可我发现那晚有[枪声]响过，而那瓶指甲油的颜色，在白天和晚上不一样，晚上会变成暗红色，和血迹一模一样。',
    initialWords: [
      { text: '丈夫', type: '人物' },
      { text: '指甲油', type: '物证' },
      { text: '枪声', type: '线索' },
    ],
    stages: [
      {
        id: 0,
        goal: 'S0 取证',
        pairs: [
          {
            a: '指甲油',
            b: '枪声',
            feedback: '枪声响起时，所有人都有证人，指甲油瓶口的"血迹"，在晚上看和真血无异，但白天看却有细微差别。邮轮舱房反锁，无任何闯入痕迹。',
            unlock: [{ text: '变色', type: '状态' }],
          },
        ],
        hint: {
          atmosphereHint: '你拿起那瓶指甲油，对着窗外的月光……颜色似乎在变。',
          logicHint: '指甲油的颜色变化很可疑，和枪声时间有关联。',
          breakHint: '请组合「指甲油」与「枪声」。',
        },
      },
      {
        id: 1,
        goal: 'S1 初判',
        pairs: [
          {
            a: '丈夫',
            b: '枪声',
            feedback: '丈夫受伤后一直在众人视线中，枪声响起时他正在惨叫，拥有完美不在场证明。指甲油的血迹推测是死者的，凶手应该是前女友。',
            unlock: [{ text: '共犯', type: '人物' }],
          },
        ],
        hint: {
          atmosphereHint: '丈夫的惨叫声，和枪声几乎同时……也许太巧了。',
          logicHint: '丈夫的受伤过于巧合，和枪声时间吻合。',
          breakHint: '请组合「丈夫」与「枪声」。',
        },
      },
      {
        id: 2,
        goal: 'S2 反转',
        pairs: [
          {
            a: '变色',
            b: '共犯',
            feedback: '那瓶指甲油是"感光变色款"——白天是红色，晚上变成暗红色，和血迹完全一致。丈夫和前女友合谋，丈夫假装受伤制造不在场，前女友用指甲油伪造血迹，制造"凶手是外人"的假象，枪声是他们提前录好的，用来混淆案发时间。',
            unlock: [{ text: '感光诡计', type: '诡计' }],
          },
        ],
        hint: {
          atmosphereHint: '白天再看那瓶指甲油……它和昨晚完全不同了。',
          logicHint: '指甲油的颜色变化是故意设计的，两人在配合。',
          breakHint: '请组合「变色」与「共犯」。',
        },
      },
      {
        id: 3,
        goal: 'S3 定论',
        pairs: [
          {
            a: '感光诡计',
            b: '丈夫',
            feedback: '【真相】丈夫为了巨额财产，和前女友合谋杀害妻子。他们利用感光指甲油的颜色变化，伪造血迹、混淆视线，丈夫假装受伤制造不在场，前女友配合演戏、布置现场，录好的枪声用来误导案发时间。我看到的"血迹"，不过是他们精心设计的视觉陷阱，最深情的丈夫，就是最残忍的凶手。',
            unlock: [],
          },
        ],
        hint: {
          atmosphereHint: '丈夫抬起头看你的眼神，平静得不像一个失去妻子的人。',
          logicHint: '感光指甲油是破解诡计的关键，丈夫的不在场是伪造的。',
          breakHint: '请组合「感光诡计」与「丈夫」。',
        },
      },
    ],
    weakPairs: [
      { pair: ['丈夫', '指甲油'], text: '丈夫没接触过指甲油，但无法排除他的嫌疑。' },
      { pair: ['枪声', '共犯'], text: '枪声可疑，但还缺合谋的直接证据。' },
    ],
    trapProfile: {
      primaryTrapType: 'visual_bias',
      secondaryTrapType: 'time_bias',
      surfaceAssumption: '指甲油瓶口的是真血，凶手是前女友独自行凶',
      hiddenBreak: '"血迹"其实是感光变色指甲油，丈夫和前女友合谋',
    },
    debrief: {
      surfaceTruth: '前女友因嫉妒杀害富家女，丈夫是无辜的受害者',
      realTruth: '丈夫和前女友合谋，利用感光变色指甲油伪造血迹',
      coreBlindSpot: '你默认了"红色=血迹"这个视觉联想',
      bestTrapPair: ['指甲油', '变色'],
      whyYouWereMisled: '暗光下你的色觉判断被劫持了，你分不清指甲油和血',
    },
    truth: '丈夫与前女友合谋，利用感光变色指甲油伪造血迹，混淆案发时间，制造完美不在场。最深情的丈夫，就是最残忍的凶手。',
    failText: '邮轮驶入迷雾，血色指甲油的秘密被大海吞噬，你永远无法揭开这场完美谋杀。',
    maxMistakes: 5,
    maxHints: 3,
  },
  {
    id: 5,
    title: '海滩阴影·替身惊魂',
    theme: '阳光下的罪恶（恐怖认知版）',
    intro: '海滩上女星被杀，所有人都在阳光下。可沙滩上的"丈夫"，帽檐角度不对，坐姿像是刻意模仿。',
    fullText:
      '我在孤岛[海滩]度假，美艳女星在海滩小屋被杀。阳光刺眼，所有人都在海滩上，都有不在场证明。我看到女星的[丈夫]一直坐在沙滩上，从未离开，可我总觉得那个"丈夫"有时帽檐角度不对、坐姿像是刻意模仿，而且小屋的[阴影]里，总有一个和女星长得一模一样的人影。',
    initialWords: [
      { text: '海滩', type: '环境' },
      { text: '丈夫', type: '人物' },
      { text: '阴影', type: '状态' },
    ],
    stages: [
      {
        id: 0,
        goal: 'S0 取证',
        pairs: [
          {
            a: '海滩',
            b: '阴影',
            feedback: '海滩开阔无遮挡，阳光刺眼，小屋的阴影非常隐蔽，人影在阴影中若隐若现，无法看清面容。所有人都在阳光下，无任何作案时间。',
            unlock: [{ text: '替身', type: '物证' }],
          },
        ],
        hint: {
          atmosphereHint: '阴影里又闪过一个轮廓……那个身形，和女星太像了。',
          logicHint: '阴影里的人影不是女星，是替身。阳光和阴影在掩盖关键破绽。',
          breakHint: '请组合「海滩」与「阴影」。',
        },
      },
      {
        id: 1,
        goal: 'S1 初判',
        pairs: [
          {
            a: '丈夫',
            b: '替身',
            feedback: '丈夫全程在阳光下，有多人作证，替身应该是凶手找来的，目的是制造"女星还活着"的假象，为凶手争取作案时间。',
            unlock: [{ text: '强光错觉', type: '状态' }],
          },
        ],
        hint: {
          atmosphereHint: '丈夫的行为过于平静，不像失去妻子的人……远看一致，近想不对。',
          logicHint: '替身的存在和丈夫有关，他的平静是伪装。',
          breakHint: '请组合「丈夫」与「替身」。',
        },
      },
      {
        id: 2,
        goal: 'S2 反转',
        pairs: [
          {
            a: '强光错觉',
            b: '丈夫',
            feedback: '阳光过于刺眼，让我产生了视觉错觉——沙滩上的"丈夫"，其实是替身；真正的丈夫，躲在小屋阴影里，和情妇（假扮女星的替身）合谋，杀死女星后，再和替身互换身份，回到沙滩上，制造完美不在场证明。我看到的"人影"，就是真正的丈夫。',
            unlock: [{ text: '身份互换', type: '诡计' }],
          },
        ],
        hint: {
          atmosphereHint: '强光下你眯着眼看沙滩……帽檐下的脸，你真的看清了吗？',
          logicHint: '强光让你分不清谁是真正的丈夫，替身不止一个。',
          breakHint: '请组合「强光错觉」与「丈夫」。',
        },
      },
      {
        id: 3,
        goal: 'S3 定论',
        pairs: [
          {
            a: '身份互换',
            b: '阴影',
            feedback: '【真相】丈夫与情妇合谋，利用海滩强光制造视觉错觉，让替身假扮自己坐在沙滩上，自己则和情妇（假扮女星）躲在小屋阴影里，杀死女星。杀人后，两人互换身份，真正的丈夫回到沙滩，替身则趁着强光逃离。阳光越是刺眼，越是能掩盖他们的罪行，阴影里的惊魂，才是这场谋杀的真相。',
            unlock: [],
          },
        ],
        hint: {
          atmosphereHint: '阳光消退，阴影扩大，你终于看清了一切。',
          logicHint: '身份互换是破解诡计的关键，阴影掩盖了杀人全过程。',
          breakHint: '请组合「身份互换」与「阴影」。',
        },
      },
    ],
    weakPairs: [
      { pair: ['海滩', '丈夫'], text: '丈夫在海滩上，但无法证明他是替身。' },
      { pair: ['阴影', '替身'], text: '替身躲在阴影里，但还缺身份互换的证据。' },
    ],
    trapProfile: {
      primaryTrapType: 'visual_bias',
      secondaryTrapType: 'identity_bias',
      surfaceAssumption: '丈夫全程在阳光下，不可能是凶手',
      hiddenBreak: '沙滩上的"丈夫"是替身，真正的丈夫在阴影里行凶',
    },
    debrief: {
      surfaceTruth: '替身是外部凶手，丈夫全程在海滩不知情',
      realTruth: '丈夫与情妇利用强光错觉，替身假扮丈夫，完成身份互换杀人',
      coreBlindSpot: '强光下你无法辨别面容细节，替身和真人被你等同了',
      bestTrapPair: ['丈夫', '替身'],
      whyYouWereMisled: '阳光越刺眼，你越看不清，这正是凶手想要的',
    },
    truth: '丈夫与情妇合谋，利用海滩强光制造视觉错觉，替身假扮自己坐在沙滩，自己在阴影中杀人。阳光越刺眼，罪行越隐蔽。',
    failText: '阳光越来越刺眼，阴影里的人影消失不见，海滩上的罪恶永远被掩盖。',
    maxMistakes: 5,
    maxHints: 3,
  },
];

// --- 辅助函数 ---
const parseText = (text, onCollect, collectedWords) => {
  const parts = text.split(/(\[.*?\])/g);
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const word = part.slice(1, -1);
      const isCollected = collectedWords.some(
        (w) => (typeof w === 'string' ? w === word : w.text === word),
      );
      return (
        <button
          key={index}
          type="button"
          onClick={() => !isCollected && onCollect(word)}
          className={`inline-block px-1.5 mx-0.5 rounded-sm transition-all font-bold ${
            isCollected
              ? 'text-red-400/40 cursor-default line-through decoration-red-500/20'
              : 'keyword-uncollected bg-red-900/20 text-red-300 border-b-2 border-red-500/60 hover:bg-red-500 hover:text-white hover:border-red-400 cursor-pointer'
          }`}
        >
          {word}
        </button>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

function createInitialLevelState() {
  return {
    collected: [],
    stage: 0,
    mistakes: 0,
    hintsUsed: 0,
    combinations: [],
    status: 'playing',
    consecutiveErrors: 0,
  };
}

const getWordText = (word) => (typeof word === 'string' ? word : word.text);

function computeRating(levelState, level) {
  const hintsRatio = levelState.hintsUsed / level.maxHints;
  const patienceRatio = (level.maxMistakes - levelState.mistakes) / level.maxMistakes;
  const score = (1 - hintsRatio) * 0.4 + patienceRatio * 0.6;

  if (score >= 0.8) return { rank: '完美结案', desc: '几乎没有被表象误导，直接穿透诡计。', icon: '🏆' };
  if (score >= 0.5) return { rank: '稳健结案', desc: '识破了关键陷阱，但中途产生过合理误判。', icon: '⭐' };
  return { rank: '惊险结案', desc: '几乎完全相信了假解释，最后才强行翻盘。', icon: '🎯' };
}

function computePairOutcome(ls, level, w1, w2) {
  if (ls.status !== 'playing') return null;

  const currentStageData = level.stages[ls.stage];

  // 1. 当前阶段合法组合
  const match = currentStageData.pairs.find(
    (p) => (p.a === w1 && p.b === w2) || (p.a === w2 && p.b === w1),
  );

  if (match) {
    const nextStage = ls.stage + 1;
    const isWin = nextStage >= level.stages.length;
    const unlockWords = match.unlock;

    let feedbackText = match.feedback;
    if (ls.stage === 1 && !isWin) {
      feedbackText = GAMEPLAY_V2.progressionFeedback.s1Prefix + ' ' + feedbackText;
    } else if (ls.stage === 2 && !isWin) {
      feedbackText = GAMEPLAY_V2.progressionFeedback.s2Prefix + ' ' + feedbackText;
    } else if (ls.stage === 3 || isWin) {
      feedbackText = GAMEPLAY_V2.progressionFeedback.s3Prefix + ' ' + feedbackText;
    }

    return {
      level: {
        ...ls,
        stage: nextStage,
        status: isWin ? 'won' : 'playing',
        collected: [...ls.collected, ...unlockWords],
        combinations: [...ls.combinations, { words: [w1, w2], feedback: match.feedback }],
        consecutiveErrors: 0,
      },
      feedback: { type: 'success', text: feedbackText },
    };
  }

  // 2. 未来阶段组合
  const futureStageMatch = level.stages.slice(ls.stage + 1).some((s) =>
    s.pairs.some((p) => (p.a === w1 && p.b === w2) || (p.a === w2 && p.b === w1)),
  );

  // 3. 弱配对
  const weakMatch = level.weakPairs?.find(
    (wp) => (wp.pair[0] === w1 && wp.pair[1] === w2) || (wp.pair[0] === w2 && wp.pair[1] === w1),
  );

  // 4. 其他阶段配对
  const anyStageMatch = level.stages.some(
    (s, idx) =>
      idx !== ls.stage &&
      s.pairs.some((p) => (p.a === w1 && p.b === w2) || (p.a === w2 && p.b === w1)),
  );

  const newMistakes = ls.mistakes + 1;
  const newConsecutiveErrors = ls.consecutiveErrors + 1;
  const isLost = newMistakes >= level.maxMistakes;

  let feedbackType = 'error';
  let feedbackText = '';

  if (futureStageMatch) {
    feedbackType = 'premature';
    feedbackText = '想法不错，但现在还不是时候。推理需要按部就班。';
  } else if (weakMatch) {
    feedbackType = 'weak';
    feedbackText = weakMatch.text;
  } else if (anyStageMatch) {
    feedbackType = 'incomplete';
    feedbackText = '你碰到边了，但还差关键的一环。';
  } else {
    feedbackType = 'invalid';
    feedbackText = '这两者目前看不出关联。';
  }

  return {
    level: {
      ...ls,
      mistakes: newMistakes,
      consecutiveErrors: newConsecutiveErrors,
      status: isLost ? 'lost' : 'playing',
    },
    feedback: { type: feedbackType, text: feedbackText },
  };
}

// --- 主组件 ---
export default function App() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(null);
  const [gameState, setGameState] = useState({});
  const [selectedWords, setSelectedWords] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showRules, setShowRules] = useState(true);
  const [showDebrief, setShowDebrief] = useState(false);
  const [caseBridgeActive, setCaseBridgeActive] = useState(false);
  const [stageRibbon, setStageRibbon] = useState(null);
  const [progressFlash, setProgressFlash] = useState(false);
  const pairClearTimerRef = useRef(null);
  const stageRibbonTimerRef = useRef(null);
  const bridgeTimerRef = useRef(null);

  const clearBridgeTimer = useCallback(() => {
    if (bridgeTimerRef.current) {
      clearTimeout(bridgeTimerRef.current);
      bridgeTimerRef.current = null;
    }
  }, []);

  const openCase = useCallback(
    (idx) => {
      clearBridgeTimer();
      setShowDebrief(false);
      setCaseBridgeActive(true);
      setCurrentLevelIdx(idx);
      bridgeTimerRef.current = window.setTimeout(() => {
        setCaseBridgeActive(false);
        bridgeTimerRef.current = null;
      }, 520);
    },
    [clearBridgeTimer],
  );

  const goToHub = useCallback(() => {
    clearBridgeTimer();
    setCaseBridgeActive(false);
    setCurrentLevelIdx(null);
    setStageRibbon(null);
    if (stageRibbonTimerRef.current) {
      clearTimeout(stageRibbonTimerRef.current);
      stageRibbonTimerRef.current = null;
    }
  }, [clearBridgeTimer]);

  useEffect(
    () => () => {
      clearBridgeTimer();
      if (stageRibbonTimerRef.current) clearTimeout(stageRibbonTimerRef.current);
    },
    [clearBridgeTimer],
  );

  const curLevel = currentLevelIdx !== null ? LEVELS[currentLevelIdx] : null;
  const levelState = useMemo(() => {
    if (curLevel && !gameState[curLevel.id]) {
      return createInitialLevelState();
    }
    return curLevel ? gameState[curLevel.id] : null;
  }, [curLevel, gameState]);

  const updateLevelState = useCallback((updates) => {
    setGameState((prev) => {
      const id = curLevel.id;
      const current = prev[id] ?? createInitialLevelState();
      return { ...prev, [id]: { ...current, ...updates } };
    });
  }, [curLevel]);

  const collectWord = useCallback((word) => {
    if (levelState.status !== 'playing') return;
    const isAlreadyCollected = levelState.collected.some(
      (w) => getWordText(w) === word,
    );
    if (!isAlreadyCollected) {
      const wordDef = curLevel.initialWords.find((iw) => iw.text === word);
      const wordObj = wordDef ? { text: word, type: wordDef.type } : word;
      updateLevelState({ collected: [...levelState.collected, wordObj] });
    }
  }, [levelState, curLevel, updateLevelState]);

  const resolveWordPair = useCallback((w1, w2) => {
    if (pairClearTimerRef.current) {
      clearTimeout(pairClearTimerRef.current);
      pairClearTimerRef.current = null;
    }

    let feedbackToShow = null;
    let hadOutcome = false;
    let ribbonPayload = null;
    setGameState((prev) => {
      const id = curLevel.id;
      const ls = prev[id] ?? createInitialLevelState();
      const outcome = computePairOutcome(ls, curLevel, w1, w2);
      if (!outcome) return prev;
      hadOutcome = true;
      feedbackToShow = outcome.feedback;
      if (
        outcome.feedback.type === 'success' &&
        outcome.level.status !== 'won' &&
        outcome.level.stage > ls.stage
      ) {
        const ns = outcome.level.stage;
        ribbonPayload = {
          goal: curLevel.stages[ns]?.goal ?? '',
          banner: GAMEPLAY_V2.stageBanners[ns] ?? '',
        };
      }
      return { ...prev, [id]: outcome.level };
    });

    if (!hadOutcome) {
      setSelectedWords([]);
      return;
    }

    if (ribbonPayload) {
      if (stageRibbonTimerRef.current) clearTimeout(stageRibbonTimerRef.current);
      setStageRibbon(ribbonPayload);
      setProgressFlash(true);
      window.setTimeout(() => setProgressFlash(false), 950);
      stageRibbonTimerRef.current = window.setTimeout(() => {
        setStageRibbon(null);
        stageRibbonTimerRef.current = null;
      }, 2800);
    }

    setFeedback(feedbackToShow);
    pairClearTimerRef.current = setTimeout(() => {
      setSelectedWords([]);
      setFeedback(null);
      pairClearTimerRef.current = null;
    }, 3500);
  }, [curLevel]);

  const toggleWordSelection = useCallback((word) => {
    if (levelState.status !== 'playing') return;
    if (selectedWords.includes(word)) {
      setSelectedWords((prev) => prev.filter((w) => w !== word));
    } else if (selectedWords.length < 2) {
      const next = [...selectedWords, word];
      setSelectedWords(next);
      if (next.length === 2) {
        resolveWordPair(next[0], next[1]);
      }
    }
  }, [levelState, selectedWords, resolveWordPair]);

  const useHint = useCallback(() => {
    if (levelState.status === 'playing' && levelState.hintsUsed < curLevel.maxHints) {
      const stageHints = curLevel.stages[levelState.stage].hint;
      const hintLevel = Math.min(levelState.hintsUsed, 2);
      const hintKeys = ['atmosphereHint', 'logicHint', 'breakHint'];
      const hintLabels = ['氛围感知', '逻辑引导', '思维破冰'];
      const hintKey = hintKeys[hintLevel];
      const hintMsg = stageHints[hintKey] || stageHints.atmosphereHint;

      setFeedback({ type: 'hint', text: hintMsg, hintLabel: hintLabels[hintLevel] });
      updateLevelState({ hintsUsed: levelState.hintsUsed + 1 });
    }
  }, [levelState, curLevel, updateLevelState]);

  const resetLevel = useCallback(() => {
    setGameState((prev) => {
      const newState = { ...prev };
      delete newState[curLevel.id];
      return newState;
    });
    setSelectedWords([]);
    setFeedback(null);
    setShowDebrief(false);
    setStageRibbon(null);
    setProgressFlash(false);
    if (stageRibbonTimerRef.current) {
      clearTimeout(stageRibbonTimerRef.current);
      stageRibbonTimerRef.current = null;
    }
  }, [curLevel]);

  // ============ 关卡选择页 ============
  if (currentLevelIdx === null) {
    return (
      <div className="film-grain vignette min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center relative">
        <FloatingParticles />
        <div className="ambient-glow" />

        <div className="max-w-2xl w-full relative z-10">
          <header className="text-center mb-12 mt-10">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <Skull size={56} className="text-red-500" />
                <div className="absolute inset-0 blur-xl bg-red-500/20 rounded-full" />
              </div>
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-3">
              <span className="text-red-500">认知诡局</span>
            </h1>
            <p className="text-neutral-600 text-sm font-mono uppercase tracking-[0.3em]">Dark Edition</p>
            <p className="text-neutral-500 text-sm mt-2">阿加莎神作 · 恐怖海龟汤 · 认知陷阱</p>
          </header>

          {showRules && (
            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 mb-10 shadow-2xl">
              <div className="flex justify-between items-start mb-5">
                <h2 className="text-lg font-bold flex items-center gap-2 text-neutral-200">
                  <HelpCircle size={18} className="text-red-400" /> 规则手册
                </h2>
                <button
                  type="button"
                  onClick={() => setShowRules(false)}
                  className="text-neutral-600 hover:text-white transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </div>
              <ul className="space-y-3 text-neutral-400 text-sm">
                <li className="flex gap-3 items-start">
                  <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs font-mono shrink-0">01</span>
                  <span>点击文中的<span className="text-red-300 font-medium">高亮词汇</span>收集线索</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs font-mono shrink-0">02</span>
                  <span>在词库中选择<span className="text-red-300 font-medium">两个词</span>组合，推进4阶段推理</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs font-mono shrink-0">03</span>
                  <span>每关都有<span className="text-violet-300 font-medium">认知陷阱</span>——跳出惯性思维才能破局</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs font-mono shrink-0">04</span>
                  <span>三层提示：<span className="text-amber-300/80">氛围感知</span> → <span className="text-amber-300/80">逻辑引导</span> → <span className="text-amber-300/80">思维破冰</span></span>
                </li>
              </ul>
            </div>
          )}

          <div className="grid gap-3">
            {LEVELS.map((level, idx) => {
              const state = gameState[level.id];
              const trapType = level.trapProfile?.primaryTrapType?.replace('_', ' ');
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => openCase(idx)}
                  className="level-card group relative flex items-center justify-between bg-neutral-900/60 backdrop-blur-sm hover:bg-neutral-800/80 border border-neutral-800/60 p-6 rounded-2xl overflow-hidden text-left"
                >
                  <div className="z-10">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-red-500/80 tracking-wider">CASE #{String(level.id).padStart(3, '0')}</span>
                      {state?.status === 'won' && <CheckCircle2 size={12} className="text-red-400" />}
                      {trapType && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400/60 border border-violet-500/10">
                          {trapType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-red-400 transition-colors mb-0.5">{level.title}</h3>
                    <p className="text-neutral-600 text-xs">{level.theme}</p>
                  </div>
                  {/* 背景装饰 */}
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-red-500/[0.03] to-transparent group-hover:from-red-500/[0.08] transition-all" />
                  <div className="z-10 bg-neutral-800/80 px-4 py-2 rounded-full text-xs font-medium text-neutral-400 group-hover:text-red-300 group-hover:bg-red-500/10 transition-all">
                    {state?.status === 'won' ? '已破解' : '进入推演'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ============ 游戏主界面 ============
  const currentBanner = levelState.stage < curLevel.stages.length
    ? GAMEPLAY_V2.stageBanners[levelState.stage]
    : null;

  const currentGoal = levelState.stage < curLevel.stages.length
    ? curLevel.stages[levelState.stage].goal
    : null;

  return (
    <div
      className={`film-grain vignette min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row h-screen overflow-hidden relative ${caseBridgeActive ? 'bridge-dampen' : ''}`}
    >
      <FloatingParticles />

      {/* ======= 侧边栏 ======= */}
      <div
        className={`w-full md:w-80 bg-neutral-900/80 backdrop-blur-sm border-b md:border-b-0 md:border-r border-neutral-800/50 flex flex-col relative z-10 ${caseBridgeActive ? 'bridge-enter-sidebar' : ''}`}
      >
        <div className="p-4 border-b border-neutral-800/50 flex justify-between items-center">
          <button
            type="button"
            onClick={goToHub}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-bold text-sm text-neutral-300">{curLevel.title}</h2>
          <button
            type="button"
            onClick={resetLevel}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-600 hover:text-white"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* 阶段进度 */}
          <div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-600 mb-2 uppercase tracking-widest">
              <span>{currentGoal || '完成'}</span>
              <span>{levelState.stage}/{curLevel.stages.length}</span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-red-500 progress-bar-fill rounded-full ${progressFlash ? 'progress-flash-once' : ''}`}
                style={{ width: `${(levelState.stage / curLevel.stages.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 阶段 Banner */}
          {currentBanner && levelState.status === 'playing' && (
            <div className="text-xs text-neutral-500 italic border-l-2 border-red-500/20 pl-3 py-1 leading-relaxed">
              {currentBanner}
            </div>
          )}

          {/* 认知陷阱标签 */}
          {curLevel.trapProfile && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400/70 border border-violet-500/15 font-mono">
                {curLevel.trapProfile.primaryTrapType.replace('_', ' ')}
              </span>
              {curLevel.trapProfile.secondaryTrapType && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400/70 border border-cyan-500/15 font-mono">
                  {curLevel.trapProfile.secondaryTrapType.replace('_', ' ')}
                </span>
              )}
            </div>
          )}

          {/* 理据 */}
          <div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-600 mb-2 uppercase tracking-widest">
              <span>理据</span>
              <span className={levelState.mistakes >= curLevel.maxMistakes - 1 ? 'text-red-400' : ''}>
                {curLevel.maxMistakes - levelState.mistakes}/{curLevel.maxMistakes}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: curLevel.maxMistakes }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-sm transition-all duration-500 ${
                    i < levelState.mistakes
                      ? 'bg-neutral-800/50'
                      : 'bg-red-500/70 shadow-[0_0_6px_rgba(239,68,68,0.3)]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 提示按钮 */}
          <button
            type="button"
            onClick={useHint}
            disabled={levelState.hintsUsed >= curLevel.maxHints || levelState.status !== 'playing'}
            className={`w-full py-3.5 px-4 border rounded-xl flex items-center justify-between transition-all disabled:opacity-20 disabled:cursor-not-allowed ${
              levelState.consecutiveErrors >= 2 && levelState.status === 'playing'
                ? 'bg-amber-500/10 border-amber-400/50 animate-pulse shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]'
                : 'bg-amber-500/5 border-amber-500/15 hover:bg-amber-500/10 hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${levelState.consecutiveErrors >= 2 ? 'bg-amber-400' : 'bg-amber-500/80'} text-neutral-900`}>
                <Lightbulb size={16} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-amber-500/90">寻求线索</p>
                <p className="text-[9px] text-amber-500/40 font-mono">
                  {curLevel.maxHints - levelState.hintsUsed} remaining
                </p>
              </div>
            </div>
            {levelState.consecutiveErrors >= 2 && levelState.status === 'playing' && (
              <span className="text-[9px] text-amber-400 animate-pulse font-mono">USE</span>
            )}
          </button>

          {/* 逻辑链条 */}
          {levelState.combinations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                <History size={12} /> 逻辑链条
              </h4>
              <div className="space-y-2">
                {levelState.combinations.map((c, i) => (
                  <div key={i} className="text-xs p-3 bg-neutral-800/30 rounded-lg border-l-2 border-red-500/50">
                    <p className="text-red-400/80 font-bold mb-1 text-[11px]">
                      {c.words[0]} + {c.words[1]}
                    </p>
                    <p className="text-neutral-500 italic line-clamp-2 leading-relaxed">{c.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======= 主游戏区 ======= */}
      <div
        className={`flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(127,29,29,0.06)_0%,_transparent_50%)] ${caseBridgeActive ? 'bridge-enter-main' : ''}`}
      >
        <div className="flex-1 p-6 md:p-12 overflow-y-auto max-w-4xl mx-auto w-full relative z-10">
          <div className="mb-12">
            <div className="mb-8">
              <p className="text-[10px] font-mono text-red-500/50 uppercase tracking-[0.3em] mb-1">Case #{String(curLevel.id).padStart(3, '0')}</p>
              <h1 className="text-3xl font-black mb-1 tracking-tight">{curLevel.title}</h1>
              <p className="text-neutral-600 text-sm">{curLevel.theme}</p>
            </div>

            {/* 案件陈述 */}
            <div className="bg-neutral-800/20 p-6 rounded-xl border border-neutral-800/40 mb-10">
              <div className="flex items-center gap-2 mb-4 text-red-400/60 text-[10px] font-mono uppercase tracking-widest">
                <Skull size={12} />
                案件陈述
              </div>
              {caseBridgeActive ? (
                <div
                  className="min-h-[80px] w-full animate-pulse rounded-lg bg-neutral-800/30"
                  aria-hidden
                />
              ) : (
                <TypewriterIntro key={curLevel.id} text={curLevel.intro} charDelayMs={38} />
              )}
            </div>

            {/* 正文 */}
            <div className="mb-4 flex items-center gap-2 text-xs text-neutral-600">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              点击高亮词收集线索
            </div>
            <div className="text-xl md:text-2xl leading-relaxed text-neutral-300">
              {parseText(curLevel.fullText, collectWord, levelState.collected)}
            </div>
          </div>

          {/* 词库 */}
          <div className="mt-10 border-t border-neutral-800/30 pt-8">
            <h3 className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Brain size={14} /> 思维词库
              <span className="text-neutral-700 normal-case">— 选择两个词组合</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {levelState.collected.map((word, idx) => {
                const wordText = typeof word === 'string' ? word : word.text;
                const wordType = typeof word === 'string' ? null : word.type;
                const typeInfo = wordType ? WORD_TYPES[wordType] : null;
                const typeColor = wordType ? TYPE_COLORS[wordType] : null;
                const isSelected = selectedWords.includes(wordText);

                return (
                  <button
                    key={wordText + idx}
                    type="button"
                    onClick={() => toggleWordSelection(wordText)}
                    className={`word-chip px-4 py-2 rounded-lg border text-sm font-medium ${
                      isSelected
                        ? 'word-chip-selected bg-red-500 border-red-400 text-white'
                        : `bg-neutral-900/80 hover:bg-neutral-800 ${
                            typeColor
                              ? `${typeColor.border} hover:${typeColor.bg}`
                              : 'border-neutral-800 hover:border-neutral-600'
                          } text-neutral-300`
                    }`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {wordText}
                    {typeInfo && (
                      <span className={`ml-1.5 text-[10px] ${isSelected ? 'opacity-80' : typeColor?.text || 'text-neutral-500'}`}>
                        {typeInfo.icon}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {stageRibbon && (
          <div
            className="stage-ribbon pointer-events-none fixed top-[5.5rem] left-1/2 z-[45] w-[min(92vw,28rem)] px-3"
            role="status"
            aria-live="polite"
          >
            <div className="rounded-xl border border-red-500/35 bg-neutral-950/95 px-4 py-3 shadow-2xl backdrop-blur-md">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-red-400/85">
                {stageRibbon.goal}
              </p>
              <p className="text-sm leading-relaxed text-neutral-200">{stageRibbon.banner}</p>
            </div>
          </div>
        )}

        {/* ======= 反馈通知 ======= */}
        {feedback && (
          <div className="feedback-notification absolute top-8 left-1/2 w-full max-w-lg px-4 z-50">
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 shadow-2xl backdrop-blur-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
                  : feedback.type === 'hint'
                    ? 'bg-amber-950/90 border-amber-500/50 text-amber-100'
                    : feedback.type === 'weak'
                      ? 'bg-orange-950/90 border-orange-500/50 text-orange-100'
                      : feedback.type === 'premature' || feedback.type === 'incomplete'
                        ? 'bg-blue-950/90 border-blue-500/50 text-blue-100'
                        : 'bg-red-950/90 border-red-500/50 text-red-100'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {feedback.type === 'success' ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : feedback.type === 'hint' ? (
                  <Lightbulb size={18} className="text-amber-400" />
                ) : feedback.type === 'weak' ? (
                  <Eye size={18} className="text-orange-400" />
                ) : feedback.type === 'premature' || feedback.type === 'incomplete' ? (
                  <HelpCircle size={18} className="text-blue-400" />
                ) : (
                  <XCircle size={18} className="text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[10px] uppercase tracking-wider mb-1 opacity-60">
                  {feedback.type === 'success'
                    ? '推理成立'
                    : feedback.type === 'hint'
                      ? feedback.hintLabel || '提示线索'
                      : feedback.type === 'weak'
                        ? '方向可疑'
                        : feedback.type === 'premature'
                          ? '阶段未到'
                          : feedback.type === 'incomplete'
                            ? '证据不足'
                            : '推理受阻'}
                </p>
                <p className="text-sm leading-relaxed opacity-90">{feedback.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* ======= 胜负弹窗 ======= */}
        {(levelState.status === 'won' || levelState.status === 'lost') && (
          <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="modal-content max-w-lg w-full bg-neutral-900/90 border border-neutral-800/50 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
              {levelState.status === 'won' ? (
                showDebrief && curLevel.debrief ? (
                  /* === 复盘页 === */
                  <>
                    <div className="modal-stagger-debrief-head mb-8 flex items-center gap-3">
                      <div className="bg-violet-500/20 p-3 rounded-full border border-violet-500/20">
                        <Brain size={24} className="text-violet-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-white">认知复盘</h2>
                        <p className="text-violet-400/60 font-mono text-[10px] uppercase tracking-wider">Cognitive Debrief</p>
                      </div>
                    </div>

                    <div className="modal-stagger-body mb-8 space-y-3">
                      <div className="debrief-card bg-neutral-800/30 p-4 rounded-xl border border-neutral-700/30" style={{ animationDelay: '0s' }}>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1.5 font-mono">你最初相信的</p>
                        <p className="text-neutral-300 text-sm leading-relaxed">{curLevel.debrief.surfaceTruth}</p>
                      </div>
                      <div className="debrief-card bg-red-950/20 p-4 rounded-xl border border-red-500/10" style={{ animationDelay: '0.1s' }}>
                        <p className="text-[9px] text-red-400/60 uppercase tracking-widest mb-1.5 font-mono">最终真相</p>
                        <p className="text-neutral-200 text-sm leading-relaxed">{curLevel.debrief.realTruth}</p>
                      </div>
                      <div className="debrief-card bg-violet-950/20 p-4 rounded-xl border border-violet-500/10" style={{ animationDelay: '0.2s' }}>
                        <p className="text-[9px] text-violet-400/60 uppercase tracking-widest mb-1.5 font-mono">核心盲区</p>
                        <p className="text-neutral-200 text-sm leading-relaxed">{curLevel.debrief.coreBlindSpot}</p>
                      </div>
                      <div className="debrief-card bg-amber-950/20 p-4 rounded-xl border border-amber-500/10" style={{ animationDelay: '0.3s' }}>
                        <p className="text-[9px] text-amber-400/60 uppercase tracking-widest mb-1.5 font-mono">你为什么会上当</p>
                        <p className="text-neutral-200 text-sm leading-relaxed">{curLevel.debrief.whyYouWereMisled}</p>
                      </div>
                      {curLevel.debrief.bestTrapPair && (
                        <div className="debrief-card flex items-center gap-2 text-[10px] text-neutral-600 pt-2" style={{ animationDelay: '0.4s' }}>
                          <span className="font-mono uppercase tracking-wider">Best trap:</span>
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-400/70 rounded font-medium">
                            {curLevel.debrief.bestTrapPair[0]} + {curLevel.debrief.bestTrapPair[1]}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={goToHub}
                      className="modal-stagger-actions w-full py-3.5 bg-red-500 hover:bg-red-400 text-neutral-900 font-bold rounded-xl transition-all text-sm"
                    >
                      返回案例列表
                    </button>
                  </>
                ) : (
                  /* === 通关页 === */
                  <>
                    <div className="mb-8 text-center">
                      <div className="modal-stagger-icon mb-5 flex justify-center">
                        <div className="relative">
                          <div className="bg-red-500/20 p-5 rounded-full border border-red-500/20">
                            <Trophy size={40} className="text-red-400" />
                          </div>
                          <div className="absolute inset-0 blur-2xl bg-red-500/20 rounded-full" />
                        </div>
                      </div>
                      <div className="modal-stagger-title">
                        <h2 className="mb-1 text-3xl font-black text-white">推演成功</h2>
                        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-500/60">Truth Reached</p>
                      </div>
                    </div>

                    <div className="modal-stagger-body mb-6 text-center">
                      <span className="inline-flex items-center gap-2 rounded-full border border-red-500/15 bg-red-500/10 px-4 py-1.5 text-sm font-bold text-red-400">
                        {computeRating(levelState, curLevel).icon} {computeRating(levelState, curLevel).rank}
                      </span>
                      <p className="mt-1.5 text-[11px] text-neutral-500">{computeRating(levelState, curLevel).desc}</p>
                    </div>

                    <div className="modal-stagger-body mb-6 rounded-xl border border-neutral-700/20 bg-neutral-800/30 p-5">
                      <p className="text-sm italic leading-relaxed text-neutral-300">&quot;{curLevel.truth}&quot;</p>
                    </div>

                    <div className="modal-stagger-actions grid grid-cols-2 gap-3">
                      {curLevel.debrief && (
                        <button
                          type="button"
                          onClick={() => setShowDebrief(true)}
                          className="py-3 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 font-bold rounded-xl transition-all border border-violet-500/15 flex items-center justify-center gap-2 text-sm"
                        >
                          <Eye size={16} /> 认知复盘
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={goToHub}
                        className={`py-3 bg-red-500 hover:bg-red-400 text-neutral-900 font-bold rounded-xl transition-all text-sm ${!curLevel.debrief ? 'col-span-2' : ''}`}
                      >
                        返回列表
                      </button>
                    </div>
                  </>
                )
              ) : (
                /* === 失败页 === */
                <>
                  <div className="mb-6 text-center">
                    <div className="modal-stagger-icon mb-5 flex justify-center">
                      <div className="relative">
                        <div className="bg-red-500/20 p-5 rounded-full border border-red-500/20">
                          <AlertCircle size={40} className="text-red-400" />
                        </div>
                        <div className="absolute inset-0 blur-2xl bg-red-500/20 rounded-full" />
                      </div>
                    </div>
                    <div className="modal-stagger-title">
                      <h2 className="mb-1 text-3xl font-black text-white">理据耗尽</h2>
                      <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-red-500/60">Failed to Connect</p>
                    </div>
                    <p className="modal-stagger-body mx-auto max-w-sm text-sm italic leading-relaxed text-neutral-500">
                      {curLevel.failText}
                    </p>
                  </div>
                  <div className="modal-stagger-actions mt-8 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={goToHub}
                      className="py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition-all text-sm"
                    >
                      返回列表
                    </button>
                    <button
                      type="button"
                      onClick={resetLevel}
                      className="py-3 bg-red-500 hover:bg-red-400 text-neutral-900 font-bold rounded-xl transition-all text-sm"
                    >
                      再次尝试
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
