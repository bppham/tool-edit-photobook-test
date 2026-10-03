<script setup lang="ts">
import { ref } from 'vue'
import { usePhotoStudioStore } from '../../stores/usePhotoStudioStore'
import { 
  FileUp, 
  X, 
  Loader2, 
  CheckCircle2, 
  FileText,
  AlertCircle,
  Lightbulb
} from 'lucide-vue-next'

const store = usePhotoStudioStore()
const fileInputRef = ref<HTMLInputElement | null>(null)
const isParsing = ref<boolean>(false)
const progressStatus = ref<string>('')
const errorMessage = ref<string | null>(null)

function triggerSelect() {
  fileInputRef.value?.click()
}

async function handlePdfFile(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    errorMessage.value = 'Vui lòng chọn file có định dạng .pdf hợp lệ!'
    return
  }

  try {
    isParsing.value = true
    errorMessage.value = null
    progressStatus.value = 'Đang tải thư viện xử lý PDF...'

    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set standard worker CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    progressStatus.value = 'Đang đọc cấu trúc tài liệu PDF...'
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdfDoc = await loadingTask.promise

    const numPages = pdfDoc.numPages
    progressStatus.value = `Tìm thấy ${numPages} trang. Đang trích xuất hình ảnh chất lượng cao...`

    const pageImages: string[] = []

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      progressStatus.value = `Đang xử lý trang ${pageNum} / ${numPages}...`
      const page = await pdfDoc.getPage(pageNum)
      
      // Render at 2x resolution for ultra-sharp quality
      const viewport = page.getViewport({ scale: 2.0 })
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        canvas.width = viewport.width
        canvas.height = viewport.height

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        }

        await page.render(renderContext).promise
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
        pageImages.push(dataUrl)
      }
    }

    progressStatus.value = `Hoàn tất! Đang tạo ${pageImages.length} trang Photobook...`
    
    // Import into store
    store.importPdfPages(pageImages)

    setTimeout(() => {
      isParsing.value = false
      store.isPdfImportModalOpen = false
    }, 500)

  } catch (err: any) {
    console.error('PDF parsing error', err)
    errorMessage.value = `Không thể đọc file PDF: ${err.message || 'Lỗi không xác định'}`
    isParsing.value = false
  }
}
</script>

<template>
  <div class="pdf-modal-backdrop" @click.self="store.isPdfImportModalOpen = false">
    <div class="pdf-modal-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-info">
          <div class="icon-circle">
            <FileUp class="modal-icon" />
          </div>
          <div>
            <h3 class="modal-title">Nhập File PDF Vào Photobook</h3>
            <p class="modal-sub">Trích xuất tự động tất cả các trang thành cuốn Album lật 3D</p>
          </div>
        </div>

        <button class="close-btn" @click="store.isPdfImportModalOpen = false">
          <X class="close-icon" />
        </button>
      </div>

      <!-- Hidden Input -->
      <input 
        ref="fileInputRef" 
        type="file" 
        accept="application/pdf,.pdf" 
        class="hidden-file-input" 
        @change="handlePdfFile"
      />

      <!-- Dropzone / Upload Area -->
      <div v-if="!isParsing" class="modal-dropzone" @click="triggerSelect">
        <div class="dropzone-inner">
          <div class="pulse-icon-box">
            <FileText class="big-pdf-icon" />
          </div>
          <span class="drop-title">Nhấp để chọn file PDF từ máy tính</span>
          <span class="drop-hint">Hỗ trợ file PDF từ 1 đến 50 trang • Tự động trích xuất chuẩn 300 DPI</span>
          
          <button class="select-file-btn" @click.stop="triggerSelect">
            <span>Chọn File PDF</span>
          </button>
        </div>
      </div>

      <!-- Loading / Parsing Progress -->
      <div v-else class="parsing-progress-box">
        <Loader2 class="spinner-icon" />
        <span class="progress-title">Đang xử lý tài liệu PDF</span>
        <span class="progress-sub">{{ progressStatus }}</span>
        <div class="animated-progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>

      <!-- Error message if any -->
      <div v-if="errorMessage" class="error-banner">
        <AlertCircle class="err-icon" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <span class="footer-note"><Lightbulb class="inline-icon" /> Sau khi nhập, bạn có thể chỉnh sửa, thêm ảnh và lật sách 3D như bình thường.</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdf-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  user-select: none;
}

.pdf-modal-card {
  width: 520px;
  background: #ffffff;
  border: 1px solid #e8e3dd;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #e8e3dd;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f0f4f8;
  border: 1px solid #7c8bb5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon {
  width: 20px;
  height: 20px;
  color: #7c8bb5;
}

.modal-title {
  font-size: 15px;
  font-weight: 700;
  color: #3d3833;
}

.modal-sub {
  font-size: 11px;
  color: #8a837b;
  margin-top: 2px;
}

.close-btn {
  background: transparent;
  border: none;
  color: #8a837b;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #f3f0ec;
  color: #3d3833;
}

.close-icon {
  width: 20px;
  height: 20px;
}

.hidden-file-input {
  display: none;
}

.modal-dropzone {
  padding: 32px 24px;
  cursor: pointer;
}

.dropzone-inner {
  border: 2px dashed #7c8bb5;
  border-radius: 12px;
  background: #faf8f5;
  padding: 36px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  transition: all 0.2s ease;
}

.dropzone-inner:hover {
  border-color: #6474a3;
  background: #f0f4f8;
}

.pulse-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #e8e3dd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.big-pdf-icon {
  width: 28px;
  height: 28px;
  color: #7c8bb5;
}

.drop-title {
  font-size: 14px;
  font-weight: 700;
  color: #3d3833;
}

.drop-hint {
  font-size: 11px;
  color: #8a837b;
}

.select-file-btn {
  margin-top: 12px;
  padding: 8px 18px;
  border-radius: 8px;
  background: #7c8bb5;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(124, 139, 181, 0.2);
}

/* Progress indicator */
.parsing-progress-box {
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.spinner-icon {
  width: 36px;
  height: 36px;
  color: #7c8bb5;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.progress-title {
  font-size: 15px;
  font-weight: 700;
  color: #3d3833;
}

.progress-sub {
  font-size: 12px;
  color: #8a837b;
}

.animated-progress-bar {
  width: 280px;
  height: 6px;
  background: #e8e3dd;
  border-radius: 999px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, #7c8bb5, #6474a3);
  border-radius: 999px;
  animation: progress-indeterminate 1.5s infinite ease-in-out;
}

@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.error-banner {
  margin: 0 24px 16px;
  padding: 10px 14px;
  background: rgba(196, 138, 138, 0.15);
  border: 1px solid rgba(196, 138, 138, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c48a8a;
  font-size: 12px;
}

.err-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.modal-footer {
  padding: 12px 24px;
  background: #faf8f5;
  border-top: 1px solid #e8e3dd;
}

.footer-note {
  font-size: 11px;
  color: #8a837b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.inline-icon {
  width: 14px;
  height: 14px;
  color: #c9a96e;
}
</style>
