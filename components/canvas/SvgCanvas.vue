<script setup lang="ts">
/**
 * SvgCanvas.vue — Refactored: uses SvgSlotFrame, A4Sheet, TextLayer
 */
import { ref, computed } from 'vue'
import { usePhotoStudioStore, type PhotoAsset } from '../../stores/usePhotoStudioStore'
import A4Sheet from '../shared/A4Sheet.vue'
import TextLayer from '../shared/TextLayer.vue'
import SvgSlotFrame from './SvgSlotFrame.vue'

const store = usePhotoStudioStore()
const hoveredSlotId = ref<string | null>(null)
const draggedSlotId = ref<string | null>(null)

function getSlotAssignment(slotId: string) {
  if (store.activeMode === 'photobook') {
    return store.currentPage.assignments?.[slotId]
  }
  return store.svgSlotAssignments[slotId]
}

function handleSlotDrop(e: DragEvent, slotId: string) {
  e.preventDefault()
  const rawData = e.dataTransfer?.getData('text/plain')
  if (!rawData) return

  try {
    const data = JSON.parse(rawData)
    if (data.fromSlotId) {
      store.swapSlots(data.fromSlotId, slotId)
    } else if (data.url) {
      store.assignImageToSlot(slotId, data as PhotoAsset)
    }
  } catch (err) {
    console.error('Drop error', err)
  }
  draggedSlotId.value = null
}

function handleSlotDragStart(e: DragEvent, slotId: string) {
  const assignment = getSlotAssignment(slotId)
  if (!assignment) return
  draggedSlotId.value = slotId
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ fromSlotId: slotId }))
    e.dataTransfer.effectAllowed = 'move'
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

function adjustZoom(slotId: string, delta: number) {
  const item = getSlotAssignment(slotId)
  if (item) {
    item.zoom = Math.max(0.6, Math.min(3.0, Number((item.zoom + delta).toFixed(1))))
  }
}

function resetTransform(slotId: string) {
  const item = getSlotAssignment(slotId)
  if (item) {
    item.zoom = 1
    item.offsetX = 0
    item.offsetY = 0
  }
}
</script>

<template>
  <div class="canvas-viewport">
    <A4Sheet
      v-if="store.currentSvgTemplate"
      sheet-id="export-sheet-svg"
      :background="store.currentSvgTemplate.background"
    >
      <!-- Background image if imported from PDF -->
      <img 
        v-if="store.activeMode === 'photobook' && store.currentPage.backgroundImage" 
        :src="store.currentPage.backgroundImage" 
        class="pdf-page-bg-img" 
      />

      <!-- Sheet Header -->
      <template #header>
        <div class="sheet-header">
          <div class="header-left">
            <span class="sheet-tag">
              {{ store.activeMode === 'photobook' ? `PHOTOBOOK TRANG ${store.activePageIndex + 1}/${store.totalPages}` : 'SVG VECTOR TEMPLATE' }}
            </span>
            <h2 class="sheet-title">{{ store.currentSvgTemplate.headerTitle }}</h2>
          </div>
          <div class="header-right">
            <span class="page-badge">
              A4 • {{ store.filledSvgSlotCount }}/{{ store.currentSvgTemplate.slots.length }} ĐÃ ĐIỀN
            </span>
          </div>
        </div>
      </template>

      <!-- Slots Container -->
      <div class="slots-container">
        <SvgSlotFrame
          v-for="slot in store.currentSvgTemplate.slots"
          :key="slot.id"
          :slot-data="slot"
          :assignment="getSlotAssignment(slot.id)"
          :is-hovered="hoveredSlotId === slot.id"
          @drag-start="handleSlotDragStart($event, slot.id)"
          @drag-over="handleDragOver"
          @drop="handleSlotDrop($event, slot.id)"
          @hover="(h: boolean) => hoveredSlotId = h ? slot.id : null"
          @zoom="(delta: number) => adjustZoom(slot.id, delta)"
          @reset="resetTransform(slot.id)"
          @remove="store.removeSlotImage(slot.id)"
        />
      </div>

      <!-- Text Layer -->
      <TextLayer />

      <!-- Sheet Footer -->
      <template #footer>
        <div class="sheet-footer">
          <span>PhotoFlow Photobook Engine • Chuẩn xuất bản 300 DPI</span>
          <span>
            {{ store.activeMode === 'photobook' ? `Trang ${store.activePageIndex + 1} / ${store.totalPages}` : 'Trang 1 / 1' }}
          </span>
        </div>
      </template>
    </A4Sheet>
  </div>
</template>

<style scoped>
.canvas-viewport {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24px 16px 32px;
  overflow-y: auto;
  height: calc(100vh - 65px - 96px);
  background: #eae6e1;
}

.pdf-page-bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  opacity: 0.95;
  z-index: 1;
}

.sheet-header {
  position: absolute;
  top: 24px;
  left: 40px;
  right: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 12px;
  z-index: 10;
}

.sheet-tag {
  font-size: 10px;
  font-weight: 800;
  color: #7c8bb5;
  letter-spacing: 0.1em;
}

.sheet-title {
  font-size: 18px;
  font-weight: 800;
  color: #3d3833;
  margin: 2px 0 0;
  letter-spacing: -0.02em;
}

.page-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f0f4f8;
  color: #3d3833;
  border: 1px solid #7c8bb5;
}

.slots-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
}

.sheet-footer {
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
