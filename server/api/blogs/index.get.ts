import { isAuthenticated } from '~~/server/middleware/auth';
import { Blog } from '~~/server/models/Blog';

/**
 * GET /api/blogs
 * 
 * Bu endpoint blog yazılarını listeler.
 * Query parametreleri:
 * - author: Belirli bir yazara ait blog yazılarını filtrelemek için
 * - tag: Belirli bir etiketle blog yazılarını filtrelemek için
 * - published: Sadece yayınlanmış/taslak blog yazılarını filtrelemek için
 * - limit: Kaç blog yazısı getirileceğini belirler (varsayılan: 20)
 * - page: Sayfalama için sayfa numarası (varsayılan: 1)
 * - search: Blog başlıklarında ve slug'ında arama yapmak için (güncellenmiş)
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { 
    author, 
    tag, 
    tags,
    published, 
    limit = 20, 
    page = 1,
    excludeId = null,
    search = null
  } = query;

  // İsteğe bağlı yetkilendirme kontrolü
  // Giriş yapmış kullanıcı varsa taslak yazıları da görebilir
  const isAuthed = await isAuthenticated(event).catch(() => null);
  
  // Filtreleme kriterlerini oluştur
  const filter: any = {};

  // Eğer author belirtilmişse, o yazara ait blog yazılarını getir
  if (author) {
    filter.author = author;
  }

  // Eğer tag belirtilmişse, o etikete sahip blog yazılarını getir
  if (tag) {
    filter.tags = { $in: [tag] };
  }
  
  // Eğer virgülle ayrılmış tags listesi varsa, bu etiketlere sahip blog yazılarını getir
  if (tags && typeof tags === 'string') {
    const tagList = tags.split(',').map(t => t.trim());
    filter.tags = { $in: tagList };
  }
  
  // Belirli bir ID'yi hariç tutmak için
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }
  
  // Arama metni varsa başlık, slug ve i18n içeriklerinde arama yap
  if (search && typeof search === 'string') {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { slug: searchRegex },
      { 'i18n.tr.title': searchRegex },
      { 'i18n.en.title': searchRegex },
      { 'i18n.tr.description': searchRegex },
      { 'i18n.en.description': searchRegex }
    ];
  }

  // Yayın durumuna göre filtrele
  // Giriş yapmamış kullanıcılar sadece yayınlanmış blog yazılarını görebilir
  if (published === 'true') {
    filter.isPublished = true;
  } else if (published === 'false' && isAuthed) {
    filter.isPublished = false;
  } else if (!isAuthed) {
    // Giriş yapmamış kullanıcılar için varsayılan olarak sadece yayınlanmış olanları göster
    filter.isPublished = true;
  }

  try {
    // Blog yazılarını getir ve yazarının bilgilerini ekle
    const blogs = await Blog.find(filter)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Toplam blog yazısı sayısını getir
    const total = await Blog.countDocuments(filter);

    // Hem meta hem de düz toplam bilgisini dön (frontend uyumluluğu için)
    return {
      blogs,
      total, // Bu frontend'in beklediği format
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    };
  } catch (error) {
    console.error('Blog yazılarını getirme hatası:', error);
    throw createError({
      statusCode: 500,
      message: 'Blog yazıları getirilirken bir hata oluştu'
    });
  }
});
