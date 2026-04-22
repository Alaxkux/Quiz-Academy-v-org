/* ================================================================
   QUIZ ACADEMY — SHARE RESULTS v4
   Generates a beautiful shareable score card image using
   the HTML Canvas API. No server, no external libs needed.
   Downloads as PNG or opens native share sheet on mobile.
   ================================================================ */

// ── THEME COLOURS for the card (always uses dark card for consistency) ──
const SHARE_THEME = {
  bg0:    '#07090E',
  bg1:    '#0C1018',
  bg2:    '#111622',
  border: '#1B2333',
  accent: '#6C8EFF',
  green:  '#4DFFC3',
  gold:   '#F5C842',
  red:    '#FF6B8A',
  t1:     '#EDF0FA',
  t2:     '#8A93AD',
  t3:     '#404A62'
};

// ── MAIN ENTRY ──
async function shareQuizResult(result) {
  try {
    showToast('Generating share card...', 'info', 1500);
    const canvas = await buildShareCard(result);
    const blob   = await canvasToBlob(canvas);

    // Try native Web Share API first (mobile)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'quiz-result.png', { type: 'image/png' })] })) {
      const file = new File([blob], 'quiz-result.png', { type: 'image/png' });
      await navigator.share({
        title: `I scored ${result.percentage}% on ${result.category}!`,
        text:  `Just scored ${result.percentage}% on ${result.category} in Quiz Academy! 🎓`,
        files: [file]
      });
      showToast('Shared! 🎉', 'success');
    } else {
      // Fallback — download the image
      downloadCanvas(canvas, `quiz-result-${result.category.replace(/\s+/g,'_')}.png`);
      showToast('Score card downloaded! 📥', 'success');
    }
  } catch (err) {
    if (err.name === 'AbortError') return; // user cancelled share sheet — not an error
    console.error('Share error:', err);
    showToast('Could not share — downloading instead', 'warning');
  }
}

// ── BUILD THE CANVAS CARD ──
async function buildShareCard(result) {
  const W = 800, H = 480;
  const canvas = document.createElement('canvas');
  canvas.width  = W * 2; // retina
  canvas.height = H * 2;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2); // retina scale

  const T = SHARE_THEME;

  // ── BACKGROUND ──
  // Deep gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#07090E');
  bgGrad.addColorStop(1, '#0E1220');
  ctx.fillStyle = bgGrad;
  roundRect(ctx, 0, 0, W, H, 20);
  ctx.fill();

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(108,142,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Top accent glow
  const glowGrad = ctx.createLinearGradient(0, 0, W, 0);
  glowGrad.addColorStop(0, 'rgba(108,142,255,0.15)');
  glowGrad.addColorStop(0.5, 'rgba(77,255,195,0.1)');
  glowGrad.addColorStop(1, 'rgba(108,142,255,0.05)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, 3);

  // Border
  ctx.strokeStyle = '#1B2333';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 0.75, 0.75, W - 1.5, H - 1.5, 20);
  ctx.stroke();

  // ── LEFT PANEL — big score ──
  const leftW = 260;

  // Score circle background
  const circleX = leftW / 2, circleY = H / 2;
  const circleR = 90;

  // Outer ring
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleR + 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(108,142,255,0.06)';
  ctx.fill();

  // Score arc track
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleR, -Math.PI / 2, Math.PI * 1.5);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Score arc fill
  const pct = result.percentage / 100;
  const arcColor = result.percentage >= 80 ? T.green
                 : result.percentage >= 60 ? T.gold
                 : T.red;

  const arcGrad = ctx.createLinearGradient(circleX - circleR, circleY, circleX + circleR, circleY);
  arcGrad.addColorStop(0, T.accent);
  arcGrad.addColorStop(1, result.percentage >= 80 ? T.green : result.percentage >= 60 ? T.gold : T.red);

  ctx.beginPath();
  ctx.arc(circleX, circleY, circleR, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pct));
  ctx.strokeStyle = arcGrad;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Score text
  ctx.fillStyle = T.t1;
  ctx.font = 'bold 52px Syne, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(result.percentage + '%', circleX, circleY - 8);

  ctx.fillStyle = T.t2;
  ctx.font = '500 13px DM Sans, sans-serif';
  ctx.fillText('Score', circleX, circleY + 32);

  // Grade label below circle
  const grade = result.percentage >= 90 ? 'Excellent!' : result.percentage >= 75 ? 'Great Job!' : result.percentage >= 60 ? 'Good Effort!' : 'Keep Going!';
  ctx.fillStyle = arcColor;
  ctx.font = 'bold 14px Syne, sans-serif';
  ctx.fillText(grade, circleX, circleY + 100);

  // Divider line
  ctx.strokeStyle = '#1B2333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftW, 30);
  ctx.lineTo(leftW, H - 30);
  ctx.stroke();

  // ── RIGHT PANEL ──
  const rx = leftW + 32, ry = 48, rw = W - leftW - 32;

  // Brand badge top right
  const brandX = W - 20, brandY = 22;
  ctx.fillStyle = T.accent;
  ctx.font = 'bold 11px Syne, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('🎓 QUIZ ACADEMY', brandX, brandY);

  // Category + emoji
  const emoji = result.percentage >= 90 ? '🎉' : result.percentage >= 75 ? '😊' : result.percentage >= 60 ? '👍' : '💪';
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(emoji, rx, ry);

  ctx.fillStyle = T.t1;
  ctx.font = 'bold 22px Syne, sans-serif';
  ctx.textBaseline = 'top';

  // Truncate long category names
  const catName = result.category.length > 30 ? result.category.slice(0, 28) + '...' : result.category;
  ctx.fillText(catName, rx + 44, ry + 2);

  ctx.fillStyle = T.t2;
  ctx.font = '500 13px DM Sans, sans-serif';
  ctx.fillText(new Date(result.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }), rx + 44, ry + 30);

  // ── STAT CARDS ──
  const stats = [
    { label: 'Correct',  value: `${result.score}/${result.total}`,  color: T.t1 },
    { label: 'Points',   value: `+${result.points}`,                color: T.green },
    { label: 'XP',       value: `+${result.xpEarned}`,              color: T.accent },
    { label: 'Time',     value: result.timeTaken,                   color: T.gold }
  ];

  const cardY   = ry + 72;
  const cardW   = (rw - 48 - 24) / 4;  // 4 cards with 3 gaps of 8
  const cardH   = 80;
  const cardGap = 8;

  stats.forEach((s, i) => {
    const cx = rx + i * (cardW + cardGap);

    // Card bg
    ctx.fillStyle = '#111622';
    roundRect(ctx, cx, cardY, cardW, cardH, 8);
    ctx.fill();

    // Card border
    ctx.strokeStyle = '#1B2333';
    ctx.lineWidth = 1;
    roundRect(ctx, cx + 0.5, cardY + 0.5, cardW - 1, cardH - 1, 8);
    ctx.stroke();

    // Top accent line
    ctx.fillStyle = s.color;
    roundRect(ctx, cx, cardY, cardW, 2, 0);
    ctx.fill();

    // Value
    ctx.fillStyle = s.color;
    ctx.font = 'bold 18px Syne, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.value, cx + cardW / 2, cardY + cardH / 2 - 8);

    // Label
    ctx.fillStyle = T.t3;
    ctx.font = '500 10px DM Sans, sans-serif';
    ctx.fillText(s.label.toUpperCase(), cx + cardW / 2, cardY + cardH / 2 + 14);
  });

  // ── LEVEL & USER ──
  const xpInfo = getLevelInfo(currentUser?.stats?.totalXP || 0);
  const levelY = cardY + cardH + 20;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = T.t2;
  ctx.font = '400 12px DM Sans, sans-serif';
  ctx.fillText(`${currentUser?.name || 'Quiz Taker'} · Lv.${xpInfo.current.level} ${xpInfo.current.title} ${xpInfo.current.emoji}`, rx, levelY);

  // Daily badge if applicable
  if (result.isDailyChallenge) {
    const badgeX = rx, badgeY = levelY + 22;
    ctx.fillStyle = 'rgba(245,200,66,0.12)';
    roundRect(ctx, badgeX, badgeY, 120, 22, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,200,66,0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, badgeX + 0.5, badgeY + 0.5, 119, 21, 5);
    ctx.stroke();
    ctx.fillStyle = T.gold;
    ctx.font = 'bold 10px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ DAILY CHALLENGE', badgeX + 60, badgeY + 6);
  }

  // ── BOTTOM URL ──
  ctx.fillStyle = T.t3;
  ctx.font = '400 11px DM Sans, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('quiz-academy.app', W - 20, H - 18);

  return canvas;
}

// ── HELPERS ──
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png', 1.0);
  });
}

function downloadCanvas(canvas, filename) {
  const link    = document.createElement('a');
  link.download = filename;
  link.href     = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ── PREVIEW MODAL — show card before sharing/downloading ──
async function previewShareCard(result) {
  try {
    const canvas = await buildShareCard(result);

    // Show in a modal
    let modal = document.getElementById('share-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id        = 'share-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
    }

    const dataUrl = canvas.toDataURL('image/png', 1.0);

    modal.innerHTML = `
      <div class="modal-box share-modal-box">
        <h3 style="margin-bottom:12px;text-align:left">🎉 Your Score Card</h3>
        <img src="${dataUrl}" alt="Score Card"
          style="width:100%;border-radius:10px;border:1px solid var(--border);margin-bottom:16px;display:block">
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
          <button class="btn btn-primary" onclick="shareQuizResult(window._shareResult)">
            📤 Share
          </button>
          <button class="btn btn-secondary" onclick="downloadCanvas(window._shareCanvas,'quiz-result.png');showToast('Downloaded ✓','success')">
            💾 Download PNG
          </button>
          <button class="btn btn-ghost" onclick="document.getElementById('share-modal').classList.remove('open')">
            Close
          </button>
        </div>
      </div>`;

    // Store references for button handlers
    window._shareResult = result;
    window._shareCanvas = canvas;

    modal.classList.add('open');
  } catch (err) {
    console.error('Preview error:', err);
    showToast('Could not generate card', 'error');
  }
}
