(function () {
  "use strict";

  var nav = document.getElementById("nav");
  var overlay = document.getElementById("overlay");
  var hamburger = document.getElementById("hamburger");
  var navPill = document.getElementById("navPill");
  var navPillLabel = document.getElementById("navPillLabel");
  var hero = document.getElementById("hero");
  var heroVideo = document.getElementById("heroVideo");
  var open = false;

  var reduceMotionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  setTimeout(function () { nav.classList.add("nav-mounted"); }, 100);
  setTimeout(function () { hero.classList.add("hero-mounted"); }, 300);

  /* ---- Hero video: play only when motion is allowed, otherwise show poster ---- */
  function heroMotionAllowed() {
    return !reduceMotionMQ.matches && !document.documentElement.classList.contains("vision-mode");
  }

  function updateHeroVideo() {
    if (!heroVideo) return;
    if (heroMotionAllowed()) {
      var playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () { /* autoplay blocked — poster stays visible */ });
      }
    } else {
      heroVideo.pause();
      try { heroVideo.currentTime = 0; } catch (e) { /* ignore seek errors before metadata loads */ }
    }
  }

  updateHeroVideo();
  if (typeof reduceMotionMQ.addEventListener === "function") {
    reduceMotionMQ.addEventListener("change", updateHeroVideo);
  } else if (typeof reduceMotionMQ.addListener === "function") {
    reduceMotionMQ.addListener(updateHeroVideo);
  }

  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  function setOpen(next) {
    open = next;
    overlay.classList.toggle("open", open);
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    navPill.setAttribute("aria-expanded", String(open));
    navPillLabel.textContent = open ? "Закрыть" : "Навигация";
    document.body.classList.toggle("menu-open", open);
  }

  hamburger.addEventListener("click", function () { setOpen(!open); });
  navPill.addEventListener("click", function () { setOpen(!open); });

  overlay.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setOpen(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) setOpen(false);
  });

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotionMQ.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Full services list toggle ---- */
  var fullListToggle = document.getElementById("fullListToggle");
  var fullList = document.getElementById("fullList");
  if (fullListToggle && fullList) {
    fullListToggle.addEventListener("click", function () {
      var isHidden = fullList.hidden;
      fullList.hidden = !isHidden;
      fullListToggle.setAttribute("aria-expanded", String(isHidden));
      fullListToggle.textContent = isHidden
        ? "Скрыть полный перечень"
        : "Полный перечень нотариальных действий (ст. 35 Основ)";
    });
  }

  /* ---- Accessibility widget ---- */
  var a11yToggle = document.getElementById("a11yToggle");
  var a11yPanel = document.getElementById("a11yPanel");
  var fontDec = document.getElementById("fontDec");
  var fontInc = document.getElementById("fontInc");
  var fontReset = document.getElementById("fontReset");
  var visionToggle = document.getElementById("visionToggle");
  var root = document.documentElement;

  var STORAGE_SCALE = "notary_text_scale";
  var STORAGE_VISION = "notary_vision_mode";
  var scale = parseFloat(localStorage.getItem(STORAGE_SCALE)) || 1;
  applyScale(scale);

  if (localStorage.getItem(STORAGE_VISION) === "1") {
    setVisionMode(true);
  }

  a11yToggle.addEventListener("click", function () {
    var isHidden = a11yPanel.hidden;
    a11yPanel.hidden = !isHidden;
    a11yToggle.setAttribute("aria-expanded", String(isHidden));
  });

  document.addEventListener("click", function (e) {
    if (!a11yPanel.hidden && !document.getElementById("a11yWidget").contains(e.target)) {
      a11yPanel.hidden = true;
      a11yToggle.setAttribute("aria-expanded", "false");
    }
  });

  function applyScale(s) {
    scale = Math.min(1.4, Math.max(0.85, s));
    root.style.setProperty("--text-scale", String(scale));
    localStorage.setItem(STORAGE_SCALE, String(scale));
  }

  fontDec.addEventListener("click", function () { applyScale(scale - 0.1); });
  fontInc.addEventListener("click", function () { applyScale(scale + 0.1); });
  fontReset.addEventListener("click", function () { applyScale(1); });

  function setVisionMode(on) {
    root.classList.toggle("vision-mode", on);
    root.classList.toggle("no-motion", on);
    visionToggle.setAttribute("aria-pressed", String(on));
    localStorage.setItem(STORAGE_VISION, on ? "1" : "0");
    updateHeroVideo();
  }

  visionToggle.addEventListener("click", function () {
    setVisionMode(!root.classList.contains("vision-mode"));
  });

  if (reduceMotionMQ.matches) {
    root.classList.add("no-motion");
  }
})();
