// Plugin to ensure photo-sphere-viewer works with Nuxt SSR
export default defineNuxtPlugin(() => {
  // Only run on client-side
  if (process.client) {
    // Pre-load photo-sphere-viewer modules for better performance
    const preloadModules = async () => {
      try {
        await import('@photo-sphere-viewer/core')
        await import('@photo-sphere-viewer/autorotate-plugin')
        await import('@photo-sphere-viewer/gyroscope-plugin')
      } catch (error) {
        console.warn('Photo Sphere Viewer modules could not be preloaded:', error)
      }
    }

    // Preload on idle or after 2 seconds
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadModules)
    } else {
      setTimeout(preloadModules, 2000)
    }
  }
})
