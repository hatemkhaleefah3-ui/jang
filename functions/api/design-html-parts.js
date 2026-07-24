const clean = (value) => typeof value === "string" ? value.replace(/\u0000/g, "").trim() : "";

export function normalizeAssetPreview(value, label = "Asset preview") {
  const source = clean(value);
  if (!source) return null;
  const match = source.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) throw new Error(`${label} must be a PNG, JPEG, or WebP data URL.`);
  const data = match[2].replace(/\s+/g, "");
  if (data.length > 900_000) throw new Error(`${label} is too large.`);
  return { mimeType: match[1].toLowerCase(), data };
}

export function createGeminiDesignParts(prompt, assets = []) {
  const parts = [{ text: prompt }];
  for (const asset of Array.isArray(assets) ? assets : []) {
    if (!asset?.preview?.data || !asset?.preview?.mimeType) continue;
    parts.push({ text: `SOURCE IMAGE PREVIEW — asset id ${asset.id}. Use this only to choose placement and composition. In the HTML output reference it only as <img data-asset-id="${asset.id}">; never embed or describe a replacement image.` });
    parts.push({ inline_data: { mime_type: asset.preview.mimeType, data: asset.preview.data } });
  }
  return parts;
}

export function publicDesignManifest(manifest = {}) {
  return {
    units: (Array.isArray(manifest.units) ? manifest.units : []).map((unit) => ({ ...unit })),
    assets: (Array.isArray(manifest.assets) ? manifest.assets : []).map(({ preview, ...asset }) => ({ ...asset })),
  };
}
