// Server middleware to handle user session
export default defineEventHandler(async (event) => {
  // Skip for auth endpoints to avoid circular dependencies
  if (event.path.startsWith('/api/auth')) {
    return;
  }

  // Check protected routes
  if (event.path.startsWith('/api/admin')) {
    const session = await useSession(event);
    
    if (!session.user) {
      return createError({
        statusCode: 401,
        message: 'Yetkisiz erişim'
      });
    }
  }
});

/**
 * Kullanıcının kimlik doğrulamasını yapar ve oturum bilgilerini döndürür
 * Eğer kullanıcı giriş yapmamışsa hata fırlatır
 */
export async function isAuthenticated(event: any) {
  const { authenticated, user } = await $fetch('/api/auth/session', {
    headers: {
      cookie: getRequestHeaders(event).cookie || ''
    }
  });
  
  if (!authenticated || !user) {
    throw createError({
      statusCode: 401,
      message: 'Bu işlem için giriş yapmanız gerekiyor'
    });
  }
  
  return { authenticated, user };
}
