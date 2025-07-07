import { Blog } from '~~/server/models/Blog';

/**
 * POST /api/blogs/:id/view
 * 
 * Bu endpoint blog görüntülenme sayısını artırır.
 */
export default defineEventHandler(async (event) => {
  // URL'den blog ID'sini al
  const id = getRouterParam(event, 'id');
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Blog ID gereklidir'
    });
  }
  
  try {
    // Blog yazısını bul ve görüntülenme sayısını artır
    await Blog.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    
    return { success: true, message: 'Görüntülenme sayısı güncellendi' };
  } catch (error) {
    console.error('Blog görüntülenme sayısını artırma hatası:', error);
    throw createError({
      statusCode: 500,
      message: 'Blog görüntülenme sayısı güncellenirken bir hata oluştu'
    });
  }
});
