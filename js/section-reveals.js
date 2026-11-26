(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...document.querySelectorAll('[data-reveal]')];
  const heroes = [...document.querySelectorAll('[data-hero-reveal]')];
  if (!('IntersectionObserver' in window)) return;
  const finished = new WeakSet();
  const running = new Map();
  let mobile = window.innerWidth <= 760;
  // Use the full viewport so the footer can reveal at the end of the page,
  // and tall sections do not need an unreachable percentage to be visible.
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!eligible(entry.target)) return;
      if (entry.isIntersecting) reveal(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px' });

  function eligible(target) {
    const scope = target.dataset.revealScope;
    return (scope !== 'mobile' || mobile) && (scope !== 'desktop' || !mobile) && target.getClientRects().length > 0;
  }
  function cancel(target) {
    running.get(target)?.forEach(animation => animation.cancel());
    running.delete(target);
  }
  function play(target, duration, delay, rise) {
    // Opacity progresses across the full duration, avoiding the former front-loaded flash.
    const fade = target.animate([
      { opacity: 0, offset: 0 },
      { opacity: .16, offset: .25 },
      { opacity: .7, offset: .7 },
      { opacity: 1, offset: 1 }
    ], { duration, delay, fill: 'backwards', easing: 'linear' });
    const animations = [fade];
    const riseDistance = typeof rise === 'number' ? rise : mobile ? 18 : 24;
    if (rise) animations.push(target.animate([
      { transform: `translateY(${riseDistance}px)` }, { transform: 'translateY(0)' }
    ], { duration: duration + 100, delay, fill: 'backwards', easing: 'cubic-bezier(0.23,1,0.32,1)' }));
    running.set(target, animations);
    let remaining = animations.length;
    animations.forEach(animation => {
      animation.onfinish = () => {
        if (--remaining === 0 && running.get(target) === animations) running.delete(target);
      };
    });
  }
  function reveal(target, immediate = false) {
    if (!immediate && !eligible(target)) return;
    target.classList.remove('reveal-pending');
    observer.unobserve(target);
    if (finished.has(target)) { if (immediate) cancel(target); return; }
    finished.add(target);
    if (immediate || reduce.matches || typeof target.animate !== 'function') return;
    const soft = target.dataset.reveal === 'soft';
    const delay = mobile ? 0 : Math.min(100, Number(target.dataset.revealDelay) || 0);
    play(target, soft ? 820 : 760, delay, !soft);
  }
  function setup() {
    targets.forEach(target => {
      if (!eligible(target)) {
        target.classList.remove('reveal-pending');
        observer.unobserve(target);
        cancel(target);
        return;
      }
      const rect = target.getBoundingClientRect();
      if (reduce.matches || finished.has(target) || rect.bottom <= 0) reveal(target, true);
      else { target.classList.add('reveal-pending'); observer.observe(target); }
    });
  }
  // First-view typography enters as three overlapping beats, with no loading screen.
  const heroTiming = { brand: [420, 0], badge: [650, 45], message: [900, 90], action: [760, 160], signature: [850, 220] };
  heroes.forEach(target => {
    finished.add(target);
    if (reduce.matches || typeof target.animate !== 'function' || target.getBoundingClientRect().bottom <= 0) return;
    const [duration, delay] = heroTiming[target.dataset.heroReveal];
    const type = target.dataset.heroReveal;
    const rise = type === 'brand' ? 8 : type === 'badge' || type === 'signature' ? false : true;
    play(target, duration, delay, rise);
  });
  document.addEventListener('focusin', event => {
    const target = event.target.closest('[data-reveal],[data-hero-reveal]');
    if (target) { cancel(target); reveal(target, true); }
  });
  window.addEventListener('resize', () => {
    const next = window.innerWidth <= 760;
    if (next !== mobile) { mobile = next; setup(); }
  }, { passive: true });
  reduce.addEventListener('change', () => {
    if (reduce.matches) [...running.keys()].forEach(cancel);
    setup();
  });
  setup();
})();
