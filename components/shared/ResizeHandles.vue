<script setup lang="ts">
/**
 * ResizeHandles.vue — 4 góc resize dùng chung cho PdfPlacedItem + BuilderSlotBox
 */
const emit = defineEmits<{
  (e: 'resize-start', event: MouseEvent, corner: 'tl' | 'tr' | 'bl' | 'br'): void
}>()
</script>

<template>
  <div class="resize-handle top-left" @mousedown.stop="emit('resize-start', $event, 'tl')" title="Kéo để chỉnh kích thước"></div>
  <div class="resize-handle top-right" @mousedown.stop="emit('resize-start', $event, 'tr')" title="Kéo để chỉnh kích thước"></div>
  <div class="resize-handle bottom-left" @mousedown.stop="emit('resize-start', $event, 'bl')" title="Kéo để chỉnh kích thước"></div>
  <div class="resize-handle bottom-right" @mousedown.stop="emit('resize-start', $event, 'br')" title="Kéo để chỉnh kích thước"></div>
</template>

<style scoped>
.resize-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #ffffff;
  border: 2.5px solid #3b82f6;
  border-radius: 50%;
  z-index: 60;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.resize-handle:hover {
  transform: scale(1.35);
  background: #3b82f6;
}

.resize-handle.top-left {
  top: -7px;
  left: -7px;
  cursor: nwse-resize;
}

.resize-handle.top-right {
  top: -7px;
  right: -7px;
  cursor: nesw-resize;
}

.resize-handle.bottom-left {
  bottom: -7px;
  left: -7px;
  cursor: nesw-resize;
}

.resize-handle.bottom-right {
  bottom: -7px;
  right: -7px;
  cursor: nwse-resize;
}
</style>
