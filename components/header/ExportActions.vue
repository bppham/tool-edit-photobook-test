<script setup lang="ts">
/**
 * ExportActions.vue — Nhập PDF, Xem 3D, Xóa hết, Xuất PNG, Xuất PDF
 */
import { usePhotoStudioStore } from '../../stores/usePhotoStudioStore'
import { 
  RotateCcw, 
  Image as ImageIcon, 
  Download, 
  FileUp, 
  BookOpen 
} from 'lucide-vue-next'

const store = usePhotoStudioStore()

const emit = defineEmits<{
  (e: 'export-pdf'): void
  (e: 'export-png'): void
}>()

function onReset() {
  if (store.activeMode === 'photobook' || store.activeMode === 'svg') {
    store.clearSvgAssignments()
  } else {
    store.clearPdfPlacements()
  }
}
</script>

<template>
  <div class="actions-group">
    <!-- PDF Import Button -->
    <button class="action-btn import-pdf-btn" @click="store.isPdfImportModalOpen = true" title="Nhập file PDF từ máy tính">
      <FileUp class="action-icon" />
      <span>Nhập PDF</span>
    </button>

    <!-- 3D Flipbook Trigger -->
    <button 
      class="action-btn flipbook-btn" 
      :class="{ active: store.is3DPreviewMode }"
      @click="store.toggle3DPreview" 
      title="Xem lật sách Photobook 3D"
    >
      <BookOpen class="action-icon" />
      <span>Lật Sách 3D</span>
    </button>

    <div class="divider-v"></div>

    <button class="action-btn secondary" @click="onReset" title="Đặt lại ảnh trang hiện tại">
      <RotateCcw class="action-icon" />
      <span>Xóa hết</span>
    </button>

    <button class="action-btn outline" @click="emit('export-png')" title="Xuất file ảnh PNG">
      <ImageIcon class="action-icon" />
      <span>Xuất PNG</span>
    </button>

    <button class="action-btn primary" @click="emit('export-pdf')" title="Xuất file tài liệu PDF toàn bộ trang">
      <Download class="action-icon" />
      <span>Xuất PDF</span>
    </button>
  </div>
</template>

<style scoped>
.actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.import-pdf-btn {
  background: #fdfbf7;
  border: 1px solid #7c8bb5;
  color: #7c8bb5;
}

.import-pdf-btn:hover {
  background: #7c8bb5;
  color: #ffffff;
}

.flipbook-btn {
  background: #fdfbf7;
  border: 1px solid #c9a96e;
  color: #c9a96e;
}

.flipbook-btn:hover,
.flipbook-btn.active {
  background: #c9a96e;
  color: #ffffff;
  border-color: #c9a96e;
}

.divider-v {
  width: 1px;
  height: 22px;
  background: #e8e3dd;
  margin: 0 2px;
}

.action-btn.secondary {
  background: transparent;
  border: 1px solid #e8e3dd;
  color: #8a837b;
}

.action-btn.secondary:hover {
  background: #c48a8a;
  color: #ffffff;
  border-color: #c48a8a;
}

.action-btn.outline {
  background: transparent;
  border: 1px solid #e8e3dd;
  color: #3d3833;
}

.action-btn.outline:hover {
  background: #f3f0ec;
  border-color: #d8caba;
}

.action-btn.primary {
  background: #7bb596;
  border: none;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(123, 181, 150, 0.3);
}

.action-btn.primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.action-icon {
  width: 14px;
  height: 14px;
}
</style>
