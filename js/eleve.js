(() => {
  'use strict';
  document.querySelectorAll('.faq-item').forEach((item, index) => {
    const button = item.querySelector('button');
    const answer = item.querySelector('.faq-answer');
    answer.id = `faq-answer-${index}`;
    button.setAttribute('aria-controls', answer.id);
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      answer.hidden = !open;
    });
  });
  const dock = document.querySelector('.purchase-dock');
  let pastHero = false;
  let nearClosing = false;
  const syncDock = () => {
    const visible = pastHero && !nearClosing;
    dock.classList.toggle('is-visible', visible);
    dock.inert = !visible;
    dock.setAttribute('aria-hidden', String(!visible));
  };
  syncDock();
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
    syncDock();
  }).observe(document.querySelector('.hero-section'));
  new IntersectionObserver(([entry]) => {
    nearClosing = entry.isIntersecting;
    syncDock();
  }, {rootMargin: '100px 0px'}).observe(document.querySelector('.eleve-closing'));
})();
