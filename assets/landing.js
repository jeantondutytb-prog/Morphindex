(function () {
  // FAQ accordion — accessible
  document.querySelectorAll('.faq-item').forEach((item, index) => {
    const btn = item.querySelector('.faq-q');
    const panel = item.querySelector('.faq-a');
    if (!btn || !panel) return;

    const panelId = `faq-panel-${index + 1}`;
    panel.id = panelId;
    btn.setAttribute('aria-controls', panelId);
    btn.setAttribute('aria-expanded', 'false');
    panel.hidden = true;

    btn.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('open');
        const q = i.querySelector('.faq-q');
        const p = i.querySelector('.faq-a');
        if (q) q.setAttribute('aria-expanded', 'false');
        if (p) p.hidden = true;
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  // Header hide on scroll down
  const header = document.getElementById('header');
  let lastY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y > lastY && y > 120) header.classList.add('is-hidden');
      else header.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    });
  }, { passive: true });

  // Mobile navigation panel
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');

  function setMobileNavOpen(open) {
    if (!mobileNav || !burger) return;
    mobileNav.classList.toggle('is-open', open);
    mobileNav.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('mobile-nav-open', open);
  }

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  burger?.addEventListener('click', () => {
    const open = !mobileNav?.classList.contains('is-open');
    setMobileNavOpen(open);
  });

  mobileNavClose?.addEventListener('click', closeMobileNav);
  mobileNavBackdrop?.addEventListener('click', closeMobileNav);

  mobileNav?.querySelectorAll('.mobile-nav-link, .mobile-nav-cta').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('is-open')) closeMobileNav();
  });
})();
