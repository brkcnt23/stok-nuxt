import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { defineEventHandler } from 'h3';

const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);
const glob = promisify(fs.readdir);

/**
 * POST /api/sitemap/regenerate
 * 
 * Bu endpoint sitemap'i manuel olarak yeniden oluşturur.
 */
export default defineEventHandler(async (event) => {
  try {
    // Find and delete all cached sitemap files
    const cacheDir = path.resolve(process.cwd(), '.nuxt/cache');
    if (await exists(cacheDir)) {
      try {
        const files = await glob(cacheDir);
        for (const file of files) {
          if (file.includes('sitemap') || file.includes('_sitemap_')) {
            try {
              await unlink(path.join(cacheDir, file));
              console.log(`Cache file deleted: ${file}`);
            } catch (err) {
              console.warn(`Could not delete cache file: ${file}`, err);
            }
          }
        }
      } catch (err) {
        console.warn('Could not read cache directory:', err);
      }
    }

    // Delete the public sitemap file to force regeneration
    const publicDir = path.resolve(process.cwd(), '.output/public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    
    if (await exists(sitemapPath)) {
      await unlink(sitemapPath).catch(error => {
        console.warn('Sitemap dosyası silinirken hata:', error);
      });
      console.log('Sitemap file deleted successfully');
    }
    
    // Force specific cache key invalidation for sitemap
    const nitroApp = useNitroApp();
    const cache = nitroApp.cache;
    
    if (cache) {
      // Try to invalidate any keys related to sitemap
      const keys = ['sitemap', 'sitemap:blogs', '_sitemap_', 'blogs'];
      for (const key of keys) {
        try {
          await cache.remove(key);
          console.log(`Cache key invalidated: ${key}`);
        } catch (err) {
          console.warn(`Could not invalidate cache key: ${key}`, err);
        }
      }
    }
    
    // Call the sitemap:generate hook with forceGenerate: true
    if (nitroApp.hooks) {
      await nitroApp.hooks.callHook('sitemap:generate', { 
        forceGenerate: true,
        clearCache: true
      });
      console.log('Sitemap generation hook called successfully');
    } else {
      throw new Error('Sitemap hooks bulunamadı');
    }
    
    return {
      success: true,
      message: 'Sitemap başarıyla yeniden oluşturuldu!',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Sitemap yeniden oluşturma hatası:', error);
    
    return {
      success: false,
      message: error.message || 'Sitemap yeniden oluşturulurken bir hata oluştu',
      timestamp: new Date().toISOString()
    };
  }
});
