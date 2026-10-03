<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePhotoStudioStore, type PhotobookPage } from '../../stores/usePhotoStudioStore'
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  BookOpen,
  Volume2,
  VolumeX,
  Trash2,
  Lightbulb
} from 'lucide-vue-next'

const store = usePhotoStudioStore()

// Spread Index: 
// 0: Cover (Page 1)
// 1: Spread 1 (Page 2 & 3)
// 2: Spread 2 (Page 4 & 5)
// 3: Spread 3 (Page 6 & 7)
// 4: Back Cover (Page 8)
const currentSpread = ref<number>(0)
const isFlipping = ref<boolean>(false)
const flipDirection = ref<'next' | 'prev' | null>(null)
const isAutoPlay = ref<boolean>(false)
const soundEnabled = ref<boolean>(true)
let autoPlayTimer: any = null

const totalSpreads = computed(() => {
  // 1 (cover) + Math.ceil((pages.length - 2) / 2) + 1 (back)
  return Math.ceil(store.pages.length / 2) + 1
})

// Current Left & Right Pages
const leftPage = computed<PhotobookPage | null>(() => {
  if (currentSpread.value === 0) return null // Cover only on right
  const leftIndex = (currentSpread.value - 1) * 2 + 1
  return store.pages[leftIndex] ?? null
})

const rightPage = computed<PhotobookPage | null>(() => {
  if (currentSpread.value === 0) {
    return store.pages[0] ?? null // Cover page
  }
  const rightIndex = (currentSpread.value - 1) * 2 + 2
  return store.pages[rightIndex] ?? null
})

// Realistic Paper Page Flip Sound using Web Audio API
function playPageTurnSound() {
  if (!soundEnabled.value) return
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    const filter = audioCtx.createBiquadFilter()

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, audioCtx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.25)

    // White noise buffer for crisp paper rustle
    const bufferSize = audioCtx.sampleRate * 0.2
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = audioCtx.createBufferSource()
    noise.buffer = buffer

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(audioCtx.destination)

    noise.start()
    noise.stop(audioCtx.currentTime + 0.25)
  } catch (e) {
    // AudioContext blocked or unsupported
  }
}

function nextSpread() {
  if (isFlipping.value || currentSpread.value >= totalSpreads.value - 1) return
  isFlipping.value = true
  flipDirection.value = 'next'
  playPageTurnSound()

  setTimeout(() => {
    currentSpread.value++
    isFlipping.value = false
    flipDirection.value = null
  }, 600)
}

function prevSpread() {
  if (isFlipping.value || currentSpread.value <= 0) return
  isFlipping.value = true
  flipDirection.value = 'prev'
  playPageTurnSound()

  setTimeout(() => {
    currentSpread.value--
    isFlipping.value = false
    flipDirection.value = null
  }, 600)
}

function toggleAutoPlay() {
  isAutoPlay.value = !isAutoPlay.value
  if (isAutoPlay.value) {
    autoPlayTimer = setInterval(() => {
      if (currentSpread.value < totalSpreads.value - 1) {
        nextSpread()
      } else {
        currentSpread.value = 0
      }
    }, 3200)
  } else {
    clearInterval(autoPlayTimer)
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    nextSpread()
  } else if (e.key === 'ArrowLeft') {
    prevSpread()
  } else if (e.key === 'Escape') {
    store.toggle3DPreview()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (autoPlayTimer) clearInterval(autoPlayTimer)
})

const emit = defineEmits<{
  (e: 'export-pdf'): void
}>()
</script>

<template>
  <div class="flipbook-overlay-root">
    <!-- Top Floating Controller Bar -->
    <header class="flipbook-header">
      <div class="header-left">
        <div class="book-badge">
          <BookOpen class="book-icon" />
        </div>
        <div>
          <h2 class="book-title">Album Sách Ảnh 3D (3D Interactive Photobook)</h2>
          <p class="book-subtitle">Khổ A4 • Chuẩn in ấn chất lượng cao 300 DPI</p>
        </div>
      </div>

      <div class="header-center">
        <button 
          class="control-btn" 
          :disabled="currentSpread === 0 || isFlipping"
          @click="prevSpread"
          title="Lật về trước (Phím ←)"
        >
          <ChevronLeft class="ctrl-icon" />
          <span>Trang trước</span>
        </button>

        <div class="spread-indicator">
          <span v-if="currentSpread === 0">Bìa Trước (Cover)</span>
          <span v-else-if="currentSpread >= totalSpreads - 1">Bìa Sau (Back Cover)</span>
          <span v-else>Trang {{ (currentSpread - 1) * 2 + 2 }} — {{ (currentSpread - 1) * 2 + 3 }}</span>
        </div>

        <button 
          class="control-btn" 
          :disabled="currentSpread >= totalSpreads - 1 || isFlipping"
          @click="nextSpread"
          title="Lật sang trang (Phím →)"
        >
          <span>Trang kế</span>
          <ChevronRight class="ctrl-icon" />
        </button>
      </div>

      <div class="header-right">
        <!-- Sound toggle -->
        <button 
          class="icon-btn" 
          :class="{ active: soundEnabled }"
          @click="soundEnabled = !soundEnabled"
          title="Bật / Tắt âm thanh lật trang"
        >
          <Volume2 v-if="soundEnabled" class="ctrl-icon" />
          <VolumeX v-else class="ctrl-icon" />
        </button>

        <!-- Auto-play toggle -->
        <button 
          class="icon-btn" 
          :class="{ active: isAutoPlay }"
          @click="toggleAutoPlay"
          title="Tự động lật sách"
        >
          <Pause v-if="isAutoPlay" class="ctrl-icon" />
          <Play v-else class="ctrl-icon" />
        </button>

        <!-- Export PDF -->
        <button class="export-pdf-btn" @click="emit('export-pdf')" title="Xuất toàn bộ 8 trang ra file PDF">
          <Download class="ctrl-icon" />
          <span>Xuất PDF</span>
        </button>

        <!-- Close / Exit 3D View -->
        <button class="close-view-btn" @click="store.toggle3DPreview" title="Quay lại chỉnh sửa (ESC)">
          <X class="ctrl-icon" />
          <span>Đóng 3D</span>
        </button>
      </div>
    </header>

    <!-- 3D Stage Viewport -->
    <main class="flipbook-stage">
      <div class="book-3d-container" :class="{ 'is-cover-view': currentSpread === 0 }">
        <!-- Spine Shadow & Lighting -->
        <div class="book-spine-shadow"></div>

        <!-- LEFT PAGE -->
        <div 
          v-if="currentSpread > 0 && leftPage"
          class="book-page page-left"
          :style="{ background: leftPage.background }"
          @click="prevSpread"
        >
          <!-- Spine shadow gradient on inner edge -->
          <div class="spine-inner-gradient left-gradient"></div>

          <!-- Page Header -->
          <div class="page-top-meta">
            <span class="meta-tag">{{ leftPage.headerTitle }}</span>
            <span class="meta-num">Trang {{ leftPage.pageNumber }}</span>
          </div>

          <!-- Page Slots & Photos -->
          <div class="page-slots-layer">
            <div
              v-for="slot in leftPage.slots"
              :key="slot.id"
              class="spread-slot"
              :style="{
                left: `${slot.x * 0.5}px`,
                top: `${slot.y * 0.5}px`,
                width: `${slot.width * 0.5}px`,
                height: `${slot.height * 0.5}px`,
                borderRadius: `${(slot.borderRadius || 12) * 0.5}px`
              }"
            >
              <img 
                v-if="leftPage.assignments?.[slot.id]" 
                :src="leftPage.assignments[slot.id].imageUrl" 
                class="spread-photo-img" 
              />
              <div v-else class="spread-empty-slot">
                <span>{{ slot.label || slot.name }}</span>
              </div>
            </div>
          </div>

          <!-- Page Texts -->
          <div class="page-texts-layer">
            <div
              v-for="txt in leftPage.texts"
              :key="txt.id"
              class="spread-text-item"
              :style="{
                left: `${txt.x * 0.5}px`,
                top: `${txt.y * 0.5}px`,
                fontSize: `${Math.max(9, txt.fontSize * 0.55)}px`,
                color: txt.color,
                fontWeight: txt.fontWeight
              }"
            >
              {{ txt.text }}
            </div>
          </div>

          <!-- Page Footer -->
          <div class="page-bottom-meta">
            <span>PhotoFlow Photobook</span>
            <span>• {{ leftPage.pageNumber }} •</span>
          </div>
        </div>

        <!-- Blank left placeholder when on Cover -->
        <div v-else class="book-cover-left-shadow"></div>

        <!-- RIGHT PAGE (OR COVER) -->
        <div 
          v-if="rightPage"
          class="book-page page-right"
          :class="{
            'is-cover': rightPage.type === 'cover',
            'is-flipping-forward': isFlipping && flipDirection === 'next',
            'is-flipping-backward': isFlipping && flipDirection === 'prev'
          }"
          :style="{ background: rightPage.background }"
          @click="nextSpread"
        >
          <!-- Spine shadow gradient on inner edge -->
          <div class="spine-inner-gradient right-gradient"></div>

          <!-- Page Header -->
          <div class="page-top-meta">
            <span class="meta-tag">{{ rightPage.headerTitle }}</span>
            <span class="meta-num">{{ rightPage.type === 'cover' ? 'BÌA TRƯỚC' : `Trang ${rightPage.pageNumber}` }}</span>
          </div>

          <!-- Page Slots & Photos -->
          <div class="page-slots-layer">
            <div
              v-for="slot in rightPage.slots"
              :key="slot.id"
              class="spread-slot"
              :style="{
                left: `${slot.x * 0.5}px`,
                top: `${slot.y * 0.5}px`,
                width: `${slot.width * 0.5}px`,
                height: `${slot.height * 0.5}px`,
                borderRadius: `${(slot.borderRadius || 12) * 0.5}px`
              }"
            >
              <img 
                v-if="rightPage.assignments?.[slot.id]" 
                :src="rightPage.assignments[slot.id].imageUrl" 
                class="spread-photo-img" 
              />
              <div v-else class="spread-empty-slot">
                <span>{{ slot.label || slot.name }}</span>
              </div>
            </div>
          </div>

          <!-- Page Texts -->
          <div class="page-texts-layer">
            <div
              v-for="txt in rightPage.texts"
              :key="txt.id"
              class="spread-text-item"
              :style="{
                left: `${txt.x * 0.5}px`,
                top: `${txt.y * 0.5}px`,
                fontSize: `${Math.max(9, txt.fontSize * 0.55)}px`,
                color: txt.color,
                fontWeight: txt.fontWeight
              }"
            >
              {{ txt.text }}
            </div>
          </div>

          <!-- Page Footer -->
          <div class="page-bottom-meta">
            <span>PhotoFlow Studio 2026</span>
            <span>• {{ rightPage.type === 'cover' ? 'A4' : rightPage.pageNumber }} •</span>
          </div>

          <!-- Page Curl / Turn Cue on Hover -->
          <div class="page-curl-corner" title="Nhấp để lật trang"></div>
        </div>
      </div>
    </main>

    <!-- Bottom Progress Scrubber -->
    <footer class="flipbook-footer">
      <div class="spread-bullets">
        <button
          v-for="idx in totalSpreads"
          :key="idx"
          class="bullet-dot"
          :class="{ active: currentSpread === idx - 1 }"
          @click="currentSpread = idx - 1"
          :title="`Đến trang ${idx}`"
        ></button>
      </div>
      <p class="hint-text"><Lightbulb class="inline-icon" /> Dùng phím mũi tên ← → trên bàn phím hoặc nhấp vào trang để lật sách</p>
    </footer>
  </div>
</template>

<style scoped>
.flipbook-overlay-root {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #f0f4f8 0%, #e2e8f0 100%);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  user-select: none;
  overflow: hidden;
}

/* Header */
.flipbook-header {
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #e8e3dd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 20;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.book-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c8bb5, #6474a3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(124, 139, 181, 0.2);
}

.book-icon {
  width: 20px;
  height: 20px;
  color: #ffffff;
}

.book-title {
  font-size: 15px;
  font-weight: 700;
  color: #3d3833;
}

.book-subtitle {
  font-size: 11px;
  color: #8a837b;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #faf8f5;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid #e8e3dd;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e8e3dd;
  color: #3d3833;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: #f0f4f8;
  border-color: #7c8bb5;
  color: #7c8bb5;
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.spread-indicator {
  font-size: 13px;
  font-weight: 700;
  color: #7c8bb5;
  padding: 0 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: #8a837b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #f3f0ec;
  border-color: #e8e3dd;
  color: #3d3833;
}

.icon-btn.active {
  background: #7c8bb5;
  color: #ffffff;
  border-color: #7c8bb5;
}

.export-pdf-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background: #7bb596;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 12px rgba(123, 181, 150, 0.3);
}

.export-pdf-btn:hover {
  filter: brightness(1.1);
}

.close-view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid #c48a8a;
  color: #c48a8a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-view-btn:hover {
  background: #c48a8a;
  color: #ffffff;
}

.ctrl-icon {
  width: 16px;
  height: 16px;
}

/* 3D Stage */
.flipbook-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 2200px;
  overflow: hidden;
  padding: 20px;
}

.book-3d-container {
  position: relative;
  width: 840px;
  height: 590px;
  display: flex;
  transform-style: preserve-3d;
  box-shadow: 0 35px 80px -20px rgba(0, 0, 0, 0.9), 0 0 60px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  transition: transform 0.4s ease;
}

.book-3d-container.is-cover-view {
  transform: translateX(-210px);
}

/* Book Spine Center */
.book-spine-shadow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 100%;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.4));
  z-index: 30;
  pointer-events: none;
}

/* Left and Right Page Sheets */
.book-page {
  position: relative;
  width: 420px;
  height: 590px;
  background: #ffffff;
  overflow: hidden;
  cursor: pointer;
  transform-origin: center center;
  transition: transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1);
  backface-visibility: hidden;
}

.page-left {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  box-shadow: inset -10px 0 20px rgba(0, 0, 0, 0.15);
}

.page-right {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  box-shadow: inset 10px 0 20px rgba(0, 0, 0, 0.15);
  transform-origin: left center;
}

.book-cover-left-shadow {
  width: 420px;
  height: 590px;
  opacity: 0;
}

/* 3D Page Flip Keyframe Animations */
.page-right.is-flipping-forward {
  animation: flip-page-forward 0.6s forwards ease-in-out;
}

@keyframes flip-page-forward {
  0% {
    transform: rotateY(0deg);
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
  }
  50% {
    transform: rotateY(-90deg) scale(1.05);
    box-shadow: -20px 0 40px rgba(0,0,0,0.4);
  }
  100% {
    transform: rotateY(-180deg);
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }
}

.spine-inner-gradient {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 30px;
  pointer-events: none;
  z-index: 15;
}

.left-gradient {
  right: 0;
  background: linear-gradient(to left, rgba(0, 0, 0, 0.2), transparent);
}

.right-gradient {
  left: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.2), transparent);
}

.page-top-meta {
  position: absolute;
  top: 14px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  font-weight: 700;
  color: #64748b;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 6px;
  z-index: 10;
}

.meta-tag {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.page-slots-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.spread-slot {
  position: absolute;
  background: #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.spread-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.spread-empty-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  background: #f1f5f9;
}

.page-texts-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.spread-text-item {
  position: absolute;
  line-height: 1.3;
  max-width: 360px;
  user-select: none;
}

.page-bottom-meta {
  position: absolute;
  bottom: 10px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: #94a3b8;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-top: 4px;
}

.page-curl-corner {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.15) 50%);
  transition: transform 0.2s ease;
}

.book-page:hover .page-curl-corner {
  transform: scale(1.4);
}

/* Footer Bullets */
.flipbook-footer {
  height: 48px;
  background: #ffffff;
  border-top: 1px solid #e8e3dd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
}

.spread-bullets {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bullet-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e8e3dd;
  border: 1px solid #d8caba;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bullet-dot:hover {
  background: #d8caba;
}

.bullet-dot.active {
  background: #7c8bb5;
  border-color: #6474a3;
  transform: scale(1.3);
}

.hint-text {
  font-size: 11px;
  color: #8a837b;
}
</style>
