<script setup lang="ts">
/**
 * HeaderBar.vue — Refactored: layout only, delegates to 3 child components
 */
import BrandLogo from './BrandLogo.vue'
import ModeSwitcher from './ModeSwitcher.vue'
import ExportActions from './ExportActions.vue'

const emit = defineEmits<{
  (e: 'export-pdf'): void
  (e: 'export-png'): void
}>()
</script>

<template>
  <header class="header-root">
    <BrandLogo />
    <ModeSwitcher />
    <ExportActions @export-pdf="emit('export-pdf')" @export-png="emit('export-png')" />
  </header>
</template>

<style scoped>
.header-root {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e8e3dd;
  color: #3d3833;
  z-index: 50;
}
</style>
