import { verifyPptxPackage } from "./pptx-exporter.js";

const PAGE_WIDTH_PX = 900;
const PAGE_HEIGHT_PX = 1170;
const PX_TO_IN = 0.01;
const POINTS_PER_PX = 0.75;
const LAYOUT_TOLERANCE_PX = 2;
const TEXT_SELECTOR = [
  "[data-source-id]", "h1", "h2", "h3", "h4", "p", "li", "figcaption", "caption", "small",
  ".course-code", ".term-tag", ".course-label", ".page-title", ".category-tag", ".footer-left", ".footer-center",
  ".page-number", ".cover-eyebrow", ".meta-label", ".meta-value", ".legend-title", ".legend-item", ".note-label",
  ".takeaway-header", ".diagram-label", ".diagram-best-for", ".toc-header", ".def-term", ".def-desc", ".qa-question",
  ".qa-answer", ".compare-head", ".note-icon", ".takeaway-icon", ".end-icon-mark", ".end-headline", ".end-subtext",
].join(",");

const clean = (value) => String(value ?? "").replace(/\u0000/g, "").trim();
const unique = (values) => [...new Set(values.filter(Boolean))];

function shape(deck, name) {
  return deck?.ShapeType?.[name] || globalThis.PptxGenJS?.ShapeType?.[name] || name;
}

function encodeSvg(svg) {
  const bytes = new TextEncoder().encode(svg);
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

function cssNumber(value) {
  const result = Number.parseFloat(String(value || "0"));
  return Number.isFinite(result) ? result : 0;
}

function cssColor(value) {
  const source = String(value || "").trim().toLowerCase();
  if (!source || source === "transparent") return null;
  const hex = source.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let raw = hex[1];
    if (raw.length === 3 || raw.length === 4) raw = raw.split("").map((item) => item + item).join("");
    const alpha = raw.length === 8 ? Number.parseInt(raw.slice(6, 8), 16) / 255 : 1;
    return { color: raw.slice(0, 6).toUpperCase(), transparency: Math.round((1 - alpha) * 100) };
  }
  const rgb = source.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+)%?)?\s*\)$/i);
  if (!rgb) return null;
  const values = rgb.slice(1, 4).map((item) => Math.max(0, Math.min(255, Math.round(Number(item)))));
  let alpha = rgb[4] === undefined ? 1 : Number(rgb[4]);
  if (String(rgb[4] || "").includes("%")) alpha /= 100;
  alpha = Math.max(0, Math.min(1, alpha));
  return { color: values.map((item) => item.toString(16).padStart(2, "0")).join("").toUpperCase(), transparency: Math.round((1 - alpha) * 100) };
}

function computedColor(style, fallback = "111110") {
  return cssColor(style?.color)?.color || fallback;
}

function fontFace(style) {
  const family = String(style?.fontFamily || "").toLowerCase();
  if (family.includes("consolas") || family.includes("mono")) return "Consolas";
  if (family.includes("georgia") || family.includes("serif")) return "Georgia";
  if (family.includes("tahoma") || style?.direction === "rtl") return "Tahoma";
  if (family.includes("arial")) return "Arial";
  return "Aptos";
}

function elementBox(element, pageRect) {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left - pageRect.left,
    top: rect.top - pageRect.top,
    width: rect.width,
    height: rect.height,
    x: (rect.left - pageRect.left) * PX_TO_IN,
    y: (rect.top - pageRect.top) * PX_TO_IN,
    w: rect.width * PX_TO_IN,
    h: rect.height * PX_TO_IN,
  };
}

function visible(element) {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) > 0.001 && rect.width > 0.25 && rect.height > 0.25;
}

function actualText(element) {
  return String(element.innerText ?? element.textContent ?? "").replace(/\u00a0/g, " ").replace(/[ \t]+\n/g, "\n").trim();
}

function manifestForVerification(manifest = {}) {
  return {
    sourceUnits: (Array.isArray(manifest.units) ? manifest.units : []).map((unit) => ({
      id: clean(unit?.id),
      page: Number(unit?.sourcePage || unit?.page || 0),
      text: clean(unit?.verbatimText || unit?.text),
    })).filter((unit) => unit.text),
    expectedAssets: (Array.isArray(manifest.assets) ? manifest.assets : []).map((asset) => clean(asset?.id || asset?.occurrenceId)).filter(Boolean),
  };
}

export function hydrateHtmlAssetSources(htmlInput, assets = []) {
  const sourceById = new Map((Array.isArray(assets) ? assets : []).map((asset) => [clean(asset?.id), clean(asset?.source)]));
  return String(htmlInput || "").replace(/<img\b([^>]*data-asset-id\s*=\s*["']([^"']+)["'][^>]*)>/gi, (all, attrs, id) => {
    const source = sourceById.get(id);
    if (!source || !/^data:image\//i.test(source)) return all;
    const withoutSrc = attrs.replace(/\s+src\s*=\s*["'][^"']*["']/gi, "");
    return `<img${withoutSrc} src="${source}">`;
  });
}

async function renderHtml(html) {
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-same-origin");
  frame.setAttribute("aria-hidden", "true");
  Object.assign(frame.style, {
    position: "fixed",
    left: "-20000px",
    top: "0",
    width: `${PAGE_WIDTH_PX + 80}px`,
    height: `${PAGE_HEIGHT_PX + 80}px`,
    border: "0",
    opacity: "0",
    pointerEvents: "none",
  });
  document.body.appendChild(frame);
  const loaded = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("The verified HTML preview did not finish loading.")), 15000);
    frame.addEventListener("load", () => { clearTimeout(timeout); resolve(); }, { once: true });
  });
  frame.srcdoc = html;
  await loaded;
  const doc = frame.contentDocument;
  if (!doc) { frame.remove(); throw new Error("The verified HTML could not be rendered for PowerPoint conversion."); }
  await doc.fonts?.ready?.catch(() => {});
  await Promise.all([...doc.images].map((image) => image.complete
    ? Promise.resolve()
    : new Promise((resolve) => {
      const finish = () => resolve();
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
      setTimeout(finish, 8000);
    })));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return { frame, doc };
}

export function inspectRenderedLecture(doc) {
  const pages = [...doc.querySelectorAll("article.page")];
  const issues = [];
  const pageReports = pages.map((page, pageIndex) => {
    const rect = page.getBoundingClientRect();
    const overflowX = page.scrollWidth > page.clientWidth + LAYOUT_TOLERANCE_PX;
    const overflowY = page.scrollHeight > page.clientHeight + LAYOUT_TOLERANCE_PX;
    if (Math.abs(rect.width - PAGE_WIDTH_PX) > LAYOUT_TOLERANCE_PX || Math.abs(rect.height - PAGE_HEIGHT_PX) > LAYOUT_TOLERANCE_PX) {
      issues.push({ type: "page-size", page: pageIndex + 1, width: rect.width, height: rect.height });
    }
    if (overflowX || overflowY) issues.push({ type: "page-overflow", page: pageIndex + 1, overflowX, overflowY, scrollWidth: page.scrollWidth, scrollHeight: page.scrollHeight });
    for (const element of page.querySelectorAll("*")) {
      if (!visible(element) || element.closest("defs, marker")) continue;
      const child = element.getBoundingClientRect();
      if (child.left < rect.left - LAYOUT_TOLERANCE_PX || child.top < rect.top - LAYOUT_TOLERANCE_PX || child.right > rect.right + LAYOUT_TOLERANCE_PX || child.bottom > rect.bottom + LAYOUT_TOLERANCE_PX) {
        issues.push({ type: "element-out-of-bounds", page: pageIndex + 1, tag: element.tagName.toLowerCase(), className: element.getAttribute("class") || "", sourceId: element.getAttribute("data-source-id") || "" });
      }
      const text = actualText(element);
      if (text && !element.closest("svg") && element.scrollHeight > element.clientHeight + 2 && element.clientHeight > 0) {
        issues.push({ type: "text-overflow", page: pageIndex + 1, tag: element.tagName.toLowerCase(), className: element.getAttribute("class") || "", sourceId: element.getAttribute("data-source-id") || "" });
      }
    }
    return { page: pageIndex + 1, width: rect.width, height: rect.height, overflowX, overflowY };
  });
  return { valid: pages.length > 0 && issues.length === 0, pageCount: pages.length, pages: pageReports, issues };
}

function firstGradient(value) {
  const source = String(value || "");
  const start = source.search(/(?:linear|radial)-gradient\(/i);
  if (start < 0) return "";
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === "(") depth += 1;
    else if (source[index] === ")") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return "";
}

function gradientSvg(width, height, style, radius = 0, border = null, borderWidth = 0) {
  const gradient = firstGradient(style.backgroundImage);
  if (!gradient) return "";
  const colors = [...gradient.matchAll(/#[0-9a-f]{3,8}|rgba?\([^)]*\)/gi)].map((match) => cssColor(match[0])).filter(Boolean);
  if (colors.length < 2) return "";
  const radial = /^radial-gradient/i.test(gradient);
  const angle = Number.parseFloat(gradient.match(/linear-gradient\(\s*(-?[\d.]+)deg/i)?.[1] || "135");
  const radians = ((angle - 90) * Math.PI) / 180;
  const x = Math.cos(radians);
  const y = Math.sin(radians);
  const x1 = 50 - x * 50;
  const y1 = 50 - y * 50;
  const x2 = 50 + x * 50;
  const y2 = 50 + y * 50;
  const stops = colors.map((item, index) => `<stop offset="${colors.length === 1 ? 0 : index / (colors.length - 1)}" stop-color="#${item.color}" stop-opacity="${1 - item.transparency / 100}"/>`).join("");
  const definition = radial
    ? `<radialGradient id="g" cx="50%" cy="50%" r="70%">${stops}</radialGradient>`
    : `<linearGradient id="g" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`;
  const stroke = border && borderWidth > 0 ? `stroke="#${border.color}" stroke-opacity="${1 - border.transparency / 100}" stroke-width="${borderWidth}"` : "";
  return encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(1, width)}" height="${Math.max(1, height)}" viewBox="0 0 ${Math.max(1, width)} ${Math.max(1, height)}"><defs>${definition}</defs><rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${Math.max(0, width - borderWidth)}" height="${Math.max(0, height - borderWidth)}" rx="${Math.max(0, radius)}" fill="url(#g)" ${stroke}/></svg>`);
}

function addElementBackground(deck, slide, element, pageRect) {
  if (element.closest("svg, table") || ["IMG", "STYLE", "SCRIPT", "BR"].includes(element.tagName)) return;
  const style = getComputedStyle(element);
  const background = cssColor(style.backgroundColor);
  const borderWidth = Math.max(cssNumber(style.borderTopWidth), cssNumber(style.borderRightWidth), cssNumber(style.borderBottomWidth), cssNumber(style.borderLeftWidth));
  const border = cssColor(style.borderTopColor || style.borderColor);
  const hasGradient = firstGradient(style.backgroundImage);
  if ((!background || background.transparency >= 100) && !hasGradient && (!border || borderWidth <= 0)) return;
  const box = elementBox(element, pageRect);
  if (box.w <= 0.002 || box.h <= 0.002) return;
  const radiusPx = Math.max(cssNumber(style.borderTopLeftRadius), cssNumber(style.borderTopRightRadius), cssNumber(style.borderBottomLeftRadius), cssNumber(style.borderBottomRightRadius));
  if (hasGradient) {
    const data = gradientSvg(box.width, box.height, style, radiusPx, border, borderWidth);
    if (data) {
      slide.addImage({ data, x: box.x, y: box.y, w: box.w, h: box.h });
      return;
    }
  }
  slide.addShape(shape(deck, radiusPx >= 4 ? "roundRect" : "rect"), {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    rectRadius: Math.min(0.12, radiusPx * PX_TO_IN),
    fill: background ? { color: background.color, transparency: background.transparency } : { color: "FFFFFF", transparency: 100 },
    line: border && borderWidth > 0 ? { color: border.color, transparency: border.transparency, width: Math.max(0.25, borderWidth * POINTS_PER_PX) } : { color: "FFFFFF", transparency: 100 },
  });
}

function richRuns(element) {
  const runs = [];
  const walk = (node, inherited = {}) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = String(node.nodeValue || "").replace(/\s+/g, " ");
      if (value) runs.push({ text: value, options: inherited });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.tagName === "BR") { runs.push({ text: "\n", options: inherited }); return; }
    const style = getComputedStyle(node);
    const options = {
      ...inherited,
      bold: Number.parseInt(style.fontWeight, 10) >= 600 || node.tagName === "STRONG",
      italic: style.fontStyle === "italic" || node.classList.contains("important-word"),
      underline: style.textDecorationLine?.includes("underline") || false,
      color: computedColor(style, inherited.color || "111110"),
      fontFace: fontFace(style),
    };
    if (node.classList.contains("critical-highlight")) options.highlight = "F5E642";
    if (node.classList.contains("important-word")) options.color = "922B21";
    for (const child of node.childNodes) walk(child, options);
  };
  for (const child of element.childNodes) walk(child, {});
  return runs.filter((run) => run.text);
}

function addTextElement(slide, element, pageRect, sourceIds, decorativeTextCount) {
  const value = actualText(element);
  if (!value) return decorativeTextCount;
  const style = getComputedStyle(element);
  const box = elementBox(element, pageRect);
  const paddingLeft = cssNumber(style.paddingLeft) * PX_TO_IN;
  const paddingRight = cssNumber(style.paddingRight) * PX_TO_IN;
  const paddingTop = cssNumber(style.paddingTop) * PX_TO_IN;
  const paddingBottom = cssNumber(style.paddingBottom) * PX_TO_IN;
  const listPrefix = element.tagName === "LI"
    ? (element.parentElement?.tagName === "OL" ? `${[...element.parentElement.children].indexOf(element) + 1}. ` : "• ")
    : "";
  const runs = richRuns(element);
  if (listPrefix) runs.unshift({ text: listPrefix, options: { bold: true, color: computedColor(style) } });
  const fontSize = Math.max(1, cssNumber(style.fontSize) * POINTS_PER_PX);
  const align = ({ center: "center", right: "right", justify: "justify", start: style.direction === "rtl" ? "right" : "left", end: style.direction === "rtl" ? "left" : "right" })[style.textAlign] || style.textAlign || (style.direction === "rtl" ? "right" : "left");
  slide.addText(runs.length ? runs : value, {
    x: box.x + paddingLeft,
    y: box.y + paddingTop,
    w: Math.max(0.02, box.w - paddingLeft - paddingRight),
    h: Math.max(0.02, box.h - paddingTop - paddingBottom),
    fontFace: fontFace(style),
    fontSize,
    color: computedColor(style),
    bold: Number.parseInt(style.fontWeight, 10) >= 600,
    italic: style.fontStyle === "italic",
    align,
    valign: style.alignItems === "center" ? "mid" : "top",
    margin: 0,
    breakLine: false,
    rtlMode: style.direction === "rtl",
    transparency: Math.round((1 - Number(style.opacity || 1)) * 100),
    charSpacing: cssNumber(style.letterSpacing) * POINTS_PER_PX,
    isTextBox: true,
  });
  const sourceId = clean(element.getAttribute("data-source-id"));
  if (sourceId) sourceIds.add(sourceId);
  return decorativeTextCount + (sourceId ? 0 : 1);
}

function addTable(slide, table, pageRect, sourceIds) {
  const rows = [...table.rows];
  if (!rows.length) return 0;
  const box = elementBox(table, pageRect);
  const tableRows = rows.map((row) => [...row.cells].map((cell) => {
    const style = getComputedStyle(cell);
    const fill = cssColor(style.backgroundColor);
    for (const source of cell.querySelectorAll("[data-source-id]")) sourceIds.add(clean(source.getAttribute("data-source-id")));
    if (cell.hasAttribute("data-source-id")) sourceIds.add(clean(cell.getAttribute("data-source-id")));
    return {
      text: actualText(cell),
      options: {
        bold: cell.tagName === "TH" || Number.parseInt(style.fontWeight, 10) >= 600,
        italic: style.fontStyle === "italic",
        color: computedColor(style),
        fill: fill ? { color: fill.color, transparency: fill.transparency } : { color: "FFFFFF" },
        align: style.textAlign === "center" ? "center" : style.textAlign === "right" ? "right" : "left",
        valign: "mid",
        margin: 0.05,
      },
    };
  }));
  const firstRow = rows[0];
  const colW = firstRow?.cells?.length
    ? [...firstRow.cells].map((cell) => cell.getBoundingClientRect().width * PX_TO_IN)
    : undefined;
  const style = getComputedStyle(table);
  slide.addTable(tableRows, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    colW,
    rowH: Math.max(0.18, box.h / rows.length),
    border: { type: "solid", color: cssColor(style.borderColor)?.color || "C8C8C2", pt: Math.max(0.5, cssNumber(style.borderWidth) * POINTS_PER_PX || 0.75) },
    color: computedColor(style),
    fontFace: fontFace(style),
    fontSize: Math.max(6, cssNumber(style.fontSize) * POINTS_PER_PX),
    margin: 0.05,
    autoFit: false,
    bold: false,
    breakLine: false,
  });
  return tableRows.reduce((sum, row) => sum + row.length, 0);
}

function imageRect(image, box) {
  const naturalWidth = image.naturalWidth || box.width;
  const naturalHeight = image.naturalHeight || box.height;
  if (!naturalWidth || !naturalHeight) return { x: box.x, y: box.y, w: box.w, h: box.h };
  const scale = Math.min(box.width / naturalWidth, box.height / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  return {
    x: box.x + (box.w - width * PX_TO_IN) / 2,
    y: box.y + (box.h - height * PX_TO_IN) / 2,
    w: width * PX_TO_IN,
    h: height * PX_TO_IN,
  };
}

function addImage(slide, image, pageRect, renderedAssets) {
  const id = clean(image.getAttribute("data-asset-id"));
  const source = clean(image.currentSrc || image.src);
  if (!id || !/^data:image\//i.test(source)) return false;
  const box = elementBox(image, pageRect);
  const target = imageRect(image, box);
  slide.addImage({ data: source, ...target, altText: `JANG_ASSET:${id}`, name: `JANG_ASSET:${id}` });
  renderedAssets.add(id);
  return true;
}

function svgViewBox(svg) {
  const base = svg.viewBox?.baseVal;
  if (base?.width && base?.height) return { x: base.x, y: base.y, width: base.width, height: base.height };
  return { x: 0, y: 0, width: svg.clientWidth || 1, height: svg.clientHeight || 1 };
}

function addSvgText(slide, element, pageRect, sourceIds) {
  const value = actualText(element);
  if (!value) return false;
  const style = getComputedStyle(element);
  const box = elementBox(element, pageRect);
  slide.addText(value, {
    x: box.x,
    y: box.y,
    w: Math.max(0.05, box.w),
    h: Math.max(0.05, box.h + 0.04),
    fontFace: fontFace(style),
    fontSize: Math.max(5, cssNumber(style.fontSize) * POINTS_PER_PX),
    color: computedColor(style),
    bold: Number.parseInt(style.fontWeight, 10) >= 600,
    italic: style.fontStyle === "italic",
    align: element.getAttribute("text-anchor") === "middle" ? "center" : element.getAttribute("text-anchor") === "end" ? "right" : "left",
    valign: "mid",
    margin: 0,
    breakLine: false,
    rtlMode: style.direction === "rtl",
  });
  const sourceId = clean(element.getAttribute("data-source-id"));
  if (sourceId) sourceIds.add(sourceId);
  return true;
}

function addSvgFallbackPath(slide, svg, path, pageRect) {
  const box = elementBox(svg, pageRect);
  const viewBox = svg.getAttribute("viewBox") || `0 0 ${svg.clientWidth || 1} ${svg.clientHeight || 1}`;
  const defs = svg.querySelector("defs")?.outerHTML || "";
  const data = encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${defs}${path.outerHTML}</svg>`);
  slide.addImage({ data, x: box.x, y: box.y, w: box.w, h: box.h });
}

function parsePoints(value) {
  const numbers = String(value || "").trim().split(/[\s,]+/).map(Number).filter(Number.isFinite);
  const points = [];
  for (let index = 0; index + 1 < numbers.length; index += 2) points.push([numbers[index], numbers[index + 1]]);
  return points;
}

function mapSvgPoint(svg, pageRect, x, y) {
  const svgBox = elementBox(svg, pageRect);
  const view = svgViewBox(svg);
  return {
    x: svgBox.x + ((x - view.x) / view.width) * svgBox.w,
    y: svgBox.y + ((y - view.y) / view.height) * svgBox.h,
  };
}

function addSvg(slide, svg, pageRect, sourceIds) {
  let nativeShapes = 0;
  let fallbackPaths = 0;
  for (const element of svg.querySelectorAll("rect,circle,ellipse,line,polyline,polygon,path,text,tspan")) {
    if (!visible(element) || element.closest("defs,marker")) continue;
    const tag = element.tagName.toLowerCase();
    if (tag === "text" && element.querySelector("[data-source-id]")) continue;
    if (tag === "text" || tag === "tspan") {
      if (addSvgText(slide, element, pageRect, sourceIds)) nativeShapes += 1;
      continue;
    }
    const style = getComputedStyle(element);
    const fill = cssColor(style.fill || element.getAttribute("fill"));
    const stroke = cssColor(style.stroke || element.getAttribute("stroke"));
    const strokeWidth = Math.max(0.25, cssNumber(style.strokeWidth || element.getAttribute("stroke-width")) * POINTS_PER_PX);
    if (["rect", "circle", "ellipse"].includes(tag)) {
      const box = elementBox(element, pageRect);
      const radius = tag === "rect" ? Math.max(cssNumber(element.getAttribute("rx")), cssNumber(element.getAttribute("ry"))) : 999;
      slide.addShape(shape(globalThis.PptxGenJS, tag === "rect" ? (radius >= 4 ? "roundRect" : "rect") : "ellipse"), {
        x: box.x, y: box.y, w: box.w, h: box.h,
        fill: fill ? { color: fill.color, transparency: fill.transparency } : { color: "FFFFFF", transparency: 100 },
        line: stroke ? { color: stroke.color, transparency: stroke.transparency, width: strokeWidth } : { color: "FFFFFF", transparency: 100 },
      });
      nativeShapes += 1;
      continue;
    }
    if (tag === "line") {
      const start = mapSvgPoint(svg, pageRect, Number(element.getAttribute("x1") || 0), Number(element.getAttribute("y1") || 0));
      const end = mapSvgPoint(svg, pageRect, Number(element.getAttribute("x2") || 0), Number(element.getAttribute("y2") || 0));
      slide.addShape(shape(globalThis.PptxGenJS, "line"), {
        x: start.x, y: start.y, w: end.x - start.x, h: end.y - start.y,
        line: { color: stroke?.color || "555550", transparency: stroke?.transparency || 0, width: strokeWidth, endArrowType: element.hasAttribute("marker-end") ? "triangle" : undefined, beginArrowType: element.hasAttribute("marker-start") ? "triangle" : undefined },
      });
      nativeShapes += 1;
      continue;
    }
    if (tag === "polyline" || tag === "polygon") {
      const points = parsePoints(element.getAttribute("points"));
      if (tag === "polygon" && points.length) points.push(points[0]);
      for (let index = 0; index + 1 < points.length; index += 1) {
        const start = mapSvgPoint(svg, pageRect, points[index][0], points[index][1]);
        const end = mapSvgPoint(svg, pageRect, points[index + 1][0], points[index + 1][1]);
        slide.addShape(shape(globalThis.PptxGenJS, "line"), { x: start.x, y: start.y, w: end.x - start.x, h: end.y - start.y, line: { color: stroke?.color || fill?.color || "555550", width: strokeWidth } });
        nativeShapes += 1;
      }
      continue;
    }
    if (tag === "path") {
      const d = clean(element.getAttribute("d"));
      const simple = /^[MLHVZmlhvz\d.,+\-\s]+$/.test(d);
      if (!simple) {
        addSvgFallbackPath(slide, svg, element, pageRect);
        fallbackPaths += 1;
        continue;
      }
      const values = [...d.matchAll(/([MLHVZmlhvz])|(-?\d*\.?\d+)/g)].map((match) => match[1] || Number(match[2]));
      let command = "";
      let cursor = [0, 0];
      let startPoint = [0, 0];
      let index = 0;
      while (index < values.length) {
        if (typeof values[index] === "string") command = values[index++];
        if (/^[Zz]$/.test(command)) {
          const a = mapSvgPoint(svg, pageRect, cursor[0], cursor[1]);
          const b = mapSvgPoint(svg, pageRect, startPoint[0], startPoint[1]);
          slide.addShape(shape(globalThis.PptxGenJS, "line"), { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y, line: { color: stroke?.color || fill?.color || "555550", width: strokeWidth } });
          nativeShapes += 1;
          command = "";
          continue;
        }
        const relative = command === command.toLowerCase();
        let next = [...cursor];
        if (/^[MmLl]$/.test(command) && typeof values[index] === "number" && typeof values[index + 1] === "number") { next = [values[index], values[index + 1]]; index += 2; }
        else if (/^[Hh]$/.test(command) && typeof values[index] === "number") { next = [values[index], cursor[1]]; index += 1; }
        else if (/^[Vv]$/.test(command) && typeof values[index] === "number") { next = [cursor[0], values[index]]; index += 1; }
        else break;
        if (relative) next = [cursor[0] + next[0], cursor[1] + next[1]];
        if (/^[Mm]$/.test(command)) { cursor = next; startPoint = next; command = relative ? "l" : "L"; continue; }
        const a = mapSvgPoint(svg, pageRect, cursor[0], cursor[1]);
        const b = mapSvgPoint(svg, pageRect, next[0], next[1]);
        slide.addShape(shape(globalThis.PptxGenJS, "line"), { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y, line: { color: stroke?.color || fill?.color || "555550", width: strokeWidth, endArrowType: element.hasAttribute("marker-end") ? "triangle" : undefined } });
        nativeShapes += 1;
        cursor = next;
      }
    }
  }
  return { nativeShapes, fallbackPaths };
}

function collectTextElements(page) {
  const candidates = [...page.querySelectorAll(TEXT_SELECTOR)].filter((element) => visible(element) && !element.closest("table,svg"));
  const uniqueElements = unique(candidates);
  return uniqueElements.filter((element) => {
    const descendants = uniqueElements.filter((other) => other !== element && element.contains(other));
    if (!descendants.length) return true;
    const directText = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => clean(node.nodeValue)).join(" ");
    return Boolean(directText);
  });
}

function addOccurrenceMarkers(slide, assetIds) {
  if (!assetIds.length) return;
  slide.addText(assetIds.map((id) => `JANG_ASSET:${id}`).join("\n"), {
    x: 8.85, y: 11.64, w: 0.1, h: 0.01, fontFace: "Aptos", fontSize: 1, color: "FFFFFF", transparency: 100, margin: 0,
  });
}

export async function buildPptxFromHtml(htmlInput, assets = [], manifest = {}, metadata = {}) {
  if (!globalThis.PptxGenJS) throw new Error("PowerPoint export could not load. Refresh the page and try again.");
  const html = hydrateHtmlAssetSources(htmlInput, assets);
  const { frame, doc } = await renderHtml(html);
  try {
    const layout = inspectRenderedLecture(doc);
    if (!layout.valid) {
      const first = layout.issues[0];
      throw new Error(`HTML layout verification failed on page ${first?.page || "?"}: ${first?.type || "unknown layout error"}.`);
    }
    const pages = [...doc.querySelectorAll("article.page")];
    const deck = new globalThis.PptxGenJS();
    deck.defineLayout({ name: "JANG_PORTRAIT", width: 9, height: 11.7 });
    deck.layout = "JANG_PORTRAIT";
    deck.author = "Jang Lecture Rebuilder";
    deck.company = "Jang";
    deck.subject = "Verified HTML-derived academic lecture";
    deck.title = metadata.title || "Redesigned lecture";
    deck.lang = metadata.language || "en-US";
    deck.theme = { headFontFace: "Georgia", bodyFontFace: metadata.direction === "rtl" ? "Tahoma" : "Aptos", lang: deck.lang };

    const expected = manifestForVerification(manifest);
    const renderedSourceIds = new Set();
    const renderedAssets = new Set();
    const report = {
      expectedSlideCount: pages.length,
      slideCount: 0,
      expectedTextCount: expected.sourceUnits.length,
      expectedAssetCount: expected.expectedAssets.length,
      textElements: 0,
      decorativeTextElements: 0,
      tableCells: 0,
      images: 0,
      nativeSvgShapes: 0,
      fallbackSvgPaths: 0,
      layout,
      renderedSourceIds: [],
      renderedAssetIds: [],
      missingSourceIds: [],
      missingAssetIds: [],
    };

    pages.forEach((page, pageIndex) => {
      const slide = deck.addSlide();
      const pageRect = page.getBoundingClientRect();
      const pageStyle = getComputedStyle(page);
      const pageColor = cssColor(pageStyle.backgroundColor);
      slide.background = { color: pageColor?.color || (page.classList.contains("cover-page") ? "1E1E1C" : "FFFFFF"), transparency: pageColor?.transparency || 0 };

      for (const element of page.querySelectorAll("*")) if (visible(element)) addElementBackground(deck, slide, element, pageRect);
      for (const table of page.querySelectorAll("table")) report.tableCells += addTable(slide, table, pageRect, renderedSourceIds);
      for (const image of page.querySelectorAll("img[data-asset-id]")) if (addImage(slide, image, pageRect, renderedAssets)) report.images += 1;
      for (const svg of page.querySelectorAll("svg")) {
        const svgReport = addSvg(slide, svg, pageRect, renderedSourceIds);
        report.nativeSvgShapes += svgReport.nativeShapes;
        report.fallbackSvgPaths += svgReport.fallbackPaths;
      }
      for (const element of collectTextElements(page)) {
        const before = renderedSourceIds.size;
        report.decorativeTextElements = addTextElement(slide, element, pageRect, renderedSourceIds, report.decorativeTextElements);
        report.textElements += renderedSourceIds.size > before || actualText(element) ? 1 : 0;
      }
      if (pageIndex === 0) addOccurrenceMarkers(slide, [...renderedAssets]);
    });

    report.slideCount = pages.length;
    report.renderedSourceIds = [...renderedSourceIds];
    report.renderedAssetIds = [...renderedAssets];
    report.missingSourceIds = expected.sourceUnits.map((unit) => unit.id).filter((id) => id && !renderedSourceIds.has(id));
    report.missingAssetIds = expected.expectedAssets.filter((id) => !renderedAssets.has(id));
    if (report.missingSourceIds.length || report.missingAssetIds.length) {
      throw new Error(`HTML-to-PowerPoint conversion stopped because ${report.missingSourceIds.length} source text unit(s) and ${report.missingAssetIds.length} image occurrence(s) were not converted.`);
    }
    return { deck, report, manifest: expected, html };
  } finally {
    frame.remove();
  }
}

export async function createPptxFileFromHtml(htmlInput, assets = [], manifest = {}, metadata = {}) {
  const built = await buildPptxFromHtml(htmlInput, assets, manifest, metadata);
  const output = await built.deck.write({ outputType: "arraybuffer" });
  const packageVerification = await verifyPptxPackage(output, built.manifest);
  if (!packageVerification.valid || packageVerification.slideCount !== built.report.expectedSlideCount) {
    throw new Error(`PowerPoint verification failed: ${packageVerification.missingSourceUnits.length} source unit(s), ${packageVerification.missingAssets.length} image occurrence(s), or ${Math.abs(packageVerification.slideCount - built.report.expectedSlideCount)} slide(s) are missing.`);
  }
  return {
    blob: new Blob([output], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }),
    report: built.report,
    packageVerification,
    verifiedHtml: built.html,
  };
}
