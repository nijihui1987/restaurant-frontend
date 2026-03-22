<template>
  <div class="before-after" ref="containerRef" @mousemove="onHover" @mouseleave="onLeave">
    <div class="image-wrapper">
      <div class="image-container before">
        <img :src="beforeImage" class="image" alt="Before" />
        <div class="overlay" :style="{ clipPath: `inset(0 0 0 ${position}%)` }"></div>
      </div>
      <div class="image-container after">
        <img :src="afterImage" class="image" alt="After" />
        <div class="overlay" :style="{ clipPath: `inset(0 ${100 - position}% 0 0)` }"></div>
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
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  beforeImage: string
  afterImage: string
}>(), {
  beforeImage: 'https://picsum.photos/seed/before/400/300',
  afterImage: 'https://picsum.photos/seed/after/400/300'
})

const containerRef = ref<HTMLElement | null>(null)
const position = ref(50)

function updatePosition(clientX: number) {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = clientX - rect.left
  const percent = (x / rect.width) * 100
  position.value = Math.max(0, Math.min(100, percent))
}

function onHover(e: MouseEvent) {
  updatePosition(e.clientX)
}

function onLeave() {
  position.value = 50
}
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

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-container.before {
  z-index: 1;
}

.image-container.after {
  z-index: 2;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 使用背景色遮挡 */
}

.image-container.before .overlay {
  background: linear-gradient(90deg, transparent 0%, transparent 98%, rgba(255,255,255,0.1) 100%);
}

.image-container.after .overlay {
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 2%, transparent 100%);
}

.slider-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.handle-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  transform: rotate(15deg);
  transform-origin: center center;
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
