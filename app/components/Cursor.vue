<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Line {
  x: number
  y: number
  length: number
  angle: number
  opacity: number
  life: number
  speed: number
}

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  lineCount: {
    type: Number,
    default: 3
  },
  maxLength: {
    type: Number,
    default: 40
  },
  lineLife: {
    type: Number,
    default: 800
  }
})

const cursorX = ref(0)
const cursorY = ref(0)
const cursorVisible = ref(false)
const isHovering = ref(false)
const lines = ref<Line[]>([])
const animationFrameId = ref(0)

// Mouse hareket tracking
const updateCursorPosition = (e: MouseEvent) => {
  if (!props.enabled) return
  
  cursorX.value = e.clientX
  cursorY.value = e.clientY
  cursorVisible.value = true

  // Hoverable element kontrolü
  const target = e.target as HTMLElement
  isHovering.value = target.tagName === 'BUTTON' || 
                   target.tagName === 'A' || 
                   target.classList.contains('cursor-hover') ||
                   target.closest('button, a, .cursor-hover') !== null

  // Dekoratif çizgileri oluştur
  if (Math.random() > 0.8) {
    createLine()
  }
}

const hideCursor = () => {
  cursorVisible.value = false
}

// Dinamik çizgi oluştur
const createLine = () => {
  const angles = [0, 45, 90, 135] // Geometrik açılar
  const angle = angles[Math.floor(Math.random() * angles.length)] || 0
  
  const line: Line = {
    x: cursorX.value + (Math.random() - 0.5) * 30,
    y: cursorY.value + (Math.random() - 0.5) * 30,
    length: Math.random() * props.maxLength + 10,
    angle,
    opacity: 0.6,
    life: props.lineLife,
    speed: Math.random() * 1 + 0.5
  }
  
  lines.value.push(line)
  
  // Maksimum çizgi sayısını kontrol et
  if (lines.value.length > props.lineCount * 3) {
    lines.value = lines.value.slice(-props.lineCount * 2)
  }
}

// Animasyon loop
const animateLines = () => {
  lines.value.forEach((line, index) => {
    line.life -= 16
    line.opacity = (line.life / props.lineLife) * 0.6
    
    // Çizgiyi hareket ettir
    const radians = (line.angle * Math.PI) / 180
    line.x += Math.cos(radians) * line.speed * 0.5
    line.y += Math.sin(radians) * line.speed * 0.5
    
    // Uzunluğu azalt
    line.length *= 0.995
  })
  
  // Yaşam süresi biten çizgileri kaldır
  lines.value = lines.value.filter(line => line.life > 0 && line.length > 2)
  
  animationFrameId.value = requestAnimationFrame(animateLines)
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', updateCursorPosition)
    window.addEventListener('mouseleave', hideCursor)
    animationFrameId.value = requestAnimationFrame(animateLines)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('mousemove', updateCursorPosition)
    window.removeEventListener('mouseleave', hideCursor)
    cancelAnimationFrame(animationFrameId.value)
  }
})

// Ana cursor stili
const mainCursorStyle = computed(() => {
  if (!props.enabled || !cursorVisible.value) {
    return { display: 'none' }
  }
  
  const scale = isHovering.value ? 1.2 : 1
  
  return {
    left: `${cursorX.value}px`,
    top: `${cursorY.value}px`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transition: 'transform 0.15s ease'
  }
})

// Çizgi stili
const getLineStyle = (line: Line) => {
  return {
    left: `${line.x}px`,
    top: `${line.y}px`,
    width: `${line.length}px`,
    opacity: line.opacity,
    transform: `translate(-50%, -50%) rotate(${line.angle}deg)`,
    transformOrigin: 'left center'
  }
}
</script>

<template>
  <div v-if="props.enabled" class="cursor-container">
    <!-- Ana cursor -->
    <div class="main-cursor" :style="mainCursorStyle">
      <div class="cursor-dot"></div>
      <div class="cursor-ring" :class="{ 'hover': isHovering }"></div>
    </div>
    
    <!-- Dekoratif çizgiler -->
    <div
      v-for="(line, index) in lines"
      :key="`line-${index}`"
      class="dynamic-line"
      :style="getLineStyle(line)"
    ></div>
  </div>
</template>

<style scoped>
.cursor-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.main-cursor {
  position: absolute;
  pointer-events: none;
  z-index: 10001;
}

.cursor-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: var(--ui-primary);
  border-radius: 50%;
  z-index: 2;
}

.cursor-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 1px solid var(--ui-primary);
  border-radius: 50%;
  opacity: 0.3;
  transition: all 0.15s ease;
  z-index: 1;
}

.cursor-ring.hover {
  width: 30px;
  height: 30px;
  opacity: 0.6;
  border-width: 2px;
}

.dynamic-line {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, 
    var(--ui-primary) 0%, 
    var(--ui-primary) 60%, 
    transparent 100%);
  pointer-events: none;
  z-index: 10000;
  will-change: transform, opacity;
}

/* Performans optimizasyonları */
@media (prefers-reduced-motion: reduce) {
  .cursor-container {
    display: none;
  }
}

/* Mobil cihazlarda gizle */
@media (hover: none) and (pointer: coarse) {
  .cursor-container {
    display: none;
  }
}

/* Dark mode desteği */
.dark .cursor-ring {
  border-color: var(--ui-primary);
}

.dark .cursor-dot {
  background: var(--ui-primary);
}

.dark .dynamic-line {
  background: linear-gradient(90deg, 
    var(--ui-primary) 0%, 
    var(--ui-primary) 60%, 
    transparent 100%);
}
</style>