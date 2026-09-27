(function () {
  var root = document.documentElement;
  root.classList.add("js");

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  }

  /* ---------- Theme toggle ---------- */
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      if (!current) {
        current = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store("theme", next);
    });
  }

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  var nav = document.querySelector(".nav");
  var menuButton = document.querySelector(".menu-toggle");

  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (nav && menuButton) {
    menuButton.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.focus();
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Active section highlighting (nav + table of contents) ---------- */
  var spyLinks = document.querySelectorAll('.nav-links a[href^="#"], .toc a[href^="#"]');
  if (spyLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    spyLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      (byId[id] = byId[id] || []).push(link);
    });
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          spyLinks.forEach(function (l) {
            l.classList.remove("is-active");
          });
          (byId[entry.target.id] || []).forEach(function (l) {
            l.classList.add("is-active");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spyObserver.observe(section);
    });
  }

  /* ---------- Lightbox for project images ---------- */
  var zoomable = document.querySelectorAll(".figure-frame img");
  if (zoomable.length && typeof HTMLDialogElement === "function") {
    var dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.setAttribute("aria-label", "Image viewer");
    dialog.innerHTML =
      '<button class="icon-button lightbox-close" type="button" aria-label="Close image">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button><img alt="" />';
    document.body.appendChild(dialog);
    var dialogImg = dialog.querySelector("img");

    function close() {
      dialog.close();
    }
    dialog.addEventListener("click", close);

    zoomable.forEach(function (img) {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "Enlarge image: " + (img.alt || ""));
      function open() {
        dialogImg.src = img.currentSrc || img.src;
        dialogImg.alt = img.alt;
        dialog.showModal();
      }
      img.addEventListener("click", open);
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
