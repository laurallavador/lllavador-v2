for (const showcase of document.querySelectorAll("[data-case-showcase]")) {
  const options = showcase.querySelector("[data-showcase-options]");
  if (!options) continue;

  const entries = [...options.querySelectorAll("button[data-showcase-target]")].map((button) => ({
    button,
    panel: document.getElementById(button.dataset.showcaseTarget),
  }));
  if (!entries.length || entries.some(({ panel }) => !showcase.contains(panel))) continue;

  function selectPreview(activeIndex) {
    entries.forEach(({ button, panel }, index) => {
      const active = index === activeIndex;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
    });
  }

  options.setAttribute("role", "tablist");
  options.setAttribute("aria-label", "Product screens");
  entries.forEach(({ button, panel }, index) => {
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", panel.id);
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", button.id);
    panel.tabIndex = 0;
    button.addEventListener("click", () => selectPreview(index));
    button.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      let nextIndex;
      switch (event.key) {
        case "ArrowRight": nextIndex = (index + 1) % entries.length; break;
        case "ArrowLeft": nextIndex = (index - 1 + entries.length) % entries.length; break;
        case "Home": nextIndex = 0; break;
        case "End": nextIndex = entries.length - 1; break;
        default: return;
      }
      event.preventDefault();
      selectPreview(nextIndex);
      entries[nextIndex].button.focus();
    });
  });
  selectPreview(0);
  options.hidden = false;
}
