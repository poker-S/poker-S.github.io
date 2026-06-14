/* 水墨 · 滚动进场
   给带 .reveal 的元素在进入视口时加 .is-visible，配合 _ink.styl 的过渡。
   尊重 prefers-reduced-motion。 */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // ---------- 文章阅读进度条 ----------
  ready(function () {
    var bar = document.getElementById('readProgressBar');
    if (!bar) return;
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop || window.pageYOffset) / max : 0;
      if (pct < 0) pct = 0; else if (pct > 1) pct = 1;
      bar.style.width = (pct * 100) + '%';
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  });

  // ---------- 滚动进场 ----------
  ready(function () {
    var nodes = document.querySelectorAll('.reveal');
    if (!nodes.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      nodes.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // 同组卡片错落进场
          var delay = el.dataset.revealDelay || 0;
          el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    // 为同一网格内的卡片设置递增延迟
    var groups = new Map();
    nodes.forEach(function (el) {
      var parent = el.parentNode;
      if (!parent) return;
      var arr = groups.get(parent) || [];
      arr.push(el);
      groups.set(parent, arr);
    });
    groups.forEach(function (arr) {
      arr.forEach(function (el, i) {
        el.dataset.revealDelay = Math.min(i * 90, 540);
      });
    });

    nodes.forEach(function (el) { io.observe(el); });
  });

  // ---------- SVG 写意自绘（笔画自己写出来） ----------
  ready(function () {
    var arts = document.querySelectorAll('.ink-art, .ink-divider');
    if (!arts.length) return;

    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 预置每条 path 的真实长度与书写延迟（CSS 变量驱动）
    arts.forEach(function (art) {
      var strokes = art.querySelectorAll && art.querySelectorAll('.ink-stroke');
      if (!strokes || !strokes.length) return;
      strokes.forEach(function (p) {
        var len = 0;
        try { len = Math.ceil(p.getTotalLength()); } catch (e) { len = 1200; }
        p.style.setProperty('--len', len);
        var order = parseInt(p.getAttribute('data-stroke-order') || '0', 10);
        // 笔画依次书写：每笔间隔 320ms，主笔先行
        p.style.setProperty('--draw-delay', (order * 320) + 'ms');
      });
    });

    function draw(el) { el.classList.add('is-drawn'); }

    if (reduce || !('IntersectionObserver' in window)) {
      arts.forEach(draw);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          draw(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -6% 0px' });

    arts.forEach(function (el) { io.observe(el); });
  });
})();
