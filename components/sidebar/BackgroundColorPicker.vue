<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePhotoStudioStore } from '../../stores/usePhotoStudioStore'
import { Palette, Check, Sparkles } from 'lucide-vue-next'

const store = usePhotoStudioStore()
const applyToAllPages = ref<boolean>(false)

// Palette of curated photobook background presets
const presetColors = [
  { label: 'Trắng', value: '#ffffff', border: true },
  { label: 'Xám khói', value: '#f8fafc', border: true },
  { label: 'Kem Vintage', value: '#fdfbf7', border: true },
  { label: 'Hồng Nhẹ', value: '#fef2f2', border: false },
  { label: 'Xanh Bơ', value: '#f0fdf4', border: false },
  { label: 'Vàng Ngà', value: '#fefce8', border: false },
  { label: 'Xám Đậm', value: '#334155', border: false },
  { label: 'Đen Luxury', value: '#0f172a', border: false },
  { label: 'Xanh Đêm', value: '#1e1b4b', border: false },
  { label: 'Nâu Cổ Điển', value: '#451a03', border: false }
]

function onColorChange(color: string) {
  store.setCanvasBackground(color, applyToAllPages.value)
}

function onNativePickerInput(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.value) {
    onColorChange(target.value)
  }
}
</script>

<template>
  <div class="panel-card bg-color-panel">
    <div class="panel-header">
      <Palette class="panel-icon highlight-icon" />
      <span class="panel-title">Màu Nền Trang</span>
    </div>

    <!-- Active Color Box + Native Picker Trigger -->
    <div class="color-picker-row">
      <label class="color-preview-trigger" :style="{ background: store.activeCanvasBackground }" title="Nhấp để mở bảng chọn màu đầy đủ">
        <input 
          type="color" 
          :value="store.activeCanvasBackground" 
          class="hidden-native-picker" 
          @input="onNativePickerInput" 
        />
        <Palette class="picker-inner-icon" :style="{ color: store.activeCanvasBackground === '#ffffff' ? '#0f172a' : '#ffffff' }" />
      </label>

      <div class="color-hex-info">
        <span class="hex-label">Mã màu:</span>
        <span class="hex-value">{{ store.activeCanvasBackground.toUpperCase() }}</span>
      </div>

      <label class="native-picker-btn">
        <span>Chọn Tự Do</span>
        <input 
          type="color" 
          :value="store.activeCanvasBackground" 
          class="hidden-native-picker" 
          @input="onNativePickerInput" 
        />
      </label>
    </div>

    <!-- Quick Preset Color Dots Swatches -->
    <div class="preset-swatches-grid">
      <button
        v-for="color in presetColors"
        :key="color.value"
        class="color-swatch-btn"
        :class="{ 
          'is-active': store.activeCanvasBackground.toLowerCase() === color.value.toLowerCase(),
          'has-border': color.border
        }"
        :style="{ background: color.value }"
        :title="color.label"
        @click="onColorChange(color.value)"
      >
        <Check 
          v-if="store.activeCanvasBackground.toLowerCase() === color.value.toLowerCase()" 
          class="check-icon"
          :style="{ color: color.value === '#ffffff' || color.value === '#f8fafc' || color.value === '#fdfbf7' || color.value === '#fefce8' ? '#0f172a' : '#ffffff' }"
        />
      </button>
    </div>

    <!-- Apply to all pages toggle for Photobook mode -->
    <div v-if="store.activeMode === 'photobook'" class="apply-all-checkbox-row">
      <label class="checkbox-label">
        <input v-model="applyToAllPages" type="checkbox" class="styled-checkbox" />
        <span>Áp dụng màu này cho toàn bộ {{ store.totalPages }} trang</span>
      </label>
    </div>
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

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #faf8f5;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #e8e3dd;
}

.color-preview-trigger {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 2px solid #e8e3dd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.15s, border-color 0.15s;
}

.color-preview-trigger:hover {
  transform: scale(1.08);
  border-color: #7c8bb5;
}

.picker-inner-icon {
  width: 15px;
  height: 15px;
}

.hidden-native-picker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.color-hex-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hex-label {
  font-size: 10px;
  color: #8a837b;
}

.hex-value {
  font-size: 12px;
  font-weight: 700;
  color: #3d3833;
  font-family: monospace;
}

.native-picker-btn {
  position: relative;
  padding: 6px 10px;
  border-radius: 6px;
  background: #f0f4f8;
  border: 1px solid #7c8bb5;
  color: #7c8bb5;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  overflow: hidden;
}

.native-picker-btn:hover {
  background: #7c8bb5;
  color: #ffffff;
}

/* Preset Swatches Grid */
.preset-swatches-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.color-swatch-btn {
  width: 100%;
  height: 28px;
  border-radius: 6px;
  border: 1.5px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
}

.color-swatch-btn.has-border {
  border-color: #e8e3dd;
}

.color-swatch-btn:hover {
  transform: translateY(-2px) scale(1.08);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.color-swatch-btn.is-active {
  border-color: #7c8bb5;
  box-shadow: 0 0 0 2px #7c8bb5, 0 4px 12px rgba(124, 139, 181, 0.2);
  transform: scale(1.08);
}

.check-icon {
  width: 14px;
  height: 14px;
}

.apply-all-checkbox-row {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #8a837b;
  cursor: pointer;
}

.styled-checkbox {
  accent-color: #7c8bb5;
  width: 14px;
  height: 14px;
  cursor: pointer;
}
</style>
