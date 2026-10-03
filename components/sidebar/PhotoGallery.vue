<script setup lang="ts">
/**
 * PhotoGallery.vue — Upload + grid ảnh kho
 */
import { ref } from 'vue'
import { usePhotoStudioStore, type PhotoAsset } from '../../stores/usePhotoStudioStore'
import { UploadCloud, Image as ImageIcon } from 'lucide-vue-next'

const store = usePhotoStudioStore()
const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerUpload() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    store.addUploadedFiles(target.files)
    target.value = ''
  }
}

function handleDragStart(e: DragEvent, image: PhotoAsset) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', JSON.stringify(image))
    e.dataTransfer.effectAllowed = 'copy'
  }
}

function onImageClick(image: PhotoAsset) {
  if (store.activeMode === 'pdf') {
    store.addPhotoToPdf(image)
  }
}
</script>

<template>
  <div class="panel-card flex-1-card">
    <!-- Hidden native file input -->
    <input 
      ref="fileInputRef" 
      type="file" 
      multiple 
      accept="image/*" 
      class="hidden-input" 
      @change="handleFileChange" 
    />

    <div class="gallery-header">
      <div class="panel-header">
        <ImageIcon class="panel-icon" />
        <span class="panel-title">Kho Ảnh ({{ store.allAvailableImages.length }})</span>
      </div>

      <button class="upload-btn" @click="triggerUpload">
        <UploadCloud class="upload-icon" />
        <span>Tải Thêm</span>
      </button>
    </div>

    <div class="gallery-scrollable">
      <div 
        v-for="img in store.allAvailableImages" 
        :key="img.id"
        class="photo-thumb-card"
        draggable="true"
        @dragstart="handleDragStart($event, img)"
        @click="onImageClick(img)"
        title="Kéo thả hoặc click để áp dụng"
      >
        <div class="img-wrapper">
          <img :src="img.url" :alt="img.name" loading="lazy" />
          <span class="aspect-badge">{{ img.aspectRatio || 'img' }}</span>
        </div>
        <div class="img-details">
          <span class="img-name">{{ img.name }}</span>
          <span class="img-cat">{{ img.category || 'Mẫu' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hidden-input {
  display: none;
}

.panel-card {
  background: #ffffff;
  border: 1px solid #e8e3dd;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flex-1-card {
  flex: 1;
  min-height: 250px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-icon {
  width: 16px;
  height: 16px;
  color: #8a837b;
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: #3d3833;
  letter-spacing: -0.01em;
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: #f0f4f8;
  border: 1px solid #7c8bb5;
  color: #7c8bb5;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background: #7c8bb5;
  color: #ffffff;
}

.upload-icon {
  width: 14px;
  height: 14px;
}

.gallery-scrollable {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  overflow-y: auto;
  padding-right: 4px;
  max-height: 380px;
}

.photo-thumb-card {
  background: #faf8f5;
  border: 1px solid #e8e3dd;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  transition: all 0.2s ease;
}

.photo-thumb-card:hover {
  border-color: #7c8bb5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.photo-thumb-card:active {
  cursor: grabbing;
}

.img-wrapper {
  position: relative;
  width: 100%;
  height: 85px;
  background: #e8e3dd;
}

.img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.aspect-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  color: #ffffff;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 4px;
  text-transform: uppercase;
}

.img-details {
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
}

.img-name {
  font-size: 11px;
  font-weight: 600;
  color: #3d3833;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.img-cat {
  font-size: 9px;
  color: #8a837b;
}
</style>
