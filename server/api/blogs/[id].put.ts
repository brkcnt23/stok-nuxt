import { isAuthenticated } from '~~/server/middleware/auth';
import { Blog, BlogDocument } from '~~/server/models/Blog';

/**
 * PUT /api/blogs/:id
 * 
 * Bu endpoint belirtilen ID'ye sahip blog yazısını günceller.
 * Sadece blog yazısının sahibi tarafından güncellenebilir.
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
  
  // İstek gövdesini al
  const body = await readBody(event);
  
  // Zorunlu alanları kontrol et - i18n için
  if (!body.i18n?.tr?.title || !body.i18n?.tr?.content || !body.i18n?.tr?.description) {
    throw createError({
      statusCode: 400,
      message: 'Türkçe başlık, açıklama ve içerik alanları zorunludur'
    });
  }
  
  if (!body.i18n?.en?.title || !body.i18n?.en?.content || !body.i18n?.en?.description) {
    throw createError({
      statusCode: 400,
      message: 'İngilizce başlık, açıklama ve içerik alanları zorunludur'
    });
  }
  
  try {
    // Blog yazısını bul
    const blog = await Blog.findById(id) as BlogDocument | null;
    
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
        message: 'Bu blog yazısını düzenleme yetkiniz yok'
      });
    }
    
    // Yayın durumunun değişip değişmediğini kontrol et
    const publishStatusChanged = blog.isPublished !== body.isPublished;
    const slugChanged = blog.slug !== body.slug;
    
    // Blog yazısını güncelle
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        i18n: {
          tr: {
            title: body.i18n.tr.title,
            description: body.i18n.tr.description,
            content: body.i18n.tr.content,
            tags: body.i18n.tr.tags || []
          },
          en: {
            title: body.i18n.en.title,
            description: body.i18n.en.description,
            content: body.i18n.en.content,
            tags: body.i18n.en.tags || []
          }
        },
        slug: body.slug,
        coverImage: body.coverImage || '',
        category: body.category || blog.category,
        tags: body.tags || [],
        isPublished: body.isPublished !== undefined ? body.isPublished : blog.isPublished
      },
      { new: true }
    ).populate('author', 'username');
    
    if (!updatedBlog) {
      throw createError({
        statusCode: 404,
        message: 'Blog güncellenemedi'
      });
    }
    
    // Eğer blog yayın durumu değiştiyse veya slug değiştiyse veya blog zaten yayındaysa sitemap'i güncelle
    if (publishStatusChanged || slugChanged || updatedBlog.isPublished) {
      try {
        // Use directRequest to call the sitemap regeneration endpoint
        await $fetch('/api/sitemap/regenerate', { 
          method: 'POST',
          headers: event.headers // Pass through authentication headers
        });
        console.log('Blog güncellendiğinde sitemap otomatik yenilendi');
      } catch (sitemapError) {
        console.error('Blog güncellendiğinde sitemap yenilenirken hata:', sitemapError);
      }
    }
    
    return updatedBlog;
  } catch (error: any) {
    console.error('Blog güncelleme hatası:', error);
    
    // Slug zaten varsa özel bir hata döndür
    if (error.code === 11000 && error.keyPattern?.slug) {
      throw createError({
        statusCode: 400,
        message: 'Bu URL adresi (slug) zaten kullanılıyor. Lütfen başka bir slug deneyin.'
      });
    }
    
    throw createError({
      statusCode: 500,
      message: 'Blog yazısı güncellenirken bir hata oluştu'
    });
  }
});
