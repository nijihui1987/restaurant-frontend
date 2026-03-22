<template>
  <div class="before-after" ref="containerRef" @mousedown.prevent="startDrag" @touchstart.prevent="startDrag" @click.stop="handleClick">
    <div class="image-container">
      <img :src="afterImage" class="image after-image" alt="After" />
      <div class="image before-container" :style="{ clipPath: `inset(0 ${100 - position}% 0 0)` }">
        <img :src="beforeImage" class="image before-image" alt="Before" />
      </div>
    </div>
    <div class="slider-handle" :style="{ left: `${position}%` }">
      <div class="handle-line"></div>
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
  width: 3px;
  transform: translateX(-50%);
  z-index: 10;
  cursor: ew-resize;
}

.handle-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.35);
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
