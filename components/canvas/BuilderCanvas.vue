<script setup lang="ts">
import { ref } from 'vue'
import { usePhotoStudioStore, type SvgSlot } from '../../stores/usePhotoStudioStore'
import BuilderToolbar from './BuilderToolbar.vue'
import BuilderSlotBox from './BuilderSlotBox.vue'
import A4Sheet from '../shared/A4Sheet.vue'

const store = usePhotoStudioStore()

// Interaction state: Dragging or Resizing
const activeDrag = ref<{
  type: 'move' | 'resize-br' | 'resize-tl' | 'resize-tr' | 'resize-bl'
  id: string
  startX: number
  startY: number
  initX: number
  initY: number
  initW: number
  initH: number
} | null>(null)

function startMove(e: MouseEvent, slot: SvgSlot) {
  e.stopPropagation()
  store.selectedBuilderSlotId = slot.id
  activeDrag.value = {
    type: 'move',
    id: slot.id,
    startX: e.clientX,
    startY: e.clientY,
    initX: slot.x,
    initY: slot.y,
    initW: slot.width,
    initH: slot.height
  }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function startResize(e: MouseEvent, slot: SvgSlot, corner: 'tl' | 'tr' | 'bl' | 'br') {
  e.stopPropagation()
  store.selectedBuilderSlotId = slot.id
  activeDrag.value = {
    type: corner === 'br' ? 'resize-br' : corner === 'tr' ? 'resize-tr' : corner === 'bl' ? 'resize-bl' : 'resize-tl',
    id: slot.id,
    startX: e.clientX,
    startY: e.clientY,
    initX: slot.x,
    initY: slot.y,
    initW: slot.width,
    initH: slot.height
  }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!activeDrag.value) return
  const { type, id, startX, startY, initX, initY, initW, initH } = activeDrag.value
  const dx = e.clientX - startX
  const dy = e.clientY - startY

  const maxW = store.canvasWidth
  const maxH = store.canvasHeight

  if (type === 'move') {
    store.updateBuilderSlot(id, {
      x: Math.max(10, Math.min(maxW - initW - 10, initX + dx)),
      y: Math.max(80, Math.min(maxH - initH - 20, initY + dy))
    })
  } else if (type === 'resize-br') {
    store.updateBuilderSlot(id, {
      width: Math.max(100, Math.min(maxW - initX - 10, initW + dx)),
      height: Math.max(80, Math.min(maxH - initY - 20, initH + dy))
    })
  } else if (type === 'resize-tr') {
    const newH = Math.max(80, initH - dy)
    store.updateBuilderSlot(id, {
      y: initY + (initH - newH),
      width: Math.max(100, Math.min(maxW - initX - 10, initW + dx)),
      height: newH
    })
  } else if (type === 'resize-bl') {
    const newW = Math.max(100, initW - dx)
    store.updateBuilderSlot(id, {
      x: initX + (initW - newW),
      width: newW,
      height: Math.max(80, Math.min(maxH - initY - 20, initH + dy))
    })
  } else if (type === 'resize-tl') {
    const newW = Math.max(100, initW - dx)
    const newH = Math.max(80, initH - dy)
    store.updateBuilderSlot(id, {
      x: initX + (initW - newW),
      y: initY + (initH - newH),
      width: newW,
      height: newH
    })
  }
}

function onMouseUp() {
  activeDrag.value = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

const emit = defineEmits<{
  (e: 'template-saved', templateName: string): void
}>()

function onSaveTemplate() {
  if (store.builderSlots.length === 0) {
    alert('Vui lòng thêm ít nhất 1 khung ảnh!')
    return
  }
  const name = prompt('Nhập tên cho Template mới:', store.builderTitle)
  if (name) {
    store.saveCustomTemplate(name)
    emit('template-saved', name)
  }
}
</script>

<template>
  <div class="canvas-viewport" @click="store.selectedBuilderSlotId = null">
    <!-- Top Floating Toolbar with Size Selector -->
    <BuilderToolbar @save="onSaveTemplate" />

    <!-- Editable Canvas Sheet with Dynamic Width & Height -->
    <A4Sheet 
      :background="store.builderBackground"
      :width="store.canvasWidth"
      :height="store.canvasHeight"
    >
      <!-- Sheet Header Preview -->
      <template #header>
        <div class="builder-header-zone">
          <span class="builder-tag">CHẾ ĐỘ THIẾT KẾ TEMPLATE (CANVA-STYLE)</span>
          <h2 class="builder-title-preview">{{ store.builderTitle || 'TIÊU ĐỀ TEMPLATE' }}</h2>
        </div>
      </template>

      <!-- Slots Workspace -->
      <div class="builder-slots-layer">
        <BuilderSlotBox
          v-for="slot in store.builderSlots"
          :key="slot.id"
          :slot-data="slot"
          :is-selected="store.selectedBuilderSlotId === slot.id"
          @start-move="startMove($event, slot)"
          @start-resize="(ev, corner) => startResize(ev, slot, corner)"
          @remove="store.removeBuilderSlot(slot.id)"
        />
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="builder-footer-zone">
          <span>Kéo 4 góc để co giãn • Kéo giữa để di chuyển</span>
          <span>Khổ giấy: {{ store.canvasWidth }} × {{ store.canvasHeight }} px</span>
        </div>
      </template>
    </A4Sheet>
  </div>
</template>

<style scoped>
.canvas-viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px 40px;
  overflow-y: auto;
  height: calc(100vh - 65px);
  background: #eae6e1;
  gap: 16px;
}

.builder-header-zone {
  position: absolute;
  top: 24px;
  left: 40px;
  right: 40px;
  border-bottom: 2px dashed #e8e3dd;
  padding-bottom: 12px;
  pointer-events: none;
  z-index: 10;
}

.builder-tag {
  font-size: 10px;
  font-weight: 800;
  color: #7c8bb5;
  letter-spacing: 0.1em;
}

.builder-title-preview {
  font-size: 18px;
  font-weight: 800;
  color: #3d3833;
  margin: 2px 0 0;
}

.builder-slots-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.builder-footer-zone {
  position: absolute;
  bottom: 20px;
  left: 40px;
  right: 40px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8a837b;
  border-top: 1px solid #e8e3dd;
  padding-top: 10px;
  z-index: 10;
}
</style>
