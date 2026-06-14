/* 观心墨池 · 点水起涟漪，诗偈如倒影浮现切换
   诗句来自 window.__pondVerses（_config.tranquility.yml 的 pond.verses）。
   尊重 prefers-reduced-motion：保留点击换句，简化涟漪、不自动流转。 */
(function () {
  'use strict';
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var water = document.getElementById('pondWater');
    var verseEl = document.getElementById('pondVerse');
    var layer = document.getElementById('rippleLayer');
    if (!water || !verseEl) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var verses = (window.__pondVerses && window.__pondVerses.length)
      ? window.__pondVerses.slice()
      : [verseEl.textContent.trim()];
    var idx = Math.floor(Math.random() * verses.length);

    // 把一句按 ，、；断句分行，营造对仗意境
    function render(text) {
      var lines = String(text).split(/[，,；;]/).filter(function (s) { return s.trim(); });
      verseEl.innerHTML = '';
      lines.forEach(function (ln) {
        var s = document.createElement('span');
        s.className = 'pond-verse__line';
        s.textContent = ln.trim();
        verseEl.appendChild(s);
      });
    }

    function show(i) {
      idx = (i % verses.length + verses.length) % verses.length;
      if (reduce) { render(verses[idx]); return; }
      verseEl.classList.add('is-fading');
      setTimeout(function () {
        render(verses[idx]);
        verseEl.classList.remove('is-fading');
      }, 460);
    }

    function ripple(x, y) {
      if (!layer) return;
      var n = reduce ? 1 : 2;
      for (var k = 0; k < n; k++) {
        (function (delay) {
          setTimeout(function () {
            var r = document.createElement('span');
            r.className = 'ripple';
            r.style.left = x + 'px';
            r.style.top = y + 'px';
            layer.appendChild(r);
            r.addEventListener('animationend', function () { r.remove(); });
          }, delay);
        })(k * 150);
      }
    }

    var timer = null;
    function startAuto() {
      if (reduce) return;
      stopAuto();
      timer = setInterval(function () {
        var rect = water.getBoundingClientRect();
        ripple(rect.width / 2, rect.height * 0.5);
        show(idx + 1);
      }, 9000);
    }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

    render(verses[idx]);

    water.addEventListener('click', function (e) {
      var rect = water.getBoundingClientRect();
      ripple(e.clientX - rect.left, e.clientY - rect.top);
      show(idx + 1);
      startAuto(); // 点击后重置自动计时
    });

    if (!reduce) {
      var rc = water.getBoundingClientRect();
      ripple(rc.width / 2, rc.height * 0.5);
      startAuto();
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAuto(); else startAuto();
    });
  });
})();
