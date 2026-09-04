// Generates a shareable PNG score card on an offscreen canvas (no deps).
// Format: 1080x1350 (4:5) — the safest WhatsApp/chat share ratio. Core result
// stays in the central safe zone so chat-list previews crop gracefully.

export interface ShareCardData {
  userName?: string | null;
  subjectName: string;
  correct: number;
  incorrect: number;
  unattempted: number;
  total: number;
  percentage: number; // 0-100
  scoreNote?: string | null; // e.g. "Final score 41/50 • negative marking"
  metaLine?: string | null; // e.g. "10 questions • Mixed • No time limit"
}

const W = 1080;
const H = 1350;

const INK = "#fafafa";
const MUTED = "#9ca3af";
const FAINT = "#71717a";
const ACCENT = "#8b5cf6";
const ACCENT_LIGHT = "#c4b5fd";
const GREEN = "#34d399";
const RED = "#f87171";
const RING_TRACK = "#20202b";
const CARD_BG = "#17171f";
const CARD_BORDER = "#2e2e3b";

function font(weight: number, px: number): string {
  return `${weight} ${px}px "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
}

function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draw centered text, shrinking the font until it fits maxWidth. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  weight: number,
  startPx: number,
  color: string,
  baseline: CanvasTextBaseline = "middle"
): number {
  let px = startPx;
  ctx.font = font(weight, px);
  while (px > 16 && ctx.measureText(text).width > maxWidth) {
    px -= 2;
    ctx.font = font(weight, px);
  }
  ctx.textAlign = "center";
  ctx.textBaseline = baseline;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  return px;
}

function drawRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  thickness: number,
  fraction: number
) {
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";
  ctx.strokeStyle = RING_TRACK;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  if (fraction > 0) {
    const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    grad.addColorStop(0, ACCENT);
    grad.addColorStop(1, ACCENT_LIGHT);
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
    ctx.stroke();
  }
}

/**
 * Message tiers: personal, honest, and shareable at every level — nobody
 * should feel ashamed to post a low first score (that's when friends help).
 */
function messageFor(firstName: string | undefined, pct: number): string {
  const base =
    pct >= 85
      ? "Outstanding! You're exam ready"
      : pct >= 70
      ? "You crushed it!"
      : pct >= 50
      ? "Good effort — keep pushing"
      : pct > 0
      ? "Practice makes progress — keep going"
      : "Ready for round two? Beat this score";
  return firstName ? `${firstName} — ${base}` : base;
}

function firstNameOf(userName?: string | null): string | undefined {
  const clean = (userName || "").trim();
  if (!clean) return undefined;
  return clean.split(/\s+/)[0];
}

export async function generateShareCard(data: ShareCardData): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const pad = 96;
  const centerX = W / 2;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#16161e");
  bg.addColorStop(1, "#0b0b10");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft violet glow behind the ring (kept subtle — professional, not neon)
  const glow = ctx.createRadialGradient(centerX, 640, 40, centerX, 640, 560);
  glow.addColorStop(0, "rgba(139, 92, 246, 0.14)");
  glow.addColorStop(1, "rgba(139, 92, 246, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ---- Header row: brand + audience tag ----
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = font(700, 52);
  ctx.fillStyle = INK;
  ctx.fillText("BUJH", pad, 116);

  ctx.font = font(600, 24);
  ctx.fillStyle = FAINT;
  ctx.textAlign = "right";
  ctx.fillText("D.PHARM 2ND YEAR • CTEVT", W - pad, 116);

  // ---- Subject pill ----
  const pillText = data.subjectName || "MCQ Practice";
  let pillPx = 34;
  ctx.font = font(600, pillPx);
  const pillMax = W - pad * 2;
  while (pillPx > 16 && ctx.measureText(pillText).width + 64 > pillMax) {
    pillPx -= 2;
    ctx.font = font(600, pillPx);
  }
  const pillW = Math.min(ctx.measureText(pillText).width + 64, pillMax);
  const pillH = 78;
  const pillY = 196;
  const pillX = (W - pillW) / 2;
  rr(ctx, pillX, pillY, pillW, pillH, 39);
  ctx.fillStyle = CARD_BG;
  ctx.fill();
  ctx.strokeStyle = CARD_BORDER;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#e5e5eb";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(pillText, centerX, pillY + pillH / 2 + 1);

  // ---- Message (personalized) ----
  const firstName = firstNameOf(data.userName);
  fitText(
    ctx,
    messageFor(firstName, data.percentage),
    centerX,
    368,
    W - pad * 2,
    700,
    46,
    data.percentage >= 85 ? ACCENT_LIGHT : INK
  );

  // ---- Accuracy ring (the hero element) ----
  const ringCX = centerX;
  const ringCY = 668;
  const ringR = 205;
  drawRing(ctx, ringCX, ringCY, ringR, 32, data.percentage / 100);

  const pctText = `${data.percentage}%`;
  ctx.font = font(700, 150);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.fillText(pctText, ringCX, ringCY - 10);

  ctx.font = font(600, 27);
  ctx.fillStyle = FAINT;
  ctx.fillText("ACCURACY", ringCX, ringCY + 96);

  if (data.scoreNote) {
    ctx.font = font(600, 26);
    ctx.fillStyle = FAINT;
    ctx.fillText(data.scoreNote, ringCX, ringCY + 168);
  }

  // ---- Meta line (question count • difficulty • timing) ----
  if (data.metaLine) {
    ctx.font = font(600, 25);
    ctx.fillStyle = FAINT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(data.metaLine.toUpperCase(), centerX, 944);
  }

  // ---- Stats row ----
  const stats = [
    { label: "Correct", value: data.correct, color: GREEN },
    { label: "Incorrect", value: data.incorrect, color: RED },
    { label: "Skipped", value: data.unattempted, color: MUTED },
  ];
  const cardW = 280;
  const cardH = 202;
  const cardGap = 24;
  const cardsTop = 1012;
  stats.forEach((s, i) => {
    const x = pad + i * (cardW + cardGap);
    rr(ctx, x, cardsTop, cardW, cardH, 24);
    ctx.fillStyle = CARD_BG;
    ctx.fill();
    ctx.strokeStyle = CARD_BORDER;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font(700, 72);
    ctx.fillStyle = s.color;
    ctx.fillText(String(s.value), x + cardW / 2, cardsTop + 72);

    ctx.font = font(600, 26);
    ctx.fillStyle = FAINT;
    ctx.fillText(s.label.toUpperCase(), x + cardW / 2, cardsTop + 156);
  });

  // ---- Footer CTA ----
  ctx.font = font(600, 25);
  ctx.fillStyle = FAINT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PRACTICE • REVISE • PASS YOUR CTEVT EXAMS", centerX, 1262);

  ctx.font = font(700, 58);
  ctx.fillStyle = INK;
  ctx.fillText("bujh.app", centerX, 1312);

  return canvas.toDataURL("image/png");
}

/** Plain text used for copy / WhatsApp text fallback. */
export function buildShareMessage(
  data: ShareCardData,
  origin: string
): string {
  const who = data.userName?.trim() ? data.userName.trim() : "I";
  const head = `🎯 ${who} scored ${data.percentage}% (${data.correct}/${data.total}) in ${data.subjectName} on Bujh!`;
  const nudge =
    data.percentage >= 70
      ? "Acing the CTEVT prep! 🔥"
      : "Practice makes perfect — join me!";
  return `${head}\n${nudge}\nPractice free → ${origin}/quiz`;
}
