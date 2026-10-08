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
ok(!/thon gọn hơn|chì kẻ|để đeo thoải mái hơn/i.test(html), 'no slimming implication / eyebrow-pencil gift / invented benefit');
for (const f of ['390.000', '429.000', '4,9', '4.088', '60,8K']) ok(text.includes(f), `fact present: ${f}`);

// no-JS safety
const css = read('styles.css');
ok(!/(?<!\.js\s)\.reveal\s*\{[^}]*opacity\s*:\s*0\b/.test(css), '.reveal not hidden unless under .js');
ok(/\.js\s+\.reveal/.test(css), '.js .reveal rule exists');
ok(/prefers-reduced-motion/.test(css), 'reduced-motion handled');

// static files
ok(/Sitemap:/.test(read('robots.txt')), 'robots.txt has Sitemap');
ok(/<loc>[^<]+<\/loc>/.test(read('sitemap.xml')), 'sitemap.xml has <loc>');
for (const f of ['DESIGN.md', 'favicon.svg', 'assets/og-image.jpg']) ok(existsSync(resolve(root, f)), `exists ${f}`);
if (html.includes('YOUR-DOMAIN.vn')) warn('placeholder domain YOUR-DOMAIN.vn still present (replace at deploy)');

console.log(failed ? `\n${failed} FAILED` : '\nALL PASSED');
process.exit(failed ? 1 : 0);
