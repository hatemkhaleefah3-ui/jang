const BLOCKED_TAGS = [
  "script", "style", "noscript", "iframe", "frame", "frameset", "object", "embed", "form",
  "input", "button", "select", "textarea", "template", "portal", "link", "meta",
];

const BOILERPLATE_SELECTORS = [
  "nav", "[role='navigation']", "[role='banner']", "[role='contentinfo']",
  ".cookie", ".cookies", "#cookie", "#cookies", ".cookie-banner", ".consent",
  ".advertisement", ".advert", ".ads", ".sidebar", ".site-header", ".site-footer",
  ".social-share", ".share-buttons", ".pagination", ".breadcrumb",
];

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_CONTENT_CHARS = 380000;

function cleanText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/ +\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ {2,}/g, " ")
    .trim();
}

function directChildren(element, selector) {
  return [...element.children].filter((child) => child.matches(selector));
}

function safeResolveUrl(src, baseHref) {
  if (!src) return { src: "", sourceKind: "missing" };
  const trimmed = src.trim();
  if (/^data:image\//i.test(trimmed)) return { src: trimmed, sourceKind: "embedded" };
  if (/^https?:\/\//i.test(trimmed)) return { src: trimmed, sourceKind: "remote" };
  if (/^blob:/i.test(trimmed)) return { src: "", sourceKind: "unavailable-blob" };
  if (baseHref) {
    try {
      const resolved = new URL(trimmed, baseHref);
      if (["http:", "https:"].includes(resolved.protocol)) return { src: resolved.href, sourceKind: "remote" };
    } catch {
      // Keep as unresolved below.
    }
  }
  return { src: trimmed, sourceKind: "relative" };
}

function sanitizeSvg(svg) {
  const clone = svg.cloneNode(true);
  clone.querySelectorAll("script, foreignObject, iframe, object, embed").forEach((node) => node.remove());
  [clone, ...clone.querySelectorAll("*")].forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      if (name.startsWith("on")) node.removeAttribute(attribute.name);
      if ((name === "href" || name === "xlink:href") && /^javascript:/i.test(value)) node.removeAttribute(attribute.name);
    });
  });
  if (!clone.getAttribute("viewBox")) {
    const width = Number.parseFloat(clone.getAttribute("width") || "");
    const height = Number.parseFloat(clone.getAttribute("height") || "");
    if (Number.isFinite(width) && Number.isFinite(height)) clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }
  return new XMLSerializer().serializeToString(clone);
}

function replaceWithAssetMarker(node, id) {
  const marker = node.ownerDocument.createElement("p");
  marker.dataset.jangAsset = id;
  marker.textContent = `[ASSET:${id}]`;
  node.replaceWith(marker);
}

function extractAssets(document) {
  const assets = [];
  let counter = 0;
  const nextId = (prefix) => `${prefix}-${String(++counter).padStart(3, "0")}`;
  const baseHref = (() => {
    const raw = document.querySelector("base[href]")?.getAttribute("href") || "";
    try {
      const url = new URL(raw);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  })();

  document.querySelectorAll(".mermaid, [data-mermaid]").forEach((node) => {
    const source = cleanText(node.textContent);
    if (!source) return node.remove();
    const id = nextId("diagram");
    assets.push({ id, type: "mermaid", source, alt: "Mermaid diagram", caption: "", sourceKind: "embedded" });
    replaceWithAssetMarker(node, id);
  });

  document.querySelectorAll("svg").forEach((svg) => {
    const id = nextId("diagram");
    const caption = cleanText(svg.closest("figure")?.querySelector("figcaption")?.textContent || "");
    const alt = cleanText(svg.getAttribute("aria-label") || svg.querySelector("title")?.textContent || caption || "Diagram");
    assets.push({ id, type: "svg", source: sanitizeSvg(svg), alt, caption, sourceKind: "embedded" });
    replaceWithAssetMarker(svg, id);
  });

  document.querySelectorAll("img").forEach((img) => {
    const id = nextId("image");
    const resolved = safeResolveUrl(img.getAttribute("src") || "", baseHref);
    const caption = cleanText(img.closest("figure")?.querySelector("figcaption")?.textContent || img.getAttribute("title") || "");
    const alt = cleanText(img.getAttribute("alt") || caption || "Lecture image");
    assets.push({
      id,
      type: "image",
      source: resolved.src,
      sourceKind: resolved.sourceKind,
      alt,
      caption,
      width: img.getAttribute("width") || "",
      height: img.getAttribute("height") || "",
    });
    replaceWithAssetMarker(img, id);
  });

  document.querySelectorAll("canvas").forEach((canvas) => {
    const id = nextId("diagram");
    assets.push({
      id,
      type: "canvas-placeholder",
      source: "",
      sourceKind: "unavailable-canvas",
      alt: cleanText(canvas.getAttribute("aria-label") || "Canvas diagram"),
      caption: "The original lecture used a script-rendered canvas that cannot be reconstructed from a single static HTML file.",
    });
    replaceWithAssetMarker(canvas, id);
  });

  return assets;
}

function tableToMarkdown(table) {
  const rows = [...table.rows].map((row) => [...row.cells].map((cell) => cleanText(cell.textContent)));
  if (!rows.length) return "";
  const width = Math.max(...rows.map((row) => row.length));
  const normalized = rows.map((row) => [...row, ...Array(Math.max(0, width - row.length)).fill("")]);
  const header = normalized[0];
  const separator = Array(width).fill("---");
  return [header, separator, ...normalized.slice(1)]
    .map((row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`)
    .join("\n");
}

function serializeElement(element, output, depth = 0) {
  if (depth > 40 || !element) return;
  const tag = element.tagName.toLowerCase();

  if (element.dataset?.jangAsset) {
    output.push(`[ASSET:${element.dataset.jangAsset}]`);
    return;
  }

  if (/^h[1-6]$/.test(tag)) {
    const level = Number(tag[1]);
    const text = cleanText(element.textContent);
    if (text) output.push(`${"#".repeat(level)} ${text}`);
    return;
  }

  if (tag === "p") {
    const text = cleanText(element.textContent);
    if (text) output.push(text);
    return;
  }

  if (tag === "ul" || tag === "ol") {
    const ordered = tag === "ol";
    const items = directChildren(element, "li");
    if (items.length) {
      items.forEach((item, index) => {
        const clone = item.cloneNode(true);
        clone.querySelectorAll("ul,ol").forEach((nested) => nested.remove());
        const text = cleanText(clone.textContent);
        if (text) output.push(`${ordered ? `${index + 1}.` : "-"} ${text}`);
        [...item.children].filter((child) => child.matches("ul,ol")).forEach((nested) => serializeElement(nested, output, depth + 1));
      });
    }
    return;
  }

  if (tag === "table") {
    const table = tableToMarkdown(element);
    if (table) output.push(table);
    return;
  }

  if (tag === "pre") {
    const text = cleanText(element.textContent);
    if (text) output.push(`\`\`\`\n${text}\n\`\`\``);
    return;
  }

  if (tag === "blockquote") {
    const text = cleanText(element.textContent);
    if (text) output.push(text.split("\n").map((line) => `> ${line}`).join("\n"));
    return;
  }

  if (tag === "dl") {
    [...element.children].forEach((child) => {
      if (child.tagName.toLowerCase() === "dt") {
        const term = cleanText(child.textContent);
        const description = cleanText(child.nextElementSibling?.tagName.toLowerCase() === "dd" ? child.nextElementSibling.textContent : "");
        if (term) output.push(`**${term}:** ${description}`.trim());
      }
    });
    return;
  }

  if (["hr"].includes(tag)) {
    output.push("---");
    return;
  }

  if (["figure", "picture"].includes(tag)) {
    [...element.children].forEach((child) => serializeElement(child, output, depth + 1));
    return;
  }

  if (["main", "article", "section", "div", "header", "footer", "aside", "details", "summary", "body"].includes(tag)) {
    [...element.children].forEach((child) => serializeElement(child, output, depth + 1));
    return;
  }

  const text = cleanText(element.textContent);
  if (text && !element.children.length) output.push(text);
  else [...element.children].forEach((child) => serializeElement(child, output, depth + 1));
}

function inferTitle(document, fallbackName) {
  const candidates = [
    document.querySelector("h1")?.textContent,
    document.querySelector("meta[property='og:title']")?.getAttribute("content"),
    document.querySelector("title")?.textContent,
    fallbackName?.replace(/\.html?$/i, ""),
  ];
  return cleanText(candidates.find((value) => cleanText(value)) || "Untitled lecture").slice(0, 300);
}

function stripUnsafe(document) {
  BLOCKED_TAGS.forEach((tag) => document.querySelectorAll(tag).forEach((node) => node.remove()));
  BOILERPLATE_SELECTORS.forEach((selector) => {
    try { document.querySelectorAll(selector).forEach((node) => node.remove()); } catch { /* Ignore unsupported selectors. */ }
  });
  document.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      if (attribute.name.toLowerCase().startsWith("on")) node.removeAttribute(attribute.name);
    });
  });
}

export async function extractLecture(file) {
  if (!(file instanceof File)) throw new Error("Please choose an HTML file.");
  if (file.size > MAX_FILE_BYTES) throw new Error("The HTML file is larger than 8 MB.");
  if (!/\.html?$/i.test(file.name) && !/html/i.test(file.type)) throw new Error("Only .html and .htm files are supported.");

  const html = await file.text();
  if (!/<html[\s>]|<!doctype html|<body[\s>]/i.test(html)) throw new Error("The selected file does not appear to be an HTML document.");

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  if (document.querySelector("parsererror")) throw new Error("The HTML file could not be parsed.");

  stripUnsafe(document);
  const assets = extractAssets(document);
  const output = [];
  serializeElement(document.body, output);

  let content = cleanText(output.join("\n\n"));
  if (!content) throw new Error("No readable lecture content was found in the file.");
  const truncated = content.length > MAX_CONTENT_CHARS;
  content = content.slice(0, MAX_CONTENT_CHARS);

  return {
    title: inferTitle(document, file.name),
    content,
    assets,
    stats: {
      originalBytes: file.size,
      extractedChars: content.length,
      assetCount: assets.length,
      imageCount: assets.filter((asset) => asset.type === "image").length,
      diagramCount: assets.filter((asset) => asset.type !== "image").length,
      truncated,
    },
  };
}

export function createFallbackPlan(extraction, options = {}) {
  const lines = extraction.content.split("\n").map((line) => line.trim()).filter(Boolean);
  const sections = [];
  let current = { title: extraction.title, category: "Lecture", keyTermsCritical: [], keyTermsImportant: [], blocks: [] };

  const flush = () => {
    if (current.blocks.length) sections.push(current);
    current = { title: "Continued", category: "Concept", keyTermsCritical: [], keyTermsImportant: [], blocks: [] };
  };

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+)/);
    if (heading) {
      if (current.blocks.length) flush();
      current.title = heading[2].slice(0, 140);
      current.category = "Concept";
      continue;
    }
    const asset = line.match(/^\[ASSET:([^\]]+)\]$/);
    if (asset) {
      current.blocks.push({ type: "image", heading: "", text: "", label: "", items: [], pairs: [], headers: [], rows: [], assetId: asset[1], caption: "", alt: "", question: "", answer: "" });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      let block = current.blocks.at(-1);
      if (!block || block.type !== "bullets") {
        block = { type: "bullets", heading: "", text: "", label: "", items: [], pairs: [], headers: [], rows: [], assetId: "", caption: "", alt: "", question: "", answer: "" };
        current.blocks.push(block);
      }
      block.items.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      let block = current.blocks.at(-1);
      if (!block || block.type !== "steps") {
        block = { type: "steps", heading: "", text: "", label: "", items: [], pairs: [], headers: [], rows: [], assetId: "", caption: "", alt: "", question: "", answer: "" };
        current.blocks.push(block);
      }
      block.items.push(line.replace(/^\d+\.\s+/, ""));
      continue;
    }
    current.blocks.push({ type: "paragraph", heading: "", text: line, label: "", items: [], pairs: [], headers: [], rows: [], assetId: "", caption: "", alt: "", question: "", answer: "" });
    if (current.blocks.length >= 8) flush();
  }
  flush();

  return {
    metadata: {
      title: extraction.title,
      subtitle: "Reformatted lecture notes",
      courseCode: options.courseCode || "Course",
      lectureLabel: options.lectureLabel || "Lecture",
      instructor: options.instructor || "",
      language: options.language === "auto" ? "" : options.language,
      direction: options.language === "Arabic" ? "rtl" : "ltr",
    },
    overview: "This local fallback preserves the extracted lecture structure without AI reorganization.",
    learningObjectives: [],
    sections: sections.length ? sections.slice(0, 40) : [{ ...current, blocks: [{ type: "paragraph", heading: "", text: extraction.content.slice(0, 4000), label: "", items: [], pairs: [], headers: [], rows: [], assetId: "", caption: "", alt: "", question: "", answer: "" }] }],
    finalTakeaways: [],
  };
}
