const searchInput = document.getElementById('searchInput');
const cards = [...document.querySelectorAll('.searchable')];
const emptyState = document.getElementById('emptyState');
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  let visible = 0;
  cards.forEach(card => {
    const text = ((card.innerText || '') + ' ' + (card.dataset.search || '')).toLowerCase();
    const match = !q || text.includes(q);
    card.style.display = match ? '' : 'none';
    if (match && card.classList.contains('file-card')) visible++;
  });
  emptyState.hidden = !q || visible > 0;
});
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('nav').classList.toggle('open');
});
document.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', () => document.getElementById('nav').classList.remove('open')));
document.getElementById('year').textContent = new Date().getFullYear();
