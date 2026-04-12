/* Theme Switcher — 5 themes with localStorage persistence */
(function() {
  const themes = ['gotham', 'ocean', 'jungle', 'sunset', 'galaxy'];
  const saved = localStorage.getItem('sws-theme') || 'gotham';

  // Apply saved theme
  document.documentElement.setAttribute('data-theme', saved);

  // Build switcher UI
  const switcher = document.createElement('div');
  switcher.id = 'themeSwitcher';
  themes.forEach(t => {
    const dot = document.createElement('div');
    dot.className = 'theme-dot' + (t === saved ? ' active' : '');
    dot.setAttribute('data-theme', t);
    dot.title = t.charAt(0).toUpperCase() + t.slice(1);
    dot.addEventListener('click', () => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('sws-theme', t);
      switcher.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
    switcher.appendChild(dot);
  });
  document.body.appendChild(switcher);
})();
