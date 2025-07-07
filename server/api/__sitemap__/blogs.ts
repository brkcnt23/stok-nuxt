import { defineSitemapEventHandler } from '#imports'
import { Blog } from '~~/server/models/Blog'

/**
 * GET /api/__sitemap__/blogs
 * 
 * Bu endpoint yayınlanmış tüm blogları sitemap için döndürür
 * Her sitemap isteğinde çağrılarak en güncel blog bilgilerini sağlar
 * AI arama ve çoklu dil optimizasyonu ile geliştirildi
 */
export default defineSitemapEventHandler(async () => {
  try {
    // Fetch all published blogs with i18n data
    const blogs = await Blog.find({ isPublished: true })
      .select('slug updatedAt i18n')
      .sort({ updatedAt: -1 });
    
    console.log(`Sitemap için ${blogs.length} blog bulundu - ${new Date().toISOString()}`);
    
    // Transform blogs to sitemap URL format
    const blogUrls = [];
    
    for (const blog of blogs) {
      // Ana blog URL'i (Türkçe varsayılan)
      const baseUrl = `/blog/${blog.slug}`;
      
      // Türkçe blog
      blogUrls.push({
        loc: baseUrl,
        lastmod: blog.updatedAt,
        changefreq: 'weekly' as const,
        priority: 0.8 as const
      });
      
      // İngilizce blog URL'i
      blogUrls.push({
        loc: `/en${baseUrl}`,
        lastmod: blog.updatedAt,
        changefreq: 'weekly' as const,
        priority: 0.7 as const
      });
    }
    
    return blogUrls;
  } catch (error) {
    console.error('Error generating blog sitemap:', error);
    return [];
  }
});
