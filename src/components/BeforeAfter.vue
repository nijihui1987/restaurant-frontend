<template>
  <div class="before-after" ref="containerRef" @mousemove="onHover" @mouseleave="onLeave">
    <div class="image-container">
      <img :src="afterImage" class="image after-image" alt="After" />
      <div class="image before-container" :style="{ clipPath: beforeClipPath }">
        <img :src="beforeImage" class="image before-image" alt="Before" />
      </div>
    </div>
    <div class="slider-handle">
      <div class="handle-line" :style="{ left: `${position}%` }"></div>
    </div>
    <div class="label before-label">处理前</div>
    <div class="label after-label">处理后</div>
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
const angle = 15 // 斜线角度

// 计算斜线切割的裁剪路径
const beforeClipPath = computed(() => {
  const p = position.value
  // 斜线从左下到右上的交点
  const yAt0 = 50 + p * 0.268  // 在x=0处的y
  const yAt100 = 50 - (100 - p) * 0.268  // 在x=100处的y

  // 裁剪区域：沿着左边缘向下到yAt0，斜切到右下，再回到左上
  return `polygon(0% ${yAt0}%, 100% ${yAt100}%, 100% 0%, 0% 0%)`
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
  left: 0;
  right: 0;
  z-index: 10;
  pointer-events: none;
}

.handle-line {
  position: absolute;
  top: -10%;
  bottom: -10%;
  width: 2px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
  transform: rotate(15deg);
  left: 50%;
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
