<script setup lang="ts">
/**
 * ModeSwitcher.vue — 4 modes: Photobook 8 Trang / Mẫu SVG / PDF / Builder
 */
import { usePhotoStudioStore } from '../../stores/usePhotoStudioStore'
import { BookOpen, FileCode2, FileText, Sparkles } from 'lucide-vue-next'

const store = usePhotoStudioStore()
</script>

<template>
  <div class="mode-switcher-container">
    <button class="mode-btn" :class="{ active: store.activeMode === 'photobook' }" @click="store.setMode('photobook')">
      <BookOpen class="btn-icon photobook-icon" />
      <span>1. Photobook {{ store.totalPages }} Trang</span>
      <span class="mode-pill-tag book-tag">Album</span>
    </button>

    <button class="mode-btn" :class="{ active: store.activeMode === 'svg' }" @click="store.setMode('svg')">
      <FileCode2 class="btn-icon" />
      <span>2. Mẫu SVG Đơn</span>
      <span class="mode-pill-tag">Auto</span>
    </button>

    <button class="mode-btn" :class="{ active: store.activeMode === 'pdf' }" @click="store.setMode('pdf')">
      <FileText class="btn-icon" />
      <span>3. Kéo Thả PDF</span>
      <span class="mode-pill-tag pdf-tag">Manual</span>
    </button>

    <button class="mode-btn" :class="{ active: store.activeMode === 'builder' }" @click="store.setMode('builder')">
      <Sparkles class="btn-icon" />
      <span>4. Tự Vẽ Layout</span>
      <span class="mode-pill-tag builder-tag">Canva</span>
    </button>
  </div>
</template>

<style scoped>
.mode-switcher-container {
  display: flex;
  background: #f3f0ec;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid #e8e3dd;
  gap: 4px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #8a837b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.mode-btn:hover {
  color: #3d3833;
  background: rgba(0, 0, 0, 0.03);
}

.mode-btn.active {
  background: #7c8bb5;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(124, 139, 181, 0.3);
}

.btn-icon {
  width: 15px;
  height: 15px;
}

.photobook-icon {
  color: #c9a96e;
}

.mode-btn.active .photobook-icon {
  color: #ffffff;
}

.mode-pill-tag {
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.05);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mode-btn.active .mode-pill-tag {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff !important;
}

.mode-pill-tag.book-tag {
  color: #c9a96e;
}

.mode-pill-tag.pdf-tag {
  color: #b97f5b;
}

.mode-pill-tag.builder-tag {
  color: #9b7cb5;
}
</style>
