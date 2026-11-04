import Matter from 'matter-js';
import { q404Combos } from '@/config/q404';

/**
 * The robot pool: Q-404 of every color falls over the whole screen and piles up (docs/04 §2.7).
 * Physics by matter-js; drawing on a fixed canvas that receives no clicks. Loaded only when the
 * button is touched. Phases: rain → hold (3 s) → drain, or earlier with Escape / "Vaciar".
 */
export interface Pit {
  drain: () => void;
  destroy: () => void;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });

export async function startPit(opts: {
  reduce: boolean;
  onFinish: () => void;
  onDrain: () => void;
}): Promise<Pit> {
  const { Engine, Bodies, Body, Composite } = Matter;
  const images = await Promise.all(
    q404Combos.map((c) => loadImage(`/brand/q404/${c.file}-265.webp`)),
  );
  const ratio = 530 / 840;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const canvas = document.createElement('canvas');
  canvas.className = 'pit';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    zIndex: '45',
    pointerEvents: 'none',
    width: `${W}px`,
    height: `${H}px`,
  });
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');

  const sprite = Math.max(84, Math.min(136, Math.round(Math.min(W, H) * 0.15)));
  const radius = sprite * 0.33;
  let target = Math.max(
    60,
    Math.min(230, Math.round((W * H * 0.8) / (Math.PI * radius * radius * 1.12))),
  );
  if (opts.reduce) target = Math.round(target * 0.5);

  const engine = Engine.create({ gravity: { x: 0, y: 1.6 } });
  const thick = 200;
  const walls = [
    Bodies.rectangle(-thick / 2, H / 2, thick, H * 4, { isStatic: true }),
    Bodies.rectangle(W + thick / 2, H / 2, thick, H * 4, { isStatic: true }),
  ];
  let floor: Matter.Body | null = Bodies.rectangle(W / 2, H + thick / 2, W * 2, thick, {
    isStatic: true,
    restitution: 0.3,
  });
  Composite.add(engine.world, [...walls, floor]);

  type Robot = { body: Matter.Body; k: number; s: number };
  const robots: Robot[] = [];
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const spawn = (inScreen: boolean) => {
    const s = rnd(0.88, 1.12);
    const r = radius * s;
    const body = Bodies.circle(
      rnd(r, Math.max(r + 1, W - r)),
      inScreen ? rnd(0, H * 0.6) : -sprite * rnd(0.6, 1.8),
      r,
      { restitution: 0.3, friction: 0.08, frictionAir: 0.004 },
    );
    Body.setVelocity(body, { x: rnd(-4, 4), y: rnd(2, 8) });
    Body.setAngularVelocity(body, rnd(-0.08, 0.08));
    Composite.add(engine.world, body);
    robots.push({ body, k: (Math.random() * images.length) | 0, s });
  };

  const pointer = { x: -9999, y: -9999 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
  };
  const onLeave = () => {
    pointer.x = pointer.y = -9999;
  };

  let phase: 'rain' | 'hold' | 'drain' = 'rain';
  let spawned = 0;
  let acc = 0;
  let holdT = 0;
  let drainT = 0;
  let raf = 0;
  let endTimer = 0;
  let destroyed = false;

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const rb of robots) {
      const { x, y } = rb.body.position;
      if (y < -sprite * 1.5) continue;
      const h = sprite * rb.s;
      const w = h * ratio;
      const a = rb.body.angle;
      const c = Math.cos(a) * dpr;
      const s = Math.sin(a) * dpr;
      ctx.setTransform(c, s, -s, c, x * dpr, y * dpr);
      const img = images[rb.k];
      if (img) ctx.drawImage(img, -w / 2, -h / 2, w, h);
    }
  };

  const drain = () => {
    if (phase === 'drain' || destroyed) return;
    phase = 'drain';
    drainT = 0;
    if (floor) Composite.remove(engine.world, floor);
    floor = null;
    robots.forEach((r) =>
      Body.applyForce(r.body, r.body.position, { x: rnd(-0.0004, 0.0004), y: rnd(0, 0.002) }),
    );
    opts.onDrain();
  };

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(raf);
    clearTimeout(endTimer);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
    Composite.clear(engine.world, false);
    Engine.clear(engine);
    canvas.remove();
  };

  const update = (dt: number) => {
    if (phase === 'rain') {
      acc += dt * (target / 3.2);
      while (acc >= 1 && spawned < target) {
        spawn(false);
        spawned++;
        acc -= 1;
      }
      if (spawned >= target) {
        phase = 'hold';
        holdT = 0;
      }
    } else if (phase === 'hold') {
      holdT += dt;
      if (holdT > 3) drain();
    } else {
      drainT += dt;
      const left = robots.some((r) => r.body.position.y < H + sprite * 1.5);
      if (!left || drainT > 7) {
        destroy();
        opts.onFinish();
        return;
      }
    }
    if (pointer.x > -999) {
      for (const r of robots) {
        const dx = r.body.position.x - pointer.x;
        const dy = r.body.position.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140 && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (1 - d / 140) * 0.012;
          Body.applyForce(r.body, r.body.position, { x: (dx / d) * f, y: (dy / d) * f });
        }
      }
    }
    Engine.update(engine, 1000 / 60);
  };

  window.addEventListener('pointermove', onMove);
  document.addEventListener('pointerleave', onLeave);

  if (opts.reduce) {
    // Reduced motion: a few robots, already piled up, no bouncing show (docs/11 §7).
    while (spawned < target) {
      spawn(true);
      spawned++;
    }
    for (let i = 0; i < 520; i++) Engine.update(engine, 1000 / 60);
    phase = 'hold';
    draw();
    endTimer = window.setTimeout(() => {
      destroy();
      opts.onFinish();
    }, 4000);
  } else {
    let last = performance.now();
    const loop = (now: number) => {
      if (destroyed) return;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      update(dt);
      if (!destroyed) {
        draw();
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
  }

  return { drain, destroy };
}
