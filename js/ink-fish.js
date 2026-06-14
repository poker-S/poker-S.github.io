/* 水墨游鱼 · 追踪鼠标在其大致区域随意游动（非绕圈）
   自包含、无依赖。全屏 fixed canvas，带淡墨水迹尾痕。
   亮色画浓墨(配 multiply)，夜墨画墨白(配 screen)。
   尊重 prefers-reduced-motion；触屏/无指针时在画面中部自在闲游。 */
(function () {
  'use strict';

  // 游鱼是站长明确要的特性：即便系统"减少动效"也照常出现，只是游得更舒缓。
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.requestAnimationFrame) return;

  var DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  var W = 0, H = 0;
  var cv = document.createElement('canvas');
  cv.id = 'ink-fish-canvas';
  var ctx = cv.getContext('2d');

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // 鼠标
  var mx = window.innerWidth * 0.5, my = window.innerHeight * 0.42, hasMouse = false, lastMove = 0;
  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY; hasMouse = true; lastMove = perfNow();
  }, { passive: true });

  function perfNow() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

  // 鱼的状态 + 尾痕
  var fish = { x: mx, y: my, ang: 0, sp: 0.8, phase: 0 };
  var target = { x: mx, y: my };
  var nextPick = 0;
  var trail = [];

  function pickTarget(now) {
    var idle = !hasMouse || (now - lastMove) > 3000;
    if (idle) {
      // 闲游：只在画面中部漫游，不躲到边角
      target.x = W * 0.28 + Math.random() * W * 0.44;
      target.y = H * 0.22 + Math.random() * H * 0.5;
      nextPick = now + 1500 + Math.random() * 2200;
    } else {
      // 鼠标大致区域随机取点：随手一点，不绕圈
      var R = 140;
      var a = Math.random() * Math.PI * 2;
      var r = 26 + Math.random() * R;
      target.x = mx + Math.cos(a) * r;
      target.y = my + Math.sin(a) * r * 0.72;
      nextPick = now + 650 + Math.random() * 950;
    }
  }

  // 画一尾写意墨鱼（朝 +x），含浓淡渐变与摆尾
  function drawFish(color, a) {
    var L = 34, hh = 12;
    var sway = Math.sin(fish.phase) * 7;
    var bend = Math.sin(fish.phase) * 3.4;

    var grad = ctx.createLinearGradient(L, 0, -L, 0);
    grad.addColorStop(0, color(a));
    grad.addColorStop(0.6, color(a * 0.72));
    grad.addColorStop(1, color(a * 0.3));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(L, 0);
    ctx.quadraticCurveTo(L * 0.2, -hh, -L * 0.4, -hh * 0.5 + bend);
    ctx.quadraticCurveTo(-L * 0.85, -hh * 0.4 + sway * 0.5, -L, sway);
    ctx.quadraticCurveTo(-L * 0.85, hh * 0.4 + sway * 0.5, -L * 0.4, hh * 0.5 + bend);
    ctx.quadraticCurveTo(L * 0.2, hh, L, 0);
    ctx.closePath();
    ctx.fill();

    // 尾鳍：双叉一扫
    ctx.fillStyle = color(a * 0.5);
    ctx.beginPath();
    ctx.moveTo(-L, sway);
    ctx.quadraticCurveTo(-L - 20, sway - 14 + sway, -L - 28, sway - 20 + sway * 1.6);
    ctx.quadraticCurveTo(-L - 14, sway, -L - 28, sway + 20 + sway * 1.6);
    ctx.quadraticCurveTo(-L - 20, sway + 14 + sway, -L, sway);
    ctx.closePath();
    ctx.fill();

    // 背鳍
    ctx.fillStyle = color(a * 0.55);
    ctx.beginPath();
    ctx.moveTo(-L * 0.1, -hh + bend);
    ctx.quadraticCurveTo(-L * 0.32, -hh - 9 + bend, -L * 0.6, -hh * 0.6 + bend);
    ctx.quadraticCurveTo(-L * 0.32, -hh * 0.8 + bend, -L * 0.1, -hh + bend);
    ctx.closePath();
    ctx.fill();

    // 眼：一点浓墨
    ctx.fillStyle = color(Math.min(1, a + 0.25));
    ctx.beginPath();
    ctx.arc(L * 0.64, -hh * 0.28, 1.8, 0, 6.283);
    ctx.fill();
  }

  var running = true;
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(loop);
  });

  function loop() {
    if (!running) return;
    var now = perfNow();
    ctx.clearRect(0, 0, W, H);

    if (now >= nextPick) pickTarget(now);

    var dx = target.x - fish.x, dy = target.y - fish.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 30) pickTarget(now);

    var desired = Math.atan2(dy, dx);
    var diff = ((desired - fish.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    fish.ang += diff * 0.07;

    var cruise = Math.min(2.8, 0.8 + dist * 0.016);
    if (reduce) cruise *= 0.55;  // 舒缓
    fish.sp += (cruise - fish.sp) * 0.06;
    fish.x += Math.cos(fish.ang) * fish.sp;
    fish.y += Math.sin(fish.ang) * fish.sp;
    fish.phase += 0.2 + fish.sp * 0.05;

    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var rgb = dark ? '224,216,200' : '30,28,24';
    function color(al) { return 'rgba(' + rgb + ',' + al + ')'; }
    var baseAlpha = dark ? 0.62 : 0.72;

    // 尾痕：淡墨水迹，越旧越淡（"减少动效"下省略）
    if (!reduce) {
      trail.push({ x: fish.x, y: fish.y });
      if (trail.length > 16) trail.shift();
      for (var i = 0; i < trail.length; i++) {
        var t = trail[i];
        var ta = (i / trail.length) * baseAlpha * 0.22;
        ctx.fillStyle = color(ta);
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2 + i * 0.25, 0, 6.283);
        ctx.fill();
      }
    }

    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(fish.ang);
    if (Math.cos(fish.ang) < 0) ctx.scale(1, -1);
    drawFish(color, baseAlpha);
    ctx.restore();

    requestAnimationFrame(loop);
  }

  function init() {
    if (!document.body) return;
    document.body.appendChild(cv);
    resize();
    fish.x = mx; fish.y = my; target.x = mx; target.y = my;
    window.addEventListener('resize', resize, { passive: true });
    requestAnimationFrame(loop);
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
