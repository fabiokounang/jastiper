(function initMobileMenu() {
  const topbar = document.querySelector('[data-topbar]');
  const toggleButton = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('primary-navigation');

  if (!topbar || !toggleButton || !nav) {
    return;
  }

  const closeMenu = () => {
    topbar.setAttribute('data-menu-open', 'false');
    toggleButton.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    topbar.setAttribute('data-menu-open', 'true');
    toggleButton.setAttribute('aria-expanded', 'true');
  };

  toggleButton.addEventListener('click', () => {
    const isOpen = topbar.getAttribute('data-menu-open') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 760px)').matches) {
        closeMenu();
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });
})();
