(() => {
  const root = document.documentElement;
  const storageKey = "laurallavador-theme";

  function storedTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function applyTheme(value) {
    const theme = value === "dark" ? "dark" : "light";
    root.dataset.theme = theme;
    const color = document.querySelector('meta[name="theme-color"]');
    if (color) color.content = theme === "dark" ? "#191817" : "#ffffff";
    for (const control of document.querySelectorAll(".theme-toggle")) {
      control.setAttribute("aria-checked", String(theme === "dark"));
      control.title = `Switch to ${theme === "dark" ? "light" : "dark"} mode`;
    }
  }

  applyTheme(storedTheme());

  function connectControls() {
    for (const control of document.querySelectorAll(".theme-toggle")) {
      control.hidden = false;
      control.addEventListener("click", () => {
        const theme = root.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(theme);
        try {
          localStorage.setItem(storageKey, theme);
        } catch {
          // The control also works when browser storage is unavailable.
        }
      });
    }
    applyTheme(root.dataset.theme);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", connectControls, { once: true });
  } else {
    connectControls();
  }

  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) applyTheme(storedTheme());
  });
})();
