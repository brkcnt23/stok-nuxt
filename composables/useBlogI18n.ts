// ~/composables/useBlogI18n.ts
export interface BlogI18nContent {
  title: string;
  description: string;
  content: string;
  tags: string[];
}

export interface BlogI18nData {
  tr: BlogI18nContent;
  en: BlogI18nContent;
}

export interface BlogPostI18n {
  _id: string;
  i18n: BlogI18nData;
  slug: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author?: any;
  createdAt?: string;
  updatedAt?: string;
  isPublished?: boolean;
  viewCount?: number;
}

export interface BlogApiResponse {
  blogs: BlogPostI18n[];
  total: number;
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Blog için i18n yardımcı fonksiyonları
 */
export const useBlogI18n = () => {
  const { locale } = useI18n();

  /**
   * Mevcut dil için blog içeriğini döndürür
   */
  const getBlogContent = (blog: BlogPostI18n): BlogI18nContent => {
    const currentLocale = locale.value as 'tr' | 'en';
    return blog.i18n[currentLocale] || blog.i18n.tr;
  };

  /**
   * Blog başlığını mevcut dilde döndürür
   */
  const getBlogTitle = (blog: BlogPostI18n): string => {
    return getBlogContent(blog).title;
  };

  /**
   * Blog açıklamasını mevcut dilde döndürür
   */
  const getBlogDescription = (blog: BlogPostI18n): string => {
    return getBlogContent(blog).description;
  };

  /**
   * Blog içeriğini mevcut dilde döndürür
   */
  const getBlogContentHtml = (blog: BlogPostI18n): string => {
    return getBlogContent(blog).content;
  };

  /**
   * Blog etiketlerini mevcut dilde döndürür
   */
  const getBlogTags = (blog: BlogPostI18n): string[] => {
    return getBlogContent(blog).tags;
  };

  /**
   * Kategori adını mevcut dile çevirir
   */
  const getCategoryName = (category: string): string => {
    const { t } = useI18n();
    const categoryMap: Record<string, string> = {
      'asma-germe': t('categories.tensioned_membrane'),
      'etfe': t('categories.etfe'),
      'acilir-kapanir': t('categories.retractable'),
      'tekstil-cephe': t('categories.textile_facade'),
      'akustik': t('categories.acoustic'),
      'genel': t('categories.general')
    };
    
    return categoryMap[category] || category;
  };

  /**
   * Blog açıklamasını kısaltır
   */
  const truncateDescription = (text: string, maxLength = 120): string => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  /**
   * Tarihi yerel formatta döndürür
   */
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    
    const currentLocale = locale.value;
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return new Date(dateString).toLocaleDateString(currentLocale === 'en' ? 'en-US' : 'tr-TR', options);
  };

  return {
    getBlogContent,
    getBlogTitle,
    getBlogDescription,
    getBlogContentHtml,
    getBlogTags,
    getCategoryName,
    truncateDescription,
    formatDate
  };
};
