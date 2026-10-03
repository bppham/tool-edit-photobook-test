<script setup lang="ts">
import { usePhotoStudioStore } from '../../stores/usePhotoStudioStore'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  BookOpen, 
  Sparkles,
  Layers,
  FileDown
} from 'lucide-vue-next'

const store = usePhotoStudioStore()
</script>

<template>
  <div class="page-thumb-bar-root">
    <!-- Left: Navigation & Page Info -->
    <div class="bar-section left-section">
      <div class="page-counter-badge">
        <Layers class="mini-icon" />
        <span>Trang {{ store.activePageIndex + 1 }} / {{ store.totalPages }}</span>
      </div>

      <div class="page-arrows-group">
        <button 
          class="arrow-btn" 
          :disabled="store.activePageIndex === 0"
          @click="store.prevPage" 
          title="Trang trước (Phím ←)"
        >
          <ChevronLeft class="arrow-icon" />
        </button>

        <button 
          class="arrow-btn" 
          :disabled="store.activePageIndex === store.totalPages - 1"
          @click="store.nextPage" 
          title="Trang kế (Phím →)"
        >
          <ChevronRight class="arrow-icon" />
        </button>
      </div>
    </div>

    <!-- Center: Horizontal Scrollable List of 8 Page Thumbnails -->
    <div class="thumbnails-track">
      <div
        v-for="(page, idx) in store.pages"
        :key="page.id"
        class="thumb-item"
        :class="{
          'is-active': store.activePageIndex === idx,
          'is-cover': page.type === 'cover' || page.type === 'back'
        }"
        @click="store.setPageIndex(idx)"
      >
        <!-- Mini preview card of the page -->
        <div class="mini-page-sheet" :style="{ background: page.background }">
          <!-- Background image if PDF imported -->
          <img v-if="page.backgroundImage" :src="page.backgroundImage" class="mini-bg-img" />

          <!-- Render mini boxes for slots -->
          <div class="mini-slots-preview">
            <div
              v-for="slot in page.slots"
              :key="slot.id"
              class="mini-slot-box"
              :class="{ 'has-image': !!page.assignments?.[slot.id] }"
            >
              <img 
                v-if="page.assignments?.[slot.id]" 
                :src="page.assignments[slot.id].imageUrl" 
                class="mini-slot-img" 
              />
            </div>
          </div>

          <!-- Page Type Badge -->
          <span class="mini-page-tag" :class="page.type">
            {{ page.type === 'cover' ? 'BÌA TRƯỚC' : page.type === 'back' ? 'BÌA SAU' : `P.${idx + 1}` }}
          </span>
        </div>

        <div class="thumb-meta">
          <span class="thumb-title">{{ page.title }}</span>
          <span class="thumb-slot-count">
            {{ Object.keys(page.assignments || {}).length }}/{{ page.slots.length }} ảnh
          </span>
        </div>
      </div>
    </div>

    <!-- Right: Multi-page Actions -->
    <div class="bar-section right-section">
      <button 
        class="thumb-action-btn fill-all-btn" 
        @click="store.autoFillAllPages" 
        title="Tự động chia đều và điền ảnh vào toàn bộ 8 trang"
      >
        <Sparkles class="btn-icon" />
        <span>Điền Cả {{ store.totalPages }} Trang</span>
      </button>

      <button 
        class="thumb-action-btn add-page-btn" 
        @click="store.addNewPage" 
        title="Thêm trang mới"
      >
        <Plus class="btn-icon" />
        <span>Thêm</span>
      </button>

      <button 
        v-if="store.totalPages > 1"
        class="thumb-action-btn delete-page-btn" 
        @click="store.removePage(store.activePageIndex)" 
        title="Xóa trang hiện tại"
      >
        <Trash2 class="btn-icon" />
      </button>

      <div class="divider-vertical"></div>

      <!-- 3D Flipbook Viewer Trigger -->
      <button 
        class="thumb-action-btn flipbook-trigger-btn" 
        @click="store.toggle3DPreview"
      >
        <BookOpen class="btn-icon" />
        <span>Xem Lật Sách 3D</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.page-thumb-bar-root {
  height: 96px;
  background: #ffffff;
  border-top: 1px solid #e8e3dd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  gap: 12px;
  z-index: 60;
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.05);
  user-select: none;
}

.bar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-counter-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #faf8f5;
  border: 1px solid #e8e3dd;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #3d3833;
  white-space: nowrap;
}

.mini-icon {
  width: 14px;
  height: 14px;
  color: #7c8bb5;
}

.page-arrows-group {
  display: flex;
  gap: 4px;
}

.arrow-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f0f4f8;
  border: 1px solid #7c8bb5;
  color: #7c8bb5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.arrow-btn:hover:not(:disabled) {
  background: #7c8bb5;
  border-color: #7c8bb5;
  color: #ffffff;
}

.arrow-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.arrow-icon {
  width: 16px;
  height: 16px;
}

/* Horizontal track of thumbnail cards */
.thumbnails-track {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 4px;
  flex: 1;
  max-width: calc(100vw - 460px);
}

.thumbnails-track::-webkit-scrollbar {
  height: 4px;
}

.thumbnails-track::-webkit-scrollbar-thumb {
  background: #e8e3dd;
  border-radius: 999px;
}

.thumb-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.thumb-item:hover {
  background: #f3f0ec;
}

.thumb-item.is-active {
  background: #f0f4f8;
}

.mini-page-sheet {
  position: relative;
  width: 48px;
  height: 64px;
  border-radius: 4px;
  border: 1.5px solid #e8e3dd;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.thumb-item:hover .mini-page-sheet {
  transform: translateY(-2px);
}

.thumb-item.is-active .mini-page-sheet {
  border-color: #7c8bb5;
  box-shadow: 0 0 0 2px #7c8bb5, 0 6px 14px rgba(124, 139, 181, 0.2);
  transform: translateY(-3px);
}

.mini-bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
}

.mini-slots-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  padding: 4px;
}

.mini-slot-box {
  background: rgba(0, 0, 0, 0.04);
  border: 0.5px dashed rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.mini-slot-box.has-image {
  border: none;
}

.mini-slot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-page-tag {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 7px;
  font-weight: 800;
  padding: 1px 3px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.85);
  color: #3d3833;
  border: 1px solid #e8e3dd;
  white-space: nowrap;
}

.mini-page-tag.cover {
  background: #7c8bb5;
  color: #ffffff;
  border-color: #7c8bb5;
}

.mini-page-tag.back {
  background: #fdfbf7;
  border: 0.5px solid #8a837b;
  color: #3d3833;
}

.thumb-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.thumb-title {
  font-size: 10px;
  font-weight: 600;
  color: #3d3833;
  max-width: 68px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thumb-slot-count {
  font-size: 9px;
  color: #8a837b;
}

/* Right Buttons */
.thumb-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.fill-all-btn {
  background: #7c8bb5;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(124, 139, 181, 0.2);
}

.fill-all-btn:hover {
  background: #6474a3;
  transform: translateY(-1px);
}

.add-page-btn {
  background: #fdfbf7;
  border: 1px solid #e8e3dd;
  color: #3d3833;
}

.add-page-btn:hover {
  background: #f3f0ec;
}

.delete-page-btn {
  background: transparent;
  border: 1px solid #e8e3dd;
  color: #8a837b;
  padding: 8px 10px;
}

.delete-page-btn:hover {
  background: #c48a8a;
  color: #ffffff;
  border-color: #c48a8a;
}

.divider-vertical {
  width: 1px;
  height: 28px;
  background: #e8e3dd;
  margin: 0 2px;
}

.flipbook-trigger-btn {
  background: #c9a96e;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(201, 169, 110, 0.35);
  animation: pulse-glow 2.5s infinite;
}

.flipbook-trigger-btn:hover {
  background: #b8985f;
  transform: translateY(-1px);
}

.btn-icon {
  width: 14px;
  height: 14px;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 4px 14px rgba(201, 169, 110, 0.35);
  }
  50% {
    box-shadow: 0 4px 22px rgba(201, 169, 110, 0.55);
  }
}
</style>
