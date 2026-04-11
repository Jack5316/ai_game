/**
 * Thought Alchemy — 引擎：多故事切换、收集、双选、合成判定
 */
import {
  CASES,
  GAME_RULES,
  resolveHintForCase,
} from "./data.js";

const STORAGE_CASE = "thought-alchemy-case";

/** @param {string} key */
function normalizeRecipeKey(key) {
  const parts = key.split("+").map((s) => s.trim()).filter(Boolean);
  if (parts.length !== 2) return key;
  return parts.sort((a, b) => a.localeCompare(b, "zh-CN")).join("+");
}

/** @type {Record<string, import('./data.js').Recipe>} */
let RECIPES_NORMALIZED = {};

function rebuildRecipesNormalized() {
  RECIPES_NORMALIZED = {};
  const c = CASES[activeCaseIndex];
  for (const [k, v] of Object.entries(c.recipes)) {
    RECIPES_NORMALIZED[normalizeRecipeKey(k)] = v;
  }
}

function getCurrentCase() {
  return CASES[activeCaseIndex];
}

let activeCaseIndex = 0;

function initCaseIndexFromUrlOrStorage() {
  const params = new URLSearchParams(location.search);
  const fromUrl = parseInt(params.get("c") ?? "", 10);
  if (Number.isFinite(fromUrl) && fromUrl >= 0 && fromUrl < CASES.length) {
    activeCaseIndex = fromUrl;
    return;
  }
  try {
    const s = localStorage.getItem(STORAGE_CASE);
    if (s != null) {
      const j = parseInt(s, 10);
      if (Number.isFinite(j) && j >= 0 && j < CASES.length) activeCaseIndex = j;
    }
  } catch (_) {
    /* ignore */
  }
}

const els = {
  caseNav: /** @type {HTMLElement | null} */ (
    document.getElementById("case-nav")
  ),
  caseTitle: /** @type {HTMLElement | null} */ (
    document.getElementById("case-title")
  ),
  storyInner: /** @type {HTMLElement} */ (
    document.querySelector("#story-board .story-board__inner")
  ),
  faultMeter: /** @type {HTMLElement} */ (document.getElementById("fault-meter")),
  inventory: /** @type {HTMLElement} */ (document.getElementById("inventory")),
  feedback: /** @type {HTMLElement} */ (document.getElementById("feedback")),
  restartBtn: /** @type {HTMLButtonElement | null} */ (
    document.getElementById("btn-restart")
  ),
  hintBtn: /** @type {HTMLButtonElement | null} */ (
    document.getElementById("btn-hint")
  ),
};

const FEEDBACK_INTRO_HTML =
  '<span class="feedback-placeholder">先点顶部 <strong>emoji</strong> 选故事；再点文中<strong>青色词</strong>入库，下方<strong>两词碰撞</strong>。顺序要解锁；失误扣<strong>理据</strong>。<strong>锦囊</strong>次数有限。</span>';

/** @type {Set<string>} */
const inventory = new Set();
/** @type {Set<string>} */
const completedRecipeIds = new Set();
/** @type {string[]} */
let selected = [];
let gameWon = false;
let gameLost = false;
let faultsUsed = 0;
let hintsRemaining = 0;
/** @type {ReturnType<typeof setTimeout> | 0} */
let selectionClearTimer = 0;

function renderFaultMeter() {
  const max = GAME_RULES.maxFaults;
  const left = Math.max(0, max - faultsUsed);
  const dots = Array.from({ length: max }, (_, i) =>
    i < left
      ? '<span class="fault-meter__dot fault-meter__dot--ok" aria-hidden="true">●</span>'
      : '<span class="fault-meter__dot fault-meter__dot--gone" aria-hidden="true">○</span>'
  ).join("");
  els.faultMeter.innerHTML = `<span class="fault-meter__label">理据余量</span><span class="fault-meter__dots">${dots}</span><span class="fault-meter__count">${left}／${max}</span>`;
}

function renderHintButton() {
  if (!els.hintBtn) return;
  const max = GAME_RULES.maxHints ?? 0;
  const left = hintsRemaining;
  els.hintBtn.textContent = `锦囊（${left}／${max}）`;
  const terminal = gameWon || gameLost;
  const exhausted = left <= 0;
  els.hintBtn.disabled = terminal || exhausted;
  els.hintBtn.setAttribute(
    "aria-label",
    exhausted && !terminal
      ? "锦囊已用尽"
      : `查阅锦囊，还可使用${left}次`
  );
}

function onHintClick() {
  if (gameWon || gameLost || hintsRemaining <= 0) return;
  cancelSelectionClearTimer();
  selected = [];
  renderInventory();

  const payload = resolveHintForCase(getCurrentCase(), {
    has: (w) => inventory.has(w),
    completedIds: completedRecipeIds,
    gameWon,
    gameLost,
  });

  if (!payload) {
    setFeedback("【锦囊】此刻没有额外指引可给。", "feedback--hint");
    renderHintButton();
    return;
  }

  hintsRemaining -= 1;
  setFeedback(`【锦囊】${payload.text}`, "feedback--hint");
  renderHintButton();
}

function registerFaultAndMaybeLose() {
  if (gameWon || gameLost) return false;
  faultsUsed += 1;
  renderFaultMeter();
  if (faultsUsed >= GAME_RULES.maxFaults) {
    gameLost = true;
    selected = [];
    document.body.classList.add("game-lost");
    setFeedback(GAME_RULES.gameOverText, "feedback--lose");
    renderInventory();
    renderHintButton();
    return true;
  }
  return false;
}

function renderInventory() {
  els.inventory.innerHTML = "";
  const words = [...inventory].sort((a, b) => a.localeCompare(b, "zh-CN"));
  for (const w of words) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag";
    btn.dataset.word = w;
    btn.textContent = w;
    if (selected.includes(w)) btn.classList.add("tag--selected");
    if (gameLost || gameWon) btn.disabled = true;
    btn.addEventListener("click", () => onTagClick(w));
    els.inventory.appendChild(btn);
  }
}

function setFeedback(html, className = "") {
  els.feedback.className = "feedback" + (className ? ` ${className}` : "");
  els.feedback.innerHTML = html;
}

function cancelSelectionClearTimer() {
  if (selectionClearTimer) {
    clearTimeout(selectionClearTimer);
    selectionClearTimer = 0;
  }
}

function clearSelectionSoon() {
  cancelSelectionClearTimer();
  selectionClearTimer = window.setTimeout(() => {
    selectionClearTimer = 0;
    selected = [];
    renderInventory();
  }, 1000);
}

function checkCombination() {
  if (selected.length !== 2 || gameWon || gameLost) return;
  const key = normalizeRecipeKey(`${selected[0]}+${selected[1]}`);
  const recipe = RECIPES_NORMALIZED[key];

  if (!recipe) {
    setFeedback("毫无关联的思绪…", "feedback--muted");
    if (registerFaultAndMaybeLose()) return;
    clearSelectionSoon();
    return;
  }

  const reqs = recipe.requires ?? [];
  const chainOk = reqs.every((id) => completedRecipeIds.has(id));
  if (!chainOk) {
    const msg =
      recipe.lockedText ??
      "这条推论来得太早：先让别的思绪尘埃落定。";
    setFeedback(msg, "feedback--locked");
    if (registerFaultAndMaybeLose()) return;
    clearSelectionSoon();
    return;
  }

  if (recipe.id) completedRecipeIds.add(recipe.id);

  setFeedback(recipe.text, recipe.isWin ? "feedback--win" : "");

  if (recipe.isWin) {
    gameWon = true;
    selected = [];
    document.body.classList.add("game-won");
    renderInventory();
    renderHintButton();
    return;
  }

  if (recipe.newWord && !inventory.has(recipe.newWord)) {
    inventory.add(recipe.newWord);
  }

  selected = [];
  renderInventory();
}

function onTagClick(word) {
  if (gameWon || gameLost) return;
  const i = selected.indexOf(word);
  if (i >= 0) {
    selected.splice(i, 1);
    renderInventory();
    return;
  }
  if (selected.length >= 2) {
    selected = [selected[1], word];
  } else {
    selected.push(word);
  }
  renderInventory();
  if (selected.length === 2) checkCombination();
}

function onClueClick(word) {
  if (gameWon || gameLost) return;
  if (inventory.has(word)) return;
  inventory.add(word);
  renderInventory();
}

function bindStoryClicks() {
  els.storyInner.querySelectorAll(".clue").forEach((node) => {
    node.addEventListener("click", () => {
      const w = node.getAttribute("data-word");
      if (w) onClueClick(w);
    });
  });
}

function updateCaseNavUI() {
  if (!els.caseNav) return;
  els.caseNav.querySelectorAll(".case-nav__btn").forEach((btn, i) => {
    const on = i === activeCaseIndex;
    btn.classList.toggle("case-nav__btn--active", on);
    btn.setAttribute("aria-current", on ? "true" : "false");
  });
}

function updateCaseTitle() {
  if (!els.caseTitle) return;
  const c = getCurrentCase();
  els.caseTitle.textContent = `${c.emoji} ${c.title} · ${c.tone}`;
}

function buildCaseNav() {
  if (!els.caseNav) return;
  els.caseNav.innerHTML = CASES.map(
    (c, i) =>
      `<button type="button" class="case-nav__btn" data-case-index="${i}" aria-label="${c.title}，${c.tone}" title="${c.title}">${c.emoji}</button>`
  ).join("");
  els.caseNav.onclick = (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const btn = t.closest("[data-case-index]");
    if (!btn) return;
    const i = parseInt(btn.getAttribute("data-case-index") ?? "-1", 10);
    if (!Number.isFinite(i) || i < 0 || i >= CASES.length) return;
    setActiveCase(i);
  };
}

/** 切换故事：持久化、重建配方表、整案重来 */
function setActiveCase(i) {
  if (i === activeCaseIndex) return;
  activeCaseIndex = i;
  try {
    localStorage.setItem(STORAGE_CASE, String(i));
  } catch (_) {
    /* ignore */
  }
  rebuildRecipesNormalized();
  updateCaseNavUI();
  updateCaseTitle();
  resetGame();
}

function resetGame() {
  cancelSelectionClearTimer();
  inventory.clear();
  completedRecipeIds.clear();
  selected = [];
  gameWon = false;
  gameLost = false;
  faultsUsed = 0;
  hintsRemaining = GAME_RULES.maxHints ?? 0;
  document.body.classList.remove("game-won", "game-lost");
  els.storyInner.innerHTML = getCurrentCase().storyHtml;
  bindStoryClicks();
  renderFaultMeter();
  renderHintButton();
  setFeedback(FEEDBACK_INTRO_HTML);
  renderInventory();
}

function init() {
  if (!els.storyInner || !els.faultMeter || !els.inventory || !els.feedback) {
    console.error("Thought Alchemy: 缺少破案页 DOM（请打开 game.html）。");
    return;
  }
  initCaseIndexFromUrlOrStorage();
  buildCaseNav();
  rebuildRecipesNormalized();
  updateCaseNavUI();
  updateCaseTitle();
  if (els.restartBtn) {
    els.restartBtn.addEventListener("click", () => resetGame());
  }
  if (els.hintBtn) {
    els.hintBtn.addEventListener("click", () => onHintClick());
  }
  resetGame();
}

init();
