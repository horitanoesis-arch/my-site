const fs = require("fs");
const path = require("path");

const SOURCE_DIR = "C:/Users/horit/Downloads/zenkousai";
const OUT_INDEX = path.join(SOURCE_DIR, "web_deck/index.html");
const OUT_STYLE = path.join(SOURCE_DIR, "web_deck/style.css");

const headerPart = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Slide Deck</title>
    <!-- Tailwind -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;900&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Three.js -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <canvas id="bg-canvas"></canvas>
    
    <div id="deck" class="deck-container">
        <div id="slides-wrapper">
`;

let newSlidesHtml = "";
let newStylesCss = "";

// Read Base Style (Top generic part)
let baseStyle = fs.readFileSync(OUT_STYLE, "utf8");
const cutPoint = baseStyle.indexOf("/* --- Slide 01 --- */");
if (cutPoint !== -1) {
  baseStyle = baseStyle.substring(0, cutPoint);
} else {
  const cutPoint2 = baseStyle.indexOf(".s01");
  if (cutPoint2 !== -1) baseStyle = baseStyle.substring(0, cutPoint2);
}
newStylesCss = baseStyle;

for (let i = 1; i <= 35; i++) {
  const filename = `file${i}.html`;
  const filePath = path.join(SOURCE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] ${filename} missing`);
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");

  // HTML Extraction
  let slideContent = "";
  // Use Regex to find the start of the slide container div, allowing for extra classes
  const startTagRegex = /<div\s+class=["']slide-container\b.*?>/i;
  const match = startTagRegex.exec(content);
  const startIdx = match ? match.index : -1;

  if (startIdx !== -1) {
    let endIdx = content.indexOf("</body>");
    if (endIdx === -1) endIdx = content.length;
    const lastDivIdx = content.lastIndexOf("</div>", endIdx);
    if (lastDivIdx > startIdx) {
      slideContent = content.substring(startIdx, lastDivIdx + 6);
    }
  }
  // Fallback
  if (slideContent.length < 50) {
    const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(content);
    if (bodyMatch)
      slideContent = `<div class="slide-container fallback">${bodyMatch[1]}</div>`;
  }

  // Path Fixes
  slideContent = slideContent.replace(/src="images\\/g, 'src="assets/');
  slideContent = slideContent.replace(/src="images\//g, 'src="assets/');
  slideContent = slideContent.replace(
    /src="([^"h][^"t][^"t][^"]*)"/g,
    (match, p1) => {
      if (!p1.startsWith("assets/") && !p1.startsWith("http")) {
        let clean = p1.replace(/^[\\\/]+/, "");
        return `src="assets/${clean}"`;
      }
      return match;
    }
  );

  const slideId = `s${String(i).padStart(2, "0")}`;

  // CSS Extraction & Scoping
  const styleMatch = /<style>([\s\S]*?)<\/style>/i.exec(content);
  if (styleMatch) {
    let css = styleMatch[1];
    // 1. Rename Keyframes
    const keyframeMap = new Map();
    css = css.replace(/@keyframes\s+([a-zA-Z0-9_-]+)/g, (match, name) => {
      if (name.startsWith(`${slideId}-`)) return match;
      const newName = `${slideId}-${name}`;
      keyframeMap.set(name, newName);
      return `@keyframes ${newName}`;
    });

    // 2. Update usages
    const sortedKeys = Array.from(keyframeMap.keys()).sort(
      (a, b) => b.length - a.length
    );
    sortedKeys.forEach((oldName) => {
      const newName = keyframeMap.get(oldName);
      const re = new RegExp(
        `(?<!@keyframes\\s+|[a-zA-Z0-9_-])${oldName}(?![a-zA-Z0-9_-])`,
        "g"
      );
      css = css.replace(re, newName);
    });
    // 3. Scope Selectors
    css = css.replace(
      /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g,
      (match, selector, suffix) => {
        let trimmed = selector.trim();
        if (
          trimmed.startsWith("@") ||
          trimmed.match(/^[\d.]+%$/) ||
          trimmed === "from" ||
          trimmed === "to"
        )
          return match;
        if (trimmed === "body")
          return `.${slideId}.active .slide-container${suffix}`;
        return `.${slideId}.active ${trimmed}${suffix}`;
      }
    );
    newStylesCss += `\n/* --- Slide ${i} --- */\n${css}\n`;
  }

  // Script Extraction & Scoping (Chart.js fix)
  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  scriptRegex.lastIndex = 0;
  while ((scriptMatch = scriptRegex.exec(content)) !== null) {
    let scriptCode = scriptMatch[1];
    if (scriptCode.includes("incomeChart")) {
      const scopedId = `incomeChart-${slideId}`;
      scriptCode = scriptCode.replace(/incomeChart/g, scopedId);
      slideContent = slideContent.replace(
        /id="incomeChart"/g,
        `id="${scopedId}"`
      );
      slideContent = slideContent.replace(
        /id='incomeChart'/g,
        `id='${scopedId}'`
      );
    }
    slideContent += `\n<script>${scriptCode}</script>\n`;
  }

  // Append to HTML
  newSlidesHtml += `
<!-- SLIDE ${i} -->
<section class="slide ${slideId}" data-slide="${i}">
    ${slideContent}
</section>
`;
}

const footerPart = `
        </div> <!-- End slides-wrapper -->
    </div> <!-- End deck -->

    <!-- Navigation Controls -->
    <div id="controls">
        <div id="slide-indicator" title="Click to Jump">1 / 35</div>
        <button class="control-btn" id="prev-btn" onclick="prev()"><i class="fas fa-chevron-left"></i></button>
        <button class="control-btn" id="next-btn" onclick="next()"><i class="fas fa-chevron-right"></i></button>
    </div>

    <div id="progress-container">
        <div id="progress-bar"></div>
    </div>

    <!-- Jump Modal -->
    <div id="jump-modal" class="hidden">
        <div class="modal-content modal-large">
            <h3>Select a Slide</h3>
            <div id="jump-grid" class="jump-grid">
                <!-- Buttons generated by JS -->
            </div>
            <button id="jump-close-btn" class="close-btn">Close</button>
        </div>
    </div>

    <!-- Scripts -->
    <!-- Three.js moved to head -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://unpkg.com/split-type"></script>
    <script src="app.js"></script>
</body>
</html>`;

fs.writeFileSync(OUT_INDEX, headerPart + newSlidesHtml + footerPart);
fs.writeFileSync(OUT_STYLE, newStylesCss);
console.log("FINAL REBUILD COMPLETE");
