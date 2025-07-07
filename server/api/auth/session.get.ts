import { User } from '~~/server/models/User';
import { getCookie } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // Cookie'den auth token'ı al
    const authToken = getCookie(event, 'auth-token');
    
    // Debug amaçlı token varlığı kontrolü
    console.debug('Sunucu: Auth token kontrolü:', authToken ? 'Token var' : 'Token yok');
    
    if (!authToken) {
      return {
        authenticated: false,
        user: null
      };
    }
    
    // Token'ı parse et
    let tokenData;
    try {
      tokenData = JSON.parse(authToken);
    } catch (parseError) {
      console.error('Geçersiz auth token formatı:', parseError);
      deleteCookie(event, 'auth-token');
      return {
        authenticated: false,
        user: null
      };
    }
    
    if (!tokenData || !tokenData._id) {
      console.warn('Auth token içeriği geçersiz');
      return {
        authenticated: false,
        user: null
      };
    }
    
    // Kullanıcının hala var olup olmadığını kontrol et
    const user = await User.findById(tokenData._id);
    
    if (!user) {
      console.warn(`Kullanıcı bulunamadı (ID: ${tokenData._id}). Cookie temizleniyor.`);
      // Kullanıcı silinmiş, cookie'yi temizle
      deleteCookie(event, 'auth-token');
      
      return {
        authenticated: false,
        user: null
      };
    }
    
    // Kullanıcı bulundu, auth'a devam et
    return {
      authenticated: true,
      user: {
        _id: user._id,
        username: user.username,
        createdAt: user.createdAt
      }
    };
  } catch (error) {
    console.error('Session kontrolü hatası:', error);
    return {
      authenticated: false,
      user: null,
      error: 'Session kontrolü sırasında bir hata oluştu'
    };
  }
});
