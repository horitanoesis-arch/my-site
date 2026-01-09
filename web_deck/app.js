document.addEventListener("DOMContentLoaded", () => {
  initDeck();
  initParticleBackground();
});

/* =========================================
   Deck Logic
   ========================================= */
const state = {
  currentSlide: 1,
  totalSlides: 35, // Will update dynamically
  slideElements: [],
  fragments: [], // Array of fragments for current slide
  currentFragmentIndex: -1,
  isTransitioning: false,
  completedSlides: new Set(), // Track slides where animation finished
};

const DOM = {
  wrapper: document.getElementById("slides-wrapper"),
  indicator: document.getElementById("slide-indicator"),
  progressBar: document.getElementById("progress-bar"),
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),
};

function initDeck() {
  // 1. Collect slides
  state.slideElements = Array.from(document.querySelectorAll(".slide"));
  state.totalSlides = state.slideElements.length;

  if (state.totalSlides === 0) {
    console.warn("No slides found!");
    return;
  }

  // 2. Sort slides by data-slide if present, else DOM order
  /* 
    state.slideElements.sort((a, b) => {
        const idxA = parseFloat(a.dataset.slide) || 999;
        const idxB = parseFloat(b.dataset.slide) || 999;
        return idxA - idxB;
    });
    */

  // 3. Initialize first slide
  goToSlide(1, true);

  // 4. Events
  setupControls();
  window.addEventListener("resize", handleResize);
  handleResize(); // Initial scale
  if (DOM.wrapper) DOM.wrapper.focus();
}

function handleResize() {
  const baseWidth = 1280;
  const baseHeight = 720;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const scaleX = windowWidth / baseWidth;
  const scaleY = windowHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY, 1.5); // Max scale 1.5

  DOM.wrapper.style.transform = `scale(${scale})`;
}

function setupControls() {
  DOM.nextBtn.addEventListener("click", () => next());
  DOM.prevBtn.addEventListener("click", () => prev());

  // Keyboard
  // Keyboard
  document.addEventListener("keydown", (e) => {
    const isSpace = e.code === "Space" || e.key === " " || e.keyCode === 32;
    const isRight = e.key === "ArrowRight" || e.code === "ArrowRight";
    const isLeft = e.key === "ArrowLeft" || e.code === "ArrowLeft";

    if (isRight || isSpace) {
      if (isSpace) e.preventDefault(); // Prevent scrolling
      next();
    }
    if (isLeft) prev();
  });

  // Background click (ignore buttons/links)
  document.addEventListener("click", (e) => {
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest("input") ||
      e.target.closest(".modal-content") ||
      e.target.id === "slide-indicator"
    )
      return;
    next();
  });

  setupJumpControl();
}

function setupJumpControl() {
  const modal = document.getElementById("jump-modal");
  const grid = document.getElementById("jump-grid");
  const closeBtn = document.getElementById("jump-close-btn");

  if (!modal || !grid) return;

  DOM.indicator.addEventListener("click", (e) => {
    e.stopPropagation();
    modal.classList.remove("hidden");
    renderGrid();
  });

  const renderGrid = () => {
    grid.innerHTML = "";
    for (let i = 1; i <= state.totalSlides; i++) {
      const btn = document.createElement("button");
      btn.className = "jump-btn";
      btn.textContent = i;
      if (i === state.currentSlide) {
        btn.style.borderColor = "#2563eb";
        btn.style.background = "#eff6ff";
      }
      btn.onclick = () => {
        goToSlide(i);
        modal.classList.add("hidden");
      };
      grid.appendChild(btn);
    }
  };

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}

function updateUI() {
  DOM.indicator.textContent = `${state.currentSlide} / ${state.totalSlides}`;
  const progress = ((state.currentSlide - 1) / (state.totalSlides - 1)) * 100;
  DOM.progressBar.style.width = `${progress}%`;
}

/* =========================================
   Navigation & Transitions
   ========================================= */
function goToSlide(index, immediate = false) {
  console.log(`Navigating to slide ${index} (Immediate: ${immediate})`);
  if (index < 1 || index > state.totalSlides) {
    console.warn("Target slide out of bounds");
    return;
  }
  if (state.isTransitioning && !immediate) {
    console.warn("Transition in progress, ignoring request");
    return;
  }

  const targetSlide = state.slideElements[index - 1];
  const prevSlide = state.slideElements[state.currentSlide - 1];
  const direction = index > state.currentSlide ? 1 : -1;

  // Update State
  state.currentSlide = index;
  updateUI();

  // Check restore state
  const shouldRestore = state.completedSlides.has(index);
  prepareFragments(targetSlide, shouldRestore); // Prepare fragments

  // Transition
  if (immediate) {
    state.slideElements.forEach((s) => {
      s.classList.remove("active");
      s.style.opacity = 0;
      s.style.visibility = "hidden";
      gsap.set(s, { clearProps: "all" }); // Clear GSAP props
    });
    targetSlide.classList.add("active");
    targetSlide.style.opacity = 1;
    targetSlide.style.visibility = "visible";
  } else {
    state.isTransitioning = true;

    // GSAP Transition
    // Out
    gsap.to(prevSlide, {
      duration: 0.5,
      x: direction * -100, // Slight shift
      opacity: 0,
      scale: 0.9,
      ease: "power2.in",
      onComplete: () => {
        prevSlide.classList.remove("active");
        prevSlide.style.visibility = "hidden";
        gsap.set(prevSlide, { x: 0, scale: 1 }); // Reset position for next time
      },
    });

    // In
    targetSlide.classList.add("active");
    targetSlide.style.visibility = "visible";

    // Ensure initial state for animation
    gsap.set(targetSlide, { x: direction * 100, opacity: 0, scale: 1.1 });

    // CORTEX-FIX: Call Init trigger for specific slide if exists
    const initFunc = window[`trigger${index}_Init`];
    if (typeof initFunc === "function") {
      console.log(`Calling init trigger for slide ${index}`);
      initFunc();
    }

    gsap.to(targetSlide, {
      duration: 0.8,
      x: 0,
      opacity: 1,
      scale: 1,
      ease: "power2.out",
      onComplete: () => {
        state.isTransitioning = false;
      },
    });
  }
}

function next() {
  console.log("Next action triggered");
  // 1. Check fragments
  if (
    state.fragments.length > 0 &&
    state.currentFragmentIndex < state.fragments.length - 1
  ) {
    console.log("Showing next fragment");
    showNextFragment();

    // Check if finished
    if (state.currentFragmentIndex === state.fragments.length - 1) {
      state.completedSlides.add(state.currentSlide);
      console.log(`Slide ${state.currentSlide} marked as completed.`);
    }
    return;
  }
  // 2. Next Slide
  console.log("Going to next slide");
  // Also mark current as completed if we leave it (just in case no fragments or skipped)
  state.completedSlides.add(state.currentSlide);
  goToSlide(state.currentSlide + 1);
}

function prev() {
  console.log("Prev action triggered");

  // Check if strictly "completed" (all fragments shown)
  // If so, user wants to treat it as a static page and go to prev slide immediately.
  const isCompleted = state.completedSlides.has(state.currentSlide);

  // 1. Check fragments (reverse)
  // Only step back if NOT completed
  if (
    !isCompleted &&
    state.fragments.length > 0 &&
    state.currentFragmentIndex >= 0
  ) {
    console.log("Hiding current fragment");
    hideCurrentFragment();
    return;
  }
  // 2. Prev Slide
  console.log("Going to prev slide");
  goToSlide(state.currentSlide - 1);
}

/* =========================================
   Fragments System
   ========================================= */
function prepareFragments(slideElement, restore = false) {
  // Find elements with data-fragment or special classes
  const els = Array.from(
    slideElement.querySelectorAll("[data-fragment], .fragment")
  );

  // Group fragments by index
  // Format: state.fragments = [ [el, el], [el], ... ]
  const indexedGroups = new Map();
  const orphans = [];

  els.forEach((el) => {
    if (el.hasAttribute("data-fragment-index")) {
      const idx = parseFloat(el.getAttribute("data-fragment-index"));
      if (!indexedGroups.has(idx)) indexedGroups.set(idx, []);
      indexedGroups.get(idx).push(el);
    } else {
      orphans.push(el);
    }
  });

  // Sort indexed groups
  const sortedIndices = Array.from(indexedGroups.keys()).sort((a, b) => a - b);

  // Build final sequence: Indexed groups first (ordered), then orphans (DOM order)
  state.fragments = sortedIndices.map((i) => indexedGroups.get(i));

  // Treat orphans as individual steps
  orphans.forEach((el) => {
    state.fragments.push([el]);
  });

  console.log(`Prepared ${state.fragments.length} fragment steps`);

  if (restore && state.fragments.length > 0) {
    // Restore fully visible state
    state.currentFragmentIndex = state.fragments.length - 1;
    state.fragments.flat().forEach((el) => {
      gsap.set(el, { autoAlpha: 1, y: 0, scale: 1, textShadow: "none" });

      // Feature: Hide Target on Restore
      // If we are restoring to full state, we must also ensure that targets meant to be hidden are actually hidden.
      if (el.dataset.hideTarget) {
        const target = document.querySelector(el.dataset.hideTarget);
        if (target) gsap.set(target, { autoAlpha: 0 });
      }
    });
    console.log("Restored all fragments for this slide.");
  } else {
    // Initial state: Hide all
    state.currentFragmentIndex = -1;
    state.fragments.flat().forEach((el) => {
      gsap.set(el, { autoAlpha: 0 }); // autoAlpha handles opacity + visibility
      // Optional: Custom initial state override
      if (
        el.classList.contains("no-anim") ||
        el.classList.contains("spin-reveal")
      )
        return;
      gsap.set(el, { y: 20, scale: 0.95 });
    });
  }
}

function showNextFragment() {
  state.currentFragmentIndex++;
  const group = state.fragments[state.currentFragmentIndex];
  if (!group) return;

  console.log(
    `Showing fragment step ${state.currentFragmentIndex + 1} with ${
      group.length
    } elements`
  );

  group.forEach((el) => {
    // Feature: Hide Target (Swap effect) - Run this BEFORE animation returns
    if (el.dataset.hideTarget) {
      const target = document.querySelector(el.dataset.hideTarget);
      if (target) gsap.to(target, { autoAlpha: 0, duration: 0.3 });
    }

    // Custom Animation: Spin Reveal (Kurukuru effect)
    if (el.classList.contains("spin-reveal")) {
      gsap.fromTo(
        el,
        { autoAlpha: 0, rotation: -720, scale: 0 },
        {
          autoAlpha: 1,
          rotation: 0,
          scale: 1,
          duration: 2.0,
          ease: "elastic.out(1, 0.75)",
        }
      );
      el.classList.add("visible");
      return;
    }

    // Check for custom animation class
    // Default Animation: Dramatic Reveal
    if (!el.classList.contains("no-anim")) {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 20, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
      el.classList.add("visible");
    } else {
      gsap.to(el, { autoAlpha: 1, duration: 0.3 });
      el.classList.add("visible");
    }

    // Optional: Glow effect
    if (!el.classList.contains("no-glow")) {
      gsap.fromTo(
        el,
        { textShadow: "0 0 20px rgba(255,255,255,0.8)" },
        { textShadow: "none", duration: 1, delay: 0.2 }
      );
    }

    // Feature: Hide Target (Swap effect)
    if (el.dataset.hideTarget) {
      const target = document.querySelector(el.dataset.hideTarget);
      if (target) gsap.to(target, { autoAlpha: 0, duration: 0.3 });
    }

    // Trigger Callback if defined
    if (
      el.dataset.trigger &&
      typeof window[el.dataset.trigger] === "function"
    ) {
      console.log(`Triggering callback: ${el.dataset.trigger}`);
      window[el.dataset.trigger]();
    }
  });
}

function hideCurrentFragment() {
  const group = state.fragments[state.currentFragmentIndex];
  if (!group) return;

  group.forEach((el) => {
    gsap.to(el, { autoAlpha: 0, y: 10, duration: 0.3 });
    el.classList.remove("visible");

    // Feature: Restore Target (Undo swap)
    if (el.dataset.hideTarget) {
      const target = document.querySelector(el.dataset.hideTarget);
      if (target) gsap.to(target, { autoAlpha: 1, duration: 0.3 });
    }

    // Feature: Reverse Trigger
    if (
      el.dataset.triggerReverse &&
      typeof window[el.dataset.triggerReverse] === "function"
    ) {
      console.log(`Triggering reverse callback: ${el.dataset.triggerReverse}`);
      window[el.dataset.triggerReverse]();
    }
  });

  state.currentFragmentIndex--;
}

/* =========================================
   Three.js Background (Reliable Blue/Abstract)
   ========================================= */
function handleResize() {
  const baseWidth = 1280;
  const baseHeight = 720;

  // Calculate scale to fit the screen while maintaining aspect ratio
  // Use a slightly smaller factor (0.95) to ensure some padding
  const scale = Math.min(
    (window.innerWidth / baseWidth) * 0.95,
    (window.innerHeight / baseHeight) * 0.95
  );

  DOM.wrapper.style.width = `${baseWidth}px`;
  DOM.wrapper.style.height = `${baseHeight}px`;
  // Use translate(-50%, -50%) to center the element from top:50%/left:50%
  DOM.wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

/* =========================================
   Particle Background
   ========================================= */
class Particle {
  constructor(w, h, color) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;

    // Speed up: approx 3x previous speed range
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;

    this.baseRadius = Math.random() * 250 + 150;
    this.radius = this.baseRadius;
    this.color = color;
    this.angle = Math.random() * Math.PI * 2;
    // Pulsation speed
    this.angleSpeed = 0.01 + Math.random() * 0.02;
  }

  update(w, h) {
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.angleSpeed;

    // Bounce off edges
    if (this.x < -this.baseRadius) this.vx *= -1;
    if (this.x > w + this.baseRadius) this.vx *= -1;
    if (this.y < -this.baseRadius) this.vy *= -1;
    if (this.y > h + this.baseRadius) this.vy *= -1;
  }

  draw(ctx) {
    ctx.beginPath();

    // Pulsate radius
    const r = this.baseRadius + Math.sin(this.angle) * 60;

    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      Math.max(0, r)
    );

    // Increase visibility
    gradient.addColorStop(
      0,
      `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.5)`
    );
    gradient.addColorStop(
      0.4,
      `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.15)`
    );
    gradient.addColorStop(
      1,
      `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`
    );

    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, Math.max(0, r), 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticleBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;
  let animationFrameId = 0;
  let particles = [];

  // Settings: Deep Blue, Violet, Charcoal, Gold accents
  const colors = [
    { r: 15, g: 23, b: 42 }, // Slate 900 (Base Dark)
    { r: 49, g: 46, b: 129 }, // Indigo 900 (Deep Blue)
    { r: 107, g: 33, b: 168 }, // Purple 800 (Accent 1)
    { r: 87, g: 83, b: 78 }, // Stone 600 (Muted Grey)
    { r: 217, g: 119, b: 6 }, // Amber 600 (Gold Accent)
  ];

  function initCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  function createParticles() {
    particles = [];
    const particleCount = 18;

    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push(new Particle(width, height, color));
    }
  }

  function animate() {
    // Clear background with trail effect
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(2, 6, 23, 0.1)";
    ctx.fillRect(0, 0, width, height);

    // Additive blending for glow
    ctx.globalCompositeOperation = "lighter";

    particles.forEach((p) => {
      p.update(width, height);
      p.draw(ctx);
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  // Init
  initCanvas();
  createParticles();
  animate();

  // Resize
  window.addEventListener("resize", () => {
    initCanvas();
    createParticles();
  });
}

//roundサークル
(() => {
  // const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduceMotion = false; // まず強制でアニメON

  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function getCXCY(el) {
    return {
      x: parseFloat(el.getAttribute("cx") || "0"),
      y: parseFloat(el.getAttribute("cy") || "0"),
    };
  }

  function setMarkerXY(marker, x, y) {
    marker.setAttribute("cx", x);
    marker.setAttribute("cy", y);
  }

  function buildEllipseSampler(ellipseEl, samples = 2000) {
    const tag = ellipseEl.tagName.toLowerCase();
    const cx = parseFloat(ellipseEl.getAttribute("cx") || "0");
    const cy = parseFloat(ellipseEl.getAttribute("cy") || "0");

    let rx, ry;
    if (tag === "circle") {
      const r = parseFloat(ellipseEl.getAttribute("r") || "0");
      rx = r;
      ry = r;
    } else {
      rx = parseFloat(ellipseEl.getAttribute("rx") || "0");
      ry = parseFloat(ellipseEl.getAttribute("ry") || "0");
    }

    const pts = [];
    const lens = [0];
    let total = 0;

    const pointAtAngle = (a) => ({
      x: cx + rx * Math.cos(a),
      y: cy + ry * Math.sin(a),
    });

    let prev = pointAtAngle(0);
    pts.push(prev);

    for (let i = 1; i <= samples; i++) {
      const a = (Math.PI * 2 * i) / samples;
      const p = pointAtAngle(a);
      total += Math.hypot(p.x - prev.x, p.y - prev.y);
      lens.push(total);
      pts.push(p);
      prev = p;
    }

    function pointAtLength(len) {
      let l = len % total;
      if (l < 0) l += total;
      let lo = 0,
        hi = lens.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (lens[mid] < l) lo = mid + 1;
        else hi = mid;
      }
      const i = Math.max(1, lo);
      const l0 = lens[i - 1],
        l1 = lens[i];
      const t = l1 - l0 > 0 ? (l - l0) / (l1 - l0) : 0;
      const p0 = pts[i - 1],
        p1 = pts[i];
      return { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
    }

    function closestLengthTo(x, y) {
      let bestI = 0,
        bestD2 = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const dx = pts[i].x - x,
          dy = pts[i].y - y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) {
          bestD2 = d2;
          bestI = i;
        }
      }
      return lens[Math.min(bestI, lens.length - 1)];
    }

    return {
      totalLength: total,
      getPointAtLength: pointAtLength,
      closestLengthTo,
    };
  }

  function initSection(section) {
    if (!section || section.dataset.roundcircleReady === "1") return;

    const wrap = section.querySelector("[data-roundcircle]");
    const svg = wrap?.querySelector("svg");
    if (!wrap || !svg) return;

    // ボタンは存在してもOK（使わない運用でもOK）
    const btn = section.querySelector("[data-roundcircle-btn]");

    const ring = svg.querySelector("#ringPath");
    const marker = svg.querySelector("#marker");
    const endRef = svg.querySelector("#markerEnd");
    if (!ring || !marker || !endRef) return;

    // 目印は位置参照用なので不可視
    endRef.style.opacity = "0";
    endRef.style.pointerEvents = "none";

    // 楕円でも確実に動くよう sampler
    const geom = buildEllipseSampler(ring, 2000);

    const startXY = getCXCY(marker);
    const endXY = getCXCY(endRef);

    const startLen = geom.closestLengthTo(startXY.x, startXY.y);
    const endLen = geom.closestLengthTo(endXY.x, endXY.y);

    // 初期位置を線上に吸着
    const p0 = geom.getPointAtLength(startLen);
    setMarkerXY(marker, p0.x, p0.y);

    // （任意）初期は 8P を非表示
    const text8pInit = svg.querySelector("#text-8p");
    if (text8pInit) text8pInit.style.opacity = "0";

    // 速度（ここだけ触ればOK）
    const DURATION_TO_END = 2600;

    const state = {
      geom,
      marker,
      startLen,
      endLen,
      step: 0, // 0: まだ動かしてない / 1: 動かした後（次は通常遷移に任せる）
      animating: false,
      rafId: 0,
    };

    function isTypingTarget(el) {
      if (!el) return false;
      const tag = el.tagName || "";
      return !!el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/i.test(tag);
    }

    function isSectionVisible() {
      if (!section.isConnected) return false;
      const cs = getComputedStyle(section);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      if (Number(cs.opacity) === 0) return false;

      const r = section.getBoundingClientRect();
      // スライドは通常 1枚だけ表示されるので、この判定で十分堅い
      return (
        r.width > 0 &&
        r.height > 0 &&
        r.bottom > 0 &&
        r.top < window.innerHeight
      );
    }

    function animateAlong(fromLen, toLen, ms) {
      if (state.animating) return;

      if (typeof reduceMotion !== "undefined" && reduceMotion) {
        const p = geom.getPointAtLength(toLen);
        setMarkerXY(marker, p.x, p.y);
        return;
      }

      state.animating = true;

      const total = geom.totalLength;
      let delta = toLen - fromLen;

      // 最短方向
      if (Math.abs(delta) > total / 2) {
        delta = delta > 0 ? delta - total : delta + total;
      }
      const target = fromLen + delta;

      const t0 = performance.now();
      const tick = (now) => {
        const t = clamp01((now - t0) / ms);
        const e = easeInOutCubic(t);
        const cur = fromLen + (target - fromLen) * e;

        const p = geom.getPointAtLength(cur);
        setMarkerXY(marker, p.x, p.y);

        if (t < 1) {
          state.rafId = requestAnimationFrame(tick);
        } else {
          state.animating = false;
        }
      };

      state.rafId = requestAnimationFrame(tick);
    }

    function currentLen() {
      const xy = getCXCY(marker);
      return geom.closestLengthTo(xy.x, xy.y);
    }

    function runRoundCircle() {
      if (state.animating) return;

      const cur = currentLen();

      const text8p = svg.querySelector("#text-8p");
      const text1500 = svg.querySelector("#text-1500");
      const text1500Left = svg.querySelector("#text-1500-left");

      if (state.step === 0) {
        animateAlong(cur, state.endLen, DURATION_TO_END);
        state.step = 1;

        if (text8p) text8p.style.opacity = "1";

        if (text1500) {
          text1500.style.setProperty("fill", "#FF0000", "important");
          text1500.setAttribute("fill", "#FF0000");
        }
        if (text1500Left) {
          text1500Left.style.setProperty("fill", "#FF0000", "important");
          text1500Left.setAttribute("fill", "#FF0000");
        }
      } else {
        // 2回目以降はこのギミック側では止めない（通常のスライド遷移に任せる）
      }
    }

    // クリック/タップ等：1回目だけ止めてアニメ
    function onAnyPointer(e) {
      if (state.step !== 0) return; // 2回目以降は止めない
      if (!isSectionVisible()) return;

      if (isTypingTarget(e.target) || isTypingTarget(document.activeElement))
        return;

      // UI要素は邪魔しない（必要なら調整）
      if (e.target?.closest?.("button, a, label, input, textarea, select"))
        return;

      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function")
        e.stopImmediatePropagation();

      runRoundCircle();
    }

    section.addEventListener("pointerdown", onAnyPointer, { capture: true });
    section.addEventListener("touchstart", onAnyPointer, {
      capture: true,
      passive: false,
    });
    section.addEventListener("click", onAnyPointer, { capture: true });

    if (btn) {
      btn.addEventListener("pointerdown", onAnyPointer, { capture: true });
      btn.addEventListener("touchstart", onAnyPointer, {
        capture: true,
        passive: false,
      });
      btn.addEventListener("click", onAnyPointer, { capture: true });
    }

    // キーボード入力：キー種別を限定せず、1回目だけ先取りしてアニメ
    function onAnyKeyDown(e) {
      if (state.step !== 0) return; // 2回目以降は止めない
      if (!isSectionVisible()) return;

      // 入力中は邪魔しない
      if (isTypingTarget(e.target) || isTypingTarget(document.activeElement))
        return;

      // ここで止めないとスペース等で次スライドに吸われる
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function")
        e.stopImmediatePropagation();

      runRoundCircle();
    }

    // document で capture：既存の「次へ」キー操作より先に取る
    document.addEventListener("keydown", onAnyKeyDown, { capture: true });

    section.dataset.roundcircleReady = "1";
  }

  function bootAll() {
    document.querySelectorAll("section.slide.s30-5").forEach(initSection);
    // document.querySelectorAll("section.slide.s30-7").forEach(initSection30_7); // Removed: Handled by fragments
  }

  // Slide 30.7 Animation Triggers
  window.trigger30_7_Center = function () {
    const section = document.querySelector(".slide.s30-7");
    if (!section) return;
    const bubble2000 = section.querySelector("#bubble-2000");
    const bubble1300 = section.querySelector("#bubble-1300");
    const targetContainer = section.querySelector(".roundcircle-embed");

    if (!bubble2000 || !bubble1300 || !targetContainer) return;

    const targetRect = targetContainer.getBoundingClientRect();
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const offset = 120;

    // Move to center, scale up, on top, BG white
    const bubbles = [
      {
        el: bubble2000,
        targetX: targetCenterX - offset,
        targetY: targetCenterY,
      },
      {
        el: bubble1300,
        targetX: targetCenterX + offset,
        targetY: targetCenterY,
      },
    ];

    bubbles.forEach((item) => {
      const bubbleRect = item.el.getBoundingClientRect();
      const bubbleX = bubbleRect.left + bubbleRect.width / 2;
      const bubbleY = bubbleRect.top + bubbleRect.height / 2;
      const deltaX = item.targetX - bubbleX;
      const deltaY = item.targetY - bubbleY;

      item.el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.3)`;
      item.el.style.zIndex = "100";
      item.el.style.backgroundColor = "#FFF";
    });
  };

  window.trigger30_7_Reset = function () {
    const section = document.querySelector(".slide.s30-7");
    if (!section) return;
    const bubble2000 = section.querySelector("#bubble-2000");
    const bubble1300 = section.querySelector("#bubble-1300");

    if (!bubble2000 || !bubble1300) return;

    [bubble2000, bubble1300].forEach((bubble) => {
      bubble.style.transform = "";
      bubble.style.zIndex = "";
      bubble.style.backgroundColor = "";
    });
  };

  window.trigger30_7_FlowP = function () {
    spawnParticles("2,000", 0.3, 0.3, "particle-flow-p", "#2b09e8");
  };

  window.trigger30_7_FlowK = function () {
    spawnParticles("1,300", 0.7, 0.7, "particle-flow-k", "#02a852");
  };

  window.trigger30_7_FlowP_Reset = function () {
    gsap.to(".particle-flow-p", {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        document
          .querySelectorAll(".particle-flow-p")
          .forEach((el) => el.remove());
      },
    });
  };

  window.trigger30_7_FlowK_Reset = function () {
    gsap.to(".particle-flow-k", {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        document
          .querySelectorAll(".particle-flow-k")
          .forEach((el) => el.remove());
      },
    });
  };

  window.trigger30_7_ClearAll = function () {
    window.trigger30_7_FlowP_Reset();
    window.trigger30_7_FlowK_Reset();
  };

  window.trigger30_7_RestoreAll = function () {
    // Re-spawn both if going back from cleared state to visible state
    window.trigger30_7_FlowP();
    window.trigger30_7_FlowK();
  };

  function spawnParticles(text, rX, rY, className, bgColor = "white") {
    const section = document.querySelector(".slide.s30-7");
    if (!section) return;
    const pyramid = section.querySelector(".p-k img");
    const targetContainer = section.querySelector(".roundcircle-embed");

    if (!pyramid || !targetContainer) return;

    const pRect = pyramid.getBoundingClientRect();
    const startX = pRect.left + pRect.width * rX;
    const startY = pRect.top + pRect.height * rY;

    const tRect = targetContainer.getBoundingClientRect();
    const targetCenterX = tRect.left + tRect.width / 2;
    const targetCenterY = tRect.top + tRect.height / 2;

    for (let i = 0; i < 30; i++) {
      const el = document.createElement("div");
      el.innerHTML = `${text}<span style="font-size:0.6em; margin-left: 2px;">円</span>`;
      if (className) el.classList.add(className);

      el.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            background: ${bgColor};
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 9999px;
            padding: 4px 10px; 
            font-size: 14px; 
            font-weight: bold;
            color: white; 
            pointer-events: none;
            z-index: 100;
            opacity: 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            white-space: nowrap;
        `;
      document.body.appendChild(el);

      const scatterX = (Math.random() - 0.5) * 60;
      const scatterY = (Math.random() - 0.5) * 60;

      const duration = 0.8 + Math.random() * 0.8;
      const delay = Math.random() * 0.5;

      gsap.set(el, { x: 0, y: 0, scale: 0 });

      const tl = gsap.timeline();

      // 1. Pop out and scatter
      tl.to(el, {
        duration: 0.3,
        opacity: 1,
        scale: 1,
        x: scatterX,
        y: scatterY,
        ease: "back.out(1.5)",
        delay: delay,
      })
        // 2. Fly to target and STAY
        .to(
          el,
          {
            duration: duration,
            x: targetCenterX - startX + (Math.random() - 0.5) * 150, // Slightly wider spread in circle
            y: targetCenterY - startY + (Math.random() - 0.5) * 150,
            scale: 1.0, // Keep original size or slightly varied
            rotation: (Math.random() - 0.5) * 30, // Random rotation for natural look
            ease: "power2.inOut",
          },
          "-=0.1"
        );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootAll);
  } else {
    bootAll();
  }

  // Explicit Init Check for Slide 33 on Boot (Polled to ensure readiness)
  const initS33Poller = setInterval(() => {
    const s33 = document.querySelector(".slide.s31");
    // Check if slide exists and is active (present) or displayed
    if (
      s33 &&
      (s33.classList.contains("present") ||
        getComputedStyle(s33).display !== "none")
    ) {
      console.log("Boot: Slide 33 detected active. Running trigger33_Init.");
      if (typeof window.trigger33_Init === "function") {
        window.trigger33_Init();
        clearInterval(initS33Poller); // Stop once run
      }
    } else if (document.readyState === "complete" && !s33) {
      // If loaded and slide not found, stop
      clearInterval(initS33Poller);
    }
  }, 200);

  // Stop poller after 3 seconds to avoid infinite checking
  setTimeout(() => clearInterval(initS33Poller), 3000);

  // Reveal.js 等で後からスライドが差し込まれる場合の保険
  document.addEventListener("slidechanged", (e) => {
    const slide = e?.detail?.currentSlide || e?.currentSlide;
    if (!slide) return;

    // Slide 30.5 / Round Circle Logic
    if (slide.dataset.roundcircleReady !== "1") {
      initSection(slide);
    }

    // Slide 33 (s31) Map Initialization
    if (
      slide.classList.contains("s31") &&
      typeof window.trigger33_Init === "function"
    ) {
      window.trigger33_Init();
    }
  });
  /* Slide 33: Map Scatter Logic */
  function spawnMapParticles(count, type, animateFromOutside, clear = false) {
    const section = document.querySelector(".slide.s31"); // S31 is logical 33
    if (!section) {
      console.log("Spawn: S31 not found");
      return;
    }
    const container = section.querySelector("#map-particle-container");
    if (!container) {
      console.log("Spawn: Particle container not found");
      return;
    }
    console.log(
      `Spawn: Generating ${count} particles (Type: ${type}, Anim: ${animateFromOutside})`
    );

    if (clear) container.innerHTML = "";

    // Map Areas (Approx % of container)
    // Container is localized to map image area? No, container is absolute inset-0 of slide-container.
    // Map Image is h-[80%] so centered.
    // We need approximate bounds relative to the 1110x646 coordinate space or visual %
    // Let's assume container matches slide dimensions.

    // Zones (Approximate centers and spread)
    const zones = [
      { name: "Hokkaido", x: 0.72, y: 0.15, r: 0.1 },
      { name: "Tohoku", x: 0.65, y: 0.35, r: 0.08 },
      { name: "Kanto", x: 0.7, y: 0.5, r: 0.06 },
      { name: "Chubu", x: 0.6, y: 0.55, r: 0.08 },
      { name: "Kansai", x: 0.5, y: 0.6, r: 0.06 },
      { name: "Chugoku", x: 0.35, y: 0.6, r: 0.08 },
      { name: "Shikoku", x: 0.4, y: 0.7, r: 0.05 },
      { name: "Kyushu", x: 0.25, y: 0.75, r: 0.08 },
      { name: "Miyagi", x: 0.3, y: 0.4, r: 0.05 },
      { name: "Yamagata", x: 0.1, y: 0.4, r: 0.05 },
    ];

    for (let i = 0; i < count; i++) {
      // Pick Particle Type
      let pType = type;
      if (type === "mixed") {
        // 30% P, 70% K
        pType = Math.random() < 0.3 ? "P" : "K";
      }

      const el = document.createElement("div");
      el.className =
        "absolute flex items-center justify-center font-bold text-white shadow-sm z-10";
      // Style based on type
      if (pType === "P") {
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#2563EB"; // blue-600
        el.textContent = "P";
        el.style.fontSize = "16px";
      } else {
        el.style.width = "30px"; // Triangle is harder with div, use SVG or clip-path
        el.style.height = "30px";
        el.style.backgroundColor = "transparent";
        el.innerHTML = `<img src="assets/K.png" class="w-full h-full drop-shadow-sm block" alt="K" />`;
        // K text centering - removed as likely built into image or not needed
      }

      // Pick Zone
      const zone = zones[Math.floor(Math.random() * zones.length)];
      // Random Pos within Zone (Simple Circle)
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * zone.r;
      const targetX = (zone.x + Math.cos(angle) * dist) * 100;
      const targetY = (zone.y + Math.sin(angle) * dist) * 100;

      container.appendChild(el);

      if (animateFromOutside) {
        // Start from Outside
        const startAngle = Math.random() * Math.PI * 2;
        const startDist = 150; // % from center
        const startX = 50 + Math.cos(startAngle) * startDist;
        const startY = 50 + Math.sin(startAngle) * startDist;

        gsap.fromTo(
          el,
          { left: `${startX}%`, top: `${startY}%`, scale: 3, opacity: 0 },
          {
            left: `${targetX}%`,
            top: `${targetY}%`,
            scale: 1,
            opacity: 1,
            duration: 1 + Math.random() * 1.5,
            ease: "power2.out",
            delay: Math.random() * 0.5,
          }
        );
      } else {
        // Static placement - Force visibility
        el.style.left = `${targetX}%`;
        el.style.top = `${targetY}%`;
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
      }
    }
  }

  window.trigger33_Init = function () {
    // Initial state: Hide ~70% of the green K-groups and set them off-screen
    const kGroups = document.querySelectorAll(".map-k-group");
    // Clear dynamic particles if any exist
    const container = document.querySelector("#map-particle-container");
    if (container) container.innerHTML = "";

    kGroups.forEach((group, index) => {
      // Hide ~70% of groups initially
      if (Math.random() < 0.7) {
        group.dataset.hiddenK = "true";
        group.style.opacity = "0";
        // group.style.transition = "none"; // GSAP handles this better on elements

        // Calculate random off-screen position
        const angle = Math.random() * Math.PI * 2;
        const dist = 500 + Math.random() * 500; // 500-1000px away
        const offsetX = Math.cos(angle) * dist;
        const offsetY = Math.sin(angle) * dist;

        gsap.set(group, { x: offsetX, y: offsetY });
      } else {
        group.dataset.hiddenK = "false";
        group.style.opacity = "1";
        gsap.set(group, { x: 0, y: 0 }); // Ensure visible ones are in place
      }
    });
  };

  window.trigger33_Scatter = function () {
    // Reveal existing hidden K-groups (Fly in)
    const kGroups = document.querySelectorAll(
      '.map-k-group[data-hidden-k="true"]'
    );
    gsap.to(kGroups, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 1.2,
      stagger: {
        amount: 0.8,
        from: "random",
      },
      ease: "power3.out",
    });
  };

  window.trigger33_Scatter_Reset = function () {
    // Reset to initial state (fade out)
    const kGroups = document.querySelectorAll(
      '.map-k-group[data-hidden-k="true"]'
    );
    gsap.to(kGroups, {
      opacity: 0,
      duration: 0.5,
    });
  };
})();

// CORTEX-FIX: Dynamic alias for Slide 38 (s31) animation trigger
document.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const s31Index = slides.findIndex((el) => el.classList.contains("s31"));
  if (s31Index !== -1) {
    const realIndex = s31Index + 1;
    if (typeof window.trigger33_Init === "function") {
      window[`trigger${realIndex}_Init`] = window.trigger33_Init;
      console.log(
        `[CORTEX] Aliased trigger${realIndex}_Init to trigger33_Init`
      );
    }
  }
});
