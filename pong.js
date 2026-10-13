// PONG — jugador (izq) vs CPU (der)
const cv = document.getElementById('pong');
const ctx = cv.getContext('2d');
const scoreL = document.getElementById('scoreL');
const scoreR = document.getElementById('scoreR');
const msg = document.getElementById('msg');
const W = cv.width, H = cv.height;

const paddleW = 12, paddleH = 80, speed = 6;
let left = { x: 14, y: H / 2 - paddleH / 2 };
let right = { x: W - 14 - paddleW, y: H / 2 - paddleH / 2 };
let ball = { x: W / 2, y: H / 2, vx: 4, vy: 3, r: 8 };
let sL = 0, sR = 0, running = false, raf = null;
let keys = {};

function resetBall(dir) {
  ball.x = W / 2; ball.y = H / 2;
  const a = (Math.random() * 0.6 - 0.3);
  const sp = 4 + Math.min(sL + sR, 10) * 0.25;
  ball.vx = (dir || (Math.random() < 0.5 ? -1 : 1)) * sp;
  ball.vy = a * sp * 2;
}
function draw() {
  ctx.fillStyle = '#1d1812'; ctx.fillRect(0, 0, W, H);
  // línea central
  ctx.strokeStyle = '#4a3f2f'; ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  ctx.setLineDash([]);
  // paletas beige
  ctx.fillStyle = '#f3ede0';
  ctx.fillRect(left.x, left.y, paddleW, paddleH);
  ctx.fillStyle = '#d9c49a';
  ctx.fillRect(right.x, right.y, paddleW, paddleH);
  // pelota
  ctx.fillStyle = '#e8b64c';
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
}
function update() {
  // jugador
  if (keys['w'] || keys['arrowup']) left.y -= speed;
  if (keys['s'] || keys['arrowdown']) left.y += speed;
  left.y = Math.max(0, Math.min(H - paddleH, left.y));
  // CPU con error
  const target = ball.y - paddleH / 2;
  const err = 28;
  if (right.y + paddleH / 2 < target - err) right.y += 4.4;
  else if (right.y + paddleH / 2 > target + err) right.y -= 4.4;
  right.y = Math.max(0, Math.min(H - paddleH, right.y));
  // pelota
  ball.x += ball.vx; ball.y += ball.vy;
  if (ball.y - ball.r < 0 || ball.y + ball.r > H) ball.vy *= -1;
  // colisiones paletas
  if (ball.vx < 0 && ball.x - ball.r < left.x + paddleW && ball.x > left.x &&
      ball.y > left.y && ball.y < left.y + paddleH) {
    const rel = (ball.y - (left.y + paddleH / 2)) / (paddleH / 2);
    ball.vx = Math.abs(ball.vx) * 1.06; ball.vy = rel * 5;
    ball.x = left.x + paddleW + ball.r;
  }
  if (ball.vx > 0 && ball.x + ball.r > right.x && ball.x < right.x + paddleW &&
      ball.y > right.y && ball.y < right.y + paddleH) {
    const rel = (ball.y - (right.y + paddleH / 2)) / (paddleH / 2);
    ball.vx = -Math.abs(ball.vx) * 1.06; ball.vy = rel * 5;
    ball.x = right.x - ball.r;
  }
  // goles
  if (ball.x < 0) { sR++; scoreR.textContent = sR; checkWin('CPU'); resetBall(1); }
  if (ball.x > W) { sL++; scoreL.textContent = sL; checkWin('Tú'); resetBall(-1); }
}
function checkWin(who) {
  if (sL >= 7 || sR >= 7) {
    running = false; cancelAnimationFrame(raf);
    msg.textContent = sL >= 7 ? '¡Ganaste! 🏆 Pulsa Reiniciar para otra partida.' : 'La CPU ganó. ¡Revancha? Pulsa Reiniciar.';
  } else {
    msg.textContent = 'Punto para ' + who + '. ¡Sigue!';
  }
}
function loop() {
  if (!running) return;
  update(); draw();
  raf = requestAnimationFrame(loop);
}
function toggle() {
  if (sL >= 7 || sR >= 7) return;
  running = !running;
  msg.textContent = running ? '¡Jugando! W/S o flechas para moverte.' : 'En pausa. Pulsa Iniciar para continuar.';
  if (running) loop(); else cancelAnimationFrame(raf);
}
document.getElementById('btnStart').addEventListener('click', toggle);
document.getElementById('btnReset').addEventListener('click', () => {
  sL = 0; sR = 0; scoreL.textContent = '0'; scoreR.textContent = '0';
  left.y = H / 2 - paddleH / 2; right.y = left.y; resetBall();
  msg.textContent = 'Marcador reiniciado. Pulsa Iniciar.';
  running = false; cancelAnimationFrame(raf); draw();
});
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (['arrowup', 'arrowdown', ' '].includes(k)) e.preventDefault();
  if (k === ' ') toggle();
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
// mouse
cv.addEventListener('mousemove', e => {
  const r = cv.getBoundingClientRect();
  const my = (e.clientY - r.top) * (H / r.height);
  left.y = Math.max(0, Math.min(H - paddleH, my - paddleH / 2));
});
// táctil
let tUp = false, tDown = false;
document.getElementById('tUp').addEventListener('pointerdown', () => keys['w'] = true);
document.getElementById('tUp').addEventListener('pointerup', () => keys['w'] = false);
document.getElementById('tDown').addEventListener('pointerdown', () => keys['s'] = true);
document.getElementById('tDown').addEventListener('pointerup', () => keys['s'] = false);

resetBall(); draw();
