(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const revealSelector = [
    ".section-intro", ".project-card", ".more-work", ".about-copy", ".workflow",
    ".contact-inner", ".case-section-head", ".case-copy", ".case-figure",
    ".case-callout", ".kimera-store-header", ".kimera-shot", ".capability-card",
    ".insight-card", ".process-grid > li", ".kimera-surface-list > li",
  ].join(", ");
  const revealElements = [...document.querySelectorAll(revealSelector)];
  const parallaxElements = [...document.querySelectorAll(
    ".hero-portrait-photo, .kimera-card-screens, .nextport-card-visual > img"
  )];
  let effectsFrame = 0;
  let wheelFrame = 0;
  let targetScroll = window.scrollY;
  let expectedScroll = window.scrollY;
  let lastWheelTime = 0;

  function revealAncestors(target) {
    for (let element = target; element instanceof Element; element = element.parentElement) {
      if (element.hasAttribute("data-reveal")) element.classList.add("is-revealed");
    }
  }

  function revealHash() {
    if (!location.hash) return;
    try {
      revealAncestors(document.getElementById(decodeURIComponent(location.hash.slice(1))));
    } catch {
      // An invalid fragment keeps its normal browser behavior.
    }
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.04 });

    for (const element of revealElements) {
      element.setAttribute("data-reveal", "");
      const position = element.getBoundingClientRect();
      if (reducedMotion.matches || position.top < window.innerHeight * 0.95) {
        element.classList.add("is-revealed");
      } else {
        observer.observe(element);
      }
    }
  }

  function updateEffects() {
    effectsFrame = 0;
    const scrollRange = root.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? window.scrollY / scrollRange : 0;
    root.style.setProperty("--reading-progress", Math.max(0, Math.min(1, progress)));

    for (const element of parallaxElements) {
      if (reducedMotion.matches) {
        element.style.removeProperty("--parallax-y");
        continue;
      }
      const anchor = element.closest(".project-art") || element.parentElement;
      const bounds = anchor.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) continue;
      const distance = (window.innerHeight / 2 - bounds.top - bounds.height / 2)
        / ((window.innerHeight + bounds.height) / 2);
      const strength = element.matches(".hero-portrait-photo") ? 26 : 10;
      const mobileScale = window.innerWidth < 760 ? 0.55 : 1;
      const offset = Math.max(-1, Math.min(1, distance)) * strength * mobileScale;
      element.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
    }
  }

  function scheduleEffects() {
    if (!effectsFrame) effectsFrame = requestAnimationFrame(updateEffects);
  }

  function stopWheel() {
    cancelAnimationFrame(wheelFrame);
    wheelFrame = 0;
    targetScroll = window.scrollY;
    expectedScroll = window.scrollY;
    root.classList.remove("is-wheel-smoothing");
  }

  function easeWheel(time) {
    const elapsed = Math.min(40, time - lastWheelTime || 16);
    lastWheelTime = time;
    const remaining = targetScroll - window.scrollY;
    const next = Math.abs(remaining) < 1.5
      ? targetScroll
      : window.scrollY + remaining * (1 - Math.exp(-elapsed / 66));
    window.scrollTo({ top: next, behavior: "auto" });
    expectedScroll = window.scrollY;
    if (Math.abs(targetScroll - expectedScroll) < 1.5) {
      stopWheel();
    } else {
      wheelFrame = requestAnimationFrame(easeWheel);
    }
  }

  function hasInnerScroll(target) {
    if (!(target instanceof Element)) return false;
    if (target.closest("input, textarea, select, [contenteditable], dialog")) return true;
    for (let element = target; element && element !== document.body; element = element.parentElement) {
      if (element.scrollHeight <= element.clientHeight + 1) continue;
      if (/(auto|scroll|overlay)/.test(getComputedStyle(element).overflowY)) return true;
    }
    return false;
  }

  window.addEventListener("wheel", (event) => {
    if (event.defaultPrevented || !event.cancelable || reducedMotion.matches || !finePointer.matches
      || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey
      || Math.abs(event.deltaX) >= Math.abs(event.deltaY)
      || document.querySelector("dialog[open]") || hasInnerScroll(event.target)
      || getComputedStyle(root).overflowY === "hidden"
      || getComputedStyle(document.body).overflowY === "hidden") return;

    const unit = event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? window.innerHeight : 1;
    const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
    const startingPoint = wheelFrame ? targetScroll : window.scrollY;
    const nextTarget = Math.max(0, Math.min(maxScroll, startingPoint + event.deltaY * unit));
    if (nextTarget === window.scrollY && !wheelFrame) return;

    event.preventDefault();
    targetScroll = nextTarget;
    root.classList.add("is-wheel-smoothing");
    if (!wheelFrame) {
      lastWheelTime = performance.now();
      wheelFrame = requestAnimationFrame(easeWheel);
    }
  }, { passive: false });

  window.addEventListener("scroll", () => {
    if (wheelFrame && Math.abs(window.scrollY - expectedScroll) > 3) stopWheel();
    scheduleEffects();
  }, { passive: true });
  window.addEventListener("resize", () => {
    stopWheel();
    scheduleEffects();
  }, { passive: true });
  document.addEventListener("keydown", stopWheel, true);
  document.addEventListener("pointerdown", stopWheel, true);
  document.addEventListener("touchstart", stopWheel, { passive: true });
  document.addEventListener("focusin", (event) => revealAncestors(event.target));
  document.addEventListener("beforematch", (event) => revealAncestors(event.target));
  document.addEventListener("visibilitychange", stopWheel);
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin || destination.pathname !== location.pathname
      || destination.search !== location.search || !destination.hash) return;
    stopWheel();
    try {
      revealAncestors(document.getElementById(decodeURIComponent(destination.hash.slice(1))));
    } catch {
      // Let the browser handle fragments that cannot be decoded.
    }
  }, true);
  window.addEventListener("hashchange", () => {
    stopWheel();
    revealHash();
  });
  reducedMotion.addEventListener("change", () => {
    stopWheel();
    if (reducedMotion.matches) {
      revealElements.forEach((element) => element.classList.add("is-revealed"));
    }
    scheduleEffects();
  });
  finePointer.addEventListener("change", stopWheel);

  root.classList.add("motion-ready");
  revealHash();
  scheduleEffects();
})();
