<script setup lang="ts">
/**
 * TemplatePicker.vue — Danh sách template SVG để chọn
 */
import { usePhotoStudioStore } from '../../stores/usePhotoStudioStore'
import { Layers, FileUp } from 'lucide-vue-next'

const store = usePhotoStudioStore()
</script>

<template>
  <div v-if="store.activeMode === 'svg'" class="panel-card">
    <div class="panel-header">
      <Layers class="panel-icon" />
      <span class="panel-title">Mẫu Bố Cục (SVG Template)</span>
    </div>

    <div class="template-selector-list">
      <button 
        v-for="tpl in store.svgTemplates" 
        :key="tpl.id"
        class="template-card-btn"
        :class="{ active: store.selectedSvgTemplateId === tpl.id }"
        @click="store.selectSvgTemplate(tpl.id)"
      >
        <div class="tpl-info">
          <div class="tpl-name">{{ tpl.name }}</div>
          <div class="tpl-desc">{{ tpl.slots.length }} khung ảnh • Tự động căn tỷ lệ</div>
        </div>
        <span v-if="store.selectedSvgTemplateId === tpl.id" class="tpl-active-badge">Đang chọn</span>
      </button>

      <NuxtLink to="/import" class="import-tpl-link">
        <FileUp class="btn-icon" />
        <span>+ Import File Template (.json)</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.panel-card {
  background: #ffffff;
  border: 1px solid #e8e3dd;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.template-selector-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-card-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  background: #faf8f5;
  border: 1px solid #e8e3dd;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card-btn:hover {
  background: #f3f0ec;
  border-color: #d8caba;
}

.template-card-btn.active {
  background: #f0f4f8;
  border-color: #7c8bb5;
}

.tpl-name {
  font-size: 13px;
  font-weight: 600;
  color: #3d3833;
}

.tpl-desc {
  font-size: 11px;
  color: #8a837b;
  margin-top: 2px;
}

.tpl-active-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  background: #7c8bb5;
  color: #ffffff;
}

.import-tpl-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px;
  border-radius: 10px;
  border: 1px dashed #7c8bb5;
  background: #f0f4f8;
  color: #7c8bb5;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-top: 4px;
}

.import-tpl-link:hover {
  background: #7c8bb5;
  color: #ffffff;
}

.btn-icon {
  width: 14px;
  height: 14px;
}
</style>
