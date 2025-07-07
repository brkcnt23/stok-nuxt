import { isAuthenticated } from '~~/server/middleware/auth';
import { Blog } from '~~/server/models/Blog';
import mongoose from 'mongoose';

/**
 * GET /api/blogs/:id
 * 
 * Bu endpoint belirtilen ID'ye veya slug'a sahip blog yazısını getirir.
 */
export default defineEventHandler(async (event) => {
  // URL'den blog ID'sini veya slug'ını al
  const idOrSlug = getRouterParam(event, 'id');
  
  if (!idOrSlug) {
    throw createError({
      statusCode: 400,
      message: 'Blog ID veya slug gereklidir'
    });
  }
  
  try {
    // İsteğe bağlı yetkilendirme kontrolü
    const isAuthed = await isAuthenticated(event).catch(() => null);
    
    // Query parametrelerini kontrol et
    const query = getQuery(event);
    const queryType = query.type || 'id';
    
    // Blog yazısını bul - ID veya Slug'a göre arama yap
    let blog;
    
    if (queryType === 'slug') {
      // Slug ile arama
      blog = await Blog.findOne({ slug: idOrSlug }).populate('author', 'username');
    } else {
      // ID ile arama - geçerli bir ObjectId mi kontrol et
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        blog = await Blog.findById(idOrSlug).populate('author', 'username');
      } else {
        // Geçerli bir ObjectId değilse slug olarak dene
        blog = await Blog.findOne({ slug: idOrSlug }).populate('author', 'username');
      }
    }
    
    if (!blog) {
      throw createError({
        statusCode: 404,
        message: 'Blog yazısı bulunamadı'
      });
    }
    
    // Taslak yazıları sadece yazar veya giriş yapmış kullanıcılar görebilir
    if (!blog.isPublished && !isAuthed) {
      throw createError({
        statusCode: 403,
        message: 'Bu blog yazısını görüntüleme yetkiniz yok'
      });
    }
    
    return blog;
  } catch (error) {
    console.error('Blog getirme hatası:', error);
    throw createError({
      statusCode: 500,
      message: 'Blog yazısı getirilirken bir hata oluştu'
    });
  }
});
