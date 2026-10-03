<script setup lang="ts">
import { usePhotoStudioStore, PAPER_SIZE_PRESETS, type PaperSizeFormat } from '../../stores/usePhotoStudioStore'
import { Plus, Save, Ratio } from 'lucide-vue-next'

const store = usePhotoStudioStore()

const emit = defineEmits<{
  (e: 'save'): void
}>()
</script>

<template>
  <div 
    class="builder-floating-bar" 
    :style="{ maxWidth: `${Math.max(800, store.canvasWidth)}px` }"
    @click.stop
  >
    <div class="bar-left">
      <input 
        v-model="store.builderTitle" 
        type="text" 
        class="title-input" 
        placeholder="Tên tiêu đề trên trang..." 
      />

      <!-- Quick Paper Size Dropdown -->
      <div class="size-select-box">
        <Ratio class="size-icon" />
        <select 
          :value="store.paperFormat" 
          class="size-dropdown"
          @change="store.setPaperSize(($event.target as HTMLSelectElement).value as PaperSizeFormat)"
        >
          <option 
            v-for="preset in PAPER_SIZE_PRESETS" 
            :key="preset.id" 
            :value="preset.id"
          >
            {{ preset.name }} ({{ preset.width }}×{{ preset.height }})
          </option>
        </select>
      </div>
    </div>

    <div class="bar-right">
      <button class="bar-btn add-btn" @click="store.addNewBuilderSlot">
        <Plus class="btn-icon" />
        <span>Thêm Khung ({{ store.builderSlots.length }})</span>
      </button>

      <button class="bar-btn save-btn" @click="emit('save')">
        <Save class="btn-icon" />
        <span>Lưu & Dùng Ngay</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.builder-floating-bar {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e8e3dd;
  padding: 8px 14px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  z-index: 30;
  gap: 12px;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.title-input {
  background: #faf8f5;
  border: 1px solid #e8e3dd;
  color: #3d3833;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  width: 200px;
  outline: none;
}

.title-input:focus {
  border-color: #7c8bb5;
}

.size-select-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #faf8f5;
  border: 1px solid #e8e3dd;
  padding: 4px 8px;
  border-radius: 8px;
}

.size-icon {
  width: 14px;
  height: 14px;
  color: #7c8bb5;
}

.size-dropdown {
  background: transparent;
  border: none;
  color: #3d3833;
  font-size: 11px;
  font-weight: 700;
  outline: none;
  cursor: pointer;
}

.size-dropdown option {
  background: #ffffff;
  color: #3d3833;
}

.bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.add-btn {
  background: #f0f4f8;
  border: 1px solid #7c8bb5;
  color: #7c8bb5;
}

.add-btn:hover {
  background: #7c8bb5;
  color: #ffffff;
}

.save-btn {
  background: #7bb596;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(123, 181, 150, 0.3);
}

.save-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-icon {
  width: 14px;
  height: 14px;
}
</style>
