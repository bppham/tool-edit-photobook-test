<script setup lang="ts">
/**
 * PdfGuideZone.vue — Một khung gợi ý trên tài liệu PDF
 */
import { type PdfSuggestedSlot } from '../../stores/usePhotoStudioStore'

defineProps<{
  guide: PdfSuggestedSlot
}>()
</script>

<template>
  <div
    class="pdf-guide-zone"
    :style="{
      left: `${guide.x}px`,
      top: `${guide.y}px`,
      width: `${guide.width}px`,
      height: `${guide.height}px`
    }"
  >
    <span class="guide-label">{{ guide.label }}</span>
  </div>
</template>

<style scoped>
.pdf-guide-zone {
  position: absolute;
  border: 2px dashed #b5d5d8;
  background: rgba(250, 248, 245, 0.6);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  box-sizing: border-box;
}

.guide-label {
  font-size: 11px;
  font-weight: 700;
  color: #8a837b;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #e8e3dd;
}
</style>
