
import os

file_path = r"c:\Users\horit\Downloads\zenkousai\web_deck\index.html"

new_table_content = """                <!-- テーブルヘッダー -->
                <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-800 text-white rounded-t-xl shadow-md anim-slide-up delay-100 items-center text-center">
                  <div class="col-span-3 text-left pl-4 font-bold">ランク</div>
                  <div class="col-span-2 font-bold text-sm">達成ポイント</div>
                  <div class="col-span-2 font-bold text-sm">分配率</div>
                  <div class="col-span-2 font-bold text-sm">ウィナーズ コミッション<br>月収例</div>
                  <div class="col-span-3 font-bold text-sm">ラウンドコミッションと<br>ウィナーズ コミッション<br>合計の年収例</div>
                </div>

                <!-- テーブルボディ -->
                <div class="flex flex-col gap-2">
                  <!-- G.M -->
                  <div class="grid grid-cols-12 gap-4 px-6 py-4 rank-row rank-gm rounded-lg shadow-sm items-center anim-slide-left delay-200">
                    <div class="col-span-3 flex items-center gap-3">
                      <div class="rank-badge bg-yellow-400"><i class="fas fa-medal"></i></div>
                      <div class="flex flex-col">
                        <p class="font-black text-3xl text-yellow-800 font-rounded leading-none">G.M</p>
                        <p class="text-xs font-bold text-yellow-600 leading-tight">（ゴールドメンバー）</p>
                      </div>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-bold text-gray-700 leading-tight">
                        <span class="text-3xl text-yellow-500 font-black">4R</span><br>
                        <span class="text-xs text-gray-500">(200ポイント)以上</span>
                      </p>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-black text-2xl text-white drop-shadow-md" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1); color: white;">27%</p>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-black text-2xl text-white drop-shadow-md" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1); color: white;">約4万円</p>
                    </div>
                    <div class="col-span-3 text-center bg-yellow-600/90 rounded py-2 shadow-inner">
                      <p class="font-black text-xl text-white">約100～170万円</p>
                    </div>
                  </div>

                  <!-- P.M -->
                  <div class="grid grid-cols-12 gap-4 px-6 py-4 rank-row rank-pm rounded-lg shadow-sm items-center anim-slide-left delay-300">
                    <div class="col-span-3 flex items-center gap-3">
                      <div class="rank-badge bg-gray-400"><i class="fas fa-gem"></i></div>
                      <div class="flex flex-col">
                        <p class="font-black text-3xl text-gray-700 font-rounded leading-none">P.M</p>
                        <p class="text-xs font-bold text-gray-500 leading-tight">（プラチナメンバー）</p>
                      </div>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-bold text-gray-700 leading-tight">
                        <span class="text-3xl text-gray-500 font-black">10R</span><br>
                        <span class="text-xs text-gray-500">(500ポイント)以上</span>
                      </p>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-black text-2xl text-white drop-shadow-md" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1); color: white;">23%</p>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-black text-2xl text-white drop-shadow-md" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1); color: white;">約10万円</p>
                    </div>
                    <div class="col-span-3 text-center bg-gray-600/90 rounded py-2 shadow-inner">
                      <p class="font-black text-xl text-white">約240～360万円</p>
                    </div>
                  </div>

                  <!-- E.C.M -->
                  <div class="grid grid-cols-12 gap-4 px-6 py-4 rank-row rank-ecm rounded-lg shadow-sm items-center anim-slide-left delay-400">
                    <div class="col-span-3 flex items-center gap-3">
                      <div class="rank-badge bg-green-500"><i class="fas fa-crown"></i></div>
                      <div class="flex flex-col">
                        <p class="font-black text-3xl text-green-800 font-rounded leading-none">E.C.M</p>
                        <p class="text-xs font-bold text-green-600 leading-tight">（エメラルドクラブメンバー）</p>
                      </div>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-bold text-gray-700 leading-tight">
                        <span class="text-3xl text-green-500 font-black">20R</span><br>
                        <span class="text-xs text-gray-500">(1,000ポイント)以上</span>
                      </p>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-black text-2xl text-white drop-shadow-md" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1); color: white;">20%</p>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-black text-2xl text-white drop-shadow-md" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1); color: white;">約15万円</p>
                    </div>
                    <div class="col-span-3 text-center bg-green-600/90 rounded py-2 shadow-inner">
                      <p class="font-black text-xl text-white">約420～900万円</p>
                    </div>
                  </div>

                  <!-- D.C.M -->
                  <div class="grid grid-cols-12 gap-4 px-6 py-4 rank-row rank-dcm rounded-lg shadow-sm items-center anim-slide-left delay-500">
                    <div class="col-span-3 flex items-center gap-3">
                      <div class="rank-badge bg-blue-500"><i class="fas fa-crown"></i></div>
                      <div class="flex flex-col">
                        <p class="font-black text-3xl text-blue-800 font-rounded leading-none">D.C.M</p>
                        <p class="text-xs font-bold text-blue-600 leading-tight">（ダイヤモンドクラブメンバー）</p>
                      </div>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-bold text-gray-700 leading-tight">
                        <span class="text-3xl text-blue-500 font-black">60R</span><br>
                        <span class="text-xs text-gray-500">(3,000ポイント)以上</span>
                      </p>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-black text-2xl text-white drop-shadow-md" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1); color: white;">17%</p>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-black text-2xl text-white drop-shadow-md" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1); color: white;">約40万円</p>
                    </div>
                    <div class="col-span-3 text-center bg-purple-600/90 rounded py-2 shadow-inner">
                      <p class="font-black text-xl text-white">約1,200～1,900万円</p>
                    </div>
                  </div>

                  <!-- P.D.C.M -->
                  <div class="grid grid-cols-12 gap-4 px-6 py-5 rank-row rank-pdcm rounded-lg shadow-lg items-center anim-slide-left delay-600 transform scale-[1.02] border-2 border-blue-400 relative z-10">
                    <div class="col-span-3 flex items-center gap-3">
                      <div class="rank-badge bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"><i class="fas fa-crown text-yellow-300"></i></div>
                      <div class="flex flex-col">
                        <p class="font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 font-rounded leading-none">P.D.C.M</p>
                        <p class="text-[10px] font-bold text-blue-600 leading-tight whitespace-nowrap">（プライムダイヤモンドクラブメンバー）</p>
                      </div>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-bold text-gray-700 leading-tight">
                        <span class="text-3xl text-blue-600 font-black">120R</span><br>
                        <span class="text-xs text-gray-500">(6,000ポイント)以上</span>
                      </p>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-black text-2xl text-white drop-shadow-md" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1); color: white;">13%</p>
                    </div>
                    <div class="col-span-2 text-center">
                      <p class="font-black text-2xl text-white drop-shadow-md" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1); color: white;">約60万円</p>
                    </div>
                    <div class="col-span-3 text-center bg-blue-700/90 rounded py-2 shadow-inner">
                      <p class="font-black text-xl text-white">約2,100～6,000万円</p>
                    </div>
                  </div>
                </div>

                <!-- Footer Note -->
                <div class="mt-6 text-center">
                  <p class="text-red-600 font-bold text-lg bg-red-50 inline-block px-4 py-2 rounded-full border border-red-200 shadow-sm">
                   ●ウィナーズコミッションの支払い上限は、ラウンドコミッションとウィナーズコミッションの合計額で1口につき月額500万円です。
                  </p>
                </div>"""

# Robust line-by-line replacement
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_marker = '<!-- テーブルヘッダー -->'
end_marker_1 = '<!-- Footer Note -->'
# We need to find the closing div of the footer note.
# The footer note block in old file is:
# <!-- Footer Note -->
# <div class="mt-6 text-center">
#   <p ...> ... </p>
# </div>

# So we want to replace from start_marker until the line containing "</div>" that closes the footer note.
# Or simpler: find start_marker, find end_marker...
# Actually, the user might want me to replace the Whole Table Area.
# Let's find the start_index and end_index.

start_index = -1
end_index = -1

for i, line in enumerate(lines):
    if start_marker in line:
        start_index = i
    if end_marker_1 in line:
        # Check next few lines for the closing div
        # We can assume the block ends ~5 lines after footer note starts
        # Let's look for the next "</div>" after footer note start?
        # A safer bet is to match the indentation.
        # But indentation varies.
        # Let's verify via the content we saw:
        # The footer note ends, then a closing </div> for the flex container.
        end_index = i + 5 # Approximation, danger.

# Better approach: Read the file content as string, find indices.
content = "".join(lines)
s_idx = content.find(start_marker)

if s_idx != -1:
    # Find the footer note
    f_idx = content.find(end_marker_1, s_idx)
    if f_idx != -1:
        # Find closing div of footer note
        # It's a div with class "mt-6 text-center"
        # Then a p tag
        # Then closing div
        c_idx = content.find("</div>", f_idx) # Closes the p? No p is inline-block usually or inside div
        # The prompt says: <div class="mt-6 text-center"> ... </div>
        # So we need the SECOND </div> after f_idx (one for p? no p ends with </p>) - one for div.
        # Wait, <div ...> <p ...> </p> </div>
        # So finding `</div>` after `</p>` is safe.
        
        div_close_idx = content.find("</div>", content.find("</p>", f_idx))
        if div_close_idx != -1:
            end_replacement_idx = div_close_idx + 6 # include </div>
            
            # Now replace
            final_content = content[:s_idx] + new_table_content + content[end_replacement_idx:]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(final_content)
            print("Successfully updated Slide 38 using string search.")
        else:
            print("Could not find closing div for footer.")
    else:
        print("Could not find Footer Note marker.")
else:
    print("Could not find Table Header marker.")
