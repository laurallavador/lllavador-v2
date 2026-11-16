(() => {
  const gallery = document.querySelector(".kimera-gallery");
  const viewer = document.getElementById("shot-viewer");
  if (!gallery || typeof viewer?.showModal !== "function") return;

  const shotSelector = ".kimera-shot a[href]";
  const close = viewer.querySelector("[data-viewer-close]");
  const image = viewer.querySelector("[data-viewer-image]");
  const caption = viewer.querySelector("[data-viewer-caption]");
  const count = viewer.querySelector("[data-viewer-count]");
  const previous = viewer.querySelector("[data-viewer-prev]");
  const next = viewer.querySelector("[data-viewer-next]");
  const original = viewer.querySelector("[data-viewer-original]");

  let opener = null;
  let shots = [];
  let activeIndex = 0;

  function renderShot(index) {
    const shot = shots[index];
    if (!shot) return;

    const thumbnail = shot.querySelector("img");
    const description = shot.closest("figure").querySelector("figcaption");
    activeIndex = index;
    image.alt = thumbnail.alt;
    image.src = shot.href;
    caption.textContent = description?.textContent.trim() ?? thumbnail.alt;
    count.textContent = `${index + 1} of ${shots.length}`;
    if (original) original.href = shot.href;

    previous.setAttribute("aria-disabled", String(index === 0));
    next.setAttribute("aria-disabled", String(index === shots.length - 1));
  }

  gallery.addEventListener("click", (event) => {
    if (viewer.open || event.defaultPrevented || event.button !== 0 ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const shot = event.target.closest(shotSelector);
    const store = shot?.closest(".kimera-store");
    if (!store) return;

    shots = [...store.querySelectorAll(shotSelector)].filter((link) =>
      !link.closest("details:not([open])") && link.getClientRects().length > 0
    );
    const index = shots.indexOf(shot);
    if (index === -1) return;

    renderShot(index);
    viewer.showModal();
    event.preventDefault();
    opener = shot;
    close.focus({ preventScroll: true });
  });

  close.addEventListener("click", (event) => {
    event.preventDefault();
    viewer.close();
  });
  previous.addEventListener("click", () => renderShot(activeIndex - 1));
  next.addEventListener("click", () => renderShot(activeIndex + 1));

  viewer.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    renderShot(activeIndex + (event.key === "ArrowLeft" ? -1 : 1));
  });

  viewer.addEventListener("close", () => {
    opener?.focus({ preventScroll: true });
    opener = null;
    shots = [];
  });

  gallery.classList.add("has-shot-viewer");
  gallery.querySelectorAll(shotSelector).forEach((shot) => shot.setAttribute("aria-haspopup", "dialog"));
})();
