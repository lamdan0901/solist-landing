# Solist Latex Waist Cincher – Landing Page Design

Date: 2026-10-08 · Status: awaiting user review

## 1. Goal
One Vietnamese, mobile-first landing page that advertises the Solist latex waist cincher and sends every click to the TikTok Shop product page. Primary KPI: click-through to TikTok Shop. Secondary: organic Vietnamese search traffic ("gen nịt bụng", "đai latex định hình vòng eo", "gen Solist").

CTA target: `https://shop.tiktok.com/vn/pdp/1734569027011249683?utm_source=landing&utm_medium=cta&utm_campaign=<slot>` with `rel="sponsored nofollow noopener"` and `target="_blank"`. `<slot>` = hero | sticky | bundle | final etc. so clicks can be told apart. Clean URL used instead of the long share link (share tokens can expire). Must be tested in a real browser at build time.

## 2. Non-goals
No backend, no cart/checkout, no order form, no analytics vendor (hook point only), no multi-language, no CMS.

## 3. Content rules
- Facts only from the saved TikTok page (`C:\Users\AndersonHo\Desktop\cloned-site\main.html`): 390.000₫ (was 429.000₫, -9%), 4.9★, 4.088 reviews (5★ 3790, 4★ 201, 3★ 50, 2★ 12, 1★ 35), 60,8K sold, shop "Cửa hàng Solist Chính Chủ", free eyebrow pencil gift, 7-day size exchange, 3-month zipper warranty, free size-down for life, free-shipping voucher shown on shop.
- Product: Chantilly lace, colors Đen / Be (da), sizes XXS–XXL, boning length 22–30 cm. Bundles: VIP DA, VIP ĐEN, VIP DA + ÁO LINER, VIP ĐEN + ÁO LINER.
- Reviews: only the 2 unique real quotes on the saved page (t**🍫 2026-07-14; N**c N**n 2026-05-19; the second appears twice on the page, used once) quoted verbatim, attributed as TikTok Shop verified purchases.
- No fake countdown, fake stock, or invented testimonials. No health/fat-loss claims; wording limited to "định hình vòng eo", "ôm dáng", "thoáng mát", "dễ mặc".
- Prices/ratings are a snapshot; footer states "Giá và đánh giá lấy từ TikTok Shop tại thời điểm cập nhật, có thể thay đổi."

## 4. Stack & files
Plain HTML/CSS/JS, no build.

```
index.html   styles.css   main.js   robots.txt   sitemap.xml   DESIGN.md
assets/      (webp images, favicon, og-image)
```
Fonts: Playfair Display + Be Vietnam Pro, Vietnamese subset, `display=swap`, self-hosted woff2 if downloadable at build time, else Google Fonts with `preconnect`.

## 5. Visual design (full tokens go in DESIGN.md)
- Colors: ink `#14110f`, champagne `#e9d8bd`, rose-gold accent `#b76e79`, off-white bg `#faf7f2`, success/star gold `#c9a227`.
- Type: Playfair Display headings (clamp scale), Be Vietnam Pro body 16px min.
- Radius 16px cards, soft shadows, 8px spacing grid, 44px min tap targets, CTA = rose-gold gradient pill, high contrast (AA).
- Motion: subtle fade-up on scroll (IntersectionObserver), respects `prefers-reduced-motion`.

## 6. Page structure (top to bottom)
1. **Top bar** – "Tặng chì kẻ mày · Miễn phí hạ size trọn đời".
2. **Header** – logo text "Solist" + CTA "Mua trên TikTok Shop".
3. **Hero** (H1) – "Gen nịt bụng latex Solist – định hình vòng eo, ôm dáng tự tin"; subcopy; rating badge; price block; primary CTA; trust chips (Chantilly thoáng mát · Khóa kéo chống trượt · Đổi size 7 ngày); model image.
4. **Benefits strip** – 3 cards.
5. **Before/after** – photo `trước/sau` + short caption.
6. **Design details** – 5 points (khóa chống trượt, xương định hình, ren Chantilly, che phủ khuyết điểm, cố định chắc chắn) with detail images.
7. **Bundle & color picker** – 4 bundles (image, name, includes), each CTA -> TikTok.
8. **Size finder** – input waist cm -> highlights size row; HTML table (XXS <57 … XXL 97–110) + measuring tips ("đo tại vị trí 2, trên rốn 3cm", "không đo theo size quần áo").
9. **How to wear** – 3 steps from description; care list.
10. **Reviews** – 4.9 summary, 5-bar distribution, 2 quotes.
11. **Genuine vs counterfeit** – comparison image + bullets.
12. **Guarantee cards** – đổi size 7 ngày · bảo hành khóa kéo 3 tháng · hạ size trọn đời.
13. **FAQ** (7 Q&A, `<details>`) – size, màu, cách mặc, vệ sinh, đổi trả, chính hãng, mặc dưới váy.
14. **Final CTA** – price recap + gift.
15. **Footer** – disclaimer, shop name, TikTok link.
16. **Sticky mobile CTA bar** – price + button, shown after hero leaves viewport.

## 7. Image plan
Source: `main_files\` of saved page. Gallery (img idx in page order): 3 before/after, 4 & 5 model, 6 genuine-vs-fake, 7/8 product on model, 9 size chart (rebuilt as table, not used), 10 flat skin. Description imgs 28–43: model editorial 28/29/31/32, banner 30, product 33/34, worn under clothes 35/36, group 37, design details 40/42, features 41/43. Skip: 1 (10/10 sale banner), 2 (policy card, rebuilt in HTML), 11–26 (unrelated review photos). Final pick done by viewing at build time. Copy -> `assets/` with descriptive names (`gen-nit-bung-latex-solist-den.webp` …), keep webp, set `width`/`height`, `loading="lazy"` except hero (`fetchpriority="high"` + preload). Generate `og-image.jpg` 1200×630 from a hero image.

## 8. SEO
- `<html lang="vi">`, one H1, ordered H2/H3, keyword-led `<title>` (≤60 chars) and meta description (≤155 chars), `meta robots index,follow`, canonical (placeholder domain `https://example.vn/` replaced at deploy), `hreflang vi`.
- Open Graph + Twitter card with og-image.
- JSON-LD: `Product` (name, image[], brand Solist, offers 390000 VND InStock priceValidUntil omitted, aggregateRating 4.9 / 4088; no per-`Review` entries because the source page shows no per-review star value and none may be invented), `FAQPage` (mirrors visible FAQ exactly), `WebSite`.
- Vietnamese descriptive `alt` on all images; semantic landmarks (`header/main/section/footer`); internal anchor nav.
- `robots.txt` (allow all, sitemap line), `sitemap.xml` (single URL), favicon set.
- Performance: no render-blocking JS (`defer`), critical CSS small single file, font preload, images sized, total page < 1.5 MB target.
- Keyword set (natural use in copy, no stuffing): gen nịt bụng, đai latex định hình, gen định hình vòng hai, gen Solist chính hãng, đai nịt bụng ren Chantilly, bảng size gen nịt bụng.

## 9. JS behavior (main.js, ~60 lines)
- Size finder (waist cm -> size, highlight row, graceful if empty/out of range).
- Sticky CTA visibility (IntersectionObserver on hero).
- Scroll reveal.
- CTA click hook: `window.dataLayer?.push({event:'cta_click', slot})` (no vendor installed).
- Page fully readable with JS disabled.

## 10. Accessibility
AA contrast, visible focus, `<details>` for FAQ, labeled input for size finder with `inputmode="numeric"`, reduced-motion respected, 44px targets.

## 11. Verification
HTML validity + lint; JSON-LD parsed with a script and checked against visible content; Lighthouse via Chrome DevTools at mobile; manual check at 390px and 1280px; confirm CTA URL opens in a browser; console clean. No production build step exists.

## 12. Open items
- Real domain for canonical/OG/sitemap (placeholder until supplied).
- Optional later: Pixel/GA4, second language.
