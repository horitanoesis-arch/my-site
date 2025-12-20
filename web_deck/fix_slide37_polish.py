
import os
import re

file_path = r"c:\Users\horit\Downloads\zenkousai\web_deck\index.html"

# Content with Polish:
# 1. Larger/Styled Labels ("下まで届かない", "末端までしっかり還元")
# 2. Renamed Title "全厚済モデル"
# 3. Glowing Pulse Animation (glow-pulse keyframe + applied to bottom nodes)

new_content = """<div class="flex-1 px-12 pb-8 grid grid-cols-2 gap-8 relative items-center">
                <!-- LEFT: Conventional Model (Stagnant Tournament) -->
                <div class="relative h-full flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300 overflow-hidden">
                  <div class="absolute top-4 left-6 bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-bold z-10">
                    <i class="fas fa-exclamation-circle mr-1"></i>一般的なモデル
                  </div>

                  <!-- Tree Structure -->
                  <div class="relative flex flex-col items-center w-full max-w-md mt-8 scale-90">
                    <!-- Connecting Lines (Using SVG for precision) -->
                    <svg class="absolute inset-0 w-full h-full pointer-events-none z-0" style="top: 0">
                      <!-- Top to Mid -->
                      <path d="M224 32 V 80 H 64 V 110" fill="none" stroke="#CBD5E1" stroke-width="2" />
                      <path d="M224 32 V 80 H 384 V 110" fill="none" stroke="#CBD5E1" stroke-width="2" />
                      <!-- Mid to Bot -->
                      <path d="M64 136 V 180 H 20 V 210" fill="none" stroke="#E2E8F0" stroke-width="2" />
                      <path d="M64 136 V 180 H 156 V 210" fill="none" stroke="#E2E8F0" stroke-width="2" />
                      <path d="M384 136 V 180 H 292 V 210" fill="none" stroke="#E2E8F0" stroke-width="2" />
                      <path d="M384 136 V 180 H 428 V 210" fill="none" stroke="#E2E8F0" stroke-width="2" />
                    </svg>

                    <!-- Level 1: Top (Rich & Stagnant) -->
                    <div class="relative z-10 mb-12">
                      <div class="w-16 h-16 bg-red-100 border-4 border-red-400 rounded-xl flex items-center justify-center shadow-lg relative">
                        <i class="fas fa-crown text-3xl text-red-500"></i>
                        <!-- Stacking Coins -->
                        <div class="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center animate-bounce">
                          <span class="font-bold text-xs">¥</span>
                        </div>
                        <div class="absolute -top-5 -left-2 w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center anim-float">
                          <span class="font-bold text-xs">¥</span>
                        </div>
                      </div>
                    </div>

                    <!-- Level 2: Middle (Partial) -->
                    <div class="relative z-10 flex gap-24 mb-12 w-full justify-between px-10">
                      <div class="w-12 h-12 bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center opacity-80">
                        <i class="fas fa-user text-gray-400"></i>
                      </div>
                      <div class="w-12 h-12 bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center opacity-80">
                        <i class="fas fa-user text-gray-400"></i>
                      </div>
                    </div>

                    <!-- Level 3: Bottom (Empty/Dead) -->
                    <div class="relative z-10 flex gap-8 w-full justify-between">
                      <div class="w-10 h-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center grayscale">
                        <i class="fas fa-user text-gray-300 text-xs"></i>
                      </div>
                      <div class="w-10 h-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center grayscale">
                        <i class="fas fa-user text-gray-300 text-xs"></i>
                      </div>
                      <div class="w-10 h-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center grayscale">
                        <i class="fas fa-user text-gray-300 text-xs"></i>
                      </div>
                      <div class="w-10 h-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center grayscale">
                        <i class="fas fa-user text-gray-300 text-xs"></i>
                      </div>
                    </div>
                  </div>

                  <!-- Stagnant Rain (Fades out) -->
                  <div class="absolute inset-0 pointer-events-none overflow-hidden">
                    <div class="absolute top-0 left-1/2 -translate-x-1/2 text-2xl animate-ping opacity-0" style="animation-duration: 2s">¥</div>
                    <!-- Coin falls and disappears halfway -->
                    <div class="text-yellow-500 absolute top-10 left-1/2" style="animation: drop-fade 2s infinite">
                        <div class="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center"><span class="font-bold text-xs text-white">¥</span></div>
                    </div>
                    <style>
                      @keyframes drop-fade {
                        0% { transform: translateY(0); opacity: 1; }
                        50% { transform: translateY(150px); opacity: 1; }
                        100% { transform: translateY(200px); opacity: 0; }
                      }
                    </style>
                  </div>

                  <div class="mt-8 bg-red-100 text-red-600 text-xl font-bold px-6 py-3 rounded-xl border-2 border-red-300 shadow-md transform rotate-1">
                    <i class="fas fa-times-circle mr-2"></i>下まで届かない...
                  </div>
                </div>

                <!-- RIGHT: Zenkou-Sai Model (Flowing Tournament) -->
                <div class="relative h-full flex flex-col items-center justify-center p-6 bg-blue-50/50 rounded-3xl border-2 border-blue-200 shadow-xl overflow-hidden">
                  <div class="absolute top-4 left-6 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10 shadow-md">
                    <i class="fas fa-check mr-1"></i>全厚済モデル
                  </div>
                  
                  <!-- Money Shower Animation (Full Coverage) -->
                  <style>
                    @keyframes shower-down-slow {
                      0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
                      10% { opacity: 1; }
                      90% { opacity: 1; }
                      100% { transform: translateY(600px) rotate(360deg); opacity: 0; }
                    }
                    .coin-shower {
                      position: absolute;
                      top: -50px;
                      animation: shower-down-slow linear infinite;
                    }
                    /* Glow Pulse Animation for Nodes */
                    @keyframes glow-pulse {
                        0% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-color: #facc15; background-color: #fefce8; }
                        50% { transform: scale(1.15); box-shadow: 0 0 15px rgba(250, 204, 21, 0.8); border-color: #eab308; background-color: #fffbeb; }
                        100% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-color: #facc15; background-color: #fefce8; }
                    }
                    .anim-glow-pulse {
                        animation: glow-pulse 2s infinite ease-in-out;
                    }
                  </style>
                  <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <!-- Center Stream -->
                    <div class="coin-shower" style="left: 50%; animation-duration: 4s; animation-delay: 0s">
                      <div class="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center"><span class="font-bold text-xs text-white">¥</span></div>
                    </div>
                    <div class="coin-shower" style="left: 45%; animation-duration: 4.6s; animation-delay: 1.0s">
                      <div class="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center"><span class="font-bold text-xs text-white">¥</span></div>
                    </div>
                    <div class="coin-shower" style="left: 55%; animation-duration: 3.6s; animation-delay: 2.4s">
                      <div class="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center"><span class="font-bold text-xs text-white">¥</span></div>
                    </div>
                    <!-- Left Stream -->
                    <div class="coin-shower" style="left: 20%; animation-duration: 5s; animation-delay: 0.4s">
                       <div class="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center"><span class="font-bold text-xs text-white">¥</span></div>
                    </div>
                    <div class="coin-shower" style="left: 30%; animation-duration: 4.2s; animation-delay: 1.6s">
                       <div class="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center"><span class="font-bold text-xs text-white">¥</span></div>
                    </div>
                    <!-- Right Stream -->
                    <div class="coin-shower" style="left: 70%; animation-duration: 4.8s; animation-delay: 0.8s">
                       <div class="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center"><span class="font-bold text-xs text-white">¥</span></div>
                    </div>
                    <div class="coin-shower" style="left: 80%; animation-duration: 4.0s; animation-delay: 2.0s">
                        <div class="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center"><span class="font-bold text-xs text-white">¥</span></div>
                    </div>
                    <!-- Extra Rain -->
                    <div class="coin-shower" style="left: 10%; animation-duration: 6s; animation-delay: 3.0s">
                        <div class="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center"><span class="font-bold text-xs text-white">¥</span></div>
                    </div>
                    <div class="coin-shower" style="left: 90%; animation-duration: 5.6s; animation-delay: 1.4s">
                        <div class="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow flex items-center justify-center"><span class="font-bold text-xs text-white">¥</span></div>
                    </div>
                  </div>

                  <!-- Tree Structure -->
                  <div class="relative flex flex-col items-center w-full max-w-md mt-8 scale-90 z-10">
                    <!-- Connecting Lines (Flowing) -->
                    <svg class="absolute inset-0 w-full h-full pointer-events-none z-0" style="top: 0">
                      <!-- Top to Mid -->
                      <path d="M224 32 V 80 H 64 V 110" fill="none" stroke="#60A5FA" stroke-width="3" />
                      <path d="M224 32 V 80 H 384 V 110" fill="none" stroke="#60A5FA" stroke-width="3" />
                      <!-- Mid to Bot -->
                      <path d="M64 136 V 180 H 20 V 210" fill="none" stroke="#93C5FD" stroke-width="2" stroke-dasharray="4 2" class="animate-pulse" />
                      <path d="M64 136 V 180 H 156 V 210" fill="none" stroke="#93C5FD" stroke-width="2" stroke-dasharray="4 2" class="animate-pulse" />
                      <path d="M384 136 V 180 H 292 V 210" fill="none" stroke="#93C5FD" stroke-width="2" stroke-dasharray="4 2" class="animate-pulse" />
                      <path d="M384 136 V 180 H 428 V 210" fill="none" stroke="#93C5FD" stroke-width="2" stroke-dasharray="4 2" class="animate-pulse" />
                    </svg>

                    <!-- Level 1: Top (Source) -->
                    <div class="relative z-10 mb-12">
                      <div class="w-16 h-16 bg-blue-100 border-4 border-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-hand-holding-water text-3xl text-blue-600"></i>
                      </div>
                    </div>

                    <!-- Level 2: Middle (Flowing) -->
                    <div class="relative z-10 flex gap-24 mb-12 w-full justify-between px-10">
                      <div class="w-12 h-12 bg-white border-2 border-blue-300 rounded-lg flex items-center justify-center shadow-sm">
                        <i class="fas fa-smile text-blue-400"></i>
                      </div>
                      <div class="w-12 h-12 bg-white border-2 border-blue-300 rounded-lg flex items-center justify-center shadow-sm">
                        <i class="fas fa-smile text-blue-400"></i>
                      </div>
                    </div>

                    <!-- Level 3: Bottom (Rich) -->
                    <div class="relative z-10 flex gap-8 w-full justify-between">
                      <!-- Node 1 -->
                      <div class="w-10 h-10 bg-yellow-50 border-2 border-yellow-400 rounded flex items-center justify-center shadow-md relative anim-glow-pulse" style="animation-delay: 0.2s">
                        <i class="fas fa-laugh-beam text-yellow-600 text-sm"></i>
                        <div class="absolute -top-4 -right-2 bg-yellow-500 text-white text-[9px] font-black px-1 rounded-full border border-white anim-pop delay-200">GET</div>
                      </div>
                      <!-- Node 2 -->
                      <div class="w-10 h-10 bg-yellow-50 border-2 border-yellow-400 rounded flex items-center justify-center shadow-md relative anim-glow-pulse" style="animation-delay: 0.5s">
                         <i class="fas fa-laugh-beam text-yellow-600 text-sm"></i>
                         <div class="absolute -top-4 -right-2 bg-yellow-500 text-white text-[9px] font-black px-1 rounded-full border border-white anim-pop delay-500">GET</div>
                      </div>
                      <!-- Node 3 -->
                      <div class="w-10 h-10 bg-yellow-50 border-2 border-yellow-400 rounded flex items-center justify-center shadow-md relative anim-glow-pulse" style="animation-delay: 0.8s">
                         <i class="fas fa-laugh-beam text-yellow-600 text-sm"></i>
                         <div class="absolute -top-4 -right-2 bg-yellow-500 text-white text-[9px] font-black px-1 rounded-full border border-white anim-pop delay-800">GET</div>
                      </div>
                      <!-- Node 4 -->
                      <div class="w-10 h-10 bg-yellow-50 border-2 border-yellow-400 rounded flex items-center justify-center shadow-md relative anim-glow-pulse" style="animation-delay: 1.0s">
                         <i class="fas fa-laugh-beam text-yellow-600 text-sm"></i>
                         <div class="absolute -top-4 -right-2 bg-yellow-500 text-white text-[9px] font-black px-1 rounded-full border border-white anim-pop delay-1000">GET</div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-8 bg-blue-100 text-blue-600 text-xl font-bold px-6 py-3 rounded-xl border-2 border-blue-300 shadow-md transform -rotate-1">
                    <i class="fas fa-check-circle mr-2"></i>末端までしっかり還元！
                  </div>
                </div>
              </div>"""

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Using robust regex matching again to locate the main block
# Start: container div
# End: end of right column's message div + closing divs
# The previous regex worked well, so I'll adapt it to match the *current* state of the file

pattern = re.compile(r'(<!-- コンテンツエリア \(Comparison Layout: Tournament Brackets\) -->\s*)<div[\s\S]*?<!-- RIGHT: Zenkou-Sai Model \(Flowing Tournament\) -->[\s\S]*?末端までしっかり還元！\s*</div>\s*</div>\s*</div>', re.MULTILINE)

match = pattern.search(content)

if match:
    print("Found match! Applying polish.")
    new_full_string = match.group(1) + new_content
    updated_content = content.replace(match.group(0), new_full_string)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    print("Successfully polished Slide 37.")
else:
    print("Could not find the target block. File might have changed structure.")
