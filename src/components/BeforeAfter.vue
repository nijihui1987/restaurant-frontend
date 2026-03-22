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
      <div class="handle-circle">
        <div class="handle-grip">
          <span></span>
          <span></span>
        </div>
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
  width: 3px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.handle-line {
  position: absolute;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: linear-gradient(180deg, transparent, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent);
  border-radius: 1px;
}

.handle-circle {
  position: relative;
  width: 32px;
  height: 32px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  cursor: ew-resize;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.handle-circle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.handle-grip {
  display: flex;
  gap: 3px;
}

.handle-grip span {
  width: 2px;
  height: 12px;
  background: #d0d0d0;
  border-radius: 1px;
  transition: background 0.2s;
}

.handle-circle:hover .handle-grip span {
  background: #a0a0a0;
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
