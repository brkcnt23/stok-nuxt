// filepath: /home/had/nuxts/asma-germe.com/app/middleware/auth.ts
// Bu middleware, korumalı sayfalara erişimi kontrol eder
export default defineNuxtRouteMiddleware(() => {
  
  // useAuth() composable'ını çağır
  const { isAuthenticated } = useAuth();
  
  // Kimlik doğrulama durumunu kontrol et
  if (!isAuthenticated.value) {
    console.warn('🔒 Yetkisiz erişim engellendi');
    
    // Login sayfasına yönlendir
    return navigateTo('/login');
  }
});
