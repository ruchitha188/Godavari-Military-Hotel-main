/**
 * Godavari Military Hotel — 3D Gold Dust Background
 * Canvas-based particle system simulating 3D depth with gold shimmer
 */
(function () {
  'use strict';

  /* ─── Canvas Setup ──────────────────────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.id = 'gold-dust-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 1;
  `;
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');

  /* ─── Config ────────────────────────────────────────────────────────────── */
  const CONFIG = {
    COUNT:        220,       // total particles
    MIN_DEPTH:    0.1,       // closest z layer (small particles)
    MAX_DEPTH:    1.0,       // farthest z layer (larger particles)
    DRIFT_X:      0.18,      // horizontal flow speed
    DRIFT_Y:     -0.12,      // upward float speed (negative = up)
    WOBBLE:       0.006,     // sine wobble amplitude multiplier
    SHIMMER_SPD:  0.04,      // alpha shimmer speed
    BASE_RADIUS:  1.8,       // base radius multiplier
    MAX_ALPHA:    0.75,      // max particle opacity
    MOUSE_RADIUS: 160,       // mouse repel radius
    MOUSE_FORCE:  0.45,      // mouse repel strength
    WIND_CHANGE:  0.0004,    // how fast wind direction shifts
    SPARKLE_CHANCE: 0.002,   // probability per particle per frame of sparkle burst
  };

  /* ─── Gold colour palette ────────────────────────────────────────────────── */
  const GOLD_HUES = [
    [212, 175,  55],  // classic gold
    [201, 168,  76],  // site gold accent
    [255, 215,   0],  // bright gold
    [184, 148,  68],  // antique gold
    [240, 198, 116],  // pale champagne
    [255, 223,  77],  // warm yellow gold
    [210, 160,  40],  // dark gold
    [255, 231, 150],  // light shimmer
  ];

  function randomGold() {
    const g = GOLD_HUES[Math.floor(Math.random() * GOLD_HUES.length)];
    // slightly randomise each channel ±12
    return [
      Math.min(255, g[0] + (Math.random() - 0.5) * 24 | 0),
      Math.min(255, g[1] + (Math.random() - 0.5) * 24 | 0),
      Math.min(255, g[2] + (Math.random() - 0.5) * 24 | 0),
    ];
  }

  /* ─── Particle factory ───────────────────────────────────────────────────── */
  function createParticle(w, h, forceNew) {
    const depth   = CONFIG.MIN_DEPTH + Math.random() * (CONFIG.MAX_DEPTH - CONFIG.MIN_DEPTH);
    const [r, g, b] = randomGold();
    return {
      x:         forceNew ? Math.random() * w : Math.random() * w,
      y:         forceNew ? Math.random() * h : h + 10 + Math.random() * 40,
      z:         depth,
      vx:        (Math.random() - 0.5) * 0.3,
      vy:        -0.05 - Math.random() * 0.25,
      wobbleOff: Math.random() * Math.PI * 2,
      wobbleSpd: 0.012 + Math.random() * 0.018,
      shimmerOff: Math.random() * Math.PI * 2,
      shimmerSpd: CONFIG.SHIMMER_SPD * (0.6 + Math.random() * 0.8),
      r, g, b,
      baseRadius: (0.4 + Math.random() * 0.6) * CONFIG.BASE_RADIUS,
      rotAngle:  Math.random() * Math.PI * 2,
      rotSpeed:  (Math.random() - 0.5) * 0.04,
      sparkle:   false,
      sparkleT:  0,
      // shape: 0 = circle, 1 = flake/diamond, 2 = tiny line
      shape:     Math.random() < 0.55 ? 0 : (Math.random() < 0.6 ? 1 : 2),
    };
  }

  /* ─── Resize handler ─────────────────────────────────────────────────────── */
  let W = 0, H = 0;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ─── Mouse tracking ─────────────────────────────────────────────────────── */
  let mouseX = -9999, mouseY = -9999;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  window.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  /* ─── Wind / flow ────────────────────────────────────────────────────────── */
  let windAngle = 0;
  let windStrength = 0.06;

  /* ─── Particle pool ──────────────────────────────────────────────────────── */
  const particles = [];
  for (let i = 0; i < CONFIG.COUNT; i++) {
    particles.push(createParticle(W, H, true));
  }

  /* ─── Draw helpers ───────────────────────────────────────────────────────── */
  function drawCircle(p, x, y, radius, alpha) {
    const grad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
    grad.addColorStop(0,   `rgba(${p.r+40 > 255 ? 255 : p.r+40},${p.g+40 > 255 ? 255 : p.g+40},${p.b+20 > 255 ? 255 : p.b+20},${alpha})`);
    grad.addColorStop(0.5, `rgba(${p.r},${p.g},${p.b},${alpha * 0.9})`);
    grad.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function drawDiamond(p, x, y, radius, alpha, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const s = radius * 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.5, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * 0.5, 0);
    ctx.closePath();
    const grad = ctx.createLinearGradient(-s, -s, s, s);
    grad.addColorStop(0,   `rgba(255,240,180,${alpha})`);
    grad.addColorStop(0.4, `rgba(${p.r},${p.g},${p.b},${alpha})`);
    grad.addColorStop(1,   `rgba(${p.r * 0.7 | 0},${p.g * 0.6 | 0},${p.b * 0.4 | 0},${alpha * 0.3})`);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  function drawLine(p, x, y, radius, alpha, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`;
    ctx.lineWidth   = radius * 0.5;
    ctx.lineCap     = 'round';
    const len = radius * 3.5;
    ctx.beginPath();
    ctx.moveTo(0, -len);
    ctx.lineTo(0,  len);
    ctx.stroke();
    ctx.restore();
  }

  function drawSparkle(x, y, t, r, g, b) {
    const prog  = t / 30;
    const alpha = (1 - prog) * 0.9;
    const size  = 4 + prog * 12;
    // 4-point star burst
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    for (let a = 0; a < 4; a++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size * (a % 2 === 0 ? 1 : 0.55));
      ctx.strokeStyle = `rgb(${r},${g},${b})`;
      ctx.lineWidth   = 1.2 - prog * 0.8;
      ctx.stroke();
    }
    // central glow
    const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.6);
    sg.addColorStop(0, `rgba(255,248,200,${alpha})`);
    sg.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = sg;
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /* ─── Main loop ──────────────────────────────────────────────────────────── */
  let frame = 0;

  function animate() {
    requestAnimationFrame(animate);
    frame++;

    ctx.clearRect(0, 0, W, H);

    // Slowly rotate wind direction
    windAngle += CONFIG.WIND_CHANGE;
    const wx = Math.cos(windAngle) * windStrength;
    const wy = Math.sin(windAngle) * windStrength * 0.3;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      /* ── Physics ── */
      const wobble = Math.sin(frame * p.wobbleSpd + p.wobbleOff) * CONFIG.WOBBLE;
      p.x += CONFIG.DRIFT_X * p.z + p.vx + wobble + wx * p.z;
      p.y += CONFIG.DRIFT_Y * p.z + p.vy + wy * p.z;
      p.rotAngle += p.rotSpeed;
      p.shimmerOff += p.shimmerSpd;

      /* ── Mouse repulsion ── */
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.MOUSE_RADIUS) {
        const force = (CONFIG.MOUSE_RADIUS - dist) / CONFIG.MOUSE_RADIUS;
        p.vx += (dx / dist) * force * CONFIG.MOUSE_FORCE;
        p.vy += (dy / dist) * force * CONFIG.MOUSE_FORCE;
      }

      // apply drag
      p.vx *= 0.97;
      p.vy *= 0.97;

      /* ── Sparkle trigger ── */
      if (!p.sparkle && Math.random() < CONFIG.SPARKLE_CHANCE) {
        p.sparkle  = true;
        p.sparkleT = 0;
      }
      if (p.sparkle) {
        p.sparkleT++;
        if (p.sparkleT > 30) p.sparkle = false;
      }

      /* ── Wrap / recycle ── */
      if (p.y < -20 || p.x > W + 20 || p.x < -20) {
        const np = createParticle(W, H, false);
        // respawn at bottom or sides
        if (Math.random() < 0.7) {
          np.x = Math.random() * W;
          np.y = H + 10;
        } else {
          np.x = Math.random() < 0.5 ? -5 : W + 5;
          np.y = Math.random() * H;
        }
        Object.assign(p, np);
        continue;
      }

      /* ── Render ── */
      const radius = p.baseRadius * (0.6 + p.z * 1.6);
      const shimmer = 0.35 + 0.65 * ((Math.sin(p.shimmerOff) + 1) / 2);
      const alpha   = Math.min(CONFIG.MAX_ALPHA, CONFIG.MAX_ALPHA * p.z * shimmer);

      if (p.sparkle) {
        drawSparkle(p.x, p.y, p.sparkleT, p.r, p.g, p.b);
      }

      switch (p.shape) {
        case 0: drawCircle(p, p.x, p.y, radius, alpha);             break;
        case 1: drawDiamond(p, p.x, p.y, radius, alpha, p.rotAngle); break;
        case 2: drawLine(p, p.x, p.y, radius, alpha, p.rotAngle);   break;
      }
    }
  }

  animate();
})();
