import re

file_path = r"c:\Users\horit\Downloads\zenkousai\web_deck\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Define the start of the path D attribute we want to target
# Finding the path that starts with M107.426 185.545
# We need to capture the whole d attribute. 
# Since it spans multiple lines, we need dotall.
pattern = re.compile(r'(<path\s+d="M107\.426 185\.545.*?)(M128\.328 219\.824.*?)(")', re.DOTALL)

match = pattern.search(content)

if match:
    print("Found path to split.")
    part1_d = match.group(1).strip()
    part2_d = match.group(2).strip()
    end_quote = match.group(3)
    
    # Analyze capture groups
    # Group 1 includes '<path d="' and the first part of data.
    # We want to close Group 1 with '"' and attributes, then start new path.
    
    original_full_match = match.group(0)
    
    # Construct new HTML
    # Path 1: The extracted 1500 text (Top part)
    # We remove the trailing stuff from part1_d if any, but regex split at M128.
    # part1_d ends right before M128.
    
    # Attributes for Path 1
    # We want to give it the ID for animation.
    # And keep fill="#1E1E1E" (which is likely set in the original tag or subsequent lines?
    # Wait, the Regex starts with `<path d=...`. 
    # The attributes like `fill` usually come AFTER `d` or BEFORE.
    # In the file, `fill` is after.
    # So `original_full_match` stops at the closing quote of `d`.
    # The `fill` attribute is outside this match? 
    # No, typically `d` is long. `fill` is on next line.
    # My regex ends at `"`.
    # The rest of the tag `<path ... />` is NOT captured entirely.
    
    # We need to be careful about replacing.
    # We should replace `original_full_match` with:
    # `part1_d"` -> End of d for path 1.
    # Then ` id="text-1500-left" fill="#1E1E1E" />` ?
    # Then `<path d="` + `part2_d"` + ...
    
    # Actually, simpler:
    # 1. Capture pure d content.
    # 2. Split string.
    # 3. Reconstruct two path elements.
    
    # Let's refine regex to just capture the d content found by start signature.
    d_pattern = re.compile(r'd="(M107\.426 185\.545.*?)(M128\.328 219\.824.*?)"', re.DOTALL)
    
    def replacer(m):
        d_top = m.group(1)
        d_bottom = m.group(2)
        
        # New top path
        # We assume the original tag has `fill="#1E1E1E"` following it or we add it.
        # But we are INSIDE the `d="..."`.
        # We can't insert a closing `/>` here easily without knowing surrounding tag structure.
        
        # Better approach: Find the WHOLE tag.
        # <path ... d="..." ... />
        return f'd="{d_top}" id="text-1500-left" />\n                <path d="{d_bottom}"'

    # This replaces `d="ALL"` with `d="TOP" id... /><path d="BOTTOM"`.
    # This works IF the original tag attributes are handled.
    # Example original: `<path d="..." fill="..." />`
    # Result: `<path d="TOP" id... /><path d="BOTTOM" fill="..." />`
    # This assigns the original `fill` ONLY to the SECOND path (Bottom).
    # The FIRST path (Top) gets `id` and closes `/>`. It needs `fill`.
    
    new_content = d_pattern.sub(
        r'd="\1" id="text-1500-left" fill="#1E1E1E" />\n                <path d="\2"', 
        content, 
        count=1
    )
    
    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f_out:
            f_out.write(new_content)
        print("Successfully split path and saved.")
    else:
        print("Replacement failed (no change).")

else:
    print("Could not find the path starting with M107.426 185.545 containing M128.328 219.824")
