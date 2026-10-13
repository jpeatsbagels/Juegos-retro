// SNAKE
const cv = document.getElementById('snake');
const ctx = cv.getContext('2d');
const N = 21, CELL = cv.width / N;
const elScore = document.getElementById('score');
const elBest = document.getElementById('best');
const elLen = document.getElementById('len');
const msg = document.getElementById('msg');

let snake, dir, nextDir, food, score, eaten, running, timer, speed;

function best() { return parseInt(localStorage.getItem('beige-snake-best') || '0', 10); }
function saveBest(v) { localStorage.setItem('beige-snake-best', String(v)); }

function init() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir = { x: 1, y: 0 }; nextDir = dir;
  score = 0; eaten = 0; speed = 150;
  elBest.textContent = best();
  placeFood(); updateHud();
}
function placeFood() {
  while (true) {
    const f = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
    if (!snake.some(s => s.x === f.x && s.y === f.y)) { food = f; return; }
  }
}
function updateHud() {
  elScore.textContent = score;
  elLen.textContent = snake.length;
  elBest.textContent = Math.max(best(), score);
}
function step() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  // choques
  if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N ||
      snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver(); return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10; eaten++;
    if (score > best()) saveBest(score);
    if (eaten % 4 === 0 && speed > 60) { speed -= 12; restartLoop(); }
    placeFood();
  } else {
    snake.pop();
  }
  updateHud(); draw();
}
function draw() {
  ctx.fillStyle = '#1d1812'; ctx.fillRect(0, 0, cv.width, cv.height);
  // cuadrícula sutil beige
  ctx.strokeStyle = 'rgba(217,196,154,.12)'; ctx.lineWidth = 1;
  for (let i = 1; i < N; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, cv.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(cv.width, i * CELL); ctx.stroke();
  }
  // comida
  ctx.fillStyle = '#c96a5a';
  ctx.beginPath(); ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.38, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a6741';
  ctx.fillRect(food.x * CELL + CELL / 2 - 1, food.y * CELL + 2, 2, 6);
  // serpiente
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? '#f3ede0' : (i % 2 ? '#d9c49a' : '#bfa878');
    const p = 1.5;
    ctx.fillRect(s.x * CELL + p, s.y * CELL + p, CELL - p * 2, CELL - p * 2);
  });
}
function gameOver() {
  running = false; clearInterval(timer);
  msg.textContent = '💀 Chocaste. Puntos: ' + score + '. Pulsa Reiniciar.';
}
function restartLoop() { clearInterval(timer); timer = setInterval(step, speed); }
function toggle() {
  if (running) { running = false; clearInterval(timer); msg.textContent = 'En pausa.'; }
  else { running = true; restartLoop(); msg.textContent = '¡Jugando! Come las manzanas 🍎'; }
}
document.getElementById('btnStart').addEventListener('click', toggle);
document.getElementById('btnReset').addEventListener('click', () => {
  clearInterval(timer); running = false; init(); draw(); msg.textContent = 'Reiniciado. Pulsa Iniciar.';
});
function setDir(x, y) {
  if (dir.x === -x && dir.y === -y) return; // no reversa
  if (dir.x === x && dir.y === y) return;
  nextDir = { x, y };
}
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'arrowup' || k === 'w') { setDir(0, -1); e.preventDefault(); }
  if (k === 'arrowdown' || k === 's') { setDir(0, 1); e.preventDefault(); }
  if (k === 'arrowleft' || k === 'a') { setDir(-1, 0); e.preventDefault(); }
  if (k === 'arrowright' || k === 'd') { setDir(1, 0); e.preventDefault(); }
  if (k === ' ') { toggle(); e.preventDefault(); }
});
document.querySelectorAll('.touch button').forEach(b => {
  b.addEventListener('click', () => {
    const d = b.dataset.dir;
    if (d === 'up') setDir(0, -1);
    if (d === 'down') setDir(0, 1);
    if (d === 'left') setDir(-1, 0);
    if (d === 'right') setDir(1, 0);
  });
});
init(); draw();
