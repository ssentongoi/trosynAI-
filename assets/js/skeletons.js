(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function createLines(count, cls) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      const line = document.createElement("div");
      line.className = cls;
      frag.appendChild(line);
    }
    return frag;
  }

  function createReadMoreSkeleton(container, cards = 3) {
    container.innerHTML = "";
    container.classList.add("is-skeleton-active");
    for (let i = 0; i < cards; i += 1) {
      const card = document.createElement("article");
      card.className = "read-more-card skeleton-card";
      card.setAttribute("aria-hidden", "true");
      card.innerHTML = `
        <div class="skeleton skeleton-media"></div>
        <div class="read-more-copy">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-title short"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-meta"></div>
        </div>
      `;
      container.appendChild(card);
    }
  }

  function removeSkeleton(container) {
    container.classList.remove("is-skeleton-active");
    container.querySelectorAll(".skeleton-card").forEach((n) => n.remove());
  }

  function initWaitlistSkeleton() {
    const host = document.querySelector("[data-skeleton-waitlist]");
    if (!host) return;
    host.setAttribute("aria-busy", "true");
    const shell = document.createElement("div");
    shell.className = "page-skeleton page-skeleton-waitlist";
    shell.setAttribute("aria-hidden", "true");
    shell.innerHTML = `
      <div class="skeleton skeleton-badge"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
      <div class="skeleton-panel">
        <div class="skeleton skeleton-input"></div>
        <div class="skeleton skeleton-input"></div>
        <div class="skeleton skeleton-input"></div>
        <div class="skeleton skeleton-button"></div>
      </div>
    `;
    host.prepend(shell);

    const markLoaded = () => {
      host.setAttribute("aria-busy", "false");
      shell.remove();
    };

    window.addEventListener("message", (event) => {
      if (typeof event?.data === "string" && event.data.includes("tally")) {
        markLoaded();
      }
    });

    setTimeout(markLoaded, 5000);
  }

  function initBlogReadMoreSkeletons() {
    const targets = document.querySelectorAll("[data-skeleton-read-more]");
    targets.forEach((target) => {
      const cards = Number(target.getAttribute("data-skeleton-cards") || "3");
      createReadMoreSkeleton(target, cards);
      target.setAttribute("aria-busy", "true");
    });
  }

  function markBlogReadMoreLoaded(target) {
    if (!target) return;
    target.setAttribute("aria-busy", "false");
    removeSkeleton(target);
  }

  function initBlogIndexSkeleton() {
    const grid = document.querySelector("[data-skeleton-blog-grid]");
    if (!grid) return;
    const cards = Number(grid.getAttribute("data-skeleton-cards") || "6");
    grid.innerHTML = "";
    grid.classList.add("is-skeleton-active");
    grid.setAttribute("aria-busy", "true");
    for (let i = 0; i < cards; i += 1) {
      const card = document.createElement("article");
      card.className = "blog-card skeleton-card";
      card.setAttribute("aria-hidden", "true");
      card.innerHTML = `
        <div class="skeleton skeleton-media"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-meta"></div>
      `;
      grid.appendChild(card);
    }
  }

  function markBlogIndexLoaded(grid) {
    if (!grid) return;
    grid.classList.remove("is-skeleton-active");
    grid.setAttribute("aria-busy", "false");
    grid.querySelectorAll(".skeleton-card").forEach((n) => n.remove());
  }

  window.TrosynSkeletons = {
    reduceMotion,
    createLines,
    initWaitlistSkeleton,
    initBlogReadMoreSkeletons,
    markBlogReadMoreLoaded,
    initBlogIndexSkeleton,
    markBlogIndexLoaded
  };
})();
