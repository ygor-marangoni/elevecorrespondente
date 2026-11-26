(() => {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .12 });

  const motionRegionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-in-viewport', entry.isIntersecting);
    });
  }, { rootMargin: '160px 0px', threshold: 0 });

  const bindMotionRegions = () => {
    document.querySelectorAll([
      '.hero-section',
      '[data-screen-label="Alunos"]',
      '.testimonials-section',
      '.figma-news-section',
      '.ai-toolchain-card',
      '.variant-system-demo',
      '.faq-marquee',
      '.site-footer'
    ].join(',')).forEach(region => {
      if (region.dataset.motionBound) return;
      region.dataset.motionBound = 'true';
      motionRegionObserver.observe(region);
    });
  };

  const bindCurrentDom = () => {
    document.querySelectorAll('[data-screen-label]:not([data-screen-label="Hero"])').forEach(section => {
      if (section.dataset.revealBound) return;
      section.dataset.revealBound = 'true';
      section.classList.add('reveal');
      revealObserver.observe(section);
    });
  };

  let dockPastHero = false;
  let dockNearFooter = false;

  const updateChrome = () => {
    const dock = document.querySelector('.purchase-dock');

    if (!dock) return;
    dock.classList.toggle('is-visible', dockPastHero && !dockNearFooter);
  };

  const bindChromeObservers = () => {
    const hero = document.querySelector('.hero-section');
    const footer = document.querySelector('.site-footer');
    if (!hero || !footer) return;

    let marker = hero.querySelector('.purchase-dock-trigger');
    if (!marker) {
      marker = document.createElement('span');
      marker.className = 'purchase-dock-trigger';
      marker.setAttribute('aria-hidden', 'true');
      hero.append(marker);
    }

    const dockHeroObserver = new IntersectionObserver(([entry]) => {
      dockPastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      updateChrome();
    });
    const dockFooterObserver = new IntersectionObserver(([entry]) => {
      dockNearFooter = entry.isIntersecting;
      updateChrome();
    }, { rootMargin: '0px 0px 8px' });
    dockHeroObserver.observe(marker);
    dockFooterObserver.observe(footer);
  };

  const bindSyllabus = () => {
    const section = document.querySelector('#conteudo');
    if (!section) return;

    const blocks = [...section.querySelectorAll('.module-block[data-module-index]')];
    const layers = [...section.querySelectorAll('[data-module-preview]')];
    const dots = [...section.querySelectorAll('[data-module-dot]')];
    const stage = section.querySelector('.content-preview-stage');
    const counter = section.querySelector('.content-preview-counter');
    const title = section.querySelector('.content-preview-title');
    if (!blocks.length || !stage || !counter || !title) return;

    const activateModule = index => {
      const activeBlock = blocks[index];
      if (!activeBlock) return;

      blocks.forEach((block, blockIndex) => block.classList.toggle('is-active', blockIndex === index));
      layers.forEach(layer => layer.classList.toggle('is-active', Number(layer.dataset.modulePreview) === index));
      dots.forEach(dot => dot.classList.toggle('is-active', Number(dot.dataset.moduleDot) === index));
      stage.style.setProperty('background', '#ececea', 'important');
      counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(blocks.length).padStart(2, '0')}`;
      title.textContent = activeBlock.querySelector('h3')?.textContent?.trim() || '';
    };

    blocks.forEach((block, index) => {
      block.addEventListener('mouseenter', () => activateModule(index), { passive: true });
      block.addEventListener('focusin', () => activateModule(index));
    });

    activateModule(0);
    const syllabusObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top - window.innerHeight * .46) -
          Math.abs(b.boundingClientRect.top - window.innerHeight * .46));
      if (!visible.length) return;
      activateModule(Number(visible[0].target.dataset.moduleIndex));
    }, { rootMargin: '-38% 0px -46% 0px', threshold: 0 });
    blocks.forEach(block => syllabusObserver.observe(block));
  };

  const bindClosingFigma = () => {
    const wrap = document.querySelector('[data-closing-figma]');
    const canvas = wrap?.querySelector('[data-closing-figma-canvas]');
    if (!wrap || !canvas || canvas.dataset.figmaDotsBound) return;
    canvas.dataset.figmaDotsBound = 'true';

    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const scale = 2;
    const offsetX = (width - 200 * scale) / 2;
    const offsetY = (height - 300 * scale) / 2;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const pointer = { x: -9999, y: -9999, active: false };
    let visible = false;
    let frame = 0;
    let lastActivity = performance.now();

    const shapes = [
      { color: '#F24E1E', contains: (x, y) => x >= 0 && x <= 100 && y >= 0 && y <= 100 && ((x >= 50) || ((x - 50) ** 2 + (y - 50) ** 2 <= 2500)) },
      { color: '#FF7262', contains: (x, y) => x >= 100 && x <= 200 && y >= 0 && y <= 100 && ((x <= 150) || ((x - 150) ** 2 + (y - 50) ** 2 <= 2500)) },
      { color: '#A259FF', contains: (x, y) => x >= 0 && x <= 100 && y >= 100 && y <= 200 && ((x >= 50) || ((x - 50) ** 2 + (y - 150) ** 2 <= 2500)) },
      { color: '#1ABCFE', contains: (x, y) => (x - 150) ** 2 + (y - 150) ** 2 <= 2500 },
      { color: '#0ACF83', contains: (x, y) => x >= 0 && x <= 100 && y >= 200 && y <= 300 && (((x - 50) ** 2 + (y - 250) ** 2 <= 2500) || (x >= 50 && y <= 250)) },
    ];

    const dots = [];
    for (let x = 4; x <= 196; x += 9) {
      for (let y = 4; y <= 296; y += 9) {
        const shape = shapes.find(item => item.contains(x, y));
        if (!shape) continue;
        const homeX = offsetX + x * scale;
        const homeY = offsetY + y * scale;
        dots.push({
          homeX,
          homeY,
          x: homeX + (Math.random() - .5) * 34,
          y: homeY - 34 - Math.random() * 70,
          velocityX: 0,
          velocityY: 0,
          color: shape.color,
        });
      }
    }

    const paint = () => {
      context.clearRect(0, 0, width, height);
      for (const dot of dots) {
        context.fillStyle = dot.color;
        context.beginPath();
        context.arc(dot.x, dot.y, 2.55, 0, Math.PI * 2);
        context.fill();
      }
    };

    const draw = now => {
      frame = 0;
      if (!visible || document.hidden) return;
      let moving = false;

      for (const dot of dots) {
        if (pointer.active) {
          const deltaX = dot.x - pointer.x;
          const deltaY = dot.y - pointer.y;
          const distance = Math.hypot(deltaX, deltaY);
          if (distance > 0 && distance < 92) {
            const force = (1 - distance / 92) * 3.4;
            dot.velocityX += deltaX / distance * force;
            dot.velocityY += deltaY / distance * force;
          }
        }

        dot.velocityX += (dot.homeX - dot.x) * .055;
        dot.velocityY += (dot.homeY - dot.y) * .055;
        dot.velocityX *= .84;
        dot.velocityY *= .84;
        dot.x += dot.velocityX;
        dot.y += dot.velocityY;
        moving ||= Math.abs(dot.velocityX) + Math.abs(dot.velocityY) > .025 ||
          Math.abs(dot.homeX - dot.x) + Math.abs(dot.homeY - dot.y) > .05;
      }
      paint();

      if (!reducedMotion.matches && (moving || pointer.active || now - lastActivity < 900)) {
        frame = requestAnimationFrame(draw);
      }
    };

    const start = () => {
      lastActivity = performance.now();
      if (!frame && visible) frame = requestAnimationFrame(draw);
    };

    wrap.addEventListener('pointermove', event => {
      if (coarsePointer.matches || reducedMotion.matches) return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - bounds.left) * width / bounds.width;
      pointer.y = (event.clientY - bounds.top) * height / bounds.height;
      pointer.active = true;
      start();
    }, { passive: true });
    wrap.addEventListener('pointerleave', () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
      start();
    }, { passive: true });

    paint();
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { rootMargin: '160px 0px' }).observe(wrap);
  };

  const bindFaq = () => {
    document.querySelectorAll('.faq-item').forEach(item => {
      const button = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!button || !answer || button.dataset.faqBound) return;
      button.dataset.faqBound = 'true';
      button.addEventListener('click', () => {
        const willOpen = button.getAttribute('aria-expanded') !== 'true';
        item.closest('.faq-list')?.querySelectorAll('.faq-item').forEach(other => {
          if (other === item) return;
          other.classList.remove('is-open');
          other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.hidden = true;
        });
        item.classList.toggle('is-open', willOpen);
        button.setAttribute('aria-expanded', String(willOpen));
        answer.hidden = !willOpen;
      });
    });
  };

  const bindFooterPhysics = () => {
    const host = document.querySelector('.footer-figma-physics');
    const footer = host?.closest('.footer-main');
    if (!host || !footer || host.dataset.physicsBound) return;
    host.dataset.physicsBound = 'true';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const colors = ['#f24e1e', '#ff7262', '#a259ff', '#1abcfe', '#0acf83'];
    const count = window.innerWidth < 760 ? 26 : 44;
    const pieces = [];
    let frame = 0;
    let started = false;
    let lastPointerAt = 0;
    let fieldWidth = 0;
    let seed = 48271;
    const random = () => {
      seed = seed * 16807 % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const build = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      fieldWidth = width;
      host.replaceChildren();
      pieces.length = 0;
      for (let index = 0; index < count; index += 1) {
        const size = Math.round((window.innerWidth < 760 ? 24 : 34) + random() * (window.innerWidth < 760 ? 20 : 34));
        const column = (index + .5) / count;
        const restX = Math.max(2, Math.min(width - size - 2, column * width - size / 2 + (random() - .5) * 28));
        const row = index % 3 === 0 ? 1 : 0;
        const restY = height - size - 8 - row * size * .48;
        const element = document.createElement('div');
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.background = colors[index % colors.length];
        element.style.borderRadius = index % 5 === 3 ? '50%' : index % 5 === 4 ? '50% 50% 50% 0' : '50% 50% 0 0';
        host.appendChild(element);
        pieces.push({
          element,
          size,
          x: restX + (random() - .5) * 80,
          y: reducedMotion ? restY : -size - random() * height * .85,
          restX,
          restY,
          vx: 0,
          vy: reducedMotion ? 0 : .2 + random() * .7,
          rotation: (random() - .5) * 80,
          vr: (random() - .5) * 1.8,
          calm: 0,
          settled: reducedMotion
        });
      }
      render();
    };

    const render = () => {
      pieces.forEach(piece => {
        piece.element.style.transform = `translate3d(${piece.x.toFixed(1)}px,${piece.y.toFixed(1)}px,0) rotate(${piece.rotation.toFixed(1)}deg)`;
      });
    };

    const animate = () => {
      pieces.forEach(piece => {
        if (piece.settled) return;
        piece.vy = Math.min(7, piece.vy + .13);
        piece.vx *= .976;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.vr;
        if (piece.y >= piece.restY) { piece.y = piece.restY; piece.vy *= -.2; piece.vr *= .72; piece.vx *= .82; }
      });
      for (let i = 0; i < pieces.length; i += 1) {
        for (let j = i + 1; j < pieces.length; j += 1) {
          const a = pieces[i], b = pieces[j];
          const gapX = (b.x - a.x) + (b.size - a.size) / 2;
          const gapY = (b.y - a.y) + (b.size - a.size) / 2;
          const min = (a.size + b.size) / 2 * .72;
          const dist = Math.hypot(gapX, gapY) || .01;
          if (dist >= min) continue;
          const shift = Math.min(3, (min - dist) / 2), nx = gapX / dist;
          a.x -= nx * shift; b.x += nx * shift;
        }
      }
      let moving = false;
      pieces.forEach(piece => {
        piece.x = Math.max(2, Math.min(fieldWidth - piece.size - 2, piece.x));
        if (piece.settled) { piece.y = piece.restY; return; }
        if (piece.y > piece.restY) piece.y = piece.restY;
        if (Math.abs(piece.vy) < .35 && Math.abs(piece.vx) < .3) piece.calm += 1; else piece.calm = 0;
        if (piece.calm > 36) { piece.vy = piece.vx = piece.vr = 0; piece.settled = true; }
        else moving = true;
      });
      render();
      frame = moving ? requestAnimationFrame(animate) : 0;
    };

    const start = () => {
      if (reducedMotion || frame) return;
      frame = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        started = true;
        start();
        observer.disconnect();
      }
    }, { rootMargin: '120px 0px' });
    observer.observe(footer);

    footer.addEventListener('pointermove', event => {
      if (reducedMotion) return;
      const now = performance.now();
      if (now - lastPointerAt < 34) return;
      lastPointerAt = now;
      const rect = host.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      let disturbed = false;
      pieces.forEach(piece => {
        const centerX = piece.x + piece.size / 2;
        const centerY = piece.y + piece.size / 2;
        const dx = centerX - pointerX;
        const dy = centerY - pointerY;
        const distance = Math.hypot(dx, dy);
        if (distance > 190) return;
        const force = ((190 - distance) / 190) ** 1.5;
        piece.vx = Math.max(-3.4, Math.min(3.4,
          piece.vx + (dx / Math.max(distance, 1)) * force * 2.1));
        piece.vy = Math.max(-3.6, Math.min(3.6,
          piece.vy - force * 2.3));
        piece.vr = Math.max(-.9, Math.min(.9,
          piece.vr + (dx >= 0 ? 1 : -1) * force * .42));
        piece.settled = false;
        piece.calm = 0;
        disturbed = true;
      });
      if (disturbed) start();
    }, { passive: true });

    build();
  };

  const bindHeroTyped = () => {
    const el = document.querySelector('.hero-typed-word');
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const words = ['designers', 'criativos', 'devs', 'líderes'];
    let i = 0, count = words[0].length, deleting = true;
    const tick = () => {
      const word = words[i];
      count += deleting ? -1 : 1;
      el.textContent = word.slice(0, count);
      let delay = deleting ? 55 : 115;
      if (!deleting && count === word.length) { delay = 1500; deleting = true; }
      else if (deleting && count === 0) { deleting = false; i = (i + 1) % words.length; delay = 340; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 1800);
  };

  const init = () => {
    bindCurrentDom();
    bindMotionRegions();
    bindSyllabus();
    bindClosingFigma();
    bindFaq();
    bindFooterPhysics();
    bindHeroTyped();
    bindChromeObservers();
    updateChrome();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
