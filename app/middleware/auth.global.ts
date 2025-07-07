// Bu middleware, panel ve korumalı sayfalara erişimi kontrol eder
export default defineNuxtRouteMiddleware((to) => {
  // Middleware'in sadece panel sayfaları için çalışmasını sağla
  if (!to.path.startsWith('/panel')) {
    return;
  }
  
  // useAuth() composable'ını çağır
  const { isAuthenticated } = useAuth();
  
  // Kimlik doğrulama durumunu kontrol et
  if (!isAuthenticated.value) {
    console.warn('🔒 Yetkisiz erişim engellendi: /panel');
    
    // Login sayfasına yönlendir
    return navigateTo('/login');
  }
});
