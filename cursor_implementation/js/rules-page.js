/**
 * 规则首页：从 data 注入正文，避免与破案页重复维护文案
 */
import { getRulesPageHtml } from "./data.js";

const root = document.getElementById("rules-root");
if (root) root.innerHTML = getRulesPageHtml();
