document.addEventListener("DOMContentLoaded", () => {
  function setFavicon(href) {
    // Remove any existing favicons
    document.querySelectorAll('link[rel="icon"]').forEach(el => el.remove());

    // Add the new favicon
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = href;
    document.head.appendChild(link);
  }

  function update() {
    setFavicon(document.hidden ? "/favicon-inactive.ico" : "/favicon-active.ico");
  }

  document.addEventListener("visibilitychange", update);
  window.addEventListener("focus", update);
  window.addEventListener("blur", update);

  update(); // initial
});
