// Home: buscador + filtros + showcase rotatorio estilo Steam
const searchInput = document.getElementById('searchInput');
const cards = [...document.querySelectorAll('.card')];
const resultCount = document.getElementById('resultCount');
const emptyMsg = document.getElementById('emptyMsg');
let activeFilter = 'all';

function applyFilters() {
  const q = (searchInput.value || '').toLowerCase().trim();
  let visible = 0;
  cards.forEach(c => {
    const tags = c.dataset.tags || '';
    const title = c.dataset.title || '';
    const okFilter = activeFilter === 'all' || tags.includes(activeFilter);
    const okSearch = !q || title.includes(q);
    const show = okFilter && okSearch;
    c.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  resultCount.textContent = visible + (visible === 1 ? ' juego' : ' juegos');
  emptyMsg.hidden = visible !== 0;
}
searchInput.addEventListener('input', applyFilters);
document.querySelectorAll('.filter').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    activeFilter = b.dataset.filter;
    applyFilters();
  });
});

// Showcase rotatorio
const showcase = {
  tetris: { title: 'Tetris Beige', desc: 'Apila bloques, limpia líneas y sube de nivel.', link: 'tetris.html', art: 'art-tetris', label: 'TETRIS' },
  pong: { title: 'Pong Retro', desc: 'Duelos de paletas contra la CPU. Gana quien llegue a 7.', link: 'pong.html', art: 'art-pong', label: 'PONG' },
  snake: { title: 'Snake Clásica', desc: 'Come manzanas, crece y evita chocar.', link: 'snake.html', art: 'art-snake', label: 'SNAKE' },
  gato: { title: 'Gato · 3 en raya', desc: 'Contra la CPU o contra un amigo. Mejor de 5 rondas.', link: 'gato.html', art: 'art-gato', label: 'GATO' }
};
const main = document.getElementById('showcaseMain');
const sTitle = document.getElementById('showcaseTitle');
const sDesc = document.getElementById('showcaseDesc');
const sLink = document.getElementById('showcaseLink');
document.querySelectorAll('.thumb').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.thumb').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    const g = showcase[t.dataset.game];
    sTitle.textContent = g.title;
    sDesc.textContent = g.desc;
    sLink.href = g.link;
    const art = main.querySelector('.showcase-art');
    art.className = 'showcase-art ' + g.art;
    art.innerHTML = '<span>' + g.label + '</span>';
  });
});
