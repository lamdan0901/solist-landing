# Solist Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vietnamese, mobile-first, SEO-focused landing page that sends every CTA click to the TikTok Shop product page.

**Architecture:** Static `index.html` + `styles.css` + `main.js`. No framework, no build step. Images copied from the saved TikTok page. Two small Node scripts (a unit test for the size finder, a static check for SEO/content rules) are the only tooling.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS (classic script, works from `file://`), Node 24 (`node --test`, check script), Python 3.14 + Pillow (scratchpad only, one-off asset prep), Playfair Display + Be Vietnam Pro.

**Spec:** `docs/superpowers/specs/2026-10-08-solist-landing-design.md`

## Global Constraints

- Root: `C:\Users\AndersonHo\Desktop\mine\outsource\landing-1`. Not a git repo: no commits, no `git mv`.
- CTA URL (exact): `https://shop.tiktok.com/vn/pdp/1734569027011249683?utm_source=landing&utm_medium=cta&utm_campaign=<slot>`, `target="_blank"`, `rel="sponsored nofollow noopener"`. `<slot>` ∈ `top|hero|bundle-da|bundle-den|bundle-da-liner|bundle-den-liner|size|final|sticky|header`.
- `<html lang="vi">`, exactly one `<h1>`, `<title>` ≤ 60 chars, meta description ≤ 155 chars.
- Product facts only from the saved page: 390.000₫ (was 429.000₫, -9%), 4.9★, 4.088 reviews (5★ 3790, 4★ 201, 3★ 50, 2★ 12, 1★ 35), 60,8K sold, shop "Cửa hàng Solist Chính Chủ", free eyebrow pencil, 7-day size exchange, 3-month zipper warranty, free size-down for life.
- Forbidden: fake countdown/stock, fat-loss/health claims (`giảm cân|giảm mỡ|đốt mỡ|tan mỡ|đếm ngược|còn \d+ (sản phẩm|suất)`), invented testimonials, per-bundle prices (not on source: bundle cards say "Xem giá trên TikTok Shop").
- Placeholder domain string everywhere: `https://YOUR-DOMAIN.vn/` (single find/replace at deploy).
- Palette: ink `#14110f`, champagne `#e9d8bd`, rose-gold `#b76e79`, bg `#faf7f2`, gold `#c9a227`. Fonts Playfair Display (headings) + Be Vietnam Pro (body, ≥16px). Min tap target 44px. AA contrast.
- Page readable with JS disabled; reveal animation must not hide content unless `html.js` is set; respect `prefers-reduced-motion`.
- Verification = lint/static checks + browser check. Do not run a build (none exists).
- Source data root: `C:\Users\AndersonHo\Desktop\cloned-site` (`main.html`, `main_files\`).

## Review Focus

1. Waist input with Vietnamese decimal comma ("72,5") → must parse as 72.5 → size M (Task 2 test).
2. Empty / `0` / negative / non-numeric waist input → no crash, no size shown, helper hint stays (Task 2 test: `parseCm`, `sizeFor` return `NaN`/`null`).
3. Waist outside table (<40 or >110) → message to check measuring tips / contact shop, never a wrong size (Task 2 test).
4. JS disabled or slow → all content, size table, FAQ and CTAs visible (Task 3 check: no unconditional `opacity:0`; table in static HTML).
5. 320px-wide phone → no horizontal scroll (Task 7 gate: `document.documentElement.scrollWidth <= innerWidth`).

---

## File Structure

| Path | Responsibility |
|---|---|
| `index.html` | All markup, SEO head, JSON-LD |
| `styles.css` | Tokens + all styles (imports nothing; fonts via `assets/fonts/fonts.css` link) |
| `main.js` | `parseCm`, `sizeFor`, size-finder UI, sticky CTA, reveal, `dataLayer` hook |
| `DESIGN.md` | Design tokens/rules (AGENTS.MD requires it) |
| `robots.txt`, `sitemap.xml`, `favicon.svg` | SEO basics |
| `assets/*.webp`, `assets/og-image.jpg`, `assets/fonts/*` | Media |
| `tools/setup_assets.py`, `tools/fonts.py` | One-off asset prep (kept for reproducibility) |
| `tools/check.mjs` | Static SEO/content check |
| `tests/size.test.cjs` | Unit test for size logic |

---

### Task 1: Assets, fonts, static SEO files

**Files:**
- Create: `tools/setup_assets.py`, `tools/fonts.py`, `robots.txt`, `sitemap.xml`, `favicon.svg`
- Create (by scripts): `assets/*.webp`, `assets/og-image.jpg`, `assets/fonts/*`

**Interfaces:**
- Produces (asset filenames used by later tasks, all under `assets/`):
  `gen-nit-bung-latex-solist-hero.webp`, `gen-nit-bung-solist-truoc-sau.webp`, `gen-latex-solist-den.webp`, `gen-latex-solist-be-da.webp`, `gen-latex-solist-be-ao-liner.webp`, `gen-latex-solist-den-ao-liner.webp`, `chi-tiet-thiet-ke-gen-den.webp`, `chi-tiet-thiet-ke-gen-be.webp`, `dang-dong-ho-cat-gen-den.webp`, `dang-dong-ho-cat-gen-be.webp`, `phan-biet-gen-solist-chinh-hang.webp`, `mau-mac-gen-solist-1.webp`, `mau-mac-gen-solist-2.webp`, `mau-mac-gen-solist-3.webp`, `khach-hang-mac-gen-solist.webp`, `og-image.jpg`, `fonts/fonts.css`.
  The script prints each file's `WxH`; Tasks 5–6 use those as `width`/`height` attributes.

- [ ] **Step 1: Write `tools/setup_assets.py`**

```python
# usage: python -I tools/setup_assets.py <scratchpad-dir-with-pylib>
import glob, os, sys
sys.path.insert(0, os.path.join(sys.argv[1], "pylib"))
from PIL import Image

SRC = r"C:\Users\AndersonHo\Desktop\cloned-site\main_files"
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
MAP = {  # hash prefix of source file -> destination name
    "bc55410855": "gen-nit-bung-latex-solist-hero.webp",
    "b7bc57045d": "gen-nit-bung-solist-truoc-sau.webp",
    "396c3d1635": "gen-latex-solist-den.webp",
    "1052db41c4": "gen-latex-solist-be-da.webp",
    "2ee1655c87": "gen-latex-solist-be-ao-liner.webp",
    "1acfdfb3d4": "gen-latex-solist-den-ao-liner.webp",
    "1881fe1404": "chi-tiet-thiet-ke-gen-den.webp",
    "14e3a43a61": "chi-tiet-thiet-ke-gen-be.webp",
    "cb392630ad": "dang-dong-ho-cat-gen-den.webp",
    "ddf72864c4": "dang-dong-ho-cat-gen-be.webp",
    "13fcfb2d9d": "phan-biet-gen-solist-chinh-hang.webp",
    "0608c87b4b": "mau-mac-gen-solist-1.webp",
    "83eb0fea59": "mau-mac-gen-solist-2.webp",
    "b9188958": "mau-mac-gen-solist-3.webp",
    "c49833ca57": "khach-hang-mac-gen-solist.webp",
}
os.makedirs(DST, exist_ok=True)
for prefix, name in MAP.items():
    hits = [f for f in glob.glob(os.path.join(SRC, prefix + "*")) if f.endswith(".webp")]
    assert len(hits) == 1, (prefix, hits)
    with open(hits[0], "rb") as a, open(os.path.join(DST, name), "wb") as b:
        b.write(a.read())
    w, h = Image.open(os.path.join(DST, name)).size
    print(f"{name}\t{w}x{h}")

# og-image 1200x630 from the SOLIST banner (cover crop)
og = glob.glob(os.path.join(SRC, "81de145dc9*"))[0]
im = Image.open(og).convert("RGB")
r = max(1200 / im.width, 630 / im.height)
im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
l, t = (im.width - 1200) // 2, (im.height - 630) // 2
im.crop((l, t, l + 1200, t + 630)).save(os.path.join(DST, "og-image.jpg"), quality=88)
print("og-image.jpg\t1200x630")
```

- [ ] **Step 2: Run it**

Run: `python -I tools/setup_assets.py "C:/Users/ANDERS~1/AppData/Local/Temp/claude/C--Users-AndersonHo-Desktop-mine-outsource-landing-1/086d2a07-8bf0-440b-9b22-b4c4448b249b/scratchpad"`
Expected: 15 lines `name<TAB>WxH` + `og-image.jpg`, no AssertionError. If the `b9188958` prefix matches ≠ 1 file, lengthen the prefix from `scratchpad/imglist.txt`.

- [ ] **Step 3: Visually confirm picks**

Read `assets/gen-nit-bung-latex-solist-hero.webp`, `gen-nit-bung-solist-truoc-sau.webp`, `og-image.jpg` with the Read tool. Expected: hero = model in red top + black corset; before/after = "trước / sau" split; og shows SOLIST banner. If the hero is a poor crop, swap the `bc55410855` entry for `0608c87b4b` (already copied as `mau-mac-gen-solist-1.webp`) and rename.

- [ ] **Step 4: Write `tools/fonts.py` and self-host fonts**

```python
# usage: python -I tools/fonts.py   (needs network)
import os, re, urllib.request
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "fonts")
URL = ("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700"
       "&family=Be+Vietnam+Pro:wght@400;600;700&display=swap")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/130.0 Safari/537.36"}
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=UA)).read()
os.makedirs(ROOT, exist_ok=True)
css = get(URL).decode()
out, done = [], {}
for subset, body in re.findall(r"/\* ([\w-]+) \*/\s*@font-face \{(.*?)\}", css, re.S):
    if subset not in ("vietnamese", "latin"):
        continue
    fam = re.search(r"font-family: '([^']+)'", body).group(1)
    wt = re.search(r"font-weight: ([\d ]+);", body).group(1).replace(" ", "-")
    u = re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1)
    if u not in done:
        done[u] = f"{fam.replace(' ', '-').lower()}-{subset}-{wt}.woff2"
        open(os.path.join(ROOT, done[u]), "wb").write(get(u))
    out.append(re.sub(r"url\([^)]+\)", f"url({done[u]})", "@font-face {" + body + "}"))
open(os.path.join(ROOT, "fonts.css"), "w", encoding="utf-8").write("\n".join(out))
print(len(done), "files,", len(out), "faces")
```

Run: `python -I tools/fonts.py`
Expected: `N files, M faces` with N ≥ 4. **Fallback:** if it errors (offline/blocked), delete `assets/fonts/`, and in Task 5 use `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Be+Vietnam+Pro:wght@400;600;700&display=swap">` instead of the local `fonts.css`.

- [ ] **Step 5: Write `robots.txt`, `sitemap.xml`, `favicon.svg`**

`robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://YOUR-DOMAIN.vn/sitemap.xml
```
`sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://YOUR-DOMAIN.vn/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
</urlset>
```
`favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#14110f"/><text x="32" y="45" font-family="Georgia,serif" font-size="40" font-weight="700" text-anchor="middle" fill="#e9d8bd">S</text></svg>
```

- [ ] **Step 6: Update `SESSION_STATE.md`** — Active Diffs list Task 1 files; Handoff = Task 2.

---

### Task 2: Size-finder logic (TDD)

**Files:**
- Create: `tests/size.test.cjs`, `main.js`

**Interfaces:**
- Produces from `main.js` (also `module.exports` under Node): `SIZES` (array of `{size,kg,min,max}`), `parseCm(str: string): number` (NaN if empty/invalid), `sizeFor(cm: number): string|null` (`'XXS'…'XXL'` or `null` when invalid/out of range 40–110).
- DOM contract (consumed from `index.html`, Tasks 5–6): `#waist` (input), `#size-result` (`aria-live="polite"`), table `#size-table` with `<tr data-size="XXS">` rows, `#sticky-cta`, `#hero`, elements with class `reveal`, CTA anchors `a[data-cta]` (slot name in `data-cta`).

- [ ] **Step 1: Write the failing test `tests/size.test.cjs`**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCm, sizeFor, SIZES } = require('../main.js');

test('table has 7 sizes in order', () => {
  assert.deepEqual(SIZES.map(s => s.size), ['XXS','XS','S','M','L','XL','XXL']);
});
test('exact ranges', () => {
  const cases = { 50:'XXS', 58:'XS', 62:'XS', 70:'S', 75:'M', 83:'L', 90:'XL', 100:'XXL', 110:'XXL' };
  for (const [cm, size] of Object.entries(cases)) assert.equal(sizeFor(+cm), size, cm);
});
test('overlaps pick the larger size', () => {
  assert.equal(sizeFor(67), 'S');
  assert.equal(sizeFor(71), 'M');
  assert.equal(sizeFor(72), 'M');
});
test('gaps pick the next larger size', () => {
  assert.equal(sizeFor(57), 'XS');
  assert.equal(sizeFor(80.5), 'L');
  assert.equal(sizeFor(86.5), 'XL');
  assert.equal(sizeFor(96.5), 'XXL');
});
test('out of range / invalid -> null', () => {
  for (const v of [39, 111, 0, -5, NaN, Infinity]) assert.equal(sizeFor(v), null, String(v));
});
test('parseCm handles Vietnamese decimal comma and junk', () => {
  assert.equal(parseCm('72,5'), 72.5);
  assert.equal(parseCm(' 72.5 '), 72.5);
  assert.equal(sizeFor(parseCm('72,5')), 'M');
  for (const v of ['', '   ', 'abc', '7 2']) assert.ok(Number.isNaN(parseCm(v)), JSON.stringify(v));
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/size.test.cjs`
Expected: FAIL — `Cannot find module '../main.js'`.

- [ ] **Step 3: Write `main.js`**

```js
(function () {
  // Size chart from the shop's "Latex size chart" image. Overlaps/gaps are resolved in sizeFor.
  var SIZES = [
    { size: 'XXS', kg: '<41',   min: 40, max: 56.99 },
    { size: 'XS',  kg: '42–46', min: 58, max: 67 },
    { size: 'S',   kg: '47–54', min: 67, max: 72 },
    { size: 'M',   kg: '55–60', min: 71, max: 80 },
    { size: 'L',   kg: '61–67', min: 81, max: 86 },
    { size: 'XL',  kg: '68–77', min: 87, max: 96 },
    { size: 'XXL', kg: '>78',   min: 97, max: 110 }
  ];

  function parseCm(str) {
    var s = String(str).trim().replace(',', '.');
    return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
  }

  // Overlap -> larger size; gap -> next larger size (ponytail: shop's "hạ size trọn đời" covers a wrong pick).
  function sizeFor(cm) {
    if (!Number.isFinite(cm) || cm < SIZES[0].min || cm > SIZES[SIZES.length - 1].max) return null;
    var hits = SIZES.filter(function (s) { return cm >= s.min && cm <= s.max; });
    return (hits.length ? hits[hits.length - 1] : SIZES.filter(function (s) { return s.min > cm; })[0]).size;
  }

  if (typeof module !== 'undefined') module.exports = { SIZES: SIZES, parseCm: parseCm, sizeFor: sizeFor };
  if (typeof document === 'undefined') return;

  var doc = document;
  doc.documentElement.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Size finder
  var input = doc.getElementById('waist'), out = doc.getElementById('size-result'),
      rows = doc.querySelectorAll('#size-table tr[data-size]');
  if (input && out) {
    input.addEventListener('input', function () {
      var raw = input.value, cm = parseCm(raw), size = sizeFor(cm);
      rows.forEach(function (r) { r.classList.toggle('is-match', r.dataset.size === size); });
      if (!raw.trim()) out.textContent = 'Nhập số đo vòng eo (cm) để xem size phù hợp.';
      else if (Number.isNaN(cm)) out.textContent = 'Vui lòng nhập số, ví dụ 72 hoặc 72,5.';
      else if (!size) out.textContent = 'Số đo ngoài bảng size (40–110 cm). Hãy kiểm tra lại cách đo hoặc nhắn shop trên TikTok để được tư vấn.';
      else out.textContent = 'Size gợi ý cho bạn: ' + size + '. Nếu chưa vừa, shop đổi size trong 7 ngày và hạ size miễn phí trọn đời.';
    });
  }

  // Sticky CTA: show after hero leaves the viewport
  var hero = doc.getElementById('hero'), sticky = doc.getElementById('sticky-cta');
  if (hero && sticky && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      sticky.classList.toggle('is-visible', !e[0].isIntersecting && e[0].boundingClientRect.top < 0);
    }).observe(hero);
  }

  // Scroll reveal (content stays visible without JS or with reduced motion)
  var els = doc.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  // Analytics hook point (no vendor installed)
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-cta]');
    if (a && window.dataLayer) window.dataLayer.push({ event: 'cta_click', slot: a.dataset.cta });
  });
})();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/size.test.cjs`
Expected: all tests PASS (`pass 6`, `fail 0`).

- [ ] **Step 5: Update `SESSION_STATE.md`** — tick nothing yet; note Task 2 files; Handoff = Task 3.

---

### Task 3: Static check script (failing first)

**Files:**
- Create: `tools/check.mjs`

**Interfaces:**
- Consumes: root files `index.html`, `styles.css`, `robots.txt`, `sitemap.xml`, assets from Task 1.
- Produces: exit code 0 = all checks pass, 1 = any FAIL. Prints `PASS`/`FAIL`/`WARN` lines.

- [ ] **Step 1: Write `tools/check.mjs`**

```js
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(resolve(root, f), 'utf8');
let failed = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) failed++; };
const warn = m => console.log('WARN ' + m);
const len = s => [...s].length;

const html = read('index.html');
const PID = '1734569027011249683';

ok(/<html[^>]*\blang="vi"/.test(html), 'html lang=vi');
ok((html.match(/<h1[\s>]/g) || []).length === 1, 'exactly one h1');
const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
ok(title && len(title) <= 60, `title <= 60 chars (${len(title)})`);
const desc = (html.match(/<meta name="description" content="([^"]+)"/) || [])[1] || '';
ok(desc && len(desc) <= 155, `meta description <= 155 chars (${len(desc)})`);
for (const p of ['rel="canonical"', 'property="og:title"', 'property="og:description"', 'property="og:image"', 'name="twitter:card"', 'name="viewport"', 'rel="icon"'])
  ok(html.includes(p), `head has ${p}`);

// images
const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
ok(imgs.length >= 10, `>= 10 <img> (${imgs.length})`);
for (const t of imgs) {
  const src = (t.match(/\bsrc="([^"]+)"/) || [])[1];
  ok(src && existsSync(resolve(root, src)), `img file exists: ${src}`);
  ok(/\balt="[^"]{8,}"/.test(t), `img alt >= 8 chars: ${src}`);
  ok(/\bwidth="\d+"/.test(t) && /\bheight="\d+"/.test(t), `img width/height: ${src}`);
}

// CTAs
const ctas = [...html.matchAll(/<a\b[^>]*shop\.tiktok\.com[^>]*>/g)].map(m => m[0]);
ok(ctas.length >= 8, `>= 8 TikTok CTAs (${ctas.length})`);
for (const a of ctas) {
  ok(a.includes(`/vn/pdp/${PID}?`) && a.includes('utm_campaign='), 'CTA url + utm: ' + (a.match(/utm_campaign=[\w-]+/) || ['?'])[0]);
  ok(/target="_blank"/.test(a) && /rel="[^"]*sponsored[^"]*nofollow[^"]*noopener|rel="[^"]*(?=.*sponsored)(?=.*nofollow)(?=.*noopener)[^"]*"/.test(a), 'CTA target/rel');
  ok(/data-cta="[\w-]+"/.test(a), 'CTA data-cta');
}

// anchors resolve
for (const [, id] of html.matchAll(/href="#([\w-]+)"/g)) ok(html.includes(`id="${id}"`), `anchor target #${id}`);

// JSON-LD
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const by = t => blocks.find(b => b['@type'] === t);
const prod = by('Product'), faq = by('FAQPage'), site = by('WebSite');
ok(prod && site && faq, 'JSON-LD Product + FAQPage + WebSite parse');
ok(prod?.offers?.price === '390000' && prod.offers.priceCurrency === 'VND', 'Product offer 390000 VND');
ok(prod?.aggregateRating?.ratingValue === '4.9' && prod.aggregateRating.reviewCount === '4088', 'aggregateRating 4.9 / 4088');
ok(!('review' in (prod || {})), 'no invented per-review entries');
const details = (html.match(/<details\b/g) || []).length;
ok(faq && faq.mainEntity.length === details && details >= 7, `FAQ JSON-LD (${faq?.mainEntity.length}) == visible <details> (${details}) >= 7`);
for (const q of faq?.mainEntity ?? []) ok(html.includes(q.name), 'FAQ question visible: ' + q.name.slice(0, 40));

// size table
const rows = [...html.matchAll(/<tr[^>]*data-size="(\w+)"/g)].map(m => m[1]);
ok(rows.join() === 'XXS,XS,S,M,L,XL,XXL', 'size table rows in static HTML');
ok(html.includes('id="waist"') && html.includes('id="size-result"'), 'size finder inputs present');

// content rules
const text = html.replace(/<script[\s\S]*?<\/script>/g, '');
ok(!/giảm cân|giảm mỡ|đốt mỡ|tan mỡ|đếm ngược|còn \d+ (sản phẩm|suất)/i.test(text), 'no forbidden claims / fake scarcity');
for (const f of ['390.000', '429.000', '4,9', '4.088', '60,8K']) ok(text.includes(f), `fact present: ${f}`);

// no-JS safety
const css = read('styles.css');
ok(!/\.reveal\s*\{[^}]*opacity\s*:\s*0/.test(css), '.reveal not hidden unless under .js');
ok(/\.js\s+\.reveal/.test(css), '.js .reveal rule exists');
ok(/prefers-reduced-motion/.test(css), 'reduced-motion handled');

// static files
ok(/Sitemap:/.test(read('robots.txt')), 'robots.txt has Sitemap');
ok(/<loc>[^<]+<\/loc>/.test(read('sitemap.xml')), 'sitemap.xml has <loc>');
for (const f of ['DESIGN.md', 'favicon.svg', 'assets/og-image.jpg']) ok(existsSync(resolve(root, f)), `exists ${f}`);
if (html.includes('YOUR-DOMAIN.vn')) warn('placeholder domain YOUR-DOMAIN.vn still present (replace at deploy)');

console.log(failed ? `\n${failed} FAILED` : '\nALL PASSED');
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tools/check.mjs`
Expected: crash/FAIL — `ENOENT ... index.html` (page not built yet).

- [ ] **Step 3: Update `SESSION_STATE.md`** — Handoff = Task 4.

---

### Task 4: DESIGN.md and styles.css

**Files:**
- Create: `DESIGN.md`, `styles.css`

**Interfaces:**
- Produces CSS class contract used by Tasks 5–6 (names exact):
  layout `.container` (max 1120px, 16px gutter), `.section`, `.section--tint`, `.section__eyebrow`, `.section__title`, `.section__lead`, `.grid`, `.grid--2`, `.grid--3`, `.grid--4`;
  atoms `.btn`, `.btn--primary`, `.btn--ghost`, `.btn--lg`, `.chip`, `.price`, `.price__now`, `.price__old`, `.price__off`, `.stars`, `.reveal` (+ `.is-in`), `.card`;
  blocks `.topbar`, `.header`, `.hero`, `.hero__media`, `.hero__copy`, `.badges`, `.benefit`, `.compare` (before/after), `.detail`, `.bundle`, `.size`, `.size__form`, `.size__result`, `.size-table` (+ `tr.is-match`), `.steps`, `.rating`, `.rating__bar`, `.quote`, `.authentic`, `.guarantee`, `.faq` (`details`), `.final`, `.footer`, `.sticky-cta` (+ `.is-visible`).

- [ ] **Step 1: Write `DESIGN.md`**

Sections (write real content, not placeholders): Brand (Solist: refined, feminine, confident), Color tokens table (ink `#14110f`, ink-soft `#3a322d`, champagne `#e9d8bd`, champagne-soft `#f4ebdb`, rose `#b76e79`, rose-dark `#8f4f59`, bg `#faf7f2`, card `#ffffff`, gold `#c9a227`, line `#e8dfd2`), Typography (Playfair Display 500/700 headings, `clamp(2rem,6vw,3.5rem)` H1, `clamp(1.5rem,4vw,2.25rem)` H2; Be Vietnam Pro 400/600/700 body 16–18px, line-height 1.6), Spacing (8px grid, section padding `clamp(48px,8vw,96px)`), Radius (16 cards, 999 pills), Shadows (`0 8px 30px rgba(20,17,15,.08)`), Buttons (primary = `linear-gradient(135deg,#b76e79,#8f4f59)`, white text, min-height 48px; ghost = ink outline), Motion (fade-up 24px/600ms, disabled under reduced-motion), Accessibility (AA, focus ring 3px rose, 44px targets), Content rules (copy from Global Constraints: no fake scarcity, no health claims).

- [ ] **Step 2: Write `styles.css`**

Start with this exact token/base block, then implement every class in the contract above following `DESIGN.md`:

```css
:root{
  --ink:#14110f; --ink-soft:#3a322d; --champagne:#e9d8bd; --champagne-soft:#f4ebdb;
  --rose:#b76e79; --rose-dark:#8f4f59; --bg:#faf7f2; --card:#fff; --gold:#c9a227; --line:#e8dfd2;
  --radius:16px; --shadow:0 8px 30px rgba(20,17,15,.08);
  --font-head:'Playfair Display',Georgia,serif; --font-body:'Be Vietnam Pro',system-ui,-apple-system,'Segoe UI',sans-serif;
  --gutter:16px; --section-y:clamp(48px,8vw,96px);
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:400 16px/1.6 var(--font-body);overflow-x:hidden}
img{max-width:100%;height:auto;display:block}
h1,h2,h3{font-family:var(--font-head);line-height:1.2;margin:0 0 .5em}
h1{font-size:clamp(2rem,6vw,3.5rem)} h2{font-size:clamp(1.5rem,4vw,2.25rem)}
a{color:inherit}
:focus-visible{outline:3px solid var(--rose);outline-offset:3px}
.container{width:100%;max-width:1120px;margin-inline:auto;padding-inline:var(--gutter)}
.section{padding-block:var(--section-y)}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 28px;border-radius:999px;font-weight:700;text-decoration:none;cursor:pointer;transition:transform .2s,box-shadow .2s}
.btn--primary{background:linear-gradient(135deg,var(--rose),var(--rose-dark));color:#fff;box-shadow:0 10px 24px rgba(183,110,121,.35)}
.btn--primary:hover{transform:translateY(-2px)}
.reveal{transition:opacity .6s ease,transform .6s ease}
.js .reveal{opacity:0;transform:translateY(24px)}
.js .reveal.is-in{opacity:1;transform:none}
.sticky-cta{position:fixed;inset:auto 0 0 0;transform:translateY(110%);transition:transform .3s;z-index:50}
.sticky-cta.is-visible{transform:none}
@media (min-width:900px){.sticky-cta{display:none}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}.js .reveal{opacity:1;transform:none}}
```

Remaining rules to write (all values from tokens): hero two-column ≥900px (image right, 4:5 ratio, `object-fit:cover`), `.size-table` full-width with `tr.is-match{background:var(--champagne);font-weight:700}`, `.rating__bar` (`<div>` track with inner `<span style="--p:92.7%">` width `var(--p)`), `.faq details` with custom marker, `.sticky-cta` content row (price + button), cards grid breakpoints (1 col → 2 at 600px → 3/4 at 900px), `body{padding-bottom:72px}` on mobile so the sticky bar never covers the footer.

- [ ] **Step 3: Lint CSS** — if `stylelint` is not installed, skip and rely on browser check in Task 7; otherwise `npx stylelint styles.css`. Expected: no errors.

- [ ] **Step 4: Update `SESSION_STATE.md`** — Handoff = Task 5.

---

### Task 5: index.html part 1 — head, top bar, hero, benefits, before/after, details

**Files:**
- Create: `index.html` (sections 1–6 + head; Task 6 appends the rest and the closing tags — leave `<!-- TASK6 -->` out of the final file)

**Interfaces:**
- Consumes: asset names + dims from Task 1 output; class contract from Task 4; `main.js` DOM contract from Task 2.
- Produces: `id="hero"`, `id="loi-ich"`, `id="truoc-sau"`, `id="chi-tiet"`; CTA anchor pattern below.

- [ ] **Step 1: Write the `<head>`**

```html
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gen nịt bụng latex Solist – Định hình vòng eo | 390.000₫</title>
<meta name="description" content="Gen nịt bụng latex Solist ren Chantilly thoáng mát, khóa kéo chống trượt, size XXS–XXL. 4.9★ (4.088 đánh giá), đổi size 7 ngày. Mua trên TikTok Shop.">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="https://YOUR-DOMAIN.vn/">
<link rel="alternate" hreflang="vi" href="https://YOUR-DOMAIN.vn/">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#14110f">
<meta property="og:type" content="product">
<meta property="og:locale" content="vi_VN">
<meta property="og:site_name" content="Gen nịt bụng Solist">
<meta property="og:title" content="Gen nịt bụng latex Solist – Định hình vòng eo, ôm dáng tự tin">
<meta property="og:description" content="Ren Chantilly thoáng mát, khóa kéo chống trượt, đổi size 7 ngày, hạ size trọn đời. 4.9★ từ 4.088 đánh giá.">
<meta property="og:url" content="https://YOUR-DOMAIN.vn/">
<meta property="og:image" content="https://YOUR-DOMAIN.vn/assets/og-image.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" as="image" href="assets/gen-nit-bung-latex-solist-hero.webp" fetchpriority="high">
<link rel="preload" as="font" type="font/woff2" href="assets/fonts/<be-vietnam-pro-vietnamese-400 file from Task 1>" crossorigin>
<link rel="stylesheet" href="assets/fonts/fonts.css">
<link rel="stylesheet" href="styles.css">
<script defer src="main.js"></script>
<script type="application/ld+json">{ ...Task 6 Step 3... }</script>
</head>
<body>
```
(Use the real woff2 filename printed in Task 1; if the Google Fonts fallback was used, replace the two font lines with the fallback links.)

- [ ] **Step 2: CTA anchor pattern (use for every CTA, change only `<slot>` in both places and the label)**

```html
<a class="btn btn--primary" data-cta="hero" target="_blank" rel="sponsored nofollow noopener"
   href="https://shop.tiktok.com/vn/pdp/1734569027011249683?utm_source=landing&amp;utm_medium=cta&amp;utm_campaign=hero">Mua ngay trên TikTok Shop</a>
```

- [ ] **Step 3: Write sections with exactly this copy**

| Section / element | Content |
|---|---|
| `.topbar` | "Tặng chì kẻ mày · Đổi size 7 ngày · Hạ size miễn phí trọn đời" (CTA slot `top` wraps the text as a link) |
| `.header` | text logo "Solist" (Playfair) + `.btn--ghost` CTA "Mua trên TikTok Shop" slot `header` |
| `#hero` `.hero` | `.section__eyebrow`: "Đai latex định hình vòng eo"; **H1**: "Gen nịt bụng latex Solist – định hình vòng eo, ôm dáng tự tin"; lead: "Ren Chantilly cao cấp, khóa kéo chống trượt. Khách hàng nhận xét đeo thoải mái, thoáng không nóng. Tặng kèm chì kẻ mày khi mua trên TikTok Shop." `.stars` badge: "★ 4,9 · 4.088 đánh giá · 60,8K đã bán"; `.price`: `.price__now` "390.000₫", `.price__old` "429.000₫", `.price__off` "-9%"; CTA slot `hero` "Mua ngay trên TikTok Shop"; `.badges` chips: "Ren Chantilly thoáng mát", "Khóa kéo chống trượt", "Đổi size 7 ngày"; `.hero__media` `<img>` hero file, alt "Người mẫu mặc gen nịt bụng latex Solist màu đen định hình vòng eo", `fetchpriority="high"` (no `loading="lazy"`) |
| `#loi-ich` | H2 "Vì sao chọn gen nịt bụng Solist?"; 3 `.benefit` cards: (1) "Ren Chantilly thoáng mát" – "Chất liệu ren cao cấp, đeo thoải mái, không gây cảm giác nóng bí." (2) "Khóa kéo chống trượt" – "Khóa chắc chắn giúp mặc nhanh và giữ đai cố định suốt ngày dài." (3) "Hạ size trọn đời" – "Miễn phí hạ size khi vòng eo thon gọn hơn." |
| `#truoc-sau` | H2 "Trước và sau khi mặc gen Solist"; `.compare` `<img>` before/after file, alt "Ảnh so sánh trước và sau khi mặc gen nịt bụng latex Solist"; caption "Hiệu quả tạo dáng có thể khác nhau tùy vóc dáng từng người." |
| `#chi-tiet` | H2 "Thiết kế tối ưu từng chi tiết"; 2 images (`chi-tiet-thiet-ke-gen-den`, `…-be`) alts "Chi tiết thiết kế gen nịt bụng Solist màu đen" / "…màu be"; 5 `.detail` items: "Form đồng hồ cát ngay khi mặc", "Eo thon, ôm vừa vặn", "Che phủ khuyết điểm vùng bụng", "Khóa chống trượt, cố định chắc chắn", "Xương định hình dài 22–30cm"; plus `dang-dong-ho-cat-gen-den`/`-be` images with alts "Gen Solist màu đen tạo đường cong chuẩn trên người mẫu" / "…màu be…" |

All images use the real `width`/`height` from Task 1, `loading="lazy"` except hero. Sections other than hero carry class `reveal`.

- [ ] **Step 4: Update `SESSION_STATE.md`** — Handoff = Task 6.

---

### Task 6: index.html part 2 — remaining sections, JSON-LD, close tags

**Files:**
- Modify: `index.html` (append after Task 5 content; fill the JSON-LD `<script>` in `<head>`)

**Interfaces:**
- Consumes: Task 5 file; DOM contract from Task 2 (`#waist`, `#size-result`, `#size-table`, `tr[data-size]`, `#sticky-cta`).
- Produces: a complete page that passes `node tools/check.mjs`.

- [ ] **Step 1: Write sections with exactly this copy**

| Section | Content |
|---|---|
| `#goi-san-pham` | H2 "Chọn màu và gói phù hợp"; 4 `.bundle` cards, each: image, name, includes, CTA "Xem giá trên TikTok Shop". (1) "Siêu cấp VIP Da (Be)" – `gen-latex-solist-be-da` – "Gen màu be + tặng chì kẻ mày", slot `bundle-da`. (2) "Siêu cấp VIP Đen" – `gen-latex-solist-den` – "Gen màu đen + tặng chì kẻ mày", slot `bundle-den`. (3) "VIP Da + Áo liner" – `gen-latex-solist-be-ao-liner` – "Gen màu be kèm áo liner mặc lót bên trong", slot `bundle-da-liner`. (4) "VIP Đen + Áo liner" – `gen-latex-solist-den-ao-liner` – "Gen màu đen kèm áo liner mặc lót bên trong", slot `bundle-den-liner`. Alts: "Gen nịt bụng Solist <màu> <gói>" |
| `#bang-size` | H2 "Bảng size gen nịt bụng Solist – chọn đúng size trong 10 giây"; lead "Đo vòng eo tại vị trí số 2 (trên rốn 3cm). Không đo theo size quần áo và không tính theo size của dòng đai khác."; `<label for="waist">Vòng eo của bạn (cm)</label><input id="waist" inputmode="decimal" autocomplete="off" placeholder="Ví dụ: 72">`; `<p id="size-result" class="size__result" aria-live="polite">Nhập số đo vòng eo (cm) để xem size phù hợp.</p>`; `<table id="size-table" class="size-table">` with `<caption>Bảng size gen latex Solist theo cân nặng và vòng eo</caption>`, header Size / Cân nặng (kg) / Vòng eo (cm), rows `<tr data-size="XXS"><td>XXS</td><td>&lt;41</td><td>&lt;57</td></tr>`, XS 42–46 / 58–67, S 47–54 / 67–72, M 55–60 / 71–80, L 61–67 / 81–86, XL 68–77 / 87–96, XXL &gt;78 / 97–110; CTA slot `size` "Chọn size trên TikTok Shop" |
| `#cach-mac` | H2 "Hướng dẫn mặc gen Solist đúng cách"; ordered `.steps`: "Cài hai móc bên trong trước", "Cài phần móc khóa bên ngoài đúng khớp", "Một tay giữ đầu khóa (cách đầu khóa 3–5cm), tay còn lại kéo khóa lên từ từ đến điểm cuối". H3 "Bảo quản": "Giặt bằng nước ở nhiệt độ thường", "Không là/ủi sản phẩm", "Không dùng chất tẩy rửa mạnh, chỉ dùng nước giặt hoặc nước xả vải thông thường", "Không phơi trực tiếp dưới ánh nắng gắt" |
| `#danh-gia` | H2 "4,9★ từ 4.088 đánh giá trên TikTok Shop"; `.rating` bars (label, bar `--p`, count): 5★ 3.790 (92.7%), 4★ 201 (4.9%), 3★ 50 (1.2%), 2★ 12 (0.3%), 1★ 35 (0.9%); 2 `.quote` blockquotes: (a) "Đúng ý, xài êm, giao hàng nhanh và đầy đủ" — t**🍫, đã mua: Siêu cấp VIP Da, size L, 14/07/2026; (b) "Đai đeo thoải mái. Thoáng ko nóng đc tặng áo lót và son." — N**c N**n, đã mua: VIP Da + áo liner, size S, 19/05/2026; footnote "Đánh giá từ khách hàng đã mua trên TikTok Shop"; `khach-hang-mac-gen-solist` image alt "Nhiều khách hàng mặc gen nịt bụng Solist" |
| `#chinh-hang` | H2 "Phân biệt gen Solist chính hãng"; image `phan-biet-gen-solist-chinh-hang` alt "So sánh gen Solist chính hãng và hàng thị trường"; two lists: "Hàng chính hãng Solist": "Màu be vải đẹp", "Có tem thương hiệu rõ ràng", "Rõ vòng eo, che bụng dưới", "Chất liệu dày, bền"; "Hàng thị trường": "Màu xỉn nhăn", "Không có tem thương hiệu", "Không có vòng eo, lộ bụng dưới", "Chất liệu nhăn, dễ rách"; sentence "Mua tại Cửa hàng Solist Chính Chủ trên TikTok Shop." |
| `#bao-hanh` | H2 "Cam kết từ shop"; 3 `.guarantee`: "Đổi size trong 7 ngày", "Bảo hành khóa kéo 3 tháng", "Miễn phí hạ size trọn đời"; line "Sản phẩm lỗi do nhà sản xuất: giữ nguyên tem – mác – bao bì và liên hệ shop để được hỗ trợ." |
| `#hoi-dap` | H2 "Câu hỏi thường gặp"; 7 `<details class="faq"><summary>Q</summary><p>A</p></details>` — see FAQ table below |
| `#mua-ngay` `.final` | H2 "Sẵn sàng định hình vòng eo cùng Solist?"; price recap (390.000₫ / 429.000₫ / -9%); "Tặng kèm chì kẻ mày khi mua trên TikTok Shop"; CTA slot `final` "Mua ngay trên TikTok Shop" |
| `.footer` | "Gen nịt bụng latex Solist · Cửa hàng Solist Chính Chủ trên TikTok Shop"; "Giá và đánh giá lấy từ TikTok Shop tại thời điểm cập nhật, có thể thay đổi."; link "Xem sản phẩm trên TikTok Shop" (slot `footer`); "Trang giới thiệu sản phẩm, đơn hàng được xử lý trên TikTok Shop." |
| `#sticky-cta` `.sticky-cta` | row: "390.000₫" + "429.000₫" struck + CTA slot `sticky` "Mua ngay" |

FAQ table (question → answer; must match JSON-LD verbatim):

| # | Question | Answer |
|---|---|---|
| 1 | Chọn size gen nịt bụng Solist như thế nào? | Đo vòng eo tại vị trí trên rốn 3cm rồi đối chiếu bảng size. Không đo theo size quần áo hay size đai hãng khác. Nếu chưa vừa, shop đổi size trong 7 ngày và hạ size miễn phí trọn đời. |
| 2 | Gen Solist có những màu nào? | Có hai màu: Đen và Be (màu da). |
| 3 | Cách mặc gen nịt bụng Solist đúng cách? | Cài hai móc bên trong trước, cài phần móc khóa bên ngoài đúng khớp, rồi một tay giữ đầu khóa cách 3–5cm, tay còn lại kéo khóa lên từ từ đến điểm cuối. |
| 4 | Giặt và bảo quản gen như thế nào? | Giặt bằng nước ở nhiệt độ thường, không là/ủi, không dùng chất tẩy rửa mạnh, không phơi trực tiếp dưới ánh nắng gắt. |
| 5 | Chính sách đổi trả và bảo hành ra sao? | Đổi size trong 7 ngày, bảo hành khóa kéo 3 tháng, miễn phí hạ size trọn đời. Nếu lỗi từ nhà sản xuất, giữ nguyên tem – mác – bao bì và liên hệ shop. |
| 6 | Làm sao nhận biết gen Solist chính hãng? | Gen chính hãng có màu be vải đẹp, tem thương hiệu rõ ràng, rõ vòng eo che bụng dưới và chất liệu dày bền. Hãy mua tại Cửa hàng Solist Chính Chủ trên TikTok Shop. |
| 7 | Gói có áo liner khác gì gói thường? | Gói có áo liner kèm áo liner mặc lót bên trong gen để đeo thoải mái hơn. Gói thường tặng kèm chì kẻ mày. |

- [ ] **Step 2: Close the document**

End with `</main>` before footer as needed (structure: `<header>`, `<main>` with sections, `<footer>`, sticky bar), then `</body></html>`.

- [ ] **Step 3: Write the JSON-LD** (replace the placeholder `<script>` in `<head>`; use three separate `<script type="application/ld+json">` blocks)

```json
{"@context":"https://schema.org","@type":"Product",
 "name":"Gen nịt bụng latex Solist ren Chantilly – đai định hình vòng eo",
 "description":"Gen nịt bụng latex Solist ren Chantilly thoáng mát, khóa kéo chống trượt, 2 màu đen và be, size XXS–XXL.",
 "image":["https://YOUR-DOMAIN.vn/assets/gen-nit-bung-latex-solist-hero.webp","https://YOUR-DOMAIN.vn/assets/gen-latex-solist-den.webp","https://YOUR-DOMAIN.vn/assets/gen-latex-solist-be-da.webp"],
 "sku":"1734569027011249683",
 "brand":{"@type":"Brand","name":"Solist"},
 "offers":{"@type":"Offer","url":"https://shop.tiktok.com/vn/pdp/1734569027011249683","priceCurrency":"VND","price":"390000",
   "availability":"https://schema.org/InStock","itemCondition":"https://schema.org/NewCondition",
   "seller":{"@type":"Organization","name":"Cửa hàng Solist Chính Chủ"}},
 "aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"4088"}}
```
```json
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
 {"@type":"Question","name":"<FAQ Q1>","acceptedAnswer":{"@type":"Answer","text":"<FAQ A1>"}}
 /* … one object per row 1–7 of the FAQ table, text copied verbatim … */
]}
```
(The `/* … */` is shorthand in this plan only; the real file contains all 7 objects and no comment.)
```json
{"@context":"https://schema.org","@type":"WebSite","name":"Gen nịt bụng latex Solist","url":"https://YOUR-DOMAIN.vn/","inLanguage":"vi"}
```

- [ ] **Step 4: Run the check**

Run: `node tools/check.mjs`
Expected: every line `PASS`, final `ALL PASSED`, one `WARN placeholder domain …`. Fix any `FAIL` in `index.html`/`styles.css`, re-run until clean.

- [ ] **Step 5: Re-run unit test**

Run: `node --test tests/size.test.cjs`
Expected: `fail 0`.

- [ ] **Step 6: Update `SESSION_STATE.md`** — tick gates "lint/HTML validity" and "JSON-LD validity" with the raw `check.mjs` output; Handoff = Task 7.

---

### Task 7: Browser verification

**Files:** none (fix-ups edit `index.html` / `styles.css` as needed)

- [ ] **Step 1: Serve locally**

Run (background): `python -m http.server 8080 --directory C:\Users\AndersonHo\Desktop\mine\outsource\landing-1`
Expected: serves on `http://localhost:8080/`.

- [ ] **Step 2: Load page in Chrome DevTools MCP** — `new_page` `http://localhost:8080/`, then `list_console_messages`.
Expected: no errors (a missing-font 404 or CORS error on `fonts.css` counts as a failure).

- [ ] **Step 3: Responsive screenshots** — `resize_page` to 390×844, `take_screenshot` (full page); repeat at 1280×800. Review hero, bundles, size table, sticky bar, footer for overlap/clipping.

- [ ] **Step 4: Overflow gate at 320px** — `resize_page` 320×640, `evaluate_script`: `() => document.documentElement.scrollWidth <= window.innerWidth`
Expected: `true`.

- [ ] **Step 5: Size finder in browser** — `fill` `#waist` with `72,5`; `evaluate_script`: `() => document.getElementById('size-result').textContent + ' | ' + document.querySelector('tr.is-match')?.dataset.size`
Expected: text starts "Size gợi ý cho bạn: M." and row `M`.

- [ ] **Step 6: CTA** — `evaluate_script`: `() => [...document.querySelectorAll('a[data-cta]')].map(a => a.href)[0]`; open it in a new page with `navigate_page`.
Expected: URL starts `https://shop.tiktok.com/vn/pdp/1734569027011249683?utm_source=landing`. If TikTok shows a bot "Security Check", record it; do not treat as page failure, but note the clean URL could not be confirmed in-session and ask Anderson to click-test it once.

- [ ] **Step 7: Lighthouse** — `lighthouse_audit` (mobile).
Expected: SEO ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95; then `performance_start_trace`/`stop_trace` if Lighthouse performance < 90 and fix the top insight (usually image sizes or font loading).

- [ ] **Step 8: Finish** — stop the server; update `SESSION_STATE.md` Verification Gates with raw outputs; Handoff = "tell Anderson: replace `YOUR-DOMAIN.vn`, deploy as static site (Cloudflare Pages/Netlify/Vercel), submit sitemap to Google Search Console". After Anderson accepts the result, delete `SESSION_STATE.md` per lifecycle rule.

---

## Self-Review (done)

- **Spec coverage:** §1 CTA → Global Constraints + Task 5 pattern + check; §3 content rules → Constraints + check forbidden-regex + facts; §4 stack/files → File Structure; §5 visual → Task 4; §6 sections 1–16 → Tasks 5–6 (top bar, header, hero, benefits, before/after, details, bundles, size, how-to, reviews, authentic, guarantee, FAQ, final, footer, sticky); §7 images → Task 1; §8 SEO → Task 5 head, Task 6 JSON-LD, Task 1 robots/sitemap, check.mjs; §9 JS → Task 2; §10 a11y → Task 4/7; §11 verification → Tasks 3, 7.
- **Spec change made during planning:** JSON-LD has no `Review` entries (source shows no per-review star value); spec §8 updated.
- **Type consistency:** `parseCm`/`sizeFor`/`SIZES`, DOM ids (`waist`, `size-result`, `size-table`, `sticky-cta`, `hero`), `data-cta` slots are identical across Tasks 2, 3, 5, 6.
- **Known limits:** bundle prices not on source → bundle cards link out without prices; domain placeholder; TikTok CTA may hit a bot wall in headless verification.
