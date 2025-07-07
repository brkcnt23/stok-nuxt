<template>
  <div ref="container" class="w-full rounded-lg overflow-hidden shadow-xl"></div>
</template>

<script setup>
const props = defineProps({
  imageUrl: {
    type: String,
    default: '/bg.webp'
  }

})

const container = ref(null)
let viewer = null

onMounted(async () => {
  if (process.client && container.value) {
    try {
      const { Viewer } = await import('@photo-sphere-viewer/core')
      const { AutorotatePlugin } = await import('@photo-sphere-viewer/autorotate-plugin')
      const { GyroscopePlugin } = await import('@photo-sphere-viewer/gyroscope-plugin')

      viewer = new Viewer({
        container: container.value,
        panorama: props.imageUrl,
        plugins: [
          [AutorotatePlugin, { autorotateSpeed: '1rpm' }],
          [GyroscopePlugin]
        ],
        navbar: ['autorotate', 'zoom', 'fullscreen', 'gyroscope']
      })

      console.log('360° Panorama yüklendi!')
    } catch (error) {
      console.error('360° Panorama yüklenemedi:', error)
    }
  }
})

onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})
</script>
