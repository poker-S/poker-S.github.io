/* 水墨 · 文章目录 scrollspy + 平滑锚点 + 回到顶部
   作用于 toc() helper 输出的 .post-toc .toc-link 与 #postBody 内标题。
   纯原生，尊重 prefers-reduced-motion。 */
(function () {
  'use strict';
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var body = document.getElementById('postBody');
    if (!body) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 回到顶部
    var topBtn = document.getElementById('tocTop');
    if (topBtn) {
      topBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
    }

    // 收集所有目录链接（右轨 + 折叠块可能各一份，统一处理）
    var links = Array.prototype.slice.call(document.querySelectorAll('.post-toc .toc-link'));
    if (!links.length) return;

    // 锚点平滑滚动
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = decodeURIComponent((a.getAttribute('href') || '').replace(/^#/, ''));
        var target = id && document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
        if (history.replaceState) history.replaceState(null, '', '#' + id);
      });
    });

    // id -> 链接集合 映射
    var map = {};
    links.forEach(function (a) {
      var id = decodeURIComponent((a.getAttribute('href') || '').replace(/^#/, ''));
      if (!id) return;
      (map[id] = map[id] || []).push(a);
    });

    var headings = Array.prototype.slice.call(
      body.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')
    ).filter(function (h) { return map[h.id]; });
    if (!headings.length || !('IntersectionObserver' in window)) return;

    function setActive(id) {
      links.forEach(function (a) { a.classList.remove('is-active'); });
      (map[id] || []).forEach(function (a) {
        a.classList.add('is-active');
        if (a.scrollIntoView && a.closest && a.closest('.post-rail--right')) {
          a.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        visible[en.target.id] = en.isIntersecting;
      });
      var current = null;
      for (var i = 0; i < headings.length; i++) {
        if (visible[headings[i].id]) { current = headings[i].id; break; }
      }
      if (current) setActive(current);
    }, { rootMargin: '-100px 0px -65% 0px', threshold: 0 });

    headings.forEach(function (h) { io.observe(h); });
  });
})();
