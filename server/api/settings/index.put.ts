import { Setting } from '~~/server/models/Setting';
import { isAuthenticated } from '~~/server/middleware/auth';

export default defineEventHandler(async (event) => {
  try {
    // Kullanıcının giriş yapmış olduğunu doğrula
    const { user } = await isAuthenticated(event);
    
    // Gelen veriyi al
    const { key, value, description } = await readBody(event);
    
    if (!key || value === undefined) {
      throw createError({
        statusCode: 400,
        message: 'Key ve value alanları zorunludur'
      });
    }
    
    // Ayarı güncelle veya oluştur
    const updatedSetting = await Setting.findOneAndUpdate(
      { key },
      { 
        $set: { 
          value, 
          description: description || '',
          updatedAt: new Date()
        } 
      },
      { 
        upsert: true, 
        new: true 
      }
    );
    
    return { success: true, data: updatedSetting };
  } catch (error) {
    console.error('Ayar güncellenemedi:', error);
    return { 
      success: false, 
      message: error.message || 'Ayar güncellenemedi.' 
    };
  }
});
