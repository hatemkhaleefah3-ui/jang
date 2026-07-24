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
  // The converter never permits scripts in model-authored HTML. allow-same-origin is
  // required only so the parent page can read the rendered DOM and computed styles.
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

function borderOptions(style) {
  const width = Math.max(cssNumber(style.borderTopWidth), cssNumber(style.borderRightWidth), cssNumber(style.borderBottomWidth), cssNumber(style.borderLeftWidth));
  const color = cssColor(style.borderTopColor) || cssColor(style.borderColor);
  if (!color || width <= 0) return null;
  return { color: color.color, transparency: color.transparency, width: Math.max(0.5, width * POINTS_PER_PX) };
}

function addElementBackground(deck, slide, element, pageRect) {
  if (["BODY", "HTML", "MAIN", "SECTION", "ARTICLE", "TABLE", "TBODY", "THEAD", "TR", "SVG", "G", "DEFS", "MARKER"].includes(element.tagName)) return;
  if (element.closest("svg, table") || element.matches("img, text, tspan, line, rect, circle, ellipse, path, polygon, polyline")) return;
  const style = getComputedStyle(element);
  const box = elementBox(element, pageRect);
  if (box.w <= 0 || box.h <= 0) return;
  const fill = cssColor(style.backgroundColor);
  const border = borderOptions(style);
  const radius = cssNumber(style.borderRadius);
  const gradient = firstGradient(style.backgroundImage);
  if (!fill && !border && !gradient) return;
  const shapeOptions = {
    x: box.x, y: box.y, w: box.w, h: box.h,
    fill: fill ? { color: fill.color, transparency: fill.transparency } : { color: "FFFFFF", transparency: 100 },
    line: border ? { color: border.color, transparency: border.transparency, width: border.width } : { color: "FFFFFF", transparency: 100 },
    radius,
  };
  const background = gradientSvg(box.width, box.height, style, radius, border, border?.width || 0);
  if (background) slide.addImage({ data: background, x: box.x, y: box.y, w: box.w, h: box.h });
  else slide.addShape(shape(deck, radius > 1 ? "roundRect" : "rect"), shapeOptions);
}

function textOptions(element, pageRect) {
  const style = getComputedStyle(element);
  const box = elementBox(element, pageRect);
  const align = style.textAlign === "center" ? "center" : style.textAlign === "right" || style.direction === "rtl" ? "right" : style.textAlign === "justify" ? "justify" : "left";
  const valign = style.alignItems === "center" || style.justifyContent === "center" ? "mid" : "top";
  const background = cssColor(style.backgroundColor);
  const border = borderOptions(style);
  const padding = Math.max(cssNumber(style.paddingTop), cssNumber(style.paddingRight), cssNumber(style.paddingBottom), cssNumber(style.paddingLeft)) * PX_TO_IN;
  return {
    x: box.x, y: box.y, w: Math.max(0.01, box.w), h: Math.max(0.01, box.h),
    fontFace: fontFace(style),
    fontSize: Math.max(1, cssNumber(style.fontSize) * POINTS_PER_PX),
    color: computedColor(style),
    bold: Number(style.fontWeight) >= 600 || ["bold", "bolder"].includes(style.fontWeight),
    italic: style.fontStyle === "italic" || style.fontStyle === "oblique",
    underline: style.textDecorationLine.includes("underline") ? { style: "sng" } : undefined,
    strike: style.textDecorationLine.includes("line-through") ? "sngStrike" : undefined,
    align, valign,
    breakLine: false,
    fit: "shrink",
    margin: [padding * 72, padding * 72, padding * 72, padding * 72],
    paraSpaceAfterPt: Math.max(0, cssNumber(style.marginBottom) * POINTS_PER_PX),
    lineSpacingMultiple: Math.max(0.7, cssNumber(style.lineHeight) / Math.max(1, cssNumber(style.fontSize))),
    isTextBox: true,
    rtlMode: style.direction === "rtl",
    fill: background ? { color: background.color, transparency: background.transparency } : undefined,
    line: border ? { color: border.color, transparency: border.transparency, width: border.width } : undefined,
  };
}

function addTextElement(slide, element, pageRect, renderedSourceIds, decorativeCount) {
  const text = actualText(element);
  if (!text) return decorativeCount;
  const id = clean(element.getAttribute("data-source-id"));
  if (id && renderedSourceIds.has(id)) return decorativeCount;
  slide.addText(text, textOptions(element, pageRect));
  if (id) renderedSourceIds.add(id);
  else decorativeCount += 1;
  return decorativeCount;
}

function addTable(slide, table, pageRect, renderedSourceIds) {
  const rows = [...table.rows].map((row) => [...row.cells].map((cell) => ({ text: actualText(cell), options: { bold: cell.tagName === "TH", color: computedColor(getComputedStyle(cell)) } })));
  if (!rows.length) return 0;
  const box = elementBox(table, pageRect);
  const style = getComputedStyle(table);
  slide.addTable(rows, {
    x: box.x, y: box.y, w: box.w, h: box.h,
    fontFace: fontFace(style),
    fontSize: Math.max(1, cssNumber(style.fontSize) * POINTS_PER_PX),
    color: computedColor(style),
    border: { type: "solid", color: "C8C8C2", pt: 0.5 },
    margin: 0.08,
    autoFit: false,
  });
  const id = clean(table.closest("[data-source-id]")?.getAttribute("data-source-id") || table.getAttribute("data-source-id"));
  if (id) renderedSourceIds.add(id);
  return rows.reduce((total, row) => total + row.length, 0);
}

function addImage(slide, image, pageRect, renderedAssets) {
  const source = image.currentSrc || image.src;
  if (!/^data:image\//i.test(source)) return false;
  const box = elementBox(image, pageRect);
  slide.addImage({ data: source, x: box.x, y: box.y, w: box.w, h: box.h });
  const id = clean(image.getAttribute("data-asset-id"));
  if (id) renderedAssets.add(id);
  return true;
}

function svgViewBox(svg) {
  const values = String(svg.getAttribute("viewBox") || "").trim().split(/[ ,]+/).map(Number);
  if (values.length === 4 && values.every(Number.isFinite) && values[2] > 0 && values[3] > 0) return values;
  return [0, 0, Math.max(1, svg.clientWidth), Math.max(1, svg.clientHeight)];
}

function mapSvgPoint(svg, pageRect, x, y) {
  const rect = svg.getBoundingClientRect();
  const [minX, minY, width, height] = svgViewBox(svg);
  return {
    x: ((rect.left - pageRect.left) + ((x - minX) / width) * rect.width) * PX_TO_IN,
    y: ((rect.top - pageRect.top) + ((y - minY) / height) * rect.height) * PX_TO_IN,
  };
}

function svgFill(element) {
  return cssColor(element.getAttribute("fill") || getComputedStyle(element).fill);
}

function svgStroke(element) {
  return cssColor(element.getAttribute("stroke") || getComputedStyle(element).stroke);
}

function addSvgText(slide, element, svg, pageRect, renderedSourceIds) {
  const text = actualText(element);
  if (!text) return;
  const point = mapSvgPoint(svg, pageRect, Number(element.getAttribute("x") || 0), Number(element.getAttribute("y") || 0));
  const style = getComputedStyle(element);
  const size = Math.max(1, cssNumber(style.fontSize || element.getAttribute("font-size")) * POINTS_PER_PX);
  const anchor = element.getAttribute("text-anchor");
  const width = Math.max(0.6, (text.length * size * 0.0075));
  slide.addText(text, {
    x: point.x - (anchor === "middle" ? width / 2 : anchor === "end" ? width : 0),
    y: point.y - size * 0.014,
    w: width,
    h: Math.max(0.15, size * 0.025),
    fontFace: fontFace(style), fontSize: size, color: computedColor(style),
    bold: Number(style.fontWeight) >= 600, italic: style.fontStyle === "italic",
    align: anchor === "middle" ? "center" : anchor === "end" ? "right" : "left",
    margin: 0, fit: "shrink", rtlMode: style.direction === "rtl",
  });
  const id = clean(element.getAttribute("data-source-id"));
  if (id) renderedSourceIds.add(id);
}

function addSvg(slide, svg, pageRect, renderedSourceIds) {
  let nativeShapes = 0;
  let fallbackPaths = 0;
  const [minX, minY, viewWidth, viewHeight] = svgViewBox(svg);
  const svgRect = svg.getBoundingClientRect();
  const sx = svgRect.width / viewWidth * PX_TO_IN;
  const sy = svgRect.height / viewHeight * PX_TO_IN;
  for (const element of svg.querySelectorAll("rect,circle,ellipse,line,polyline,polygon,path,text,tspan")) {
    if (!visible(element) || element.closest("defs, marker")) continue;
    const tag = element.tagName.toLowerCase();
    if (tag === "text" || tag === "tspan") { if (tag === "text") addSvgText(slide, element, svg, pageRect, renderedSourceIds); continue; }
    const fill = svgFill(element);
    const stroke = svgStroke(element);
    const strokeWidth = Math.max(0.25, cssNumber(element.getAttribute("stroke-width") || getComputedStyle(element).strokeWidth) * POINTS_PER_PX);
    const baseLine = { color: stroke?.color || "555550", transparency: stroke?.transparency || 0, width: strokeWidth };
    const baseFill = fill ? { color: fill.color, transparency: fill.transparency } : { color: "FFFFFF", transparency: 100 };
    if (tag === "rect") {
      const x = (svgRect.left - pageRect.left) * PX_TO_IN + (Number(element.getAttribute("x") || 0) - minX) * sx;
      const y = (svgRect.top - pageRect.top) * PX_TO_IN + (Number(element.getAttribute("y") || 0) - minY) * sy;
      const w = Number(element.getAttribute("width") || 0) * sx;
      const h = Number(element.getAttribute("height") || 0) * sy;
      const radius = Number(element.getAttribute("rx") || 0);
      slide.addShape(shape(globalThis.PptxGenJS, radius ? "roundRect" : "rect"), { x, y, w, h, fill: baseFill, line: baseLine });
      nativeShapes += 1;
    } else if (tag === "circle" || tag === "ellipse") {
      const cx = Number(element.getAttribute("cx") || 0);
      const cy = Number(element.getAttribute("cy") || 0);
      const rx = tag === "circle" ? Number(element.getAttribute("r") || 0) : Number(element.getAttribute("rx") || 0);
      const ry = tag === "circle" ? rx : Number(element.getAttribute("ry") || 0);
      const point = mapSvgPoint(svg, pageRect, cx - rx, cy - ry);
      slide.addShape(shape(globalThis.PptxGenJS, "ellipse"), { x: point.x, y: point.y, w: rx * 2 * sx, h: ry * 2 * sy, fill: baseFill, line: baseLine });
      nativeShapes += 1;
    } else if (tag === "line") {
      const start = mapSvgPoint(svg, pageRect, Number(element.getAttribute("x1") || 0), Number(element.getAttribute("y1") || 0));
      const end = mapSvgPoint(svg, pageRect, Number(element.getAttribute("x2") || 0), Number(element.getAttribute("y2") || 0));
      slide.addShape(shape(globalThis.PptxGenJS, "line"), { x: start.x, y: start.y, w: end.x - start.x, h: end.y - start.y, line: { ...baseLine, endArrowType: element.hasAttribute("marker-end") ? "triangle" : undefined } });
      nativeShapes += 1;
    } else if (tag === "polyline" || tag === "polygon") {
      const values = String(element.getAttribute("points") || "").trim().split(/[ ,]+/).map(Number);
      const points = [];
      for (let index = 0; index + 1 < values.length; index += 2) points.push(mapSvgPoint(svg, pageRect, values[index], values[index + 1]));
      for (let index = 1; index < points.length; index += 1) {
        const a = points[index - 1]; const b = points[index];
        slide.addShape(shape(globalThis.PptxGenJS, "line"), { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y, line: { ...baseLine, endArrowType: index === points.length - 1 && element.hasAttribute("marker-end") ? "triangle" : undefined } });
        nativeShapes += 1;
      }
      if (tag === "polygon" && points.length > 2) {
        const a = points.at(-1); const b = points[0];
        slide.addShape(shape(globalThis.PptxGenJS, "line"), { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y, line: baseLine });
        nativeShapes += 1;
      }
    } else if (tag === "path") {
      const d = String(element.getAttribute("d") || "").trim();
      const tokens = [...d.matchAll(/[MmLlHhVvZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g)].map((match) => match[0]);
      if (!tokens.length || tokens.some((token) => /^[CcSsQqTtAa]$/.test(token))) {
        fallbackPaths += 1;
        continue;
      }
      let cursor = [0, 0]; let startPoint = [0, 0]; let command = ""; let index = 0;
      while (index < tokens.length) {
        if (/^[A-Za-z]$/.test(tokens[index])) command = tokens[index++];
        const values = tokens.map((token) => Number(token));
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
