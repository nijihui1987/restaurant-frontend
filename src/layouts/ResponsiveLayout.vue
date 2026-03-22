<template>
  <component :is="LayoutComponent" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MobileLayout from './MobileLayout.vue'
import UserLayout from './UserLayout.vue'

const isMobile = ref(false)

const LayoutComponent = computed(() => {
  return isMobile.value ? MobileLayout : UserLayout
})

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>
