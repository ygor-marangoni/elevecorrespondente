(() => {
  "use strict";

  function initProcessScrollReveal() {
    const section = document.querySelector(".catalog-process");

    if (!section) return;

    const elements = [...section.querySelectorAll("[data-scroll-reveal]")];
    if (elements.length === 0) return;

    const reveal = (element) => {
      element.classList.add("is-visible");
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      elements.forEach(reveal);
      return;
    }

    const lastMedia = section.querySelector(
      ".catalog-process__step-group--04 .catalog-process__media",
    );
    const intro = section.querySelector(".catalog-process__intro");
    const mediaPairs = [
      ...section.querySelectorAll(".catalog-process__step-group"),
    ]
      .map((group) => ({
        card: group.querySelector(".catalog-process__card"),
        media: group.querySelector(".catalog-process__media"),
      }))
      .filter(({ card, media }) => card && media);

    let mediaFadeFrame = 0;

    const syncPassedMedia = () => {
      mediaFadeFrame = 0;

      const isDesktop = window.matchMedia("(min-width: 1101px)").matches;
      const isMobile = window.matchMedia("(max-width: 767.98px)").matches;
      const passLead = 160;
      const precedingMediaPassLead = Math.round(
        Math.max(240, Math.min(520, window.innerHeight * 0.55)),
      );

      if (isMobile) {
        mediaPairs.forEach(({ media }) => {
          // On mobile, each image and card form one continuous vertical module.
          // Keeping the image visible avoids an empty gap before cards 2 and 4.
          media.classList.remove("is-scroll-passing");
          media.style.removeProperty("--process-media-pass-opacity");
          media.style.removeProperty("--process-media-pass-y");
          media.classList.remove("is-passed");
        });
        return;
      }

      const sectionRect = section.getBoundingClientRect();

      if (sectionRect.bottom < -window.innerHeight || sectionRect.top > window.innerHeight * 1.5) {
        return;
      }

      mediaPairs.forEach(({ card, media }) => {
        const cardTop = card.getBoundingClientRect().top;
        const cardBottom = card.getBoundingClientRect().bottom;
        const mediaTop = media.getBoundingClientRect().top;
        const mediaBottom = media.getBoundingClientRect().bottom;
        const stickyTop = parseFloat(window.getComputedStyle(card).top) || 0;
        const cardIsSticky = cardTop <= stickyTop + 5;
        const mediaBeforeCard = Boolean(
          media.compareDocumentPosition(card) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        );

        if (!mediaBeforeCard) {
          const fadeRange = 220;
          const fadeStart = cardBottom;
          const progress = cardIsSticky
            ? Math.min(
                1,
                Math.max(0, (fadeStart - mediaTop) / fadeRange),
              )
            : 0;

          media.classList.remove("is-passed");

          if (progress > 0) {
            media.classList.add("is-scroll-passing");
            media.style.setProperty(
              "--process-media-pass-opacity",
              `${1 - progress}`,
            );
            media.style.setProperty(
              "--process-media-pass-y",
              `${progress * -64}px`,
            );
          } else {
            media.classList.remove("is-scroll-passing");
            media.style.removeProperty("--process-media-pass-opacity");
            media.style.removeProperty("--process-media-pass-y");
          }

          return;
        }

        media.classList.remove("is-scroll-passing");
        media.style.removeProperty("--process-media-pass-opacity");
        media.style.removeProperty("--process-media-pass-y");
        const currentPassLead = mediaBeforeCard
          ? precedingMediaPassLead
          : passLead;
        const mediaIsBehindCard =
          mediaTop < cardBottom + currentPassLead &&
          mediaBottom > cardTop - currentPassLead;
        const mediaPassedCard = mediaBottom <= cardTop + 2;

        media.classList.toggle(
          "is-passed",
          cardIsSticky && (mediaIsBehindCard || mediaPassedCard),
        );
      });
    };

    const requestPassedMediaSync = () => {
      if (mediaFadeFrame) return;

      mediaFadeFrame = window.requestAnimationFrame(syncPassedMedia);
    };

    window.addEventListener("scroll", requestPassedMediaSync, {
      passive: true,
    });

    window.addEventListener("resize", requestPassedMediaSync);
    requestPassedMediaSync();

    if (lastMedia && intro && "IntersectionObserver" in window) {
      let lastMediaWasVisible = false;
      let introWasReleased = false;
      let releaseFrame = 0;

      const syncReleasedIntro = () => {
        releaseFrame = 0;

        if (!introWasReleased) return;

        const releaseDistance = Math.max(
          0,
          -lastMedia.getBoundingClientRect().bottom,
        );

        intro.style.setProperty(
          "--process-intro-release-y",
          `${-releaseDistance}px`,
        );
      };

      const requestReleasedIntroSync = () => {
        if (!introWasReleased || releaseFrame) return;

        releaseFrame = window.requestAnimationFrame(syncReleasedIntro);
      };

      const releaseIntro = () => {
        if (introWasReleased) return;

        section.classList.add("process-intro-released");
        intro.style.setProperty("--process-intro-release-y", "0px");
        introWasReleased = true;
        requestReleasedIntroSync();
      };

      const restoreIntro = () => {
        if (!introWasReleased) return;

        section.classList.remove("process-intro-released");
        intro.style.removeProperty("--process-intro-release-y");
        introWasReleased = false;
      };

      window.addEventListener("scroll", requestReleasedIntroSync, {
        passive: true,
      });

      window.addEventListener("resize", requestReleasedIntroSync);

      const endObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            lastMediaWasVisible = true;
            restoreIntro();
            return;
          }

          if (lastMediaWasVisible && entry.boundingClientRect.bottom <= 0) {
            releaseIntro();
          }
        },
        { threshold: 0 },
      );

      endObserver.observe(lastMedia);
    }

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));
    section.classList.add("reveal-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProcessScrollReveal, {
      once: true,
    });
  } else {
    initProcessScrollReveal();
  }
})();
