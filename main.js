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
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' }); // ponytail: ratio thresholds never fire for sections taller than viewport/ratio
    els.forEach(function (el) { io.observe(el); });
  }

  // Analytics hook point (no vendor installed)
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-cta]');
    if (a && window.dataLayer) window.dataLayer.push({ event: 'cta_click', slot: a.dataset.cta });
  });
})();
