const GRID = 96;
const DILATE = 2;

function maskFromCanvas(source, size) {
  const grid = new Uint8Array(GRID * GRID);
  if (!source) return grid;
  const off = document.createElement("canvas");
  off.width = GRID;
  off.height = GRID;
  const ctx = off.getContext("2d");
  ctx.drawImage(source, 0, 0, GRID, GRID);
  const data = ctx.getImageData(0, 0, GRID, GRID).data;
  for (let i = 0; i < GRID * GRID; i += 1) {
    if (data[i * 4 + 3] > 36) grid[i] = 1;
  }
  return grid;
}

/** Rasterise the target glyph once so grading needs no hand-authored paths. */
export function buildTargetMask(canvas, glyph, fontFamily) {
  const off = document.createElement("canvas");
  const size = canvas.width || 480;
  off.width = size;
  off.height = size;
  const ctx = off.getContext("2d");
  const fontSize = size * 0.62;
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `400 ${fontSize}px ${fontFamily || "sans-serif"}`;
  try {
    ctx.direction = "rtl";
  } catch {
    /* older browsers — the glyph still renders */
  }
  ctx.fillText(glyph, size / 2, size / 2);
  return maskFromCanvas(off, size);
}

function dilate(mask) {
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (!mask[y * GRID + x]) continue;
      for (let dy = -DILATE; dy <= DILATE; dy += 1) {
        for (let dx = -DILATE; dx <= DILATE; dx += 1) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny < 0 || ny >= GRID || nx < 0 || nx >= GRID) continue;
          out[ny * GRID + nx] = 1;
        }
      }
    }
  }
  return out;
}

/**
 * Compare the learner's ink with the ghost glyph.
 * coverage = how much of the target got inked, spill = ink that lands off-target.
 */
export function gradeStroke(drawnCanvas, targetMask) {
  const drawn = maskFromCanvas(drawnCanvas);
  const targetCount = targetMask.reduce((sum, v) => sum + v, 0);
  const drawnCount = drawn.reduce((sum, v) => sum + v, 0);
  if (drawnCount < 25) return { score: 0, coverage: 0, spill: 0, empty: true };
  if (!targetCount) return { score: 0, coverage: 0, spill: 0, empty: false };

  const near = dilate(targetMask);
  let onTarget = 0;
  for (let i = 0; i < drawn.length; i += 1) {
    if (drawn[i] && near[i]) onTarget += 1;
  }
  const coverage = onTarget / targetCount;
  const spill = 1 - onTarget / drawnCount;
  const score = Math.max(0, Math.min(100, Math.round(coverage * 100 - spill * 38)));
  return { score, coverage, spill, empty: false };
}