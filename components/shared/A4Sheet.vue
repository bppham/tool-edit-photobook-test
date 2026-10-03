<script setup lang="ts">
/**
 * A4Sheet.vue — Shared wrapper cho khổ giấy tùy biến (A4 Dọc/Ngang, Vuông, A5, Custom)
 * Dùng chung cho SvgCanvas, PdfCanvas, BuilderCanvas
 */
import { usePhotoStudioStore } from '../../stores/usePhotoStudioStore'

const store = usePhotoStudioStore()

defineProps<{
  sheetId?: string
  background?: string
  width?: number
  height?: number
}>()
</script>

<template>
  <div
    :id="sheetId"
    class="a4-sheet"
    :style="{ 
      width: `${width || store.canvasWidth}px`,
      height: `${height || store.canvasHeight}px`,
      background: background || '#ffffff' 
    }"
  >
    <!-- Header slot -->
    <slot name="header" />

    <!-- Main content area -->
    <slot />

    <!-- Footer slot -->
    <slot name="footer" />
  </div>
</template>

<style scoped>
.a4-sheet {
  position: relative;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  user-select: none;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
