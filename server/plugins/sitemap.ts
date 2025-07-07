import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const unlink = promisify(fs.unlink)
const exists = promisify(fs.exists)

export default defineNitroPlugin((nitro) => {
  // Add a custom hook for sitemap regeneration
  nitro.hooks.hook('content:file:afterChange', async () => {
    console.log('Content changed, regenerating sitemap...')
    try {
      // Try to delete existing sitemap files to force regeneration
      const publicDir = path.resolve(process.cwd(), '.output/public')
      const sitemapPath = path.join(publicDir, 'sitemap.xml')
      
      if (await exists(sitemapPath)) {
        await unlink(sitemapPath).catch(error => {
          console.warn('Sitemap dosyası silinirken hata:', error)
        })
      }
      
      // Call the sitemap:generate hook with forceGenerate
      await nitro.hooks.callHook('sitemap:generate', { forceGenerate: true })
      console.log('Sitemap regenerated after content change')
    } catch (error) {
      console.error('Error regenerating sitemap after content change:', error)
    }
  })

  // Add an alias for the sitemap:generate hook that clears cache first
  nitro.hooks.hook('sitemap:generate', async (params = {}) => {
    try {
      // If we have a cache and should clear it
      if (nitro.cache && params.clearCache) {
        // Try to invalidate any keys related to sitemap
        const keys = ['sitemap', 'sitemap:blogs', '_sitemap_', 'blogs', '/api/__sitemap__/blogs']
        for (const key of keys) {
          try {
            await nitro.cache.remove(key)
            console.log(`Cache key invalidated before sitemap generation: ${key}`)
          } catch (err) {
            console.warn(`Could not invalidate cache key: ${key}`, err)
          }
        }
      }
      
      console.log('Sitemap generation initiated with params:', params)
    } catch (error) {
      console.error('Error in sitemap:generate hook:', error)
    }
  })

  console.log('Sitemap plugin registered')
})
