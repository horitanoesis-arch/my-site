
with open(r"c:\Users\horit\zenkousai\web_deck\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

slide_count = 0
target_line = 8335
target_index = -1

for i, line in enumerate(lines):
    if 'class="slide' in line:
        slide_count += 1
        if i + 1 == target_line:
             target_index = slide_count

with open("slide_index.txt", "w") as f:
    f.write(str(target_index))
