const fs = require('fs');
const path = require('path');

const SOURCE_DIR = "C:/Users/horit/Downloads/zenkousai";
const OUT_INDEX = path.join(SOURCE_DIR, 'web_deck/index.html');
const OUT_STYLE = path.join(SOURCE_DIR, 'web_deck/style.css');

// Regex helpers
const BODY_CONTENT_REGEX = /<div class="slide-container"[^>]*>([\s\S]*?)<\/div>\s*<\/body>/i;
// Alternative regex if body structure differs slightly, but we target slide-container
const SLIDE_CONTAINER_REGEX = /<div class="slide-container"[^>]*>([\s\S]*?)<\/div>(?![\s\S]*<div class="slide-container")/i;
const STYLE_REGEX = /<style>([\s\S]*?)<\/style>/i;

function run() {
    let indexHtml = fs.readFileSync(OUT_INDEX, 'utf8');
    let styleCss = fs.readFileSync(OUT_STYLE, 'utf8');

    // Find insertion point for slides in index.html - we want to append after existing slides?
    // User wants ALL slides 1-35. 
    // Currently 1-3 are in. We can rebuild or append.
    // Let's rebuild the dynamic part.
    // Actually, it's safer to just APPEND 4-35.
    
    const insertionPoint = indexHtml.lastIndexOf('</div'); // risky if minified
    // Better: look for <!-- SLIDE 3 --> block and insert after
    const lastSlideMarker = '<!-- SLIDE 3 -->';
    const splitIdx = indexHtml.indexOf(lastSlideMarker);
    if (splitIdx === -1) {
        console.error("Could not find Slide 3 marker");
        return;
    }
    // Find closing of Slide 3 section
    const slide3End = indexHtml.indexOf('</section>', splitIdx) + 10;
    
    let newSlidesHtml = "";
    let newStylesCss = "\n/* AUTO-GENERATED STYLES FOR SLIDES 4-35 */\n";

    for (let i = 4; i <= 35; i++) {
        const filename = `file${i}.html`;
        const filePath = path.join(SOURCE_DIR, filename);

        if (!fs.existsSync(filePath)) {
            console.warn(`Skipping ${filename} (not found)`);
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        
        // 1. Extract HTML
        let bodyMatch = SLIDE_CONTAINER_REGEX.exec(content);
        if (!bodyMatch) {
             // Try broader body match
             bodyMatch = /<body>([\s\S]*?)<\/body>/i.exec(content);
        }
        
        if (bodyMatch) {
            let slideContent = bodyMatch[1].trim();
            // Wrap strictly if it was just body content without container (unlikely based on file1-3)
            // But we grabbed contents OF slide-container in regex 1.
            // If regex 2 (body), we might need to be careful.
            
            // Fix Image Paths
            slideContent = slideContent.replace(/src="images\\/g, 'src="assets/');
            slideContent = slideContent.replace(/src="images\//g, 'src="assets/');
            // Fix backslashes generally in src
            slideContent = slideContent.replace(/src="([^"]+)"/g, (match, p1) => {
                return `src="${p1.replace(/\\/g, '/')}"`;
            });
            
            // Add Fragment Attributes to <li> and specific classes if needed
            // Heuristic: Add data-fragment to all direct children of grid columns or lists
            // For now, let's just make it raw.
            
            const slideId = `s${String(i).padStart(2, '0')}`;
            
            newSlidesHtml += `
            <!-- SLIDE ${i} -->
            <section class="slide ${slideId}" data-slide="${i}">
                <div class="slide-container">
                    ${slideContent}
                </div>
            </section>
            `;
        } else {
            console.warn(`Could not extract body from ${filename}`);
        }

        // 2. Extract CSS
        const styleMatch = STYLE_REGEX.exec(content);
        if (styleMatch) {
            let css = styleMatch[1];
            const slideId = `s${String(i).padStart(2, '0')}`;
            
            // Scope CSS
            // Replace "selector {" with ".sNN selector {"
            // But be careful about media queries or keyframes.
            
            // Simple approach: Split by '}', find last '{', insert prefix.
            // Better: Regex replace.
            // Exclude @keyframes, @media
            
            // 1. Rename animations
            // Find @keyframes name
            const keyframes = [];
            css = css.replace(/@keyframes\s+([a-zA-Z0-9_-]+)/g, (match, name) => {
                const newName = `${slideId}-${name}`;
                keyframes.push({old: name, new: newName});
                return `@keyframes ${newName}`;
            });
            
            // Update animation properties
            keyframes.forEach(k => {
                const re = new RegExp(`animation:\\s*${k.old}`, 'g');
                css = css.replace(re, `animation: ${k.new}`);
                const reName = new RegExp(`animation-name:\\s*${k.old}`, 'g');
                css = css.replace(reName, `animation-name: ${k.new}`);
                 // Simplified: just replace name if it appears in animation prop? 
                 // Too risky to replace strict words globally.
                 // But in the context of this project, names like 'fadeIn' are common.
                 // The regex above for 'animation:' catches most. 
                 // We also need to catch `animation: 1s fadeIn;` order variance.
                 // Let's brute force replace the animation names in the whole block EXCLUDING keyframe definitions (already renamed).
                 const reGlobal = new RegExp(`(?<!@keyframes\\s+)${k.old}\\b`, 'g');
                // This verify lookbehind support? Node 14+ supports it.
            });
            
            // 2. Scope Selectors
            // We want to prefix standard rules.
            // Strategy: 
            // - Remove comments
            // - Split by }
            // - For each block, text before { is selector.
            // - Prefix selector.
            
            const lines = css.split('\n');
            let scopedCss = "";
            let insideMedia = false; // Simple tracker
            
            // Very naive parser
            let buffer = "";
            for (let j = 0; j < css.length; j++) {
                const char = css[j];
                buffer += char;
                if (char === '{') {
                   // Check if @keyframes or @media
                   if (buffer.trim().startsWith('@keyframes')) {
                       // Pass through
                   } else if (buffer.trim().startsWith('@media')) {
                       // Pass through? Media queries inside scoping is hard.
                       // Just prefix normally inside?
                   } else {
                       // It's a selector block.
                       // Replace the selector part.
                       // ex: "h1 {" -> ".s04 h1 {"
                       const parts = buffer.split('{');
                       const selector = parts[0].trim();
                       // Check if it's NOT an at-rule
                       if (!selector.startsWith('@')) {
                           // Handle commas
                           const scopedSelector = selector.split(',').map(s => `.${slideId} ${s.trim()}`).join(', ');
                           buffer = scopedSelector + ' {';
                       }
                   }
                }
                if (char === '}') {
                    scopedCss += buffer;
                    buffer = "";
                }
            }
            scopedCss += buffer; // leftovers
            
            // Just append raw for now, manual fix might be better if this fails.
            // Let's try a regex replace for selectors instead.
            // Replace "^\s*([.#a-z][^{]+)\{" with ".sNN $1 {" MULTILINE
            
            css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match, selector, suffix) => {
                selector = selector.trim();
                if (selector.startsWith('@') || selector.startsWith('from') || selector.startsWith('to') || selector.match(/^\d+%$/)) {
                    return match;
                }
                return `.${slideId} ${selector}${suffix}`;
            });

            newStylesCss += `\n/* --- Slide ${i} --- */\n${css}`;
        }
    }

    // Write Back
    const finalHtml = indexHtml.slice(0, slide3End) + newSlidesHtml + indexHtml.slice(slide3End);
    fs.writeFileSync(OUT_INDEX, finalHtml);
    
    fs.appendFileSync(OUT_STYLE, newStylesCss);
}

run();
