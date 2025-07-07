import { deleteCookie } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // Auth cookie'yi sil
    deleteCookie(event, 'auth-token', {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    });
    
    return {
      success: true,
      message: 'Çıkış yapıldı'
    };
  } catch (error) {
    console.error('Çıkış yapma hatası:', error);
    
    // Hata olsa bile başarılı döndür
    return {
      success: true,
      message: 'Çıkış yapıldı'
    };
  }
});
