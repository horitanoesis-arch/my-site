const fs = require('fs');
const path = require('path');

const SOURCE_DIR = "C:/Users/horit/Downloads/zenkousai";
const OUT_INDEX = path.join(SOURCE_DIR, 'web_deck/index.html');
const OUT_STYLE = path.join(SOURCE_DIR, 'web_deck/style.css'); // We will append to this, or rebuild? 
// Better to rebuild style.css dynamic part too to avoid duplicates if run multiple times.

// READ BASE INDEX TO GET TEMPLATE (Slides 1-3)
// We assume index.html currently has 1-3 correctly. 
// We will strip anything after <!-- SLIDE 4 -->
let indexHtml = fs.readFileSync(OUT_INDEX, 'utf8');
const marker = '<!-- SLIDE 4 -->';
const markerIndex = indexHtml.indexOf(marker);

if (markerIndex === -1) {
    console.log("Marker SLIDE 4 not found, maybe first run? Proceeding to append.");
} else {
    // Reset to before slide 4
    indexHtml = indexHtml.substring(0, markerIndex); 
}

// Reset Style CSS to base (approx line 232 or just find the marker)
let styleCss = fs.readFileSync(OUT_STYLE, 'utf8');
const styleMarker = '/* AUTO-GENERATED STYLES FOR SLIDES 4-35 */';
const styleMarkerIndex = styleCss.indexOf(styleMarker);
if (styleMarkerIndex !== -1) {
    styleCss = styleCss.substring(0, styleMarkerIndex);
}
styleCss += `\n${styleMarker}\n`;


let newSlidesHtml = "";
let newStylesCss = "";

for (let i = 4; i <= 35; i++) {
    const filename = `file${i}.html`;
    const filePath = path.join(SOURCE_DIR, filename);

    if (!fs.existsSync(filePath)) {
        console.warn(`[WARN] ${filename} not found.`);
        continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // --- 1. EXTRACT HTML CONTENT ---
    // Strategy: Find first <div class="slide-container"> and last </div> inside <body>
    
    // Simple heuristic: 
    // The slide container usually starts at: <div class="slide-container" (maybe with extra attributes)
    // And ends before </body>
    
    const startTagStr = '<div class="slide-container"';
    const startIdx = content.indexOf(startTagStr);
    
    let slideContent = "";
    
    if (startIdx !== -1) {
        // Find closing body to limit search
        let endIdx = content.indexOf('</body>');
        if (endIdx === -1) endIdx = content.length; // Fallback
        
        // Extract everything from startTag to endIdx
        // Then we need to find the LAST </div> in that block to match the first div? 
        // Or just take the whole chunk and assume it closes nicely? 
        // Most files seem to have <div class="slide-container"> ... </div> </body>
        // So taking from StartIdx to LastIndexOf('</div>', endIdx) should work.
        
        const lastDivIdx = content.lastIndexOf('</div>', endIdx);
        
         if (lastDivIdx > startIdx) {
             // We include the closing div tag (length of </div> is 6)
             slideContent = content.substring(startIdx, lastDivIdx + 6);
         }
    }
    
    // Fallback if slide-container not found or weird structure
    if (slideContent.length < 50) { // arbitrary small size check
        console.warn(`[WARN] Could not robustly extract slide-container from ${filename}. Trying body content.`);
        const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(content);
        if (bodyMatch) {
            slideContent = `<div class="slide-container fallback-extraction">${bodyMatch[1]}</div>`;
        } else {
             console.error(`[ERROR] FAILED to extract content for ${filename}`);
             slideContent = `<div class="slide-container error-slide"><h1>Error loading ${filename}</h1></div>`;
        }
    }

    // FIX IMAGE PATHS
    slideContent = slideContent.replace(/src="images\\/g, 'src="assets/');
    slideContent = slideContent.replace(/src="images\//g, 'src="assets/');
    // General Fix for any local path not starting with assets or http
    slideContent = slideContent.replace(/src="([^"h][^"t][^"t][^"]*)"/g, (match, p1) => {
         // p1 is the url. If it doesn't start with assets, prepend assets/ if it looks like a filename
         if (!p1.startsWith('assets/') && !p1.startsWith('http')) {
             // Remove leading slash or backslash
             let clean = p1.replace(/^[\\\/]+/, '');
             return `src="assets/${clean}"`;
         }
         return match;
    });

    const slideId = `s${String(i).padStart(2, '0')}`;
    newSlidesHtml += `\n<!-- SLIDE ${i} -->\n<section class="slide ${slideId}" data-slide="${i}">\n${slideContent}\n</section>\n`;


    // --- 2. EXTRACT CSS ---
    const styleMatch = /<style>([\s\S]*?)<\/style>/i.exec(content);
    if (styleMatch) {
        let css = styleMatch[1];
        
        // SCOPE CSS
        // 1. Rename Keyframes
        const keyframeMap = new Map();
        css = css.replace(/@keyframes\s+([a-zA-Z0-9_-]+)/g, (match, name) => {
            const newName = `${slideId}-${name}`;
            keyframeMap.set(name, newName);
            return `@keyframes ${newName}`;
        });
        
        // 2. Update Keyframe References in 'animation' properties
        // We iterate our map and replace usage
        keyframeMap.forEach((newName, oldName) => {
             // Regex to match full word oldName not preceded by @keyframes
             const re = new RegExp(`(?<!@keyframes\\s+)${oldName}\\b`, 'g');
             css = css.replace(re, newName);
        });

        // 3. Prefix Selectors with .sNN
        // Regex to find selectors. 
        // We split by '}' to get blocks, then find '{'
        // This is "good enough" for simple CSS.
        
        let scopedBlock = "";
        let chunks = css.split('}');
        
        for (let k = 0; k < chunks.length; k++) {
            let chunk = chunks[k];
            if (!chunk.trim()) continue;
            
            // Check if this chunk has a {
            if (chunk.indexOf('{') !== -1) {
                // It has a selector part
                let parts = chunk.split('{');
                let selectorPart = parts[0];
                let bodyPart = parts.slice(1).join('{'); // Rest is body (nested braces unlikely in this simple CSS)
                
                // Process selectorPart
                // Skip if @media or @keyframes (already handled by keyframes regex mostly, but block structure is tricky)
                // If the chunk belongs to an @media block, this split logic breaks.
                // Given the file content seen, simple media queries are rare or simple.
                // Let's use a simpler heuristic: Just replace every "start of line" selector?
                // No, sticking to regex replacement of selectors might be safer than splitting.
            }
        }
        
        // Alternative Scoping: Regex Replace
        // Replace "selector {" with ".sNN selector {"
        // Exclude @ rules
        css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match, selector, suffix) => {
            let trimmed = selector.trim();
            // Don't prefix inside keyframes (0%, from, to) or @rules
            if (trimmed.startsWith('@') || trimmed.match(/^[\d.]+%$/) || trimmed === 'from' || trimmed === 'to') {
                return match;
            }
            return `.${slideId} ${trimmed}${suffix}`;
        });
        
        newStylesCss += `\n/* --- Slide ${i} --- */\n${css}\n`;
    }
}

// Final Write
const finalHtml = indexHtml + newSlidesHtml + "\n<!-- END SLIDES -->\n</div>\n" + (fs.readFileSync(OUT_INDEX, 'utf8').split('</body>')[1] || "</body></html>");
// Wait, appending closing div/body might duplicate if I just took substring(0, marker).
// indexHtml substring likely cuts off the closing tags of existing file.
// Check structure of index.html.
// It has <div id="wrapper"> ... slides(1-3) ... [CUT] ... </div> </body> </html>
// So I should ensure I close the wrapper and body.

// Let's actually Read index.html lines to be precise.
// <section class="slide s03" ... </section> is where we probably cut.
// We need to append new slides, then CLOSE the main container if it was open.
// Looking at file3 in previous view: it was just <section>.
// The main container in index.html is likely <div id="main"> or similar.
// I will just append the closing tags blindly: </div> (for main) </body> </html>
// But wait, the original file had scripts at the end. I should preserve them.

// Better Strategy:
// Read indexHtml. Split by '<!-- SLIDE 4 -->'.
// If not found, split by '</body>'.
// Insert newSlidesHtml before '</body>' (and before scripts).

let baseHtml = fs.readFileSync(OUT_INDEX, 'utf8');
let injectionIndex = baseHtml.indexOf('<!-- SLIDE 4 -->');
let suffix = "";

if (injectionIndex !== -1) {
    // We have a marker, likely from previous run.
    // We keep everything BEFORE it.
    // And we need to find where the *end* of the slides block was to preserve footer scripts?
    // Actually, if we just overwrite everything after Slide 4 marker, we lose the scripts at bottom of body.
    // We need to keep the bottom part of index.html (scripts).
    
    // Assumption: The previous run added slides AND maybe pushed footer down.
    // Or maybe I never had a footer script except app.js?
    // Let's peek at the end of index.html in the next step or just "Restore" the footer.
    // I know index.html has:
    /*
        <script src="app.js"></script>
        </body>
        </html>
    */
    
    // So I will just reconstruct the footer.
    baseHtml = baseHtml.substring(0, injectionIndex);
    suffix = `
    </div>
    <div id="controls">...</div> (Wait verify controls overlap)
    
    <!-- Controls (already in base?) -->
    <!-- Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://unpkg.com/split-type"></script>
    <script src="app.js"></script>
</body>
</html>`;

   // Actually, viewing index.html led me to think controls are fixed at bottom?
   // Let's just use the "insert before closing main div" approach.
   // I'll grab the original index.html (pre-build) or just trust that everything after Slide 3 is expendable/re-generatable.
   
   // Let's try to be safe: Find </body>. Insert before it.
   // If <!-- SLIDE 4 --> exists, remove everything between it and </body> first.
} else {
    // First run logic
    injectionIndex = baseHtml.indexOf('</body>');
    // But we need to be inside the container.
    // Let's assume the container ends right before body?
    // No, index.html structure:
    /*
      <div id="deck">
         <section s01>...</section>
         <section s02>...</section>
         <section s03>...</section>
         <!-- INSERT HERE -->
      </div>
      <controls...>
      <scripts...>
    */
    // I need to find the closing div of "deck" or "main".
    // I'll look for `<!-- SLIDE 3 -->` ... `</section>`
    const s3Marker = '<!-- SLIDE 3 -->';
    const s3Idx = baseHtml.indexOf(s3Marker);
    const s3End = baseHtml.indexOf('</section>', s3Idx) + 10;
    
    baseHtml = baseHtml.substring(0, s3End);
    
    // Reconstruct footer
    suffix = `
    </div> <!-- End Main slide container -->
    
    <!-- Controls are fixed position, probably outside or inside? Check styled. -->
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://unpkg.com/split-type"></script>
    <script src="app.js"></script>
</body>
</html>`;
}

// Since I am unsure of the exact footer structure I might break it. 
// Safest: Use replace to swap placeholders if used, OR regex replace the "Slide 4 to end" block.

// Let's go with:
// 1. Read file. 
// 2. Regex replace /<!-- SLIDE 4 -->[\s\S]*?(?=<\/div>\s*<script)/ with new content?
// Too risky.

// SIMPLEST VALID APPROACH:
// Read existing index.html.
// Find `<!-- SLIDE 4 -->`. If exists, delete everything from there to `<!-- END SLIDES -->`.
// If `<!-- END SLIDES -->` doesn't exist, assume we are appending for first time? 
// But per user, "empty pages", so I likely generated bad code.
// I will overwrite `index.html` with a CLEAN structure that I KNOW is correct.
// Consolidate:
// Header (Head, Body start, Container start, Slide 1-3)
// + Slide 4-35 (Generated)
// + Footer (Container end, Scripts, Body end)

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
    
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <canvas id="bg-canvas"></canvas>
    
    <div id="deck" class="deck-container">
        <div id="slides-wrapper">
`;

// Retrieve Slide 1-3 Content MANUALLY or from file1-3 to be safe?
// I'll read them from file1-3.html to ensure they are consistent with 4-35 logic
// So loop 1 to 35.

newSlidesHtml = ""; // Reset
newStylesCss = fs.readFileSync(OUT_INDEX /* wait, style is separate */, 'utf8'); 
// Actually I need base style.css. I'll read style.css and keep top part.
// But wait, style.css has scoped s01-s03 already manually?
// Yes. I should probably just regenerate EVERYTHING 1-35.
// That ensures consistency.
// So I will read `style.css` but ONLY keep the generic/global styles (top ~160 lines).
// I will look for `/* --- Slide 01 --- */` and cut there.

let baseStyle = fs.readFileSync(OUT_STYLE, 'utf8');
const cutPoint = baseStyle.indexOf('/* --- Slide 01 --- */');
if (cutPoint !== -1) {
    baseStyle = baseStyle.substring(0, cutPoint);
} else {
    // maybe s01?
     const cutPoint2 = baseStyle.indexOf('.s01');
     if (cutPoint2 !== -1) baseStyle = baseStyle.substring(0, cutPoint2);
}

newStylesCss = baseStyle;

for (let i = 1; i <= 35; i++) {
    const filename = `file${i}.html`;
    const filePath = path.join(SOURCE_DIR, filename);
    if (!fs.existsSync(filePath)) continue;
    
    // ... Extraction Logic (Same as above) ...
    const content = fs.readFileSync(filePath, 'utf8');
    
    // HTML
    let slideContent = "";
    const startTagStr = '<div class="slide-container"';
    const startIdx = content.indexOf(startTagStr);
    if (startIdx !== -1) {
        let endIdx = content.indexOf('</body>');
        if (endIdx === -1) endIdx = content.length;
        const lastDivIdx = content.lastIndexOf('</div>', endIdx);
        if (lastDivIdx > startIdx) {
            slideContent = content.substring(startIdx, lastDivIdx + 6);
        }
    }
    // Fallback
    if (slideContent.length < 50) {
        const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(content);
        if (bodyMatch) slideContent = `<div class="slide-container fallback">${bodyMatch[1]}</div>`;
    }
    
    // Path Fixes
    slideContent = slideContent.replace(/src="images\\/g, 'src="assets/');
    slideContent = slideContent.replace(/src="images\//g, 'src="assets/');
    slideContent = slideContent.replace(/src="([^"h][^"t][^"t][^"]*)"/g, (match, p1) => {
         if (!p1.startsWith('assets/') && !p1.startsWith('http')) {
             let clean = p1.replace(/^[\\\/]+/, '');
             return `src="assets/${clean}"`;
         }
         return match;
    });

    const slideId = `s${String(i).padStart(2, '0')}`;
    newSlidesHtml += `\n<!-- SLIDE ${i} -->\n<section class="slide ${slideId}" data-slide="${i}">\n${slideContent}\n</section>\n`;
    
    // CSS
    const styleMatch = /<style>([\s\S]*?)<\/style>/i.exec(content);
    if (styleMatch) {
        let css = styleMatch[1];
        // 1. Rename Keyframes
        const keyframeMap = new Map();
        css = css.replace(/@keyframes\s+([a-zA-Z0-9_-]+)/g, (match, name) => {
            // Check if already prefixed (shouldn't happen on fresh read, but good safety)
            if (name.startsWith(`${slideId}-`)) {
                return match; 
            }
            const newName = `${slideId}-${name}`;
            keyframeMap.set(name, newName);
            return `@keyframes ${newName}`;
        });
        
        // 2. Update usages
        // Sort keys by length desc to avoid partial replacements of substrings
        const sortedKeys = Array.from(keyframeMap.keys()).sort((a, b) => b.length - a.length);
        
        sortedKeys.forEach(oldName => {
             const newName = keyframeMap.get(oldName);
             // Use word boundary to avoid replacing partial matches
             const re = new RegExp(`(?<!@keyframes\\s+|[a-zA-Z0-9_-])${oldName}(?![a-zA-Z0-9_-])`, 'g');
             css = css.replace(re, newName);
        });
        // 3. Scope Selectors
        css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match, selector, suffix) => {
            let trimmed = selector.trim();
            // SKIP @rules, keyframe offsets
            if (trimmed.startsWith('@') || trimmed.match(/^[\d.]+%$/) || trimmed === 'from' || trimmed === 'to') {
                return match;
            }
            
            // SPECIAL HANDLING: 'body' tag -> map to the slide container
            if (trimmed === 'body') {
                 // The slide's main container is usually what 'body' styles were meant for (bg color, font)
                 // We target the slide section AND the container?
                 // Usually styles are: body { background: ...; font: ... }
                 // So we want: .sNN.active { ... } or .sNN.active .slide-container { ... }
                 // Let's map to .sNN .slide-container to be safe, as it mimics the "body" of the slide.
                 return `.${slideId}.active .slide-container${suffix}`;
            }
            
            // GENERAL HANDLING: Prefix with slide ID
            // We use .active to ensure CSS animations trigger only when looking at the slide.
            return `.${slideId}.active ${trimmed}${suffix}`;
        });
        newStylesCss += `\n/* --- Slide ${i} --- */\n${css}\n`;
    }

    // ---------------------------------------------------------
    // 4. Extract & Scope Scripts (Chart.js fix)
    // ---------------------------------------------------------
    const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    // Reset regex lastIndex for each content
    scriptRegex.lastIndex = 0; 
    while ((scriptMatch = scriptRegex.exec(content)) !== null) {
        let scriptCode = scriptMatch[1];
        // Scope specific IDs we know cause conflicts
        if (scriptCode.includes('incomeChart')) {
            const scopedId = `incomeChart-${slideId}`;
            scriptCode = scriptCode.replace(/incomeChart/g, scopedId);
            slideContent = slideContent.replace(/id="incomeChart"/g, `id="${scopedId}"`);
            slideContent = slideContent.replace(/id='incomeChart'/g, `id='${scopedId}'`);
        }
        slideContent += `\n<script>${scriptCode}</script>\n`;
    }

    // ---------------------------------------------------------
    // 5. Append to Index HTML
    // ---------------------------------------------------------
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://unpkg.com/split-type"></script>
    <script src="app.js"></script>
</body>
</html>`;

fs.writeFileSync(OUT_INDEX, headerPart + newSlidesHtml + footerPart);
fs.writeFileSync(OUT_STYLE, newStylesCss);
console.log("REBUILD COMPLETE");
