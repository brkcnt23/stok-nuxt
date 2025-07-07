<script setup lang="ts">
interface FloatingElement {
  x: number
  y: number
  size: number
  delay: number
  opacity: number
  rotation: number
  shape: 'fabric' | 'triangle' | 'diamond' | 'wave'
}

const props = withDefaults(defineProps<{
  elementCount?: number
  primaryColor?: string
  secondaryColor?: string
  speed?: 'slow' | 'normal' | 'fast'
  size?: { min: number, max: number }
  theme?: 'fabric' | 'geometric' | 'mixed'
}>(), {
  elementCount: 15,
  primaryColor: 'var(--ui-primary)',
  secondaryColor: 'var(--ui-secondary)',
  speed: 'normal',
  size: () => ({
    min: 20,
    max: 120
  }),
  theme: 'mixed'
})

// Define shapes based on theme
const getShapeDistribution = (theme: string) => {
  switch (theme) {
    case 'fabric':
      return ['fabric', 'wave', 'fabric', 'wave']
    case 'geometric':
      return ['triangle', 'diamond', 'triangle', 'diamond']
    case 'mixed':
    default:
      return ['fabric', 'triangle', 'diamond', 'wave']
  }
}

// Generate random floating elements
const generateElements = (count: number): FloatingElement[] => {
  const shapes = getShapeDistribution(props.theme)
  return Array.from({ length: count }, () => ({
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 20) + 100,
    size: Math.random() * (props.size.max - props.size.min) + props.size.min,
    delay: Math.random() * 25,
    opacity: Math.random() * 0.3 + 0.1,
    rotation: Math.random() * 360,
    shape: shapes[Math.floor(Math.random() * shapes.length)] as FloatingElement['shape']
  }))
}

// Speed configurations
const speedMap = {
  slow: { duration: 35, opacity: 0.15, ratio: 0.5 },
  normal: { duration: 25, opacity: 0.25, ratio: 0.3 },
  fast: { duration: 18, opacity: 0.35, ratio: 0.2 }
}

// Generate and store elements
const floatingElements = useState<{ slow: FloatingElement[], normal: FloatingElement[], fast: FloatingElement[] }>('awningElements', () => {
  return {
    slow: generateElements(Math.floor(props.elementCount * speedMap.slow.ratio)),
    normal: generateElements(Math.floor(props.elementCount * speedMap.normal.ratio)),
    fast: generateElements(Math.floor(props.elementCount * speedMap.fast.ratio))
  }
})

// Compute element layers
const elementLayers = computed(() => [
  { elements: floatingElements.value.fast, ...speedMap.fast },
  { elements: floatingElements.value.normal, ...speedMap.normal },
  { elements: floatingElements.value.slow, ...speedMap.slow }
])

// Get SVG path for different shapes
const getShapePath = (shape: FloatingElement['shape'], size: number) => {
  const half = size / 2
  switch (shape) {
    case 'fabric':
      // Wavy fabric-like pattern
      return `M0,${half} Q${half/2},0 ${half},${half/4} T${size},${half} Q${size-half/2},${size} ${half},${size*0.75} T0,${half} Z`
    case 'triangle':
      // Triangle pointing up
      return `M${half},0 L${size},${size} L0,${size} Z`
    case 'diamond':
      // Diamond shape
      return `M${half},0 L${size},${half} L${half},${size} L0,${half} Z`
    case 'wave':
      // Wave pattern
      return `M0,${half} Q${half/4},${half/4} ${half/2},${half} T${size},${half} L${size},${size} Q${size-half/4},${size-half/4} ${half/2},${size} T0,${size} Z`
    default:
      return `M0,0 L${size},0 L${size},${size} L0,${size} Z`
  }
}
</script>

<template>
  <div class="fixed pointer-events-none inset-0 overflow-hidden z-0">
    <div class="awning-background size-full absolute inset-0">
      <!-- Subtle gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-transparent via-primary-50/5 to-primary-100/10 dark:from-transparent dark:via-primary-900/5 dark:to-primary-800/10"></div>
      
      <!-- Floating elements -->
      <div v-for="(layer, index) in elementLayers" :key="index" 
           class="element-layer w-full h-full absolute inset-0" 
           :style="{
             '--element-duration': `${layer.duration}s`,
             '--primary-color': primaryColor,
             '--secondary-color': secondaryColor
           }">
        <div v-for="(element, elementIndex) in layer.elements" 
             :key="elementIndex" 
             class="floating-element absolute"
             :style="{
               left: `${element.x}%`,
               bottom: `-${element.y}px`,
               width: `${element.size}px`,
               height: `${element.size}px`,
               opacity: element.opacity,
               animationDelay: `${element.delay}s`,
               animationDuration: `var(--element-duration)`,
               transform: `rotate(${element.rotation}deg)`
             }">
          <svg :width="element.size" :height="element.size" class="w-full h-full">
            <defs>
              <linearGradient :id="`grad-${index}-${elementIndex}`" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :style="`stop-color:var(--primary-color);stop-opacity:0.3`" />
                <stop offset="50%" :style="`stop-color:var(--secondary-color);stop-opacity:0.2`" />
                <stop offset="100%" :style="`stop-color:var(--primary-color);stop-opacity:0.1`" />
              </linearGradient>
              <filter :id="`blur-${index}-${elementIndex}`">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
              </filter>
            </defs>
            <path :d="getShapePath(element.shape, element.size)"
                  :fill="`url(#grad-${index}-${elementIndex})`"
                  :filter="`url(#blur-${index}-${elementIndex})`"
                  class="element-path" />
          </svg>
        </div>
      </div>
      
      <!-- Subtle texture overlay -->
      <div class="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_50%_50%,_var(--ui-primary)_1px,_transparent_1px)] bg-[length:50px_50px]"></div>
    </div>
  </div>
</template>

<style scoped>
.awning-background {
  width: 100%;
  pointer-events: none;
}

.floating-element {
  animation: floatAwningElements linear infinite;
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}

.element-path {
  transition: all 0.3s ease;
}

@keyframes floatAwningElements {
  0% {
    transform: translateY(0) rotate(var(--initial-rotation, 0deg)) scale(1);
    opacity: var(--element-opacity, 0.3);
  }
  
  25% {
    transform: translateY(-25vh) rotate(calc(var(--initial-rotation, 0deg) + 90deg)) scale(1.05);
  }
  
  50% {
    transform: translateY(-50vh) rotate(calc(var(--initial-rotation, 0deg) + 180deg)) scale(1.1);
    opacity: var(--element-opacity, 0.3);
  }
  
  75% {
    transform: translateY(-75vh) rotate(calc(var(--initial-rotation, 0deg) + 270deg)) scale(1.05);
  }
  
  100% {
    transform: translateY(-100vh) rotate(calc(var(--initial-rotation, 0deg) + 360deg)) scale(0.9);
    opacity: 0;
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .floating-element {
    animation: none;
    opacity: 0.1;
  }
}

@media (max-width: 768px) {
  .floating-element {
    animation-duration: calc(var(--element-duration) * 1.2);
  }
}
</style>
