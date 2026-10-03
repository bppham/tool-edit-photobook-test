<script setup lang="ts">
/**
 * SvgSlotFrame.vue — Một slot riêng lẻ trong SVG canvas
 * Hiển thị ảnh đã gán hoặc placeholder trống
 */
import { type SvgSlot, type SlotTransform } from '../../stores/usePhotoStudioStore'
import { ZoomIn, ZoomOut, Move, Trash2, PlusCircle } from 'lucide-vue-next'

const props = defineProps<{
  slotData: SvgSlot
  assignment?: SlotTransform
  isHovered: boolean
}>()

const emit = defineEmits<{
  (e: 'drag-start', event: DragEvent): void
  (e: 'drag-over', event: DragEvent): void
  (e: 'drop', event: DragEvent): void
  (e: 'hover', hovered: boolean): void
  (e: 'zoom', delta: number): void
  (e: 'reset'): void
  (e: 'remove'): void
}>()
</script>

<template>
  <div
    class="slot-frame"
    :class="{
      'is-filled': !!assignment,
      'is-hovered': isHovered
    }"
    :style="{
      left: `${slotData.x}px`,
      top: `${slotData.y}px`,
      width: `${slotData.width}px`,
      height: `${slotData.height}px`,
      borderRadius: `${slotData.borderRadius || 12}px`
    }"
    draggable="true"
    @dragstart="emit('drag-start', $event)"
    @dragover="emit('drag-over', $event)"
    @drop="emit('drop', $event)"
    @mouseenter="emit('hover', true)"
    @mouseleave="emit('hover', false)"
  >
    <!-- When image is assigned -->
    <template v-if="assignment">
      <div class="image-crop-wrapper">
        <img
          :src="assignment.imageUrl"
          alt="Slot Photo"
          class="slot-image"
          :style="{
            transform: `scale(${assignment.zoom}) translate(${assignment.offsetX}px, ${assignment.offsetY}px)`
          }"
        />
      </div>

      <!-- Mini Overlay Toolbar on Hover -->
      <div class="slot-toolbar">
        <button class="tool-btn" @click.stop="emit('zoom', 0.15)" title="Phóng to">
          <ZoomIn class="tool-icon" />
        </button>
        <button class="tool-btn" @click.stop="emit('zoom', -0.15)" title="Thu nhỏ">
          <ZoomOut class="tool-icon" />
        </button>
        <button class="tool-btn" @click.stop="emit('reset')" title="Căn lại mặc định">
          <Move class="tool-icon" />
        </button>
        <button class="tool-btn danger" @click.stop="emit('remove')" title="Xóa ảnh">
          <Trash2 class="tool-icon" />
        </button>
      </div>

      <div class="slot-order-pill">
        {{ slotData.label || slotData.name }}
      </div>
    </template>

    <!-- Empty Slot Placeholder -->
    <template v-else>
      <div class="empty-slot-placeholder">
        <div class="placeholder-circle">
          <PlusCircle class="empty-icon" />
        </div>
        <span class="slot-name-text">{{ slotData.name }}</span>
        <span class="slot-instruction">Thả ảnh vào đây</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.slot-frame {
  position: absolute;
  overflow: hidden;
  box-sizing: border-box;
  background: #f1f5f9;
  border: 2px dashed #cbd5e1;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.slot-frame.is-filled {
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.slot-frame.is-hovered {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.image-crop-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.slot-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.15s ease-out;
  pointer-events: none;
}

.slot-toolbar {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 20;
}

.slot-frame:hover .slot-toolbar {
  opacity: 1;
}

.tool-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.tool-btn:hover {
  background: #3b82f6;
}

.tool-btn.danger:hover {
  background: #ef4444;
}

.tool-icon {
  width: 14px;
  height: 14px;
}

.slot-order-pill {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(6px);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  pointer-events: none;
}

.empty-slot-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #64748b;
  text-align: center;
  padding: 12px;
}

.placeholder-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.empty-icon {
  width: 20px;
  height: 20px;
  color: #94a3b8;
}

.slot-name-text {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.slot-instruction {
  font-size: 11px;
  color: #94a3b8;
}
</style>
