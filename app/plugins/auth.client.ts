// Kimlik doğrulama plugin'i - uygulamanın her yerinde kimlik durumu kontrolü yapar
export default defineNuxtPlugin(async (nuxtApp) => {
  // Sadece client tarafında çalıştır
  if (process.client) {
    const auth = useAuth();
    
    // Add a flag to track initialization
    const authInitialized = ref(false);
    
    // Sayfa ilk yüklendiğinde kimlik durumunu kontrol et
    try {
      await auth.checkAuthStatus();
      authInitialized.value = true;
    } catch (err) {
      console.error('Initial auth check failed:', err);
    }
    
    // Router olayları ile kimlik durumunu sürekli güncel tut
    nuxtApp.hook('page:start', async () => {
      await auth.checkAuthStatus();
    });
    
    // Sayfa değişikliği sonrası auth durumunu güncellemek için:
    nuxtApp.hook('page:finish', async () => {
      await auth.checkAuthStatus();
    });
    
    // Wait for Vue app to be mounted before handling auth-dependent routes
    nuxtApp.hook('app:mounted', async () => {
      await auth.checkAuthStatus();
      authInitialized.value = true;
    });
    
    // Daha detaylı router navigasyon kontrolü
    nuxtApp.$router.beforeEach(async (to) => {
      // Verify auth is initialized
      if (!authInitialized.value) {
        await auth.checkAuthStatus();
        authInitialized.value = true;
      }
      
      // Kimlik durumunu kontrol et
      await auth.checkAuthStatus();
      
      // Panel sayfasına yönlendirme kontrolü
      if (to.path.startsWith('/panel') && !auth.isAuthenticated.value) {
        return navigateTo('/login');
      }
      
      // Login sayfası kontrolü
      if (to.path === '/login' && auth.isAuthenticated.value) {
        return navigateTo('/panel');
      }
      
      return true;
    });
    
    // Auth değişikliklerini logla
    watch(() => auth.isAuthenticated.value, (newValue) => {
    });
  }
  
  return {
    provide: {
      auth: useAuth()
    }
  };
});
