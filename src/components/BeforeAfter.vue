<template>
  <div class="before-after" ref="containerRef" @mousemove="onHover" @mouseleave="onLeave">
    <!-- Before 图片 (底层) -->
    <div class="layer before">
      <img :src="beforeImage" alt="Before" />
    </div>
    <!-- After 图片 (上层，通过宽度控制显示范围) -->
    <div class="layer after" :style="{ width: `${position}%` }">
      <img :src="afterImage" alt="After" />
    </div>
    <!-- 滑块线 -->
    <div class="slider" :style="{ left: `${position}%` }">
      <div class="slider-line"></div>
    </div>
    <!-- 标签 -->
    <span class="label before-label">处理前</span>
    <span class="label after-label">处理后</span>
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

.layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.layer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.layer.before {
  z-index: 1;
}

.layer.after {
  z-index: 2;
  width: 50%;
  overflow: hidden;
}

.layer.after img {
  width: calc(100% / var(--reveal-width, 0.5));
}

.slider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  margin-left: -20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.slider-line {
  width: 2px;
  height: 100%;
  background: white;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
}

.label {
  position: absolute;
  bottom: 12px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
  z-index: 20;
}

.before-label {
  left: 12px;
}

.after-label {
  right: 12px;
}
</style>
