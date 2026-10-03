<script setup lang="ts">
import { usePhotoStudioStore, PAPER_SIZE_PRESETS, type PaperSizeFormat } from '../../stores/usePhotoStudioStore'
import { Maximize2, Ratio } from 'lucide-vue-next'

const store = usePhotoStudioStore()

function onPresetChange(e: Event) {
  const target = e.target as HTMLSelectElement
  store.setPaperSize(target.value as PaperSizeFormat)
}

function onWidthInput(e: Event) {
  const target = e.target as HTMLInputElement
  const val = Number(target.value)
  if (val >= 400 && val <= 1800) {
    store.updateCanvasDimensions(val, store.canvasHeight)
  }
}

function onHeightInput(e: Event) {
  const target = e.target as HTMLInputElement
  const val = Number(target.value)
  if (val >= 400 && val <= 1800) {
    store.updateCanvasDimensions(store.canvasWidth, val)
  }
}
</script>

<template>
  <div class="panel-card paper-size-panel">
    <div class="panel-header">
      <Ratio class="panel-icon highlight-icon" />
      <span class="panel-title">Khổ Giấy & Kích Thước</span>
    </div>

    <!-- Quick Preset Buttons Grid -->
    <div class="presets-buttons-grid">
      <button
        v-for="preset in PAPER_SIZE_PRESETS.filter(p => p.id !== 'custom')"
        :key="preset.id"
        class="preset-btn"
        :class="{ active: store.paperFormat === preset.id }"
        @click="store.setPaperSize(preset.id)"
        :title="preset.description"
      >
        <span class="preset-name">{{ preset.name }}</span>
        <span class="preset-dim">{{ preset.width }} × {{ preset.height }}</span>
      </button>
    </div>

    <!-- Custom Dimension Inputs -->
    <div class="custom-dim-row">
      <div class="dim-input-group">
        <label class="dim-label">Rộng (px):</label>
        <input 
          type="number" 
          :value="store.canvasWidth" 
          min="400" 
          max="1800" 
          step="10"
          class="dim-input" 
          @change="onWidthInput" 
        />
      </div>

      <span class="dim-times">×</span>

      <div class="dim-input-group">
        <label class="dim-label">Cao (px):</label>
        <input 
          type="number" 
          :value="store.canvasHeight" 
          min="400" 
          max="1800" 
          step="10"
          class="dim-input" 
          @change="onHeightInput" 
        />
      </div>
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

.presets-buttons-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 6px 10px;
  border-radius: 8px;
  background: #faf8f5;
  border: 1px solid #e8e3dd;
  color: #8a837b;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.preset-btn:hover {
  background: #f3f0ec;
  border-color: #d8caba;
  color: #3d3833;
}

.preset-btn.active {
  background: #f0f4f8;
  border-color: #7c8bb5;
  color: #3d3833;
  box-shadow: 0 0 0 1px #7c8bb5;
}

.preset-name {
  font-size: 11px;
  font-weight: 700;
}

.preset-dim {
  font-size: 9px;
  color: #8a837b;
  margin-top: 1px;
}

.custom-dim-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #faf8f5;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e8e3dd;
}

.dim-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dim-label {
  font-size: 11px;
  color: #8a837b;
}

.dim-input {
  width: 64px;
  background: #ffffff;
  border: 1px solid #e8e3dd;
  color: #3d3833;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  outline: none;
}

.dim-input:focus {
  border-color: #7c8bb5;
}

.dim-times {
  font-size: 13px;
  font-weight: 700;
  color: #8a837b;
}
</style>
