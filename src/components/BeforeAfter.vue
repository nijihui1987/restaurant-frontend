<template>
  <div class="before-after" ref="containerRef" @mousemove="onHover" @mouseleave="onLeave">
    <!-- Before 图片 - 显示斜线左侧 -->
    <div class="layer before">
      <img :src="beforeImage" alt="Before" :style="{ clipPath: beforeClip }" />
    </div>
    <!-- After 图片 - 显示斜线右侧 -->
    <div class="layer after">
      <img :src="afterImage" alt="After" :style="{ clipPath: afterClip }" />
    </div>
    <!-- 滑块 -->
    <div class="slider" :style="{ left: `${position}%` }">
      <div class="slider-line"></div>
    </div>
    <!-- 标签 -->
    <span class="label before-label">处理前</span>
    <span class="label after-label">处理后</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  beforeImage: string
  afterImage: string
}>(), {
  beforeImage: 'https://picsum.photos/seed/before/400/300',
  afterImage: 'https://picsum.photos/seed/after/400/300'
})

const containerRef = ref<HTMLElement | null>(null)
const position = ref(50)
const angleDeg = 15
const angleRad = (angleDeg * Math.PI) / 180

// 计算斜线裁剪
const beforeClip = computed(() => {
  const p = position.value
  // 斜线方程: y = tan(angle) * (x - p) + 50
  // 在 x=0 时: y = 50 - p * tan(angle)
  // 在 x=100 时: y = 50 + (100-p) * tan(angle)
  const y0 = 50 - p * Math.tan(angleRad)
  const y1 = 50 + (100 - p) * Math.tan(angleRad)

  // Before 图片: 显示斜线左下方的区域
  return `polygon(0% ${y0}%, 0% 100%, 100% 100%, 100% ${y1}%)`
})

const afterClip = computed(() => {
  const p = position.value
  const y0 = 50 - p * Math.tan(angleRad)
  const y1 = 50 + (100 - p) * Math.tan(angleRad)

  // After 图片: 显示斜线右上方的区域
  return `polygon(0% 0%, 0% ${y0}%, 100% ${y1}%, 100% 0%)`
})

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
}

.slider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  z-index: 10;
  pointer-events: none;
}

.slider-line {
  position: absolute;
  top: -10%;
  bottom: -10%;
  left: 50%;
  width: 2px;
  margin-left: -1px;
  background: white;
  box-shadow: 0 0 12px rgba(0,0,0,0.4);
  transform: rotate(var(--angle, 15deg));
  transform-origin: center center;
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
