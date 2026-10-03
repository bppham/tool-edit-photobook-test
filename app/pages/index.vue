<script setup lang="ts">
import { ref } from 'vue'
import { usePhotoStudioStore } from '../../stores/usePhotoStudioStore'
import { toPng, toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'
import HeaderBar from '../../components/header/HeaderBar.vue'
import Sidebar from '../../components/sidebar/Sidebar.vue'
import SvgCanvas from '../../components/canvas/SvgCanvas.vue'
import PdfCanvas from '../../components/canvas/PdfCanvas.vue'
import BuilderCanvas from '../../components/canvas/BuilderCanvas.vue'
import PageThumbnailBar from '../../components/multipage/PageThumbnailBar.vue'
import BookViewer3D from '../../components/flipbook/BookViewer3D.vue'
import PdfImportModal from '../../components/importer/PdfImportModal.vue'

const store = usePhotoStudioStore()
const isProcessing = ref(false)
const toastMessage = ref<string | null>(null)

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = null
  }, 3500)
}

async function handleExportPng() {
  const targetId = store.activeMode === 'pdf' ? 'export-sheet-pdf' : 'export-sheet-svg'
  const node = document.getElementById(targetId)
  if (!node) return

  try {
    isProcessing.value = true
    showToast('Đang tạo file ảnh PNG chất lượng cao 300 DPI...')
    
    const dataUrl = await toPng(node, {
      quality: 0.95,
      pixelRatio: 2
    })

    const link = document.createElement('a')
    link.download = `PhotoFlow-Page-${store.activePageIndex + 1}-${Date.now()}.png`
    link.href = dataUrl
    link.click()

    showToast('Xuất ảnh PNG thành công!')
  } catch (err) {
    console.error('Export PNG failed', err)
    showToast('Lỗi khi xuất ảnh PNG')
  } finally {
    isProcessing.value = false
  }
}

async function handleExportPdf() {
  try {
    isProcessing.value = true

    if (store.activeMode === 'photobook') {
      showToast(`Đang khởi tạo tài liệu PDF ${store.totalPages} trang...`)
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const originalPageIndex = store.activePageIndex

      for (let i = 0; i < store.pages.length; i++) {
        store.setPageIndex(i)
        await new Promise((resolve) => setTimeout(resolve, 250))

        const node = document.getElementById('export-sheet-svg')
        if (node) {
          const dataUrl = await toJpeg(node, {
            quality: 0.95,
            pixelRatio: 2
          })

          if (i > 0) {
            pdf.addPage('a4', 'portrait')
          }

          const imgProps = pdf.getImageProperties(dataUrl)
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

          pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight)
        }
      }

      store.setPageIndex(originalPageIndex)
      pdf.save(`PhotoFlow-Photobook-${store.totalPages}Pages-${Date.now()}.pdf`)
      showToast(`Đã xuất trọn bộ ${store.totalPages} trang PDF thành công!`)

    } else {
      const targetId = store.activeMode === 'pdf' ? 'export-sheet-pdf' : 'export-sheet-svg'
      const node = document.getElementById(targetId)
      if (!node) return

      showToast('Đang tạo file PDF in ấn...')

      const dataUrl = await toJpeg(node, {
        quality: 0.95,
        pixelRatio: 2
      })

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgProps = pdf.getImageProperties(dataUrl)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`PhotoFlow-SinglePage-${Date.now()}.pdf`)

      showToast('Xuất file PDF thành công!')
    }
  } catch (err) {
    console.error('Export PDF failed', err)
    showToast('Lỗi khi tạo file PDF')
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="app-layout">
    <!-- Top Header Navigation -->
    <HeaderBar 
      @export-png="handleExportPng" 
      @export-pdf="handleExportPdf" 
    />

    <!-- Main Workspace (Sidebar + Canvas Viewport + Bottom Multi-Page Bar) -->
    <main class="studio-workspace">
      <Sidebar />

      <div class="center-stage-column">
        <SvgCanvas v-if="store.activeMode === 'photobook' || store.activeMode === 'svg'" />
        <PdfCanvas v-else-if="store.activeMode === 'pdf'" />
        <BuilderCanvas 
          v-else 
          @template-saved="(name) => showToast(`Đã lưu và chuyển sang template '${name}'!`)" 
        />

        <!-- Multi-page Page Thumbnail Navigation Bar -->
        <PageThumbnailBar v-if="store.activeMode === 'photobook'" />
      </div>
    </main>

    <!-- 3D Flipbook Interactive Overlay -->
    <Transition name="fade-scale">
      <BookViewer3D 
        v-if="store.is3DPreviewMode" 
        @export-pdf="handleExportPdf"
      />
    </Transition>

    <!-- PDF File Import Modal -->
    <Transition name="fade-scale">
      <PdfImportModal v-if="store.isPdfImportModalOpen" />
    </Transition>

    <!-- Global Toast Notification -->
    <Transition name="toast-fade">
      <div v-if="toastMessage" class="toast-notification">
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<style>
/* Global Resets and Modern Typography */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #faf8f5;
  color: #3d3833;
  overflow: hidden;
  height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #faf8f5;
  overflow: hidden;
}

.studio-workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.center-stage-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.toast-notification {
  position: fixed;
  bottom: 110px;
  right: 24px;
  background: #ffffff;
  border: 1px solid #e8e3dd;
  color: #3d3833;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  font-size: 13px;
  font-weight: 600;
  z-index: 9999;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #e8e3dd;
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d8caba;
}
</style>
