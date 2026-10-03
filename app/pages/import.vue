<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePhotoStudioStore } from '../../stores/usePhotoStudioStore'
import { 
  FileCode, 
  Upload, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  Sparkles,
  Layers,
  FileType
} from 'lucide-vue-next'

const router = useRouter()
const store = usePhotoStudioStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const jsonContent = ref<string>('')
const parsedTemplate = ref<any | null>(null)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const fileTypeDetected = ref<'json' | 'svg' | null>(null)

function triggerSelect() {
  fileInputRef.value?.click()
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  processFile(file)
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    processFile(file)
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

function processFile(file: File) {
  errorMessage.value = null
  successMessage.value = null
  fileTypeDetected.value = null

  if (file.name.endsWith('.json')) {
    fileTypeDetected.value = 'json'
    readJsonFile(file)
  } else if (file.name.endsWith('.svg')) {
    fileTypeDetected.value = 'svg'
    readSvgFile(file)
  } else {
    errorMessage.value = 'Vui lòng chọn file định dạng .json hoặc .svg hợp lệ!'
  }
}

function readJsonFile(file: File) {
  const reader = new FileReader()
  reader.onload = (evt) => {
    try {
      const text = evt.target?.result as string
      jsonContent.value = text
      const parsed = JSON.parse(text)

      if (!parsed.slots || !Array.isArray(parsed.slots)) {
        errorMessage.value = 'File JSON thiếu thông tin danh sách khung ảnh (`slots`)!'
        parsedTemplate.value = null
        return
      }

      parsedTemplate.value = parsed
      successMessage.value = `Đọc thành công file JSON template "${parsed.name || 'Tùy Chỉnh'}" với ${parsed.slots.length} khung ảnh.`
    } catch (err: any) {
      errorMessage.value = `File JSON không hợp lệ: ${err.message}`
      parsedTemplate.value = null
    }
  }
  reader.readAsText(file)
}

function readSvgFile(file: File) {
  const reader = new FileReader()
  reader.onload = (evt) => {
    try {
      const text = evt.target?.result as string
      const parsed = parseSvgString(text, file.name)
      parsedTemplate.value = parsed
      successMessage.value = `Đã phân tích (parse) thành công file SVG Adobe "${parsed.name}" với ${parsed.slots.length} khung ảnh!`
    } catch (err: any) {
      errorMessage.value = err.message || 'Lỗi khi đọc file SVG'
      parsedTemplate.value = null
    }
  }
  reader.readAsText(file)
}

function parseSvgString(svgText: string, fileName: string) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')
  const svgEl = doc.querySelector('svg')
  if (!svgEl) {
    throw new Error('Không tìm thấy thẻ <svg> trong file!')
  }

  let width = 800
  let height = 1130
  const viewBox = svgEl.getAttribute('viewBox')
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts[2] && parts[3]) {
      width = parts[2]
      height = parts[3]
    }
  } else {
    const w = parseFloat(svgEl.getAttribute('width') || '')
    const h = parseFloat(svgEl.getAttribute('height') || '')
    if (w) width = w
    if (h) height = h
  }

  // Find candidate slots
  let elements = Array.from(doc.querySelectorAll('[id*="slot"], [id*="frame"], [id*="photo"], [id*="box"]'))
  if (elements.length === 0) {
    elements = Array.from(doc.querySelectorAll('rect')).filter(rect => {
      const w = parseFloat(rect.getAttribute('width') || '0')
      const h = parseFloat(rect.getAttribute('height') || '0')
      return w > 50 && h > 50 && (w < width - 10 || h < height - 10)
    })
  }

  const slots: any[] = []
  elements.forEach((el, index) => {
    const tagName = el.tagName.toLowerCase()
    let x = 0, y = 0, w = 200, h = 200, rx = 12

    if (tagName === 'rect') {
      x = parseFloat(el.getAttribute('x') || '0')
      y = parseFloat(el.getAttribute('y') || '0')
      w = parseFloat(el.getAttribute('width') || '200')
      h = parseFloat(el.getAttribute('height') || '200')
      rx = parseFloat(el.getAttribute('rx') || '12')
    } else if (tagName === 'circle') {
      const cx = parseFloat(el.getAttribute('cx') || '100')
      const cy = parseFloat(el.getAttribute('cy') || '100')
      const r = parseFloat(el.getAttribute('r') || '100')
      x = cx - r
      y = cy - r
      w = r * 2
      h = r * 2
      rx = r
    }

    slots.push({
      id: el.getAttribute('id') || `svg-slot-${index + 1}`,
      name: el.getAttribute('id') || `Khung Ảnh ${index + 1}`,
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(w),
      height: Math.round(h),
      borderRadius: Math.round(rx),
      label: `ẢNH ${index + 1}`
    })
  })

  if (slots.length === 0) {
    throw new Error('Không tìm thấy khung ảnh nào trong file SVG. Vui lòng đặt tên Layer chứa chữ "slot" hoặc "frame" trên Adobe Illustrator!')
  }

  return {
    id: `adobe-svg-${Date.now()}`,
    name: fileName.replace('.svg', '') || 'Adobe Illustrator Template',
    description: `Mẫu xuất từ Adobe/Figma (${slots.length} khung ảnh)`,
    type: 'svg',
    width: Math.round(width),
    height: Math.round(height),
    background: '#faf8f5',
    headerTitle: fileName.replace('.svg', '').toUpperCase(),
    slots
  }
}

function confirmImport() {
  if (!parsedTemplate.value) return
  store.importTemplateJson(parsedTemplate.value)
  router.push('/')
}

function downloadSampleJson() {
  const sample = {
    id: `sample-template-${Date.now()}`,
    name: 'Sample 3-Grid Pastel Template',
    description: 'Mẫu Template JSON 3 khung ảnh',
    type: 'svg',
    width: 800,
    height: 1130,
    background: '#faf8f5',
    headerTitle: 'SAMPLE PHOTOBOOK',
    slots: [
      {
        id: 'slot-1',
        name: 'Khung Trên',
        x: 40,
        y: 100,
        width: 720,
        height: 480,
        borderRadius: 16,
        label: 'ẢNH CHÍNH'
      },
      {
        id: 'slot-2',
        name: 'Khung Trái',
        x: 40,
        y: 600,
        width: 345,
        height: 430,
        borderRadius: 16,
        label: 'ẢNH 1'
      },
      {
        id: 'slot-3',
        name: 'Khung Phải',
        x: 415,
        y: 600,
        width: 345,
        height: 430,
        borderRadius: 16,
        label: 'ẢNH 2'
      }
    ]
  }

  const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'sample-photobook-template.json'
  link.click()
}

function downloadSampleSvg() {
  const sampleSvg = `<svg viewBox="0 0 800 1130" xmlns="http://www.w3.org/2000/svg">
  <!-- Adobe Illustrator Export Example -->
  <rect width="800" height="1130" fill="#faf8f5"/>
  <text x="50" y="75" font-size="22" font-weight="bold" fill="#3d3833" font-family="sans-serif">ADOBE DESIGNER COLLECTION 2026</text>
  
  <!-- Frame 1 (Adobe Layer name: slot-header) -->
  <rect id="slot-header" x="50" y="110" width="700" height="460" rx="16" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>

  <!-- Frame 2 (Adobe Layer name: slot-left) -->
  <rect id="slot-left" x="50" y="600" width="335" height="420" rx="14" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>

  <!-- Frame 3 (Adobe Layer name: slot-right) -->
  <rect id="slot-right" x="415" y="600" width="335" height="420" rx="14" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
</svg>`

  const blob = new Blob([sampleSvg], { type: 'image/svg+xml' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'adobe-designer-template.svg'
  link.click()
}
</script>

<template>
  <div class="import-page-root">
    <!-- Header bar -->
    <header class="import-header">
      <div class="header-left">
        <button class="back-btn" @click="router.push('/')" title="Quay lại Studio">
          <ArrowLeft class="btn-icon" />
          <span>Về Studio</span>
        </button>
        <div class="header-title-group">
          <FileCode class="header-icon" />
          <h2>Import Template (File .JSON hoặc .SVG Adobe)</h2>
        </div>
      </div>

      <div class="header-actions">
        <button class="sample-btn" @click="downloadSampleSvg" title="Tải file SVG Adobe mẫu để test">
          <FileType class="btn-icon" />
          <span>Tải File SVG Mẫu (Adobe)</span>
        </button>
        <button class="sample-btn" @click="downloadSampleJson" title="Tải file JSON mẫu">
          <Download class="btn-icon" />
          <span>Tải File JSON Mẫu</span>
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="import-body">
      <div class="import-card">
        <div class="card-title-section">
          <h3>Tải Lên Template Của Bạn</h3>
          <p>Hỗ trợ file cấu trúc <b>.JSON</b> hoặc file vector <b>.SVG xuất từ Adobe Illustrator / Figma</b></p>
        </div>

        <!-- Hidden input -->
        <input 
          ref="fileInputRef" 
          type="file" 
          accept=".json,.svg,application/json,image/svg+xml" 
          class="hidden-input"
          @change="handleFileSelect"
        />

        <!-- Dropzone -->
        <div 
          class="dropzone" 
          @click="triggerSelect"
          @dragover="handleDragOver"
          @drop="handleDrop"
        >
          <div class="dropzone-content">
            <div class="icon-circle">
              <Upload class="upload-icon" />
            </div>
            <span class="drop-text">Kéo thả file .JSON hoặc .SVG (Adobe) vào đây hoặc nhấp để chọn</span>
            <span class="drop-sub">Tự động bóc tách tọa độ khung ảnh (ID: slot-*, frame-*)</span>
          </div>
        </div>

        <!-- Error & Success Banners -->
        <div v-if="errorMessage" class="banner error-banner">
          <AlertCircle class="banner-icon" />
          <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="banner success-banner">
          <CheckCircle2 class="banner-icon" />
          <span>{{ successMessage }}</span>
        </div>

        <!-- Parsed Template Preview Card -->
        <div v-if="parsedTemplate" class="template-preview-box">
          <div class="preview-header">
            <Sparkles class="sparkle-icon" />
            <span class="preview-title">Xem Trước Template</span>
            <span v-if="fileTypeDetected" class="file-type-tag">{{ fileTypeDetected.toUpperCase() }}</span>
          </div>

          <div class="preview-details">
            <div class="detail-item">
              <span class="label">Tên Template:</span>
              <span class="value">{{ parsedTemplate.name || 'Chưa đặt tên' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Kích Thước:</span>
              <span class="value">{{ parsedTemplate.width || 800 }} × {{ parsedTemplate.height || 1130 }} px</span>
            </div>
            <div class="detail-item">
              <span class="label">Số Khung Ảnh Tìm Thấy:</span>
              <span class="value badge">{{ parsedTemplate.slots.length }} Slots</span>
            </div>
          </div>

          <!-- Mini slots preview -->
          <div class="mini-slots-layout">
            <div 
              v-for="slot in parsedTemplate.slots" 
              :key="slot.id" 
              class="mini-slot"
            >
              <span>{{ slot.label || slot.name }}</span>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="card-footer">
          <button class="cancel-btn" @click="router.push('/')">Hủy Bỏ</button>
          <button 
            class="import-submit-btn" 
            :disabled="!parsedTemplate"
            @click="confirmImport"
          >
            <span>Nhập Template Vào Studio</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.import-page-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #faf8f5;
  color: #3d3833;
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
}

.import-header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e8e3dd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background: #f0f4f8;
  border: 1px solid #7c8bb5;
  color: #7c8bb5;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #7c8bb5;
  color: #ffffff;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  width: 22px;
  height: 22px;
  color: #7c8bb5;
}

.header-title-group h2 {
  font-size: 16px;
  font-weight: 800;
  color: #3d3833;
}

.sample-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background: #faf8f5;
  border: 1px solid #e8e3dd;
  color: #3d3833;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sample-btn:hover {
  background: #f3f0ec;
  border-color: #d8caba;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.import-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  overflow-y: auto;
}

.import-card {
  width: 620px;
  background: #ffffff;
  border: 1px solid #e8e3dd;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-title-section h3 {
  font-size: 18px;
  font-weight: 800;
  color: #3d3833;
}

.card-title-section p {
  font-size: 12px;
  color: #8a837b;
  margin-top: 4px;
}

.hidden-input {
  display: none;
}

.dropzone {
  border: 2px dashed #7c8bb5;
  background: #faf8f5;
  border-radius: 12px;
  padding: 36px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropzone:hover {
  background: #f0f4f8;
  border-color: #6474a3;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #f0f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.upload-icon {
  width: 24px;
  height: 24px;
  color: #7c8bb5;
}

.drop-text {
  font-size: 13px;
  font-weight: 700;
  color: #3d3833;
}

.drop-sub {
  font-size: 11px;
  color: #8a837b;
}

.banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.error-banner {
  background: rgba(196, 138, 138, 0.15);
  border: 1px solid rgba(196, 138, 138, 0.3);
  color: #c48a8a;
}

.success-banner {
  background: rgba(123, 181, 150, 0.15);
  border: 1px solid rgba(123, 181, 150, 0.3);
  color: #4f8564;
}

.banner-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.template-preview-box {
  background: #faf8f5;
  border: 1px solid #e8e3dd;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #7c8bb5;
}

.file-type-tag {
  margin-left: auto;
  font-size: 10px;
  font-weight: 800;
  background: #7c8bb5;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
}

.sparkle-icon {
  width: 16px;
  height: 16px;
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.detail-item .label {
  color: #8a837b;
}

.detail-item .value {
  font-weight: 700;
  color: #3d3833;
}

.detail-item .badge {
  background: #7c8bb5;
  color: #ffffff;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.mini-slots-layout {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px dashed #e8e3dd;
}

.mini-slot {
  background: #ffffff;
  border: 1px solid #e8e3dd;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  color: #8a837b;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e3dd;
}

.cancel-btn {
  padding: 9px 18px;
  border-radius: 8px;
  border: 1px solid #e8e3dd;
  background: transparent;
  color: #8a837b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #faf8f5;
  color: #3d3833;
}

.import-submit-btn {
  padding: 9px 20px;
  border-radius: 8px;
  border: none;
  background: #7c8bb5;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(124, 139, 181, 0.2);
}

.import-submit-btn:hover:not(:disabled) {
  background: #6474a3;
}

.import-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
