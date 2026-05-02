const canvas = document.getElementById('holo');
const ctx = canvas.getContext('2d', { alpha: true });

const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
const BASE_POINTS = 2800;
const CENTER = { x: 0, y: 0, z: 0 };
const FOV = 760;
const CAMERA_Z = 630;
const LOOP_SECONDS = 40;

const sequence = [
  { name: 'macbook', hold: 3.0, morph: 1.5, spin: [0.12, 0.35, 0.08], pulse: 0.2 },
  { name: 'dslr', hold: 2.8, morph: 1.5, spin: [0.15, 0.3, 0.1], pulse: 0.5 },
  { name: 'drone', hold: 2.8, morph: 1.5, spin: [0.1, 0.45, 0.12], pulse: 0.6, propeller: true },
  { name: 'mic', hold: 2.8, morph: 1.5, spin: [0.13, 0.32, 0.08], pulse: 0.4 },
  { name: 'imac', hold: 2.8, morph: 1.5, spin: [0.1, 0.28, 0.07], pulse: 0.35 },
];

const duration = sequence.reduce((acc, s) => acc + s.hold + s.morph, 0);
const durationScale = LOOP_SECONDS / duration;
sequence.forEach((s) => {
  s.hold *= durationScale;
  s.morph *= durationScale;
});

function resize() {
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.floor(bounds.width * DPR);
  canvas.height = Math.floor(bounds.height * DPR);
}

window.addEventListener('resize', resize);
resize();

function pseudo(i) {
  const x = Math.sin(i * 19.19) * 43758.5453;
  return x - Math.floor(x);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function choose(count, fn) {
  return Array.from({ length: count }, (_, i) => fn(i));
}

function makeMacbook(count) {
  return choose(count, (i) => {
    const r = pseudo(i + 8);
    const branch = r < 0.55 ? 0 : r < 0.85 ? 1 : 2;
    if (branch === 0) {
      const u = pseudo(i * 1.23) * 2 - 1;
      const v = pseudo(i * 1.77) * 2 - 1;
      return { x: u * 180, y: v * 120 + 26, z: -50 + Math.sin(u * 4) * 3 };
    }
    if (branch === 1) {
      const u = pseudo(i * 0.89) * 2 - 1;
      const v = pseudo(i * 1.91) * 2 - 1;
      return { x: u * 190, y: v * 100 - 92, z: 44 + Math.sin(v * 4) * 2 };
    }
    const t = pseudo(i * 2.71);
    const side = pseudo(i * 3.41) > 0.5 ? -1 : 1;
    return { x: mix(-180, 180, t), y: mix(-62, 48, t * t), z: side * 48 };
  });
}

function makeDSLR(count) {
  return choose(count, (i) => {
    const r = pseudo(i + 21);
    if (r < 0.4) {
      const a = pseudo(i * 1.2) * Math.PI * 2;
      const rr = 70 + (pseudo(i * 2.1) - 0.5) * 20;
      const zz = (pseudo(i * 3.4) - 0.5) * 90;
      return { x: Math.cos(a) * rr, y: Math.sin(a) * rr + 2, z: zz };
    }
    if (r < 0.75) {
      const u = pseudo(i * 0.9) * 2 - 1;
      const v = pseudo(i * 1.5) * 2 - 1;
      return { x: u * 190, y: v * 86, z: (pseudo(i * 2.8) - 0.5) * 105 };
    }
    const u = pseudo(i * 4.1) * 2 - 1;
    const v = pseudo(i * 5.1) * 2 - 1;
    return { x: u * 60, y: v * 28 + 84, z: (pseudo(i * 6.2) - 0.5) * 70 };
  });
}

function makeDrone(count) {
  const armCenters = [
    [165, 105],
    [-165, 105],
    [165, -105],
    [-165, -105],
  ];
  return choose(count, (i) => {
    const r = pseudo(i + 50);
    if (r < 0.45) {
      const arm = armCenters[Math.floor(pseudo(i * 1.3) * armCenters.length)];
      const t = pseudo(i * 2.1);
      return { x: arm[0] * t, y: arm[1] * t, z: (pseudo(i * 3.5) - 0.5) * 22 };
    }
    if (r < 0.85) {
      const arm = armCenters[Math.floor(pseudo(i * 2.8) * armCenters.length)];
      const a = pseudo(i * 3.9) * Math.PI * 2;
      const rr = 48 + (pseudo(i * 4.7) - 0.5) * 14;
      return { x: arm[0] + Math.cos(a) * rr, y: arm[1] + Math.sin(a) * rr, z: (pseudo(i * 5.4) - 0.5) * 20 };
    }
    const u = pseudo(i * 6.3) * 2 - 1;
    const v = pseudo(i * 7.2) * 2 - 1;
    return { x: u * 95, y: v * 55, z: (pseudo(i * 8.1) - 0.5) * 42 };
  });
}

function makeMic(count) {
  return choose(count, (i) => {
    const r = pseudo(i + 77);
    if (r < 0.52) {
      const a = pseudo(i * 1.8) * Math.PI * 2;
      const h = pseudo(i * 2.9) * 220 - 120;
      const radius = h > -20 ? 72 : mix(48, 72, (h + 120) / 100);
      return { x: Math.cos(a) * radius, y: h, z: Math.sin(a) * radius };
    }
    if (r < 0.8) {
      const u = pseudo(i * 3.6) * 2 - 1;
      const v = pseudo(i * 4.2) * 2 - 1;
      return { x: u * 36, y: v * 150 + 42, z: (pseudo(i * 5.5) - 0.5) * 48 };
    }
    const a = pseudo(i * 6.1) * Math.PI * 2;
    const rr = 98 + (pseudo(i * 7.4) - 0.5) * 12;
    return { x: Math.cos(a) * rr, y: -168 + (pseudo(i * 8.2) - 0.5) * 12, z: Math.sin(a) * rr };
  });
}

function makeIMac(count) {
  return choose(count, (i) => {
    const r = pseudo(i + 95);
    if (r < 0.55) {
      const u = pseudo(i * 1.4) * 2 - 1;
      const v = pseudo(i * 1.9) * 2 - 1;
      return { x: u * 200, y: v * 122 + 14, z: -18 + (pseudo(i * 2.5) - 0.5) * 16 };
    }
    if (r < 0.78) {
      const u = pseudo(i * 3.1) * 2 - 1;
      const v = pseudo(i * 3.8) * 2 - 1;
      return { x: u * 56, y: v * 62 - 148, z: (pseudo(i * 4.4) - 0.5) * 40 };
    }
    const u = pseudo(i * 5.2) * 2 - 1;
    const v = pseudo(i * 6.7) * 2 - 1;
    return { x: u * 140, y: v * 18 - 228, z: (pseudo(i * 7.3) - 0.5) * 30 };
  });
}

const shapePoints = {
  macbook: makeMacbook(BASE_POINTS),
  dslr: makeDSLR(BASE_POINTS),
  drone: makeDrone(BASE_POINTS),
  mic: makeMic(BASE_POINTS),
  imac: makeIMac(BASE_POINTS),
};

const particles = shapePoints.macbook.map((p, i) => ({
  x: p.x,
  y: p.y,
  z: p.z,
  drift: pseudo(i * 9.13) * Math.PI * 2,
  speed: 0.4 + pseudo(i * 10.31) * 0.8,
  size: 0.8 + pseudo(i * 2.2) * 2.6,
}));

function rotate(v, rx, ry, rz) {
  let { x, y, z } = v;

  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cz = Math.cos(rz);
  const sz = Math.sin(rz);

  let y1 = y * cx - z * sx;
  let z1 = y * sx + z * cx;
  y = y1;
  z = z1;

  let x1 = x * cy + z * sy;
  z1 = -x * sy + z * cy;
  x = x1;
  z = z1;

  x1 = x * cz - y * sz;
  y1 = x * sz + y * cz;

  return { x: x1, y: y1, z };
}

function currentPhase(t) {
  let cursor = 0;
  for (let i = 0; i < sequence.length; i += 1) {
    const s = sequence[i];
    if (t < cursor + s.hold) {
      return {
        from: s,
        to: sequence[(i + 1) % sequence.length],
        ratio: 0,
        dissolve: 0,
        life: (t - cursor) / s.hold,
      };
    }
    cursor += s.hold;
    if (t < cursor + s.morph) {
      const ratio = (t - cursor) / s.morph;
      return {
        from: s,
        to: sequence[(i + 1) % sequence.length],
        ratio: smoothstep(ratio),
        dissolve: Math.sin(Math.PI * ratio),
        life: ratio,
      };
    }
    cursor += s.morph;
  }
  return {
    from: sequence[0],
    to: sequence[1],
    ratio: 0,
    dissolve: 0,
    life: 0,
  };
}

function drawScanlines(w, h, time) {
  const gap = 6 * DPR;
  const drift = (time * 30 * DPR) % gap;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = 'rgba(138, 175, 255, 0.05)';
  for (let y = -drift; y < h; y += gap) {
    ctx.fillRect(0, y, w, 1.5 * DPR);
  }
  ctx.restore();
}

function renderFrame(ms) {
  const time = ms * 0.001;
  const t = time % LOOP_SECONDS;
  const phase = currentPhase(t);

  const width = canvas.width;
  const height = canvas.height;
  const centerX = width * 0.5;
  const centerY = height * 0.53;

  ctx.clearRect(0, 0, width, height);

  const fromPoints = shapePoints[phase.from.name];
  const toPoints = shapePoints[phase.to.name];

  const pulse = 0.6 + Math.sin(time * 2.2) * 0.25 + phase.from.pulse;
  const angleBase = time * 0.4;
  const rx = angleBase * phase.from.spin[0];
  const ry = angleBase * phase.from.spin[1] + phase.ratio * 0.25;
  const rz = angleBase * phase.from.spin[2];

  const trailAlpha = 0.2 + phase.dissolve * 0.28;
  ctx.lineWidth = 1.2 * DPR;

  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    const a = fromPoints[i];
    const b = toPoints[i];

    const morphNoise = Math.sin(time * p.speed + p.drift) * 18 * phase.dissolve;
    const jitter = Math.cos(time * (p.speed + 0.2) + p.drift * 0.6) * 12 * phase.dissolve;

    const target = {
      x: mix(a.x, b.x, phase.ratio) + Math.cos(p.drift + time * 0.9) * morphNoise,
      y: mix(a.y, b.y, phase.ratio) + Math.sin(p.drift + time * 0.8) * jitter,
      z: mix(a.z, b.z, phase.ratio) + Math.sin(p.drift + time * 0.7) * morphNoise,
    };

    const rot = rotate(target, rx, ry, rz);

    if (phase.from.propeller) {
      const radial = Math.hypot(rot.x, rot.y);
      if (radial > 150) {
        const spin = time * 14;
        rot.x += Math.cos(spin + p.drift) * 6;
        rot.y += Math.sin(spin + p.drift) * 6;
      }
    }

    const depth = (FOV / (rot.z + CAMERA_Z));
    if (depth <= 0) continue;

    const sx = centerX + (rot.x - CENTER.x) * depth;
    const sy = centerY + (rot.y - CENTER.y) * depth;
    const rad = Math.max(0.6, p.size * depth * DPR * (0.8 + pulse * 0.25));

    const hueMix = (Math.sin(p.drift + time * 0.7) + 1) * 0.5;
    const red = `rgba(255, 56, 96, ${0.4 + depth * 0.22})`;
    const blue = `rgba(70, 166, 255, ${0.4 + depth * 0.24})`;
    const color = hueMix > 0.48 ? blue : red;

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16 * DPR;
    ctx.arc(sx, sy, rad, 0, Math.PI * 2);
    ctx.fill();

    if (i % 11 === 0) {
      const lineLen = (10 + phase.dissolve * 22) * depth;
      ctx.strokeStyle = hueMix > 0.5 ? `rgba(120, 210, 255, ${trailAlpha})` : `rgba(255, 92, 132, ${trailAlpha})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - Math.cos(p.drift + time) * lineLen * DPR, sy - Math.sin(p.drift + time) * lineLen * DPR);
      ctx.stroke();
    }
  }

  drawScanlines(width, height, time);

  requestAnimationFrame(renderFrame);
}

requestAnimationFrame(renderFrame);
