/* 关于我 · 山水寻径 交互
   单 scroll+rAF 写 --p/--sy 驱动墨径自走/视差/引路虾/游标；
   盖印展开 · 题跋拖拽 · 回卷首。尊重 prefers-reduced-motion。 */
(function () {
  'use strict';
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var scape = document.getElementById('scape');
    if (!scape) return;
    var root = document.documentElement;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- 墨径长度（自走的基础） ----
    var line = scape.querySelector('.trail-line');
    var len = 1000;
    if (line) {
      try { len = Math.ceil(line.getTotalLength()); } catch (e) { len = 1000; }
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
    }

    // ---- 滚动驱动（单监听 + 单 rAF） ----
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = (h.scrollHeight - h.clientHeight) || 1;
      var sy = window.pageYOffset || h.scrollTop || 0;
      var p = sy / max;
      if (p < 0) p = 0; else if (p > 1) p = 1;
      root.style.setProperty('--p', p);
      // 视差在"减少动效"下关闭（避免眩晕），但墨径/引路虾仍随滚动指引
      root.style.setProperty('--sy', reduce ? '0px' : (sy + 'px'));
      if (line) line.style.strokeDashoffset = len * (1 - p);
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }

    // 滚动驱动（墨径自走 / 引路虾沿径指引 / 游标）由用户滚动触发，
    // 属进度指示而非自主动画，即便"减少动效"也保留。
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    // ---- 获奖印：点击/回车 展开洇染 ----
    var seals = scape.querySelectorAll('[data-seal]');
    seals.forEach(function (el) {
      el.addEventListener('click', function () { el.classList.toggle('is-open'); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.classList.toggle('is-open'); }
      });
    });

    // ---- 回卷首 ----
    var top = document.getElementById('scapeTop');
    if (top) {
      top.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
    }

    // ---- 题跋拖拽（仅精确指针、非 reduce） ----
    var colo = document.getElementById('colophon');
    var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (colo && fine && !reduce && window.PointerEvent) {
      var dragging = false, sx = 0, sy0 = 0;
      colo.style.touchAction = 'none';
      colo.addEventListener('pointerdown', function (e) {
        dragging = true; sx = e.clientX; sy0 = e.clientY;
        try { colo.setPointerCapture(e.pointerId); } catch (err) {}
        colo.classList.add('is-dragging');
      });
      colo.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - sx, dy = e.clientY - sy0;
        var ox = Math.max(-40, Math.min(40, dx));
        var oy = Math.max(-30, Math.min(30, dy));
        colo.style.transform = 'translate(' + ox + 'px,' + oy + 'px) rotate(' + (ox * 0.05) + 'deg)';
      });
      function end() {
        if (!dragging) return;
        dragging = false;
        colo.classList.remove('is-dragging');
        colo.style.transform = '';
      }
      colo.addEventListener('pointerup', end);
      colo.addEventListener('pointercancel', end);
    }
  });
})();
