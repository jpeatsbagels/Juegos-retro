// GATO (Tic-Tac-Toe): vs CPU con estrategia + modo 2 jugadores
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const roundEl = document.getElementById('round');
const btnCpu = document.getElementById('modeCpu');
const btn2p = document.getElementById('mode2p');

let cells = Array(9).fill('');
let turn = 'X';
let mode = 'cpu'; // 'cpu' | '2p'
let over = false;
let wins = { X: 0, O: 0 };
let round = 1;

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function render() {
  boardEl.innerHTML = '';
  cells.forEach((v, i) => {
    const b = document.createElement('button');
    b.className = 'cell';
    b.textContent = v;
    b.disabled = v !== '' || over;
    b.style.color = v === 'X' ? '#2e2620' : '#b07d3c';
    b.addEventListener('click', () => play(i));
    boardEl.appendChild(b);
  });
}
function winner(b = cells) {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line: [a, c, d] };
  }
  return b.every(x => x) ? { who: 'tie' } : null;
}
function play(i) {
  if (over || cells[i]) return;
  cells[i] = turn;
  afterMove();
  // turno CPU
  if (!over && mode === 'cpu' && turn === 'O') {
    statusEl.textContent = 'La CPU está pensando…';
    setTimeout(() => { if (!over) { cells[cpuMove()] = 'O'; afterMove(); } }, 350);
  }
}
function afterMove() {
  const w = winner();
  render();
  if (w) {
    over = true;
    if (w.who === 'tie') {
      statusEl.textContent = '🤝 Empate en la ronda ' + round + '.';
    } else {
      wins[w.who]++;
      scoreX.textContent = wins.X; scoreO.textContent = wins.O;
      w.line.forEach(i => boardEl.children[i].classList.add('win'));
      statusEl.textContent = w.who === 'X'
        ? (mode === 'cpu' ? '🎉 ¡Ganaste la ronda ' + round + '!' : '🎉 ¡Jugador 1 (X) gana la ronda ' + round + '!')
        : (mode === 'cpu' ? '🤖 La CPU gana la ronda ' + round + '.' : '🎉 ¡Jugador 2 (O) gana la ronda ' + round + '!');
    }
    [...boardEl.children].forEach(c => c.disabled = true);
    return;
  }
  turn = turn === 'X' ? 'O' : 'X';
  statusEl.textContent = mode === 'cpu'
    ? (turn === 'X' ? 'Tu turno (X).' : 'Turno de la CPU (O)…')
    : ('Turno del ' + (turn === 'X' ? 'Jugador 1 (X).' : 'Jugador 2 (O).'));
}
function cpuMove() {
  // 1. ganar 2. bloquear 3. centro 4. esquina 5. lado
  for (const m of ['O', 'X']) {
    for (let i = 0; i < 9; i++) {
      if (!cells[i]) { cells[i] = m; const w = winner(); cells[i] = ''; if (w && w.who === m) return i; }
    }
  }
  if (!cells[4]) return 4;
  const corners = [0, 2, 6, 8].filter(i => !cells[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  const sides = [1, 3, 5, 7].filter(i => !cells[i]);
  return sides[Math.floor(Math.random() * sides.length)];
}
function nextRound() {
  cells = Array(9).fill(''); over = false;
  round++; roundEl.textContent = round;
  turn = round % 2 === 1 ? 'X' : 'O'; // alterna quien empieza
  statusEl.textContent = mode === 'cpu'
    ? (turn === 'X' ? 'Tu turno (X). ¡Suerte!' : 'La CPU empieza…')
    : ('Empieza el ' + (turn === 'X' ? 'Jugador 1 (X).' : 'Jugador 2 (O).'));
  render();
  if (mode === 'cpu' && turn === 'O') {
    setTimeout(() => { if (!over) { cells[cpuMove()] = 'O'; afterMove(); } }, 400);
  }
}
btnCpu.addEventListener('click', () => { mode = 'cpu'; btnCpu.classList.add('active'); btn2p.classList.remove('active'); resetAll(); });
btn2p.addEventListener('click', () => { mode = '2p'; btn2p.classList.add('active'); btnCpu.classList.remove('active'); resetAll(); });
function resetAll() {
  cells = Array(9).fill(''); over = false; turn = 'X';
  wins = { X: 0, O: 0 }; round = 1;
  scoreX.textContent = '0'; scoreO.textContent = '0'; roundEl.textContent = '1';
  statusEl.textContent = mode === 'cpu' ? 'Tu turno (X). ¡Suerte!' : 'Turno del Jugador 1 (X).';
  render();
}
document.getElementById('btnReset').addEventListener('click', resetAll);
document.getElementById('btnNext').addEventListener('click', nextRound);
render();
