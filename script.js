(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- theme toggle ---------------- */

  var themeBtn = document.getElementById("themeToggle");
  function setTheme(mode) {
    if (mode === "light") {
      root.setAttribute("data-theme", "light");
      themeBtn.setAttribute("aria-label", "Switch to dark theme");
    } else {
      root.removeAttribute("data-theme");
      themeBtn.setAttribute("aria-label", "Switch to light theme");
    }
    localStorage.setItem("theme", mode);
  }
  themeBtn.addEventListener("click", function () {
    var isLight = root.getAttribute("data-theme") === "light";
    setTheme(isLight ? "dark" : "light");
  });
  // sync the label on load (attribute was already set inline in <head> to avoid flash)
  setTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  /* ---------------- nav overlay ---------------- */

  var navToggle = document.getElementById("navToggle");
  var navOverlay = document.getElementById("navOverlay");
  var lastFocused = null;

  function openNav() {
    lastFocused = document.activeElement;
    navOverlay.classList.add("is-open");
    navOverlay.setAttribute("aria-hidden", "false");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
    var firstLink = navOverlay.querySelector("a");
    if (firstLink) firstLink.focus({ preventScroll: true });
  }

  function closeNav() {
    navOverlay.classList.remove("is-open");
    navOverlay.setAttribute("aria-hidden", "true");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus({ preventScroll: true });
  }

  navToggle.addEventListener("click", function () {
    var isOpen = navOverlay.classList.contains("is-open");
    isOpen ? closeNav() : openNav();
  });

  navOverlay.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navOverlay.classList.contains("is-open")) closeNav();
  });

  /* ---------------- active page highlight in menu ---------------- */

  (function () {
    var current = location.pathname.split("/").pop();
    if (current === "") current = "index.html";
    navOverlay.querySelectorAll(".nav-list a").forEach(function (a) {
      var href = (a.getAttribute("href") || "").split("/").pop();
      if (href === current) a.classList.add("is-current");
    });
  })();

  /* ---------------- scroll reveal ---------------- */

  var revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach(function (el, i) {
    if (el.closest(".hero")) el.style.setProperty("--r-i", i);
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- scroll progress bar ---------------- */

  var progressBar = document.getElementById("progressBar");
  var ticking = false;
  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? doc.scrollTop / max : 0;
    progressBar.style.transform = "scaleX(" + pct + ")";
    ticking = false;
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateProgress();

  /* ---------------- hero cursor spotlight ---------------- */

  var hero = document.querySelector(".hero");
  if (hero && window.matchMedia("(hover: hover)").matches && !reduceMotion) {
    var raf = null;
    hero.addEventListener("mousemove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var rect = hero.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty("--x", x + "%");
        hero.style.setProperty("--y", y + "%");
        raf = null;
      });
    });
  }

  /* ---------------- back to top ---------------- */

  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------- copy email ---------------- */

  var emailBtn = document.getElementById("emailCopy");
  if (emailBtn) {
    var emailText = document.getElementById("emailText");
    var original = emailText.textContent;
    emailBtn.addEventListener("click", function () {
      var email = emailBtn.getAttribute("data-email");
      var done = function () {
        emailText.textContent = "Copied!";
        setTimeout(function () { emailText.textContent = original; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(done);
      } else {
        done();
      }
    });
  }
})();
