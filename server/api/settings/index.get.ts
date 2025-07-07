import { Setting, ensureDefaultSettings } from '~~/server/models/Setting';

// Uygulama başlangıcında varsayılan ayarları kontrol et
ensureDefaultSettings();

export default defineEventHandler(async (event) => {
  try {
    // Tüm ayarları getir veya belirli bir key'e göre filtrele
    const query = getQuery(event);
    const filter = query.key ? { key: query.key } : {};

    const settings = await Setting.find(filter);
    
    // Eğer key parametresi ile istek atılmışsa ve sonuç varsa, direkt value döndür
    if (query.key && settings.length === 1) {
      return { success: true, data: settings[0].value };
    }
    
    return { success: true, data: settings };
  } catch (error) {
    console.error('Ayarlar getirilemedi:', error);
    return { success: false, message: 'Ayarlar getirilemedi.' };
  }
});
