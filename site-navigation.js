(() => {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!toggle || !menu || typeof menu.showModal !== "function") return;

  const root = document.documentElement;
  const mobile = window.matchMedia("(max-width: 760px)");
  const closeButton = menu.querySelector(".mobile-menu-close");
  const lastLink = menu.querySelector(".mobile-menu-email");
  let restoreFocus = true;

  function closeMenu() {
    if (menu.open) menu.close();
  }

  toggle.addEventListener("click", () => {
    if (!mobile.matches || menu.open) return;
    restoreFocus = true;
    menu.showModal();
    toggle.setAttribute("aria-expanded", "true");
    root.classList.add("nav-dialog-open");
  });

  closeButton.addEventListener("click", closeMenu);
  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    if (event.shiftKey && document.activeElement === closeButton) {
      event.preventDefault();
      lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault();
      closeButton.focus();
    }
  });

  menu.addEventListener("close", () => {
    toggle.setAttribute("aria-expanded", "false");
    root.classList.remove("nav-dialog-open");
    if (restoreFocus) {
      const target = mobile.matches ? toggle : document.querySelector(".main-nav a");
      target?.focus({ preventScroll: true });
    }
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest?.("a[href]")) {
      restoreFocus = false;
      closeMenu();
      return;
    }
    if (event.target !== menu) return;
    const bounds = menu.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu();
  });

  mobile.addEventListener("change", () => {
    if (!mobile.matches) closeMenu();
  });
  window.addEventListener("pagehide", closeMenu);
  root.classList.add("nav-ready");
  toggle.hidden = false;
})();
