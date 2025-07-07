import { useAuth } from '~/composables/useAuth';

export default defineNuxtRouteMiddleware((to) => {
  // Sadece login sayfası için kontrol yap
  if (to.path !== '/login') {
    return;
  }
  
  const auth = useAuth();
  
  // Eğer kullanıcı zaten giriş yapmışsa panel sayfasına yönlendir
  if (auth.isAuthenticated.value) {
    return navigateTo('/panel');
  }
});
