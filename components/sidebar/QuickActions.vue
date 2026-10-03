<script setup lang="ts">
/**
 * QuickActions.vue — Auto-fill, shuffle, text add buttons per mode
 */
import { usePhotoStudioStore } from '../../stores/usePhotoStudioStore'
import { Sparkles, Shuffle, Type, BookOpen, Layers, Lightbulb, Palette } from 'lucide-vue-next'

const store = usePhotoStudioStore()
</script>

<template>
  <div class="panel-card highlight">
    <div class="panel-header">
      <Sparkles class="panel-icon highlight-icon" />
      <span class="panel-title">Thao Tác Nhanh</span>
    </div>

    <!-- Photobook Multi-Page Actions -->
    <div v-if="store.activeMode === 'photobook'" class="cta-actions">
      <button class="cta-btn fill-btn" @click="store.autoFillSvg()">
        <Sparkles class="cta-icon" />
        <span>Điền Trang Hiện Tại</span>
      </button>

      <button class="cta-btn fill-all-btn" @click="store.autoFillAllPages()">
        <Layers class="cta-icon" />
        <span>Điền Cả {{ store.totalPages }} Trang</span>
      </button>

      <button class="cta-btn shuffle-btn" @click="store.shuffleSvg()">
        <Shuffle class="cta-icon" />
        <span>Đổi Vị Trí Ngẫu Nhiên</span>
      </button>
    </div>

    <!-- SVG Mode Actions -->
    <div v-else-if="store.activeMode === 'svg'" class="cta-actions">
      <button class="cta-btn fill-btn" @click="store.autoFillSvg()">
        <Sparkles class="cta-icon" />
        <span>Tự Động Điền (Auto-Fill)</span>
      </button>

      <button class="cta-btn shuffle-btn" @click="store.shuffleSvg()">
        <Shuffle class="cta-icon" />
        <span>Đổi Vị Trí Ngẫu Nhiên</span>
      </button>
    </div>

    <!-- PDF Mode Actions -->
    <div v-else-if="store.activeMode === 'pdf'" class="cta-actions">
      <button class="cta-btn fill-btn" @click="store.autoFillPdfGuides()">
        <Sparkles class="cta-icon" />
        <span>Snap Khung Gợi Ý PDF</span>
      </button>
      <p class="guide-subtext"><Lightbulb class="inline-icon" /> Click hoặc Kéo ảnh thả trực tiếp lên tài liệu PDF</p>
    </div>

    <!-- Builder Mode Actions -->
    <div v-else class="cta-actions">
      <button class="cta-btn fill-btn" @click="store.addNewBuilderSlot()">
        <Sparkles class="cta-icon" />
        <span>Thêm Khung Ảnh Mới</span>
      </button>
      <p class="guide-subtext"><Palette class="inline-icon" /> Kéo góc để co giãn • Kéo giữa để xếp ô</p>
    </div>

    <!-- Add Text — Available in all modes -->
    <button class="cta-btn text-add-btn" @click="store.addCanvasText()">
      <Type class="cta-icon" />
      <span>Thêm Chữ / Ghi Chú</span>
    </button>
  </div>
</template>

<style scoped>
.panel-card {
  background: #ffffff;
  border: 1px solid #e8e3dd;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-card.highlight {
  background: linear-gradient(135deg, #ffffff, #f0f4f8);
  border-color: #7c8bb5;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-icon {
  width: 16px;
  height: 16px;
  color: #8a837b;
}

.highlight-icon {
  color: #7c8bb5;
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: #3d3833;
  letter-spacing: -0.01em;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fill-btn {
  background: #7bb596;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(123, 181, 150, 0.2);
}

.fill-btn:hover {
  background: #6aa384;
  transform: translateY(-1px);
}

.fill-all-btn {
  background: #7c8bb5;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(124, 139, 181, 0.2);
}

.fill-all-btn:hover {
  background: #6474a3;
  transform: translateY(-1px);
}

.shuffle-btn {
  background: transparent;
  color: #3d3833;
  border: 1px solid #e8e3dd;
}

.shuffle-btn:hover {
  background: #f3f0ec;
  border-color: #d8caba;
}

.text-add-btn {
  background: transparent;
  border: 1px dashed #7c8bb5;
  color: #7c8bb5;
  margin-top: 4px;
}

.text-add-btn:hover {
  background: #f0f4f8;
  border-color: #6474a3;
  color: #6474a3;
}

.cta-icon {
  width: 16px;
  height: 16px;
}

.guide-subtext {
  font-size: 11px;
  color: #8a837b;
  text-align: center;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.inline-icon {
  width: 12px;
  height: 12px;
  color: #c9a96e;
}
</style>
