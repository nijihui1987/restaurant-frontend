<template>
  <div class="before-after" ref="containerRef" @mousedown.prevent="startDrag" @touchstart.prevent="startDrag" @click.stop="handleClick">
    <div class="image-container">
      <img :src="afterImage" class="image after-image" alt="After" />
      <div class="image before-container" :style="{ clipPath: `inset(0 ${100 - position}% 0 0)` }">
        <img :src="beforeImage" class="image before-image" alt="Before" />
      </div>
    </div>
    <div class="slider-handle" :style="{ left: `${position}%` }">
      <div class="handle-line">
        <div class="handle-arrow handle-arrow-top">‹</div>
        <div class="handle-arrow handle-arrow-bottom">›</div>
      </div>
    </div>
    <div class="label before-label">处理前</div>
    <div class="label after-label">处理后</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  beforeImage: string
  afterImage: string
}>(), {
  beforeImage: 'https://picsum.photos/seed/before/400/300',
  afterImage: 'https://picsum.photos/seed/after/400/300'
})

const containerRef = ref<HTMLElement | null>(null)
const position = ref(50)
const isDragging = ref(false)

function updatePosition(clientX: number) {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = clientX - rect.left
  const percent = (x / rect.width) * 100
  position.value = Math.max(0, Math.min(100, percent))
}

function startDrag(e: MouseEvent | TouchEvent) {
  e.stopPropagation()
  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  updatePosition(clientX)
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  updatePosition(clientX)
}

function stopDrag() {
  isDragging.value = false
}

function handleClick(e: Event) {
  e.stopPropagation()
}

onMounted(() => {
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.before-after {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--radius-lg);
  cursor: ew-resize;
  user-select: none;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.before-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.before-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slider-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 24px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: ew-resize;
}

.handle-line {
  position: relative;
  width: 2px;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}

.handle-arrow {
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, color 0.2s ease;
}

.handle-arrow-top {
  top: 50%;
  transform: translateY(-100%) translateY(-16px);
}

.handle-arrow-bottom {
  bottom: 50%;
  transform: translateY(100%) translateY(16px);
}

.slider-handle:hover .handle-arrow {
  color: #333;
}

.slider-handle:hover .handle-arrow-top {
  transform: translateY(-100%) translateY(-16px) scale(1.1);
}

.slider-handle:hover .handle-arrow-bottom {
  transform: translateY(100%) translateY(16px) scale(1.1);
}

.label {
  position: absolute;
  bottom: 12px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  font-size: 12px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.before-label {
  left: 12px;
}

.after-label {
  right: 12px;
}
</style>
