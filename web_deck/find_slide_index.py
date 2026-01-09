
with open(r"c:\Users\horit\zenkousai\web_deck\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

slide_count = 0
target_line = 8335
target_index = -1

for i, line in enumerate(lines):
    if 'class="slide' in line:
        slide_count += 1
        # Check if this is our target line (approx)
        if i + 1 == target_line: # Lines are 1-based in editor
             print(f"Found target slide at line {i+1}. Index is {slide_count}")
             target_index = slide_count

print(f"Total slides found so far: {slide_count}")
