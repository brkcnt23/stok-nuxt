<script setup lang="ts">
// Import i18n
const { t, locale } = useI18n()
const localePath = useLocalePath()

interface BlogPost {
  _id: string;
  i18n?: {
    tr: {
      title: string;
      description: string;
      content: string;
      tags: string[];
    };
    en: {
      title: string;
      description: string;
      content: string;
      tags: string[];
    };
  };
  // Eski format için fallback
  title?: string;
  description?: string;
  content?: string;
  tags?: string[];
  // Ortak alanlar
  coverImage?: string;
  slug?: string;
  author?: any;
  createdAt?: string;
  updatedAt?: string;
  isPublished?: boolean;
  viewCount?: number;
}

interface ApiResponse {
  blogs: BlogPost[];
  total: number;
  meta?: {
    total: number;
    page: number;
    pages: number;
  };
}

// URL parametrelerinden sayfa numarasını al
const route = useRoute();
const router = useRouter();
const page = ref(parseInt(route.query.page as string) || 1);

// Props ve varsayılan değerler
const props = defineProps({
  orientation: {
    type: String as () => 'horizontal' | 'vertical',
    default: 'horizontal'
  },
  apiUrl: {
    type: String,
    default: '/api/blogs'
  },
  perPage: {
    type: Number,
    default: 12 // Bir sayfada gösterilecek blog sayısı - SEO için optimize edildi
  }
});

// Blogları saklamak için ref
const blogs = ref<BlogPost[]>([]);
const isLoading = ref(false);
const totalBlogs = ref(0);

// Pagination için hesaplamalar
const itemsPerPage = props.perPage;
const pageCount = computed(() => Math.ceil(totalBlogs.value / itemsPerPage));

// SEO için meta bilgileri ayarla - i18n uyumlu
const updateSEO = () => {
  const pageTitle = page.value > 1 
    ? t('blog.seo_title_page').replace('{page}', page.value.toString())
    : t('blog.seo_title');
  
  const pageDescription = page.value > 1
    ? t('blog.seo_description_page').replace('{page}', page.value.toString())
    : t('blog.seo_description');
  
  // Dil-aware canonical URL
  const baseUrl = 'https://asma-germe.com';
  const blogPath = page.value > 1 ? `/blog?page=${page.value}` : '/blog';
  const canonicalUrl = locale.value === 'tr' 
    ? `${baseUrl}${blogPath}`
    : `${baseUrl}/en${blogPath}`;

  // AI arama için structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    'headline': pageTitle,
    'description': pageDescription,
    'url': canonicalUrl,
    'publisher': {
      '@type': 'Organization',
      'name': 'ASMA GERME',
      'url': 'https://asma-germe.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://asma-germe.com/logo.svg'
      },
      'sameAs': [
        'https://www.instagram.com/asma.germe/',
        'https://wa.me/905497222100'
      ]
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${canonicalUrl}?search={search_term}`,
      'query-input': 'required name=search_term'
    },
    'about': {
      '@type': 'Thing',
      'name': locale.value === 'tr' ? 'Asma Germe Hizmetleri' : 'Awning Services',
      'description': locale.value === 'tr' 
        ? 'Profesyonel asma germe, balkon germe, teras germe hizmetleri'
        : 'Professional awning, balcony and terrace awning services'
    },
    'inLanguage': locale.value === 'tr' ? 'tr-TR' : 'en-US',
    'isAccessibleForFree': true
  };
  
  // useSeoMeta ile optimize edilmiş SEO
  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    keywords: t('blog.seo_keywords'),
    
    // Open Graph - AI arama için optimize edildi
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogUrl: canonicalUrl,
    ogType: 'website',
    ogSiteName: 'ASMA GERME',
    ogLocale: locale.value === 'tr' ? 'tr_TR' : 'en_US',
    ogImage: 'https://asma-germe.com/og.webp',
    
    // Twitter/X
    twitterCard: 'summary_large_image',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    twitterImage: 'https://asma-germe.com/og.webp',
    twitterSite: '@asma_germe',
    
    // AI arama için ek meta
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    
    // Çoklu dil support
    ...(locale.value === 'tr' && {
      'og:locale:alternate': 'en_US'
    }),
    ...(locale.value === 'en' && {
      'og:locale:alternate': 'tr_TR'
    })
  });
  
  // Link tags ve structured data - dil-aware URL'ler
  const linkTags = [
    { rel: 'canonical', href: canonicalUrl },
    // Çoklu dil alternatifleri
    { rel: 'alternate', hreflang: 'tr', href: locale.value === 'en' ? canonicalUrl.replace('/en/', '/') : canonicalUrl },
    { rel: 'alternate', hreflang: 'en', href: locale.value === 'tr' ? canonicalUrl.replace('asma-germe.com/', 'asma-germe.com/en/') : canonicalUrl },
    { rel: 'alternate', hreflang: 'x-default', href: locale.value === 'en' ? canonicalUrl.replace('/en/', '/') : canonicalUrl }
  ];
  
  // Pagination için SEO bağlantıları - dil-aware
  if (page.value > 1) {
    const prevPagePath = page.value === 2 ? '/blog' : `/blog?page=${page.value - 1}`;
    const prevUrl = locale.value === 'tr' 
      ? `https://asma-germe.com${prevPagePath}`
      : `https://asma-germe.com/en${prevPagePath}`;
    
    linkTags.push({ rel: 'prev', href: prevUrl });
  }
  
  // Sonraki sayfa bağlantısı - dil-aware
  if (page.value < pageCount.value) {
    const nextPagePath = `/blog?page=${page.value + 1}`;
    const nextUrl = locale.value === 'tr' 
      ? `https://asma-germe.com${nextPagePath}`
      : `https://asma-germe.com/en${nextPagePath}`;
    
    linkTags.push({ rel: 'next', href: nextUrl });
  }
  
  // Head konfigürasyonu
  useHead({
    link: linkTags,
    meta: [
      // AI arama için ek meta
      { name: 'author', content: 'ASMA GERME' },
      { name: 'publisher', content: 'ASMA GERME' },
      { name: 'copyright', content: 'ASMA GERME' },
      { name: 'language', content: locale.value === 'tr' ? 'Turkish' : 'English' },
      { name: 'subject', content: locale.value === 'tr' ? 'Asma Germe Blog' : 'Awning Blog' },
      { name: 'topic', content: locale.value === 'tr' ? 'Asma Germe' : 'Awning' },
      { name: 'classification', content: 'Business' },
      { name: 'category', content: 'Architecture, Construction, Services' },
      { name: 'coverage', content: 'Turkey' },
      { name: 'distribution', content: 'Global' },
      { name: 'rating', content: 'General' },
      { name: 'audience', content: 'All' },
      { name: 'page-type', content: 'Blog Index' },
      { name: 'content-language', content: locale.value === 'tr' ? 'tr' : 'en' }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd)
      },
      // BreadcrumbList
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': locale.value === 'tr' ? 'Ana Sayfa' : 'Home',
              'item': locale.value === 'tr' ? 'https://asma-germe.com' : 'https://asma-germe.com/en'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Blog',
              'item': canonicalUrl
            }
          ]
        })
      }
    ]
  });
};

// Blogları yükle - sayfa değiştikçe tekrar çağrılır
const loadBlogs = async () => {
  isLoading.value = true;
  
  try {
    // API'den blogları yükle
    const response = await $fetch<ApiResponse>(props.apiUrl, {
      params: {
        limit: itemsPerPage,
        page: page.value,
        published: 'true'
      }
    });
    
    // Blog verilerini güncelle
    blogs.value = response.blogs || [];
    
    // Meta bilgileri içinde total varsa al, yoksa doğrudan total değerini kullan
    if (response.meta && response.meta.total !== undefined) {
      totalBlogs.value = response.meta.total;
    } else if (response.total !== undefined) {
      totalBlogs.value = response.total;
    } else {
      totalBlogs.value = 0;
      console.warn('API toplam blog sayısını döndürmedi');
    }
        
    // SEO meta etiketlerini güncelle
    updateSEO();
    
    // Sayfa başına kaydır
    if (process.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Bloglar yüklenirken hata oluştu:', error);
  } finally {
    isLoading.value = false;
  }
};

// Sayfa değişikliğinde URL'yi güncelle
const updateRoute = async (newPage: number) => {
  if (newPage === 1) {
    await router.push(localePath('/blog'));
  } else {
    await router.push(localePath(`/blog?page=${newPage}`));
  }
};

// Blog makalelerini formatlayan yardımcı fonksiyonlar
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString('tr-TR', options);
};

// Blog açıklamasını kısalt
const truncateDescription = (text: string, maxLength = 120) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Blog verilerini i18n formatına göre işle
const getBlogData = (blog: BlogPost) => {
  // i18n verisi varsa kullan
  if (blog.i18n && blog.i18n[locale.value as 'tr' | 'en']) {
    const i18nData = blog.i18n[locale.value as 'tr' | 'en'];
    return {
      title: i18nData.title,
      description: i18nData.description,
      content: i18nData.content,
      tags: i18nData.tags
    };
  }
  
  // Fallback olarak eski format kullan
  return {
    title: blog.title || '',
    description: blog.description || '',
    content: blog.content || '',
    tags: blog.tags || []
  };
};

// URL değişikliklerini izle
watch(() => route.query.page, (newValue) => {
  const newPage = parseInt(newValue as string) || 1;
  if (page.value !== newPage) {
    page.value = newPage;
  }
}, { immediate: true });

// Sayfa değişikliklerini izle ve blogları yükle
watch(() => page.value, async () => {
  await loadBlogs();
}, { immediate: true });

// Sayfa değişikliğini izle - UPagination komponentinden
const onPageChange = async (newPage: number) => {
  await updateRoute(newPage);
};

// İlk yüklemede blogları al - URL'den sayfa numarasını kullan
onMounted(() => {
  const pageFromUrl = parseInt(route.query.page as string) || 1;
  page.value = pageFromUrl;
  // loadBlogs watcher tarafından otomatik olarak tetiklenecek
});
</script>

<template>
  <section class="py-10 md:py-16">
    <UContainer>
      <!-- Sayfa Başlık ve Açıklama -->
      <div class="mb-10 text-center">
        <h1 class="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4">{{ t('blog.title') }}</h1>
        <p class="text-lg text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto">
          {{ t('blog.description') }}
        </p>
             <!-- Bilgi: Sayfa ve Toplam -->
      <div v-if="blogs.length > 0" class="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-4">
        {{ t('blog.current_page') }} <UBadge :label="page" variant="subtle" color="secondary"/> | {{ t('blog.total_pages') }} <UBadge :label="pageCount" variant="subtle"/> | {{ t('blog.total_count') }} <UBadge :label="totalBlogs" variant="subtle" color="info"/> 
      </div>
      
      </div>
      
      <!-- Yükleniyor Göstergesi -->
      <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center">
        <UIcon name="i-lucide-loader-2" class="text-primary-500 animate-spin h-12 w-12" />
        <p class="mt-4 text-lg text-neutral-600 dark:text-neutral-400">{{ t('blog.admin.loading_blogs') }}</p>
      </div>
      
      <!-- Bloglar -->
      <div v-else-if="blogs.length > 0" class="mb-10">
        <UBlogPosts :orientation="orientation">
          <UBlogPost
            v-for="blog in blogs"
            :key="blog._id"
            :title="getBlogData(blog).title"
            :description="truncateDescription(getBlogData(blog).description)"
            :image="blog.coverImage || '/og.webp'"
            :date="blog.createdAt"
            :to="localePath(`/blog/${blog.slug || blog._id}`)"
            variant="subtle"
            class="transition-all duration-300 hover:shadow-lg"
            :badge="blog.tags && blog.tags.length > 0 ? { 
              label: blog.tags[0], 
              color: 'primary' as const,
              variant: 'subtle' as const,
              size: 'xs' as const
            } : undefined"
            :ui="{
              title: 'text-xl font-semibold text-primary-800 dark:text-primary-200 line-clamp-2',
              description: 'text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3',
              image: 'aspect-[16/9] object-cover rounded-t-lg',
              root: 'h-full flex flex-col rounded-lg overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
              body: 'flex-1 p-5',
              meta: 'flex flex-col space-y-2'
            }"
          />
        </UBlogPosts>
      </div>
      
      <!-- Boş Durum -->
      <div v-else class="py-20 text-center">
        <UIcon name="i-lucide-file-text" class="mx-auto h-16 w-16 text-neutral-300 dark:text-neutral-700" />
        <h3 class="mt-4 text-xl font-medium text-neutral-700 dark:text-neutral-300">{{ t('blog.no_posts') }}</h3>
        <p class="mt-2 text-neutral-500 dark:text-neutral-400">{{ t('blog.content_soon') }}</p>
        <UButton :to="localePath('/')" icon="i-lucide-home" class="mt-6">{{ t('blog.go_home') }}</UButton>
      </div>
      
      <!-- Pagination - Tamamen yeniden yazıldı -->
      <div v-if="pageCount > 1" class="flex justify-center mt-12">
        <UPagination
          v-model:page="page"
          :page-count="pageCount"
          :total="totalBlogs"
          :items-per-page="props.perPage"
          show-edges
          size="lg"
          @update:page="onPageChange"
        />
      </div>
      
 
      <!-- CTA Bölümü -->
      <div class="mt-16 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-8 text-center">
        <h3 class="text-2xl font-semibold text-primary-800 dark:text-primary-200 mb-3">
          {{ t('cta.services_title') }}
        </h3>
        <p class="text-neutral-700 dark:text-neutral-300 mb-6 max-w-2xl mx-auto">
          {{ t('cta.services_description') }}
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <UButton
            to="https://wa.me/905497222100"
            target="_blank"
            color="success"
            icon="i-simple-icons-whatsapp"
            size="lg"
          >
            {{ t('cta.whatsapp_text') }}
          </UButton>
          <UButton
            :to="localePath('/#iletisim')"
            color="primary"
            icon="i-lucide-mail"
            size="lg"
          >
            {{ t('cta.contact_text') }}
          </UButton>
        </div>
      </div>
    </UContainer>
  </section>
</template>