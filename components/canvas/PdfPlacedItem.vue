<script setup lang="ts">
/**
 * PdfPlacedItem.vue — Một ảnh đặt trên PDF (draggable + resizable)
 */
import { type PdfPlacement } from '../../stores/usePhotoStudioStore'
import ResizeHandles from '../shared/ResizeHandles.vue'
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-vue-next'

defineProps<{
  item: PdfPlacement
  isSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'start-move', event: MouseEvent): void
  (e: 'start-resize', event: MouseEvent, corner: 'tl' | 'tr' | 'bl' | 'br'): void
  (e: 'bring-front'): void
  (e: 'send-back'): void
  (e: 'remove'): void
}>()

function onResizeStart(event: MouseEvent, corner: 'tl' | 'tr' | 'bl' | 'br') {
  emit('start-resize', event, corner)
}
</script>

<template>
  <div
    class="pdf-placed-item"
    :class="{ 'is-selected': isSelected }"
    :style="{
      left: `${item.x}px`,
      top: `${item.y}px`,
      width: `${item.width}px`,
      height: `${item.height}px`,
      zIndex: item.zIndex
    }"
    @mousedown="emit('start-move', $event)"
  >
    <img :src="item.imageUrl" alt="PDF Placed Photo" class="item-img" />

    <!-- Selected State Controls -->
    <template v-if="isSelected">
      <ResizeHandles @resize-start="onResizeStart" />

      <!-- Floating Item Toolbar -->
      <div class="item-action-bar" @mousedown.stop>
        <button class="mini-btn" @click.stop="emit('bring-front')" title="Đưa lên trên cùng">
          <ArrowUp class="mini-icon" />
        </button>
        <button class="mini-btn" @click.stop="emit('send-back')" title="Đưa xuống dưới">
          <ArrowDown class="mini-icon" />
        </button>
        <button class="mini-btn danger" @click.stop="emit('remove')" title="Xóa">
          <Trash2 class="mini-icon" />
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pdf-placed-item {
  position: absolute;
  cursor: move;
  box-sizing: border-box;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  transition: box-shadow 0.15s ease;
}

.pdf-placed-item.is-selected {
  outline: 2px solid #7c8bb5;
  box-shadow: 0 8px 24px rgba(124, 139, 181, 0.2);
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  display: block;
  pointer-events: none;
}

.item-action-bar {
  position: absolute;
  top: -38px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  background: #ffffff;
  padding: 4px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e3dd;
  z-index: 40;
}

.mini-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: #f0f4f8;
  color: #7c8bb5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.mini-btn:hover {
  background: #7c8bb5;
  color: #ffffff;
}

.mini-btn.danger:hover {
  background: #c48a8a;
  color: #ffffff;
}

.mini-icon {
  width: 12px;
  height: 12px;
}
</style>
