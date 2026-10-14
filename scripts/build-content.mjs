// Reads content/pharmacy-notes.xlsx and the files in public/files/,
// then writes content/uploads.json and the card thumbnails in public/thumbs/.
//
// Run it on your computer after adding or changing uploads:
//     npm run content
// then commit and push everything it changed.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { readSheet } from "read-excel-file/node";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const ROOT = process.cwd();
const SHEET = path.join(ROOT, "content", "pharmacy-notes.xlsx");
const OUT_JSON = path.join(ROOT, "content", "uploads.json");
const FILES = path.join(ROOT, "public", "files");
const THUMB_WIDTH = 640;
const INFOGRAPHIC_VIEW_WIDTH = 1400;
const MAX_MB = 20;

const require = createRequire(import.meta.url);
const pdfjsDir = path.dirname(require.resolve("pdfjs-dist/package.json"));
// PDF.js wants these folders written with forward slashes and ending in "/", even on Windows
const toSlash = (p) => p.split(path.sep).join("/") + "/";
const standardFontDataUrl = toSlash(path.join(pdfjsDir, "standard_fonts"));
const cMapUrl = toSlash(path.join(pdfjsDir, "cmaps"));

const CATEGORIES = {
  presentation: "presentations",
  document: "documents",
  infographic: "infographics",
};

const warnings = [];
const warn = (msg) => warnings.push(msg);

// ---------- helpers ----------

function clean(v) {
  if (v === null || v === undefined) return "";
  return String(v).replace(/\s+/g, " ").trim();
}

function list(v) {
  return clean(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normaliseCategory(v) {
  const c = clean(v).toLowerCase().replace(/s$/, "");
  return CATEGORIES[c] ? c : null;
}

function slugify(text, max = 80) {
  let s = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s.length > max) s = s.slice(0, max).replace(/-[^-]*$/, "");
  return s;
}

// "Breast-Cancer.PPTX" / "x.ptx" -> "breast-cancer"
function baseName(fileName) {
  return clean(fileName)
    .replace(/\.(pptx?|ptx|pdf|png|jpe?g|webp)$/i, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

// Find a file regardless of letter case. If it isn't lowercase, rename it so URLs stay lowercase.
function findFile(dir, wanted) {
  if (!fs.existsSync(dir)) return null;
  const hit = fs.readdirSync(dir).find((f) => f.toLowerCase() === wanted);
  if (!hit) return null;
  if (hit !== wanted) {
    const tmp = path.join(dir, `__renaming__${wanted}`);
    fs.renameSync(path.join(dir, hit), tmp); // two steps so Windows notices a case-only change
    fs.renameSync(tmp, path.join(dir, wanted));
    warn(`Renamed "${hit}" to "${wanted}" (file names must be lowercase).`);
  }
  const full = path.join(dir, wanted);
  const mb = fs.statSync(full).size / 1024 / 1024;
  if (mb > MAX_MB)
    warn(
      `${wanted} is ${mb.toFixed(1)} MB. Keep files under ${MAX_MB} MB (Cloudflare limit is 25 MB).`,
    );
  return full;
}

function isFresh(target, source) {
  return (
    fs.existsSync(target) &&
    fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs
  );
}

async function savePng(canvas, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, await canvas.encode("webp", 82));
}

// ---------- PDF: page count, page-1 thumbnail, text per page ----------

async function readPdf(pdfPath, thumbPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({
    data,
    standardFontDataUrl,
    cMapUrl,
    cMapPacked: true,
    verbosity: 0,
  }).promise;

  const first = await doc.getPage(1);
  const vp1 = first.getViewport({ scale: 1 });

  if (!isFresh(thumbPath, pdfPath)) {
    const scale = THUMB_WIDTH / vp1.width;
    const viewport = first.getViewport({ scale });
    const canvas = createCanvas(
      Math.round(viewport.width),
      Math.round(viewport.height),
    );
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await first.render({ canvasContext: ctx, viewport, canvas }).promise;
    await savePng(canvas, thumbPath);
  }

  const text = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    const words = tc.items.map((it) => ("str" in it ? it.str : "")).join(" ");
    text.push(words.replace(/\s+/g, " ").trim().slice(0, 1500));
  }

  const result = {
    pages: doc.numPages,
    aspect: +(vp1.width / vp1.height).toFixed(4),
    text,
  };
  await doc.destroy();
  return result;
}

// ---------- Image (infographics) ----------

async function readImage(imgPath, thumbPath, viewPath) {
  const img = await loadImage(fs.readFileSync(imgPath));
  const make = async (width, out) => {
    if (isFresh(out, imgPath)) return;
    const w = Math.min(width, img.width);
    const h = Math.round((img.height * w) / img.width);
    const canvas = createCanvas(w, h);
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);
    await savePng(canvas, out);
  };
  await make(THUMB_WIDTH, thumbPath);
  await make(INFOGRAPHIC_VIEW_WIDTH, viewPath);
  return {
    width: img.width,
    height: img.height,
    aspect: +(img.width / img.height).toFixed(4),
  };
}

// ---------- main ----------

async function main() {
  if (!fs.existsSync(SHEET)) {
    console.error(`Spreadsheet not found: ${SHEET}`);
    process.exit(1);
  }

  const rows = await readSheet(SHEET);
  const header = rows[0].map((h) => clean(h).toLowerCase());
  const col = (name) => header.indexOf(name);
  for (const need of ["category", "title", "file_name"]) {
    if (col(need) === -1) {
      console.error(`The spreadsheet needs a "${need}" column.`);
      process.exit(1);
    }
  }
  const get = (row, name) => (col(name) === -1 ? "" : row[col(name)]);

  const uploads = [];
  const usedSlugs = new Set();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const line = `Row ${r + 1}`;
    const title = clean(get(row, "title"));
    if (!title) continue; // blank row

    const category = normaliseCategory(get(row, "category"));
    if (!category) {
      warn(
        `${line}: unknown category "${clean(get(row, "category"))}" (use presentation, document or infographic). Skipped.`,
      );
      continue;
    }
    const folder = CATEGORIES[category];
    const dir = path.join(FILES, folder);

    const base = baseName(get(row, "file_name"));
    if (!base) {
      warn(`${line}: "${title}" has no file_name. Skipped.`);
      continue;
    }

    // Slug: from the optional "slug" column, otherwise from the title
    let slug = slugify(clean(get(row, "slug")) || title);
    if (usedSlugs.has(`${folder}/${slug}`)) {
      let n = 2;
      while (usedSlugs.has(`${folder}/${slug}-${n}`)) n++;
      warn(
        `${line}: another ${category} already uses the URL "${slug}"; this one becomes "${slug}-${n}".`,
      );
      slug = `${slug}-${n}`;
    }
    usedSlugs.add(`${folder}/${slug}`);

    const entry = {
      category,
      slug,
      url: `/${folder}/${slug}`,
      title,
      description: clean(get(row, "description")),
      subject: clean(get(row, "subject")),
      courses: list(get(row, "course")),
      tags: list(get(row, "tags")),
      featured: /^y(es)?$/i.test(clean(get(row, "featured"))),
      order: r,
      thumb: `/thumbs/${folder}/${base}.webp`,
    };
    const thumbPath = path.join(ROOT, "public", entry.thumb);

    try {
      if (category === "infographic") {
        const ext = ["png", "jpg", "jpeg", "webp"].find((e) =>
          findFile(dir, `${base}.${e}`),
        );
        if (!ext) {
          warn(
            `${line}: image for "${title}" not found in public/files/${folder}/ (expected ${base}.png). Skipped.`,
          );
          continue;
        }
        const imgPath = path.join(dir, `${base}.${ext}`);
        const view = `/thumbs/${folder}/${base}-large.webp`;
        const info = await readImage(
          imgPath,
          thumbPath,
          path.join(ROOT, "public", view),
        );
        Object.assign(entry, info, {
          image: view,
          download: `/files/${folder}/${base}.${ext}`,
          downloadLabel: ext.toUpperCase(),
          pages: 1,
          text: [],
        });
      } else {
        const pdfPath = findFile(dir, `${base}.pdf`);
        if (!pdfPath) {
          warn(
            `${line}: ${base}.pdf not found in public/files/${folder}/. Skipped "${title}".`,
          );
          continue;
        }
        Object.assign(entry, await readPdf(pdfPath, thumbPath));
        entry.pdf = `/files/${folder}/${base}.pdf`;
        entry.download = entry.pdf;
        entry.downloadLabel = "PDF";
        if (category === "presentation") {
          if (findFile(dir, `${base}.pptx`)) {
            entry.download = `/files/${folder}/${base}.pptx`;
            entry.downloadLabel = "PPTX";
          } else {
            warn(
              `${line}: ${base}.pptx not found, so "${title}" will download as PDF.`,
            );
          }
        }
      }
    } catch (err) {
      warn(
        `${line}: could not read the file for "${title}": ${err.message}. Skipped.`,
      );
      continue;
    }

    uploads.push(entry);
    process.stdout.write(".");
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(uploads, null, 2) + "\n");

  const count = (c) => uploads.filter((u) => u.category === c).length;
  console.log(
    `\n\nWrote ${uploads.length} uploads: ${count("presentation")} presentations, ` +
      `${count("document")} documents, ${count("infographic")} infographics.`,
  );
  if (warnings.length) {
    console.log(`\n${warnings.length} thing(s) to check:`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
