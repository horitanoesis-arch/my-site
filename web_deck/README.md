# Web Slide Deck

This project converts individual HTML slide files into a single, interactive web presentation.

## Directory Structure

- `index.html`: The main entry point containing all slide content.
- `app.js`: Logic for navigation, animations, and Three.js background.
- `style.css`: Stylesheet containing global styles and scoped slide styles.
- `assets/`: Directory for images and media.

## Integration Process for New Slides

To add `file4.html`, `file5.html`, etc.:

1. **Open `fileN.html`** and copy the content inside the `<div class="slide-container">...</div>`.
2. **Paste into `index.html`**:

    ```html
    <section class="slide s04" data-slide="4">
        <div class="slide-container">
            <!-- PASTE CONTENT HERE -->
        </div>
    </section>
    ```

    *Ensure you update the class `sNN` and `data-slide="N"`.*

3. **Extract CSS**:
    - Copy the content of `<style>...</style>` from `fileN.html`.
    - Paste it into `style.css` under a new comment section `/* --- Slide NN --- */`.
    - **Scope the CSS**: Add `.sNN` before every selector.
        - Example: `.anim-title` -> `.sNN .anim-title`
    - **Rename Keyframes**: If the CSS defines keyframes (e.g., `@keyframes fadeIn`), rename them to strict conflicts (e.g., `@keyframes sNN-fadeIn`) and update the animation properties to use the new name.

4. **Fragments (Animations)**:
    - To animate elements sequentially within a slide, add the `data-fragment` attribute to the HTML element.
    - Example: `<li data-fragment>...</li>`
    - The system will automatically recognize these and reveal them one by one.

5. **Images**:
    - Ensure image `src` attributes point to `assets/...` or valid URLs.

## Features

- **PowerPoint-like Navigation**: Click, Arrow Keys, Spacebar.
- **Animations**: Three.js background, GSAP transitions.
- **Responsive**: Scales to fit screen while maintaining aspect ratio.
