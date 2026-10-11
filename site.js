// treat(ment)'s — grain texture + loops that play only on screen.
(() => {
  // Figma frame effect: NOISE, monotone, black at 12 % alpha, size .5, density .76.
  // Its grains are sub-pixel, so per pixel it averages out: alpha 0..6.2 %, mean 3 %
  // (matches the Figma render: #d9d9d9 plates read 210 ± 2.5 at the same scale).
  const noise = document.querySelector('.noise');
  try {
    const S = 256, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d'), img = ctx.createImageData(S, S), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i + 3] = 255 * 0.062 * Math.random();
    }
    ctx.putImageData(img, 0, 0);
    noise.style.backgroundImage = `url(${c.toDataURL('image/png')})`;
    noise.style.backgroundSize = `${S / dpr}px ${S / dpr}px`;
  } catch (e) { /* no canvas: no grain */ }

  // hero slots: a random loop from the pool in each of the six plates, a fresh shuffle on every visit
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pool = (window.HERO_POOL || []).slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const slots = [...document.querySelectorAll('.slot video')];
  const webm = slots.length && slots[0].canPlayType('video/webm; codecs="vp9"');
  slots.forEach((v, i) => {
    const name = pool[i % (pool.length || 1)]; if (!name) return;
    v.poster = `media/hero/${name}.jpg`;
    v.addEventListener('loadeddata', () => v.classList.add('on'), { once: true });
    if (still) { v.preload = 'metadata'; v.classList.add('on'); }
    v.src = `media/hero/${name}.${webm ? 'webm' : 'mp4'}`;
  });

  // loops: play while on screen, pause otherwise; stills only under reduced motion
  const videos = [...document.querySelectorAll('.media video'), ...slots];
  if (still || !('IntersectionObserver' in window)) {
    if (!still) videos.forEach(v => { v.autoplay = true; v.play().catch(() => {}); });
    return;
  }
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); }
      else v.pause();
    }
  }, { rootMargin: '25% 0px' });
  videos.forEach(v => io.observe(v));
})();
