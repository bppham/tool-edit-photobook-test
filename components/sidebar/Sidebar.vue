<script setup lang="ts">
/**
 * Sidebar.vue — Layout shell importing sidebar child components
 */
import TemplatePicker from './TemplatePicker.vue'
import QuickActions from './QuickActions.vue'
import PaperSizeSelector from './PaperSizeSelector.vue'
import BackgroundColorPicker from './BackgroundColorPicker.vue'
import PhotoGallery from './PhotoGallery.vue'
</script>

<template>
  <aside class="sidebar-root">
    <TemplatePicker />
    <QuickActions />
    <PaperSizeSelector />
    <BackgroundColorPicker />
    <PhotoGallery />
  </aside>
</template>

<style scoped>
.sidebar-root {
  width: 340px;
  background: #f3f0ec;
  border-right: 1px solid #e8e3dd;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  height: calc(100vh - 65px);
  overflow-y: auto;
}
</style>
