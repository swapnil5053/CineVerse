(function(){
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-bs-theme') || 'light';
    html.setAttribute('data-bs-theme', current === 'light' ? 'dark' : 'light');
  });
})();
