<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { usePhotoStudioStore, type CanvasTextItem } from '../../stores/usePhotoStudioStore'
import { 
  Type, 
  Trash2, 
  Bold, 
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  Palette
} from 'lucide-vue-next'

const store = usePhotoStudioStore()

const activeTextList = computed<CanvasTextItem[]>(() => {
  if (store.activeMode === 'photobook') {
    return store.currentPage.texts || []
  }
  return store.canvasTextItems
})

// Dragging State
const activeDragText = ref<{
  id: string
  startX: number
  startY: number
  initX: number
  initY: number
  hasMoved: boolean
} | null>(null)

// Width Resizing State
const activeResizeWidth = ref<{
  id: string
  startX: number
  initWidth: number
} | null>(null)

const editingTextId = ref<string | null>(null)
const textareaRefs = ref<Record<string, HTMLTextAreaElement | null>>({})

function selectText(e: MouseEvent, item: CanvasTextItem) {
  e.stopPropagation()
  store.selectedTextItemId = item.id
}

function startMoveText(e: MouseEvent, item: CanvasTextItem) {
  // If clicking on textarea during editing, don't drag
  if (editingTextId.value === item.id) return

  e.stopPropagation()
  store.selectedTextItemId = item.id
  
  activeDragText.value = {
    id: item.id,
    startX: e.clientX,
    startY: e.clientY,
    initX: item.x,
    initY: item.y,
    hasMoved: false
  }

  window.addEventListener('mousemove', onMouseMoveText)
  window.addEventListener('mouseup', onMouseUpText)
}

function onMouseMoveText(e: MouseEvent) {
  if (!activeDragText.value) return
  const { id, startX, startY, initX, initY } = activeDragText.value
  const dx = e.clientX - startX
  const dy = e.clientY - startY

  // Threshold to avoid accidental drag on simple click
  if (Math.hypot(dx, dy) > 3) {
    activeDragText.value.hasMoved = true
  }

  if (activeDragText.value.hasMoved) {
    const newX = Math.max(10, Math.min(750, initX + dx))
    const newY = Math.max(20, Math.min(1080, initY + dy))
    
    // Update store & item directly
    const item = activeTextList.value.find(t => t.id === id)
    if (item) {
      item.x = newX
      item.y = newY
    }
    store.updateCanvasText(id, { x: newX, y: newY })
  }
}

function onMouseUpText() {
  activeDragText.value = null
  window.removeEventListener('mousemove', onMouseMoveText)
  window.removeEventListener('mouseup', onMouseUpText)
}

// Width Resizing
function startResizeWidth(e: MouseEvent, item: CanvasTextItem) {
  e.stopPropagation()
  activeResizeWidth.value = {
    id: item.id,
    startX: e.clientX,
    initWidth: item.width || 450
  }
  window.addEventListener('mousemove', onMouseMoveWidth)
  window.addEventListener('mouseup', onMouseUpWidth)
}

function onMouseMoveWidth(e: MouseEvent) {
  if (!activeResizeWidth.value) return
  const { id, startX, initWidth } = activeResizeWidth.value
  const dx = e.clientX - startX
  const newWidth = Math.max(160, Math.min(720, initWidth + dx))

  const item = activeTextList.value.find(t => t.id === id)
  if (item) {
    item.width = newWidth
  }
  store.updateCanvasText(id, { width: newWidth })
}

function onMouseUpWidth() {
  activeResizeWidth.value = null
  window.removeEventListener('mousemove', onMouseMoveWidth)
  window.removeEventListener('mouseup', onMouseUpWidth)
}

// Start Editing
function startEditing(item: CanvasTextItem) {
  editingTextId.value = item.id
  store.selectedTextItemId = item.id
  nextTick(() => {
    const el = textareaRefs.value[item.id]
    if (el) {
      el.focus()
      el.select()
      autoResizeTextarea(el)
    }
  })
}

function autoResizeTextarea(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function stopEditing() {
  editingTextId.value = null
}

// Format Actions
function toggleBold(item: CanvasTextItem) {
  const newWeight = item.fontWeight === 'bold' || item.fontWeight === '700' ? 'normal' : 'bold'
  item.fontWeight = newWeight
  store.updateCanvasText(item.id, { fontWeight: newWeight })
}

function toggleItalic(item: CanvasTextItem) {
  const newStyle = item.fontStyle === 'italic' ? 'normal' : 'italic'
  item.fontStyle = newStyle
  store.updateCanvasText(item.id, { fontStyle: newStyle })
}

function setAlignment(item: CanvasTextItem, align: 'left' | 'center' | 'right') {
  item.textAlign = align
  store.updateCanvasText(item.id, { textAlign: align })
}

function changeFontSize(item: CanvasTextItem, delta: number) {
  const newSize = Math.max(10, Math.min(60, item.fontSize + delta))
  item.fontSize = newSize
  store.updateCanvasText(item.id, { fontSize: newSize })
}

function changeColor(item: CanvasTextItem, color: string) {
  item.color = color
  store.updateCanvasText(item.id, { color })
}
</script>

<template>
  <div class="text-layer-root" @click="store.selectedTextItemId = null; stopEditing()">
    <div
      v-for="item in activeTextList"
      :key="item.id"
      class="canvas-text-box"
      :class="{ 
        'is-selected': store.selectedTextItemId === item.id,
        'is-editing': editingTextId === item.id
      }"
      :style="{
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: item.width ? `${item.width}px` : '450px',
        zIndex: item.zIndex,
        fontSize: `${item.fontSize}px`,
        color: item.color,
        fontWeight: item.fontWeight,
        fontStyle: item.fontStyle || 'normal',
        textAlign: item.textAlign || 'left'
      }"
      @click.stop="selectText($event, item)"
      @mousedown="startMoveText($event, item)"
      @dblclick.stop="startEditing(item)"
    >
      <!-- Multi-line Auto-expanding Textarea when editing -->
      <textarea
        v-if="editingTextId === item.id"
        :ref="(el) => textareaRefs[item.id] = el as HTMLTextAreaElement"
        v-model="item.text"
        class="inline-textarea-editor"
        :style="{
          fontSize: `${item.fontSize}px`,
          color: item.color,
          fontWeight: item.fontWeight,
          fontStyle: item.fontStyle || 'normal',
          textAlign: item.textAlign || 'left'
        }"
        rows="1"
        @input="autoResizeTextarea($event.target as HTMLTextAreaElement)"
        @blur="stopEditing"
        @keydown.esc="stopEditing"
        @mousedown.stop
      ></textarea>

      <!-- Static rendered text content -->
      <div 
        v-else 
        class="rendered-text-content"
        :style="{ textAlign: item.textAlign || 'left' }"
      >
        {{ item.text || 'Nhấp đúp để gõ chữ...' }}
      </div>

      <!-- Selected State Handles -->
      <template v-if="store.selectedTextItemId === item.id">
        <!-- Move Icon Badge -->
        <div class="text-move-handle" title="Kéo để di chuyển vị trí">
          <Move class="mini-handle-icon" />
        </div>

        <!-- Width Resize Handle (Right edge) -->
        <div 
          class="text-width-resize-handle" 
          @mousedown.stop="startResizeWidth($event, item)"
          title="Kéo sang hai bên để co giãn độ rộng khung chữ"
        ></div>

        <!-- Floating Formatting Toolbar (Adaptive Top/Bottom position) -->
        <div 
          class="text-action-bar"
          :class="{ 'position-below': item.y < 50 }"
          @mousedown.stop
          @click.stop
        >
          <!-- Font Size Adjustment -->
          <div class="toolbar-group">
            <button class="t-btn" @click.stop="changeFontSize(item, -2)" title="Giảm cỡ chữ">A-</button>
            <span class="size-indicator">{{ item.fontSize }}px</span>
            <button class="t-btn" @click.stop="changeFontSize(item, 2)" title="Tăng cỡ chữ">A+</button>
          </div>

          <div class="toolbar-sep"></div>

          <!-- Bold & Italic -->
          <div class="toolbar-group">
            <button 
              class="t-btn" 
              :class="{ active: item.fontWeight === 'bold' || item.fontWeight === '700' }"
              @click.stop="toggleBold(item)"
              title="In đậm (Bold)"
            >
              <Bold class="t-icon" />
            </button>

            <button 
              class="t-btn" 
              :class="{ active: item.fontStyle === 'italic' }"
              @click.stop="toggleItalic(item)"
              title="In nghiêng (Italic)"
            >
              <Italic class="t-icon" />
            </button>
          </div>

          <div class="toolbar-sep"></div>

          <!-- Text Alignments -->
          <div class="toolbar-group">
            <button 
              class="t-btn" 
              :class="{ active: !item.textAlign || item.textAlign === 'left' }"
              @click.stop="setAlignment(item, 'left')"
              title="Căn trái"
            >
              <AlignLeft class="t-icon" />
            </button>
            <button 
              class="t-btn" 
              :class="{ active: item.textAlign === 'center' }"
              @click.stop="setAlignment(item, 'center')"
              title="Căn giữa"
            >
              <AlignCenter class="t-icon" />
            </button>
            <button 
              class="t-btn" 
              :class="{ active: item.textAlign === 'right' }"
              @click.stop="setAlignment(item, 'right')"
              title="Căn phải"
            >
              <AlignRight class="t-icon" />
            </button>
          </div>

          <div class="toolbar-sep"></div>

          <!-- Color Dots Swatches -->
          <div class="color-palette-dots">
            <span class="c-dot black" :class="{ sel: item.color === '#0f172a' }" @click.stop="changeColor(item, '#0f172a')" title="Đen"></span>
            <span class="c-dot white" :class="{ sel: item.color === '#ffffff' }" @click.stop="changeColor(item, '#ffffff')" title="Trắng"></span>
            <span class="c-dot blue" :class="{ sel: item.color === '#2563eb' }" @click.stop="changeColor(item, '#2563eb')" title="Xanh dương"></span>
            <span class="c-dot red" :class="{ sel: item.color === '#dc2626' }" @click.stop="changeColor(item, '#dc2626')" title="Đỏ"></span>
            <span class="c-dot gold" :class="{ sel: item.color === '#d97706' }" @click.stop="changeColor(item, '#d97706')" title="Vàng đồng"></span>
            <span class="c-dot purple" :class="{ sel: item.color === '#7c3aed' }" @click.stop="changeColor(item, '#7c3aed')" title="Tím"></span>
            
            <!-- Custom Color Picker Icon -->
            <label class="custom-color-btn" title="Chọn màu chữ tự do">
              <input 
                type="color" 
                :value="item.color" 
                class="hidden-color-input" 
                @input="changeColor(item, ($event.target as HTMLInputElement).value)" 
              />
              <Palette class="palette-icon" />
            </label>
          </div>

          <div class="toolbar-sep"></div>

          <!-- Delete Action -->
          <button class="t-btn danger" @click.stop="store.removeCanvasText(item.id)" title="Xóa chữ">
            <Trash2 class="t-icon" />
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.text-layer-root {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 40;
}

.canvas-text-box {
  position: absolute;
  pointer-events: auto;
  cursor: default;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1.5px dashed transparent;
  user-select: none;
  box-sizing: border-box;
  line-height: 1.5;
  background: transparent;
  transition: border-color 0.15s, background-color 0.15s;
}

.canvas-text-box:hover {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(255, 255, 255, 0.15);
}

.canvas-text-box.is-selected {
  border: 1.5px solid #3b82f6;
  background: rgba(239, 246, 255, 0.35);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.canvas-text-box.is-editing {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border: 1.5px solid #3b82f6;
}

.rendered-text-content {
  width: 100%;
  white-space: pre-wrap;
  word-break: break-word;
  user-select: text;
}

.inline-textarea-editor {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  padding: 0;
  margin: 0;
  display: block;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Move Handle Badge */
.text-move-handle {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 50;
}

.mini-handle-icon {
  width: 12px;
  height: 12px;
}

/* Width Resize Handle on Right Edge */
.text-width-resize-handle {
  position: absolute;
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
  width: 8px;
  height: 24px;
  background: #3b82f6;
  border-radius: 4px;
  cursor: ew-resize;
  z-index: 50;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* Floating Adaptive Toolbar */
.text-action-bar {
  position: absolute;
  top: -46px;
  left: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #0f172a;
  padding: 5px 8px;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
  z-index: 100;
  user-select: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
  white-space: nowrap;
}

.text-action-bar.position-below {
  top: auto;
  bottom: -46px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-sep {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 4px;
}

.t-btn {
  padding: 4px 6px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 5px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  min-width: 24px;
  height: 24px;
}

.t-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.t-btn.active {
  background: #3b82f6;
  color: #ffffff;
}

.t-btn.danger:hover {
  background: #ef4444;
  color: #ffffff;
}

.t-icon {
  width: 13px;
  height: 13px;
}

.size-indicator {
  font-size: 11px;
  font-weight: 700;
  color: #cbd5e1;
  padding: 0 4px;
  min-width: 32px;
  text-align: center;
  font-family: monospace;
}

/* Color Dots */
.color-palette-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 2px;
}

.c-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  cursor: pointer;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.15s;
}

.c-dot:hover {
  transform: scale(1.2);
}

.c-dot.black { background: #0f172a; }
.c-dot.white { background: #ffffff; }
.c-dot.blue { background: #2563eb; }
.c-dot.red { background: #dc2626; }
.c-dot.gold { background: #d97706; }
.c-dot.purple { background: #7c3aed; }

.c-dot.sel {
  transform: scale(1.3);
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.6);
}

.custom-color-btn {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 2px;
  overflow: hidden;
}

.custom-color-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.hidden-color-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.palette-icon {
  width: 12px;
  height: 12px;
  color: #cbd5e1;
}
</style>
