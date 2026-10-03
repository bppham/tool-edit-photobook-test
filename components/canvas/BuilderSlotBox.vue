<script setup lang="ts">
import { usePhotoStudioStore, type SvgSlot } from '../../stores/usePhotoStudioStore'
import ResizeHandles from '../shared/ResizeHandles.vue'
import { LayoutGrid, Trash2 } from 'lucide-vue-next'

const store = usePhotoStudioStore()

defineProps<{
  slotData: SvgSlot
  isSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'start-move', event: MouseEvent): void
  (e: 'start-resize', event: MouseEvent, corner: 'tl' | 'tr' | 'bl' | 'br'): void
  (e: 'remove'): void
}>()
</script>

<template>
  <div
    class="builder-slot-box"
    :class="{ 'is-selected': isSelected }"
    :style="{
      left: `${slotData.x}px`,
      top: `${slotData.y}px`,
      width: `${slotData.width}px`,
      height: `${slotData.height}px`,
      borderRadius: `${slotData.borderRadius ?? 12}px`
    }"
    @click.stop="store.selectedBuilderSlotId = slotData.id"
    @mousedown="emit('start-move', $event)"
  >
    <div class="slot-content-inner">
      <LayoutGrid class="slot-center-icon" />
      <span class="slot-label-text">{{ slotData.name }}</span>
      <span class="slot-dim-text">{{ Math.round(slotData.width) }} × {{ Math.round(slotData.height) }}px</span>
    </div>

    <!-- Selection Border & 4 Resize Handles -->
    <template v-if="isSelected">
      <ResizeHandles @resize-start="(ev, corner) => emit('start-resize', ev, corner)" />

      <!-- Floating Settings for this Slot (Adaptive position) -->
      <div 
        class="slot-edit-bar"
        :class="{ 'position-below': slotData.y < 85 }"
        @mousedown.stop
        @click.stop
      >
        <input 
          v-model="slotData.name" 
          type="text" 
          class="slot-name-inp" 
          placeholder="Tên ô" 
          @mousedown.stop
        />
        
        <button 
          class="mini-tool-btn" 
          :class="{ active: slotData.borderRadius === 0 }"
          @click.stop="slotData.borderRadius = 0"
          title="Góc vuông"
        >
          Vuông
        </button>
        
        <button 
          class="mini-tool-btn" 
          :class="{ active: slotData.borderRadius === 16 }"
          @click.stop="slotData.borderRadius = 16"
          title="Bo góc 16px"
        >
          Bo 16
        </button>

        <button 
          class="mini-tool-btn danger" 
          @click.stop="emit('remove')" 
          title="Xóa ô này"
        >
          <Trash2 class="tool-icon-sm" />
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.builder-slot-box {
  position: absolute;
  background: rgba(250, 248, 245, 0.85);
  border: 2px dashed #b5d5d8;
  box-sizing: border-box;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.15s;
  user-select: none;
}

.builder-slot-box.is-selected {
  border: 2.5px solid #7c8bb5;
  background: rgba(240, 244, 248, 0.95);
  box-shadow: 0 0 0 3px rgba(124, 139, 181, 0.25), 0 8px 24px rgba(124, 139, 181, 0.15);
  z-index: 25;
}

.slot-content-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  pointer-events: none;
}

.slot-center-icon {
  width: 24px;
  height: 24px;
  color: #64748b;
}

.slot-label-text {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.slot-dim-text {
  font-size: 11px;
  font-weight: 600;
  color: #8a837b;
}

.slot-edit-bar {
  position: absolute;
  top: -44px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  background: #ffffff;
  padding: 4px 8px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  z-index: 70;
  white-space: nowrap;
  border: 1px solid #e8e3dd;
}

.slot-edit-bar.position-below {
  top: auto;
  bottom: -44px;
}

.slot-name-inp {
  background: #faf8f5;
  border: 1px solid #e8e3dd;
  color: #3d3833;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  width: 110px;
  outline: none;
}

.slot-name-inp:focus {
  border-color: #7c8bb5;
}

.mini-tool-btn {
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
  border: 1px solid #e8e3dd;
  background: transparent;
  color: #8a837b;
  cursor: pointer;
  transition: all 0.15s;
}

.mini-tool-btn:hover {
  background: #f3f0ec;
  color: #3d3833;
}

.mini-tool-btn.active {
  background: #7c8bb5;
  border-color: #7c8bb5;
  color: #ffffff;
}

.mini-tool-btn.danger {
  background: transparent;
  border-color: #c48a8a;
  color: #c48a8a;
}

.mini-tool-btn.danger:hover {
  background: #c48a8a;
  color: #ffffff;
}

.tool-icon-sm {
  width: 12px;
  height: 12px;
}
</style>
