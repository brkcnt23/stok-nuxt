import { isAuthenticated } from '~~/server/middleware/auth';
import { Blog } from '~~/server/models/Blog';

/**
 * POST /api/blogs
 * 
 * Bu endpoint yeni blog yazısı oluşturur.
 * Sadece giriş yapmış kullanıcılar tarafından kullanılabilir.
 */
export default defineEventHandler(async (event) => {
  // Kullanıcının giriş yapmış olduğunu doğrula
  const { user } = await isAuthenticated(event);
  
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
    // Blog nesnesini oluştur
    const newBlog = await Blog.create({
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
      category: body.category || 'genel',
      tags: body.tags || [],
      isPublished: body.isPublished || false,
      author: user._id // Oturum açmış kullanıcının ID'si
    });
    
    // Blog başarıyla oluşturuldu - dinamik sitemap ile otomatik güncelleneceğinden
    // ek bir işlem yapmaya gerek yok
    if (body.isPublished) {
      console.log('Blog oluşturuldu - dinamik sitemap ile otomatik olarak güncellenecek');
    }
    
    // Oluşturulan blog yazısını döndür
    return await Blog.findById(newBlog._id).populate('author', 'username');
  } catch (error: any) {
    console.error('Blog oluşturma hatası:', error);
    
    // Slug zaten varsa özel bir hata döndür
    if (error.code === 11000 && error.keyPattern?.slug) {
      throw createError({
        statusCode: 400,
        message: 'Bu URL adresi (slug) zaten kullanılıyor. Lütfen başka bir slug deneyin.'
      });
    }
    
    throw createError({
      statusCode: 500,
      message: 'Blog yazısı oluşturulurken bir hata oluştu'
    });
  }
});
