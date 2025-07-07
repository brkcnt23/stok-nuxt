import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { defineEventHandler } from 'h3';

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);

/**
 * GET /api/sitemap/info
 * 
 * Bu endpoint sitemap ile ilgili bilgileri döndürür
 */
export default defineEventHandler(async (event) => {
  try {
    // Sitemap dosyasının yolu için projenin root dizinini bulup dosya yollarını oluştur
    const publicDir = path.resolve(process.cwd(), '.output/public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    
    const sitemapInfo = {
      exists: false,
      lastGenerated: null,
      totalUrls: 0
    };
    
    // Ana sitemap bilgisi
    try {
      const fileExists = await exists(sitemapPath);
      
      if (fileExists) {
        const sitemapStats = await stat(sitemapPath);
        sitemapInfo.exists = true;
        sitemapInfo.lastGenerated = sitemapStats.mtime;
        
        // XML içeriğini okuyarak URL sayısını hesapla
        const sitemapContent = await readFile(sitemapPath, 'utf-8');
        const urlMatches = sitemapContent.match(/<url>/g);
        sitemapInfo.totalUrls = urlMatches ? urlMatches.length : 0;
      }
    } catch (e) {
      console.error('Sitemap dosyası kontrol edilirken hata:', e);
      // Sitemap dosyası henüz oluşturulmamış olabilir
    }
    
    return sitemapInfo;
  } catch (error) {
    console.error('Sitemap bilgisi getirme hatası:', error);
    throw createError({
      statusCode: 500,
      message: 'Sitemap bilgisi getirilirken bir hata oluştu'
    });
  }
});
