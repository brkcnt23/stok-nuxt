// Vue/Nuxt fonksiyonları otomatik olarak import edildiği için tekrar import etmeye gerek yok

interface User {
  _id: string;
  username: string;
  createdAt?: string | Date;
}

export const useAuth = () => {
  // Check if running on client-side
  const isClient = process.client;
  
  // Kullanıcı bilgisi için state - Nuxt'un kendi useState fonksiyonunu kullanıyoruz
  const user = useState<User | null>('auth-user', () => null);
  
  // Kimlik doğrulama durumu - kullanıcı bilgisi varsa true
  const isAuthenticated = computed(() => !!user.value);
  
  // Yükleniyor durumu
  const isLoading = ref(false);
  
  // Hata mesajları
  const error = ref<string | null>(null);

  /**
   * Mevcut kimlik doğrulama durumunu API'den kontrol eder
   */
  const checkAuthStatus = async () => {
    // Skip auth check on server to prevent hydration mismatch
    if (!isClient) return isAuthenticated.value;
    
    try {
      isLoading.value = true;
      
      const response = await $fetch('/api/auth/session', {
        // Cache'lenmesini önle - her seferinde fresh veri al
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache',
        }
      });
      
      // Response'u manuel debug için kontrol et
      console.debug('[Auth] Session kontrolü:', response);
      
      if (response && response.authenticated === true) {
        user.value = response.user;
        console.debug('[Auth] Oturum aktif:', user.value?.username);
      } else {
        if (user.value !== null) {
          console.debug('[Auth] Oturum sonlandırıldı');
        }
        user.value = null;
      }
      
      return isAuthenticated.value;
    } catch (err: any) {
      console.error('[Auth] Kimlik kontrolü hatası:', err);
      error.value = err.message || 'Kimlik doğrulama kontrolü başarısız!';
      user.value = null;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Login işlemi yapar
   */
  const login = async (username: string, password: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      
      console.debug('[Auth] Login cevabı:', response);
      
      if (response && response.success) {
        // Kullanıcı bilgilerini güncelle
        user.value = response.user;
        
        // Kimlik durumunu doğrula
        await checkAuthStatus();
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('[Auth] Login hatası:', err);
      error.value = err.message || 'Giriş başarısız!';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Logout işlemi yapar
   */
  const logout = async () => {
    try {
      isLoading.value = true;
      
      const response = await $fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      console.debug('[Auth] Logout cevabı:', response);
      
      // Kullanıcı state'ini hemen temizle
      user.value = null;
      
      // Login sayfasına yönlendirme yap
      const router = useRouter();
      router.push('/login');
      
      return true;
    } catch (err: any) {
      console.error('[Auth] Logout hatası:', err);
      
      // Hata olsa bile kullanıcıyı logout yap
      user.value = null;
      error.value = err.message || 'Çıkış yapılırken hata!';
      
      // Hata durumunda da login sayfasına yönlendir
      const router = useRouter();
      router.push('/login');
      
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Always return the same structure
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuthStatus,
  };
};
