<script setup lang="ts">
/**
 * BrandLogo.vue — Logo gradient + tiêu đề "PhotoFlow Studio"
 */
import { Sparkles } from 'lucide-vue-next'
</script>

<template>
  <div class="brand-group">
    <div class="brand-badge">
      <Sparkles class="brand-icon" />
    </div>
    <div>
      <div class="brand-title">PhotoFlow Studio</div>
      <div class="brand-sub">Auto-Fill & PDF Layout Engine</div>
    </div>
  </div>
</template>

<style scoped>
.brand-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #a4b2d3, #d3b4cc, #b5d5d8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.brand-icon {
  width: 22px;
  height: 22px;
  color: #ffffff;
}

.brand-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #3d3833;
}

.brand-sub {
  font-size: 11px;
  color: #8a837b;
  font-weight: 500;
}
</style>
