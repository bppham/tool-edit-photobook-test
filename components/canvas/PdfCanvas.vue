<script setup lang="ts">
import { ref } from 'vue'
import { usePhotoStudioStore, type PhotoAsset, type PdfPlacement } from '../../stores/usePhotoStudioStore'
import A4Sheet from '../shared/A4Sheet.vue'
import TextLayer from '../shared/TextLayer.vue'
import PdfGuideZone from './PdfGuideZone.vue'
import PdfPlacedItem from './PdfPlacedItem.vue'
import { FileText } from 'lucide-vue-next'

const store = usePhotoStudioStore()
const canvasRef = ref<HTMLElement | null>(null)

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

function onCanvasDrop(e: DragEvent) {
  e.preventDefault()
  const raw = e.dataTransfer?.getData('text/plain')
  if (!raw) return

  try {
    const data = JSON.parse(raw) as PhotoAsset
    if (data.url) {
      const dropX = Math.round(e.clientX - 340 - 140)
      const dropY = Math.round(e.clientY - 65 - 105)
      store.addPhotoToPdf(data, Math.max(20, dropX), Math.max(100, dropY))
    }
  } catch (err) {
    console.error('PDF drop error', err)
  }
}

function onCanvasDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

function startMove(e: MouseEvent, item: PdfPlacement) {
  e.stopPropagation()
  store.selectedPdfPlacementId = item.id
  activeDrag.value = {
    type: 'move',
    id: item.id,
    startX: e.clientX,
    startY: e.clientY,
    initX: item.x,
    initY: item.y,
    initW: item.width,
    initH: item.height
  }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function startResize(e: MouseEvent, item: PdfPlacement, corner: 'tl' | 'tr' | 'bl' | 'br') {
  e.stopPropagation()
  store.selectedPdfPlacementId = item.id
  activeDrag.value = {
    type: corner === 'br' ? 'resize-br' : 'resize-tl',
    id: item.id,
    startX: e.clientX,
    startY: e.clientY,
    initX: item.x,
    initY: item.y,
    initW: item.width,
    initH: item.height
  }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!activeDrag.value) return
  const { type, id, startX, startY, initX, initY, initW, initH } = activeDrag.value
  const dx = e.clientX - startX
  const dy = e.clientY - startY

  if (type === 'move') {
    store.updatePdfPlacement(id, {
      x: Math.max(10, Math.min(790 - initW, initX + dx)),
      y: Math.max(60, Math.min(1120 - initH, initY + dy))
    })
  } else if (type === 'resize-br') {
    store.updatePdfPlacement(id, {
      width: Math.max(100, initW + dx),
      height: Math.max(80, initH + dy)
    })
  } else if (type === 'resize-tl') {
    const newW = Math.max(100, initW - dx)
    const newH = Math.max(80, initH - dy)
    store.updatePdfPlacement(id, {
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

function bringToFront(id: string) {
  const maxZ = Math.max(...store.pdfPlacements.map(p => p.zIndex), 1)
  store.updatePdfPlacement(id, { zIndex: maxZ + 1 })
}

function sendToBack(id: string) {
  const minZ = Math.min(...store.pdfPlacements.map(p => p.zIndex), 1)
  store.updatePdfPlacement(id, { zIndex: Math.max(1, minZ - 1) })
}
</script>

<template>
  <div class="canvas-viewport" @click="store.selectedPdfPlacementId = null">
    <A4Sheet
      v-if="store.currentPdfTemplate"
      sheet-id="export-sheet-pdf"
      :background="store.currentPdfTemplate.background"
      @dragover="onCanvasDragOver"
      @drop="onCanvasDrop"
    >
      <!-- Header -->
      <template #header>
        <div class="pdf-doc-header">
          <div class="pdf-logo-box">
            <FileText class="pdf-logo-icon" />
          </div>
          <div class="pdf-doc-meta">
            <h1 class="pdf-title">{{ store.currentPdfTemplate.documentTitle }}</h1>
            <p class="pdf-subtitle">{{ store.currentPdfTemplate.documentSubtitle }}</p>
          </div>
          <div class="pdf-doc-badge">PDF DOCUMENT</div>
        </div>
      </template>

      <!-- Suggested Guides -->
      <PdfGuideZone 
        v-for="guide in store.currentPdfTemplate.suggestedSlots" 
        :key="guide.id" 
        :guide="guide" 
      />

      <!-- Placed Photos -->
      <PdfPlacedItem
        v-for="item in store.pdfPlacements"
        :key="item.id"
        :item="item"
        :is-selected="store.selectedPdfPlacementId === item.id"
        @start-move="startMove($event, item)"
        @start-resize="(ev, corner) => startResize(ev, item, corner)"
        @bring-front="bringToFront(item.id)"
        @send-back="sendToBack(item.id)"
        @remove="store.removePdfPlacement(item.id)"
      />

      <!-- Text Layer -->
      <TextLayer />

      <!-- Footer -->
      <template #footer>
        <div class="pdf-doc-footer">
          <span>© 2026 TDOU PhotoStudio • Trang 1/1 • Đính kèm phụ lục hiện trường</span>
          <span>Mã xác thực: #PDF-VERIFIED-2026</span>
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
  padding: 32px 16px;
  overflow-y: auto;
  height: calc(100vh - 65px);
  background: #eae6e1;
}

.pdf-doc-header {
  position: absolute;
  top: 30px;
  left: 50px;
  right: 50px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 2px solid #e8e3dd;
}

.pdf-logo-box {
  width: 44px;
  height: 44px;
  background: #fdfbf7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3d3833;
  border: 1px solid #e8e3dd;
}

.pdf-logo-icon {
  width: 24px;
  height: 24px;
}

.pdf-doc-meta {
  flex: 1;
}

.pdf-title {
  font-size: 15px;
  font-weight: 800;
  color: #3d3833;
  margin: 0;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.pdf-subtitle {
  font-size: 11px;
  color: #8a837b;
  margin: 3px 0 0;
  font-weight: 500;
}

.pdf-doc-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  background: #fdfbf7;
  color: #c48a8a;
  border: 1px solid #c48a8a;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.pdf-doc-footer {
  position: absolute;
  bottom: 24px;
  left: 50px;
  right: 50px;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 500;
  color: #8a837b;
  border-top: 1px solid #e8e3dd;
  padding-top: 12px;
}
</style>
