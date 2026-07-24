import { normalizeDesignedHtml } from "./html-design-contract.js";
import { MASTER_DESIGN_REFERENCE } from "./master-design-reference.js";

function masterCss() {
  const match = MASTER_DESIGN_REFERENCE.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
  if (!match) throw new Error("The master design reference does not contain a style block.");
  return match[1].trim();
}

export const MASTER_DESIGN_CSS = masterCss();

export function applyMasterDesignCss(htmlInput) {
  let html = normalizeDesignedHtml(htmlInput);
  html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  const style = `<style data-jang-master-design="2026-07">\n${MASTER_DESIGN_CSS}\n</style>`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${style}\n</head>`);
  if (/<html\b[^>]*>/i.test(html)) return html.replace(/<html\b[^>]*>/i, (root) => `${root}<head><meta charset="UTF-8">${style}</head>`);
  return html;
}
