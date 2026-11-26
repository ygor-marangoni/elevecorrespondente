(() => {
  'use strict';
  const journey = document.querySelector('.journey');
  const scene = document.querySelector('.journey-scroll-scene');
  const layout = document.querySelector('.journey-layout');
  const tabs = [...document.querySelectorAll('.journey-choices [role="tab"]')];
  const panels = [...document.querySelectorAll('.journey-media-panel')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1;
  let frame = 0;
  let mediaAnimation;
  let outgoingAnimation;
  let outgoingImage;
  let descriptionAnimation;
  function select(index, immediate = false) {
    if (window.innerWidth <= 760) return;
    if (index === active) return;
    const previous = active;
    active = index;
    mediaAnimation?.cancel();
    outgoingAnimation?.cancel();
    outgoingImage?.remove();
    descriptionAnimation?.cancel();
    const animate = previous >= 0 && !immediate && !reduce.matches;
    const previousImage = panels[previous]?.querySelector('img');
    if (animate && typeof previousImage?.cloneNode === 'function') {
      outgoingImage = previousImage.cloneNode();
      outgoingImage.removeAttribute('loading');
      outgoingImage.alt = '';
      outgoingImage.setAttribute('aria-hidden', 'true');
      outgoingImage.className = 'journey-transition-image';
      panels[index].parentElement.append(outgoingImage);
    }
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      tab.querySelector('.journey-choice-description').hidden = i !== index;
      panels[i].hidden = i !== index;
    });
    const image = panels[index].querySelector('img');
    if (animate && typeof image?.animate === 'function') {
      mediaAnimation = image.animate([
        { opacity: .6, transform: 'scale(1.025)' },
        { opacity: 1, transform: 'scale(1)' }
      ], { duration: 420, easing: 'cubic-bezier(0.23,1,0.32,1)' });
      if (typeof outgoingImage?.animate === 'function') {
        const fadingImage = outgoingImage;
        outgoingAnimation = fadingImage.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 320, easing: 'cubic-bezier(0.23,1,0.32,1)'
        });
        outgoingAnimation.onfinish = () => fadingImage.remove();
      }
      const description = tabs[index].querySelector('.journey-choice-description');
      if (typeof description.animate === 'function') {
        descriptionAnimation = description.animate([
          { height: '0px', opacity: 0 },
          { height: `${description.scrollHeight}px`, opacity: 1 }
        ], { duration: 280, easing: 'cubic-bezier(0.23,1,0.32,1)' });
      }
    }
  }
  function bounds() {
    const top = parseFloat(getComputedStyle(layout).top) || 0;
    return { start: scene.getBoundingClientRect().top + window.scrollY - top,
      travel: Math.max(1, scene.offsetHeight - layout.offsetHeight) };
  }
  function sizeJourney() {
    if (!scene || !layout) return;
    const mobile = window.innerWidth <= 760;
    journey.classList.toggle('is-mobile', mobile);
    journey.classList.toggle('is-enhanced', !mobile && !reduce.matches);
    journey.setAttribute('aria-labelledby', mobile ? 'journey-mobile-title' : 'journey-title');
    if (mobile) {
      mediaAnimation?.cancel();
      outgoingAnimation?.cancel();
      outgoingImage?.remove();
      descriptionAnimation?.cancel();
      panels.forEach(panel => {
        panel.hidden = false;
        panel.removeAttribute('role');
        panel.removeAttribute('aria-labelledby');
      });
      return;
    }
    panels.forEach((panel, index) => {
      panel.hidden = index !== Math.max(0, active);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `journey-tab-${index}`);
    });
    if (reduce.matches) return;
    const entrySpace = Math.min(90, parseFloat(getComputedStyle(journey).paddingTop) || 0);
    const available = Math.max(320, window.innerHeight - 100 - 24 - entrySpace);
    journey.classList.toggle('is-compact', available < 640);
    // Short screens keep the complete photo and use direct selection rather than an overflowing pin.
    journey.classList.toggle('is-static', available < (mobile ? 610 : 430));
    const stepDistance = Math.max(220, Math.min(360, window.innerHeight * .36));
    scene.style.setProperty('--journey-stage-height', `${available}px`);
    scene.style.setProperty('--journey-run', `${stepDistance * (tabs.length - 1)}px`);
  }
  function updateFromScroll() {
    frame = 0;
    if (window.innerWidth <= 760 || reduce.matches || journey.classList.contains('is-static')) return;
    const { start, travel } = bounds();
    const progress = Math.max(0, Math.min(.9999, (window.scrollY - start) / travel));
    const position = progress * (tabs.length - 1);
    const next = Math.round(position);
    // A narrow dead band prevents a tiny reverse scroll from flashing the previous photo.
    if (active >= 0 && next > active && position < active + .56) return;
    if (active >= 0 && next < active && position > active - .56) return;
    select(next);
  }
  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(updateFromScroll);
  }
  function goTo(index, keyboard) {
    if (window.innerWidth <= 760) return;
    select(index, keyboard);
    if (reduce.matches || journey.classList.contains('is-static')) return;
    const { start, travel } = bounds();
    window.scrollTo({ top: start + travel * (index / (tabs.length - 1)), behavior: 'instant' });
  }
  if (journey && scene && layout && tabs.length === panels.length && tabs.length) {
    journey.classList.toggle('is-enhanced', !reduce.matches);
    select(0);
    sizeJourney();
    // Prime all four scenes before entering the pinned sequence to avoid an empty image on selection.
    if ('IntersectionObserver' in window) {
      const preload = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        panels.forEach(panel => { panel.querySelector('img').loading = 'eager'; });
        preload.disconnect();
      }, { rootMargin: '800px 0px' });
      preload.observe(journey);
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', event => goTo(i, event.detail === 0));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        tabs[next].focus({ preventScroll: true });
        goTo(next, true);
      });
    });
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', () => { sizeJourney(); requestUpdate(); }, { passive: true });
    document.fonts?.ready.then(() => { sizeJourney(); requestUpdate(); });
    reduce.addEventListener('change', () => {
      mediaAnimation?.cancel();
      outgoingAnimation?.cancel();
      outgoingImage?.remove();
      descriptionAnimation?.cancel();
      journey.classList.toggle('is-enhanced', !reduce.matches);
      sizeJourney();
      requestUpdate();
    });
    requestUpdate();
  }
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  if (header && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-fixed', !entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
    }).observe(hero);
  }

  // Measured, interruptible accordion animation; native details remain usable without JS.
  const faqItems = [...document.querySelectorAll('.faq-list details')];
  const faqControllers = [];
  faqItems.forEach(details => {
    details.removeAttribute('name');
    const summary = details.querySelector('summary');
    let expanded = details.open;
    let animation;
    function setOpen(open, immediate = false) {
      if (expanded === open && !animation) return;
      const start = details.getBoundingClientRect().height;
      animation?.cancel();
      animation = null;
      expanded = open;
      summary.setAttribute('aria-expanded', String(open));
      if (immediate || reduce.matches || typeof details.animate !== 'function') {
        details.open = open;
        details.style.overflow = '';
        return;
      }
      details.open = true;
      const end = open ? details.scrollHeight : summary.getBoundingClientRect().height;
      details.style.overflow = 'hidden';
      const current = details.animate([{ height: `${start}px` }, { height: `${end}px` }], {
        duration: 200, easing: 'cubic-bezier(0.23,1,0.32,1)'
      });
      animation = current;
      current.onfinish = () => {
        if (animation !== current) return;
        details.open = expanded;
        details.style.overflow = '';
        animation = null;
      };
    }
    summary.setAttribute('aria-expanded', String(expanded));
    summary.addEventListener('click', event => {
      event.preventDefault();
      const next = !expanded;
      if (next) faqControllers.forEach(controller => { if (controller !== setOpen) controller(false, event.detail === 0); });
      setOpen(next, event.detail === 0);
    });
    reduce.addEventListener('change', () => { if (reduce.matches) setOpen(expanded, true); });
    faqControllers.push(setOpen);
  });

  const form = document.querySelector('#contact-form');
  if (form) {
    form.hidden = false;
    const phone = form.elements.namedItem('phone');
    phone.addEventListener('input', () => phone.setCustomValidity(''));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      const value = key => String(data.get(key) || '').trim();
      const digits = value('phone').replace(/\D/g, '');
      phone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Informe um celular com DDD');
      if (!form.reportValidity()) return;
      const message = [
        'Olá, Eleve! Gostaria de conversar sobre financiamento imobiliário',
        `Nome: ${value('name')}`, `Celular: ${value('phone')}`,
        `Cidade: ${value('city')}`, `Interesse: ${value('interest')}`,
        value('message') ? `Mensagem: ${value('message')}` : ''
      ].filter(Boolean).join('\n');
      window.open(`https://wa.me/5516993674960?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      form.querySelector('.contact-status').textContent = 'Mensagem preparada no WhatsApp. Revise os dados e envie para iniciar o atendimento';
    });
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') document.documentElement.classList.add('keyboard-nav');
  });
  document.addEventListener('pointerdown', () => document.documentElement.classList.remove('keyboard-nav'), { passive: true });
})();
