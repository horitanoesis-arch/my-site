/* Slide 33: Map Scatter Logic */
function spawnMapParticles(count, type, animateFromOutside, clear = false) {
  const section = document.querySelector(".slide.s31"); // S31 is logical 33
  if (!section) return;
  const container = section.querySelector("#map-particle-container");
  if (!container) return;

  if (clear) container.innerHTML = "";

  // Map Areas (Approx % of container)
  // Container is localized to map image area? No, container is absolute inset-0 of slide-container.
  // Map Image is h-[80%] so centered.
  // We need approximate bounds relative to the 1110x646 coordinate space or visual %
  // Let's assume container matches slide dimensions.

  // Zones (Approximate centers and spread)
  const zones = [
    { name: "Hokkaido", x: 0.85, y: 0.2, r: 0.1 },
    { name: "Tohoku", x: 0.75, y: 0.35, r: 0.08 },
    { name: "Kanto", x: 0.7, y: 0.5, r: 0.06 },
    { name: "Chubu", x: 0.6, y: 0.55, r: 0.08 },
    { name: "Kansai", x: 0.5, y: 0.6, r: 0.06 },
    { name: "Chugoku", x: 0.35, y: 0.6, r: 0.08 },
    { name: "Shikoku", x: 0.4, y: 0.7, r: 0.05 },
    { name: "Kyushu", x: 0.25, y: 0.75, r: 0.08 },
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
      "absolute flex items-center justify-center font-bold text-white shadow-sm border border-white z-10";
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
      el.innerHTML = `<svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-sm"><path d="M50 10 L90 90 L10 90 Z" fill="#16A34A" stroke="white" stroke-width="8"/></svg><span class="absolute text-xs pt-2">K</span>`;
      // K text centering
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
      // Static placement
      el.style.left = `${targetX}%`;
      el.style.top = `${targetY}%`;
    }
  }
}

window.trigger33_Init = function () {
  // 20 mixed particles, static
  spawnMapParticles(20, "mixed", false, true);
};

window.trigger33_Scatter = function () {
  // 100 K particles, flying in
  spawnMapParticles(80, "K", true, false); // Don't clear existing
};

window.trigger33_Scatter_Reset = function () {
  // Revert to just static
  spawnMapParticles(20, "mixed", false, true);
};
