const decoder = new TextDecoder("utf-8");
const ZIP_EOCD = 0x06054b50;
const ZIP_CENTRAL = 0x02014b50;
const ZIP_LOCAL = 0x04034b50;

function uint16(view, offset) {
  return view.getUint16(offset, true);
}

function uint32(view, offset) {
  return view.getUint32(offset, true);
}

function findEndOfCentralDirectory(view) {
  const minimum = Math.max(0, view.byteLength - 65_557);
  for (let offset = view.byteLength - 22; offset >= minimum; offset -= 1) {
    if (uint32(view, offset) === ZIP_EOCD) return offset;
  }
  throw new Error("This PowerPoint file is not a readable PPTX archive.");
}

async function inflateRaw(bytes) {
  if (!("DecompressionStream" in globalThis)) {
    throw new Error("This browser cannot open PPTX files. Use a current version of Chrome, Edge, Safari, or Firefox.");
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function unzipEntries(file) {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const eocd = findEndOfCentralDirectory(view);
  const entryCount = uint16(view, eocd + 10);
  let offset = uint32(view, eocd + 16);
  const output = new Map();

  for (let index = 0; index < entryCount; index += 1) {
    if (uint32(view, offset) !== ZIP_CENTRAL) throw new Error("The PPTX directory is damaged.");
    const method = uint16(view, offset + 10);
    const compressedSize = uint32(view, offset + 20);
    const fileNameLength = uint16(view, offset + 28);
    const extraLength = uint16(view, offset + 30);
    const commentLength = uint16(view, offset + 32);
    const localOffset = uint32(view, offset + 42);
    const nameBytes = new Uint8Array(buffer, offset + 46, fileNameLength);
    const name = decoder.decode(nameBytes);

    if (uint32(view, localOffset) !== ZIP_LOCAL) throw new Error("A PPTX slide entry is damaged.");
    const localNameLength = uint16(view, localOffset + 26);
    const localExtraLength = uint16(view, localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = new Uint8Array(buffer, dataStart, compressedSize);

    const needed = name === "ppt/presentation.xml"
      || /^ppt\/slides\/slide\d+\.xml$/.test(name)
      || /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(name);
    if (needed) {
      if (method === 0) output.set(name, new Uint8Array(compressed));
      else if (method === 8) output.set(name, await inflateRaw(compressed));
      else throw new Error(`Unsupported PPTX compression method ${method}.`);
    }
    offset += 46 + fileNameLength + extraLength + commentLength;
  }
  return output;
}

function parseXml(bytes, path) {
  if (!bytes) return null;
  const document = new DOMParser().parseFromString(decoder.decode(bytes), "application/xml");
  if (document.querySelector("parsererror")) throw new Error(`Could not read ${path} from the PPTX file.`);
  return document;
}

function descendantsByLocalName(node, localName) {
  return [...node.getElementsByTagNameNS("*", localName)];
}

function firstByLocalName(node, localName) {
  return descendantsByLocalName(node, localName)[0] || null;
}

function numericAttribute(node, name) {
  const value = Number(node?.getAttribute(name));
  return Number.isFinite(value) ? value : 0;
}

function elementBox(node, slideSize) {
  const transform = firstByLocalName(node, "xfrm");
  const offset = transform ? firstByLocalName(transform, "off") : null;
  const extent = transform ? firstByLocalName(transform, "ext") : null;
  const x = numericAttribute(offset, "x");
  const y = numericAttribute(offset, "y");
  const width = numericAttribute(extent, "cx");
  const height = numericAttribute(extent, "cy");
  const percent = (value, total) => total ? Math.round((value / total) * 1000) / 10 : 0;
  return {
    x: percent(x, slideSize.width),
    y: percent(y, slideSize.height),
    width: percent(width, slideSize.width),
    height: percent(height, slideSize.height),
  };
}

function textFromNode(node) {
  return descendantsByLocalName(node, "t").map((item) => item.textContent || "").join(" ").replace(/\s+/g, " ").trim();
}

function parseTables(document) {
  return descendantsByLocalName(document, "tbl").map((table) => {
    return descendantsByLocalName(table, "tr").map((row) => descendantsByLocalName(row, "tc").map((cell) => textFromNode(cell)));
  }).filter((table) => table.some((row) => row.some(Boolean)));
}

function boxDistance(a, b) {
  const aRight = a.x + a.width;
  const aBottom = a.y + a.height;
  const bRight = b.x + b.width;
  const bBottom = b.y + b.height;
  const dx = Math.max(0, a.x - bRight, b.x - aRight);
  const dy = Math.max(0, a.y - bBottom, b.y - aBottom);
  return Math.hypot(dx, dy);
}

function nearbyTextForImage(image, textRuns, title) {
  const seen = new Set();
  return textRuns
    .filter((run) => run.text && run.text !== title)
    .map((run) => ({ text: run.text, distance: boxDistance(image, run) }))
    .sort((a, b) => a.distance - b.distance)
    .filter((item) => {
      const key = item.text.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5)
    .map((item) => item.text);
}

function parseSlide(document, slideNumber, slideSize) {
  const textRuns = descendantsByLocalName(document, "sp").map((shape) => ({
    text: textFromNode(shape),
    ...elementBox(shape, slideSize),
  })).filter((item) => item.text);

  textRuns.sort((a, b) => a.y - b.y || a.x - b.x);
  const titleCandidate = textRuns.find((item) => item.y < 30 && item.text.length <= 180)?.text || textRuns[0]?.text || `Slide ${slideNumber}`;

  const images = descendantsByLocalName(document, "pic").map((picture, index) => {
    const properties = firstByLocalName(picture, "cNvPr");
    const name = properties?.getAttribute("name") || `Image ${index + 1}`;
    const description = properties?.getAttribute("descr") || properties?.getAttribute("title") || "";
    const box = elementBox(picture, slideSize);
    const nearbyText = nearbyTextForImage(box, textRuns, titleCandidate);
    return {
      name,
      label: description || name,
      description,
      nearbyText,
      contextHint: [titleCandidate, ...nearbyText].filter(Boolean).join(" · "),
      ...box,
    };
  });

  return {
    number: slideNumber,
    title: titleCandidate,
    textRuns,
    images,
    tables: parseTables(document),
  };
}

function presentationSize(entries) {
  const document = parseXml(entries.get("ppt/presentation.xml"), "ppt/presentation.xml");
  const size = document ? firstByLocalName(document, "sldSz") : null;
  return {
    width: numericAttribute(size, "cx") || 12_192_000,
    height: numericAttribute(size, "cy") || 6_858_000,
  };
}

function numberedPaths(entries, pattern) {
  return [...entries.keys()].map((path) => {
    const match = path.match(pattern);
    return match ? { path, number: Number(match[1]) } : null;
  }).filter(Boolean).sort((a, b) => a.number - b.number);
}

export async function extractPptxManifest(file) {
  if (!file) throw new Error("Choose a PowerPoint file first.");
  if (!/\.pptx$/i.test(file.name)) throw new Error("Choose a .pptx PowerPoint file.");
  const entries = await unzipEntries(file);
  const slideSize = presentationSize(entries);
  const slides = numberedPaths(entries, /^ppt\/slides\/slide(\d+)\.xml$/).map(({ path, number }) => {
    const document = parseXml(entries.get(path), path);
    return parseSlide(document, number, slideSize);
  });

  if (!slides.length) throw new Error("No readable slides were found in this PowerPoint file.");

  const notePaths = numberedPaths(entries, /^ppt\/notesSlides\/notesSlide(\d+)\.xml$/);
  for (const { path, number } of notePaths) {
    const slide = slides.find((item) => item.number === number);
    if (!slide) continue;
    const document = parseXml(entries.get(path), path);
    const notes = textFromNode(document).replace(/\s+/g, " ").trim();
    if (notes) slide.notes = notes;
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    slideCount: slides.length,
    slideSize,
    slides,
  };
}
