// TETRIS completo: 7 piezas, rotación, líneas, niveles, next, récord
const cv = document.getElementById('tetris');
const ctx = cv.getContext('2d');
const nv = document.getElementById('next');
const nctx = nv.getContext('2d');
const elScore = document.getElementById('score');
const elLines = document.getElementById('lines');
const elLevel = document.getElementById('level');
const elBest = document.getElementById('best');
const msg = document.getElementById('msg');

const COLS = 10, ROWS = 20, S = 24;
const COLORS = { I: '#6fa8a0', O: '#e8b64c', T: '#b07d3c', S: '#7fb069', Z: '#c97b5a', J: '#8a8fc7', L: '#d99a6c' };
const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]]
};
let grid, cur, nxt, score, lines, level, running, dropTimer, lastTime, dropInterval;

function best() { return parseInt(localStorage.getItem('beige-tetris-best') || '0', 10); }
function emptyGrid() { return Array.from({ length: ROWS }, () => Array(COLS).fill(null)); }
function newPiece() {
  const keys = Object.keys(SHAPES);
  const k = keys[Math.floor(Math.random() * keys.length)];
  return { type: k, m: SHAPES[k].map(r => r.slice()), x: 3, y: 0 };
}
function init() {
  grid = emptyGrid(); score = 0; lines = 0; level = 1;
  cur = newPiece(); nxt = newPiece();
  elBest.textContent = best();
  updateHud(); draw();
}
function updateHud() {
  elScore.textContent = score; elLines.textContent = lines; elLevel.textContent = level;
  elBest.textContent = Math.max(best(), score);
}
function rotate(m) {
  const n = m.length;
  const r = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) r[x][n - 1 - y] = m[y][x];
  return r;
}
function collides(m, px, py) {
  for (let y = 0; y < m.length; y++) for (let x = 0; x < m[y].length; x++) {
    if (!m[y][x]) continue;
    const nx = px + x, ny = py + y;
    if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
    if (ny >= 0 && grid[ny][nx]) return true;
  }
  return false;
}
function merge() {
  cur.m.forEach((row, y) => row.forEach((v, x) => {
    if (v && cur.y + y >= 0) grid[cur.y + y][cur.x + x] = cur.type;
  }));
}
function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (grid[y].every(Boolean)) { grid.splice(y, 1); grid.unshift(Array(COLS).fill(null)); cleared++; y++; }
  }
  if (cleared) {
    const pts = [0, 100, 300, 500, 800][cleared] * level;
    score += pts; lines += cleared;
    level = Math.floor(lines / 10) + 1;
    if (score > best()) localStorage.setItem('beige-tetris-best', String(score));
    updateHud();
    msg.textContent = cleared === 4 ? '¡TETRIS! +' + pts + ' puntos 🎉' : '+' + pts + ' puntos por ' + cleared + ' línea(s).';
  }
}
function spawn() {
  cur = nxt; nxt = newPiece();
  cur.x = 3; cur.y = 0;
  if (collides(cur.m, cur.x, cur.y)) {
    running = false; cancelAnimationFrame(dropTimer);
    msg.textContent = '💀 Game Over. Puntos: ' + score + '. Pulsa Reiniciar.';
  }
}
function stepDown() {
  if (!collides(cur.m, cur.x, cur.y + 1)) cur.y++;
  else { merge(); clearLines(); spawn(); }
}
function drawCell(c, x, y, s, color) {
  c.fillStyle = color;
  c.fillRect(x * s, y * s, s, s);
  c.fillStyle = 'rgba(255,255,255,.25)';
  c.fillRect(x * s, y * s, s, 3);
  c.strokeStyle = '#1d1812'; c.lineWidth = 1;
  c.strokeRect(x * s + .5, y * s + .5, s - 1, s - 1);
}
function draw() {
  ctx.fillStyle = '#1d1812'; ctx.fillRect(0, 0, cv.width, cv.height);
  grid.forEach((row, y) => row.forEach((v, x) => { if (v) drawCell(ctx, x, y, S, COLORS[v]); }));
  if (cur) cur.m.forEach((row, y) => row.forEach((v, x) => {
    if (v && cur.y + y >= 0) drawCell(ctx, cur.x + x, cur.y + y, S, COLORS[cur.type]);
  }));
  // next
  nctx.fillStyle = '#1d1812'; nctx.fillRect(0, 0, nv.width, nv.height);
  const s2 = 20;
  const ox = (nv.width - nxt.m[0].length * s2) / 2, oy = (nv.height - nxt.m.length * s2) / 2;
  nxt.m.forEach((row, y) => row.forEach((v, x) => {
    if (!v) return;
    nctx.fillStyle = COLORS[nxt.type];
    nctx.fillRect(ox + x * s2, oy + y * s2, s2, s2);
    nctx.strokeStyle = '#1d1812'; nctx.strokeRect(ox + x * s2 + .5, oy + y * s2 + .5, s2 - 1, s2 - 1);
  }));
}
function loop(t) {
  if (!running) return;
  if (!lastTime) lastTime = t;
  dropInterval = Math.max(1000 - (level - 1) * 90, 90);
  if (t - lastTime > dropInterval) { stepDown(); lastTime = t; }
  draw();
  dropTimer = requestAnimationFrame(loop);
}
function toggle() {
  running = !running; lastTime = 0;
  msg.textContent = running ? '¡Jugando! Nivel ' + level + '.' : 'En pausa.';
  if (running) dropTimer = requestAnimationFrame(loop);
  else cancelAnimationFrame(dropTimer);
}
function action(a) {
  if (!running && a !== 'toggle') return;
  if (a === 'left' && !collides(cur.m, cur.x - 1, cur.y)) cur.x--;
  if (a === 'right' && !collides(cur.m, cur.x + 1, cur.y)) cur.x++;
  if (a === 'down') stepDown();
  if (a === 'rot') { const r = rotate(cur.m); if (!collides(r, cur.x, cur.y)) cur.m = r; }
  if (a === 'drop') { while (!collides(cur.m, cur.x, cur.y + 1)) cur.y++; stepDown(); }
  draw();
}
document.getElementById('btnStart').addEventListener('click', toggle);
document.getElementById('btnReset').addEventListener('click', () => {
  cancelAnimationFrame(dropTimer); running = false; init();
  msg.textContent = 'Reiniciado. Pulsa Iniciar.';
});
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'arrowleft') { action('left'); e.preventDefault(); }
  if (k === 'arrowright') { action('right'); e.preventDefault(); }
  if (k === 'arrowdown') { action('down'); e.preventDefault(); }
  if (k === 'arrowup' || k === 'x') { action('rot'); e.preventDefault(); }
  if (k === ' ') { action('drop'); e.preventDefault(); }
  if (k === 'p') toggle();
});
document.getElementById('tLeft').addEventListener('click', () => action('left'));
document.getElementById('tRight').addEventListener('click', () => action('right'));
document.getElementById('tDown').addEventListener('click', () => action('down'));
document.getElementById('tRot').addEventListener('click', () => action('rot'));
document.getElementById('tDrop').addEventListener('click', () => action('drop'));

init();
