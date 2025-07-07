import { isAuthenticated } from '~~/server/middleware/auth';
import { Blog } from '~~/server/models/Blog';

/**
 * DELETE /api/blogs/:id
 * 
 * Bu endpoint belirtilen ID'ye sahip blog yazısını siler.
 * Sadece blog yazısının sahibi tarafından silinebilir.
 */
export default defineEventHandler(async (event) => {
  // Kullanıcının giriş yapmış olduğunu doğrula
  const { user } = await isAuthenticated(event);
  
  // URL'den blog ID'sini al
  const id = getRouterParam(event, 'id');
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Blog ID gereklidir'
    });
  }
  
  try {
    // Blog yazısını bul
    const blog = await Blog.findById(id);
    
    if (!blog) {
      throw createError({
        statusCode: 404,
        message: 'Blog yazısı bulunamadı'
      });
    }
    
    // Blog yazısının sahibi olan kullanıcı mı kontrol et
    if (blog.author.toString() !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        message: 'Bu blog yazısını silme yetkiniz yok'
      });
    }
    
    // Silinen blog yayınlanmış mı kontrol et
    const wasPublished = blog.isPublished;
    
    // Blog yazısını sil
    await Blog.findByIdAndDelete(id);
    
    // Eğer silinen blog yayınlanmışsa sitemap'i güncelle
    if (wasPublished) {
      try {
        // Use directRequest to call the sitemap regeneration endpoint
        await $fetch('/api/sitemap/regenerate', { 
          method: 'POST',
          headers: event.headers // Pass through authentication headers
        });
        console.log('Blog silindiğinde sitemap otomatik yenilendi');
      } catch (sitemapError) {
        console.error('Blog silindiğinde sitemap yenilenirken hata:', sitemapError);
        // Sitemap güncellemesi başarısız olsa bile silme işlemi devam eder
      }
    }
    
    return { success: true, message: 'Blog yazısı başarıyla silindi' };
  } catch (error) {
    console.error('Blog silme hatası:', error);
    throw createError({
      statusCode: 500,
      message: 'Blog yazısı silinirken bir hata oluştu'
    });
  }
});
