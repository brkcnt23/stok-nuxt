<script setup lang="ts">
// Import blog styles
import '@/assets/css/blog.css';

// Import i18n
const { t, locale } = useI18n()

// Nuxt route ve params
const route = useRoute();
const slug = route.params.slug as string;

// Blog verisi için state
const blog = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const relatedPosts = ref<any[]>([]);

// Blog makalesini getir - async/await yapısı ile SSR için optimize edildi
const { data: blogData, pending, error: fetchError } = await useFetch(`/api/blogs/${slug}`, {
  params: { type: 'slug' },
  key: `blog-${slug}`
});

// Blog verilerini i18n formatına göre işle
const getBlogData = (blog: any) => {
  // i18n verisi varsa kullan
  if (blog.i18n && blog.i18n[locale.value]) {
    const i18nData = blog.i18n[locale.value];
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

// Blog verilerini reactive değişkene kopyala
if (blogData.value) {
  blog.value = blogData.value;
  isLoading.value = false;
  
  // Blog görüntüleme sayısını artır - sadece client-side'da çalışmalı
  onMounted(async () => {
    try {
      await $fetch(`/api/blogs/${blog.value._id}/view`, {
        method: 'POST'
      });
    } catch (err) {
      // Sessizce devam et - görüntüleme sayısı kritik değil
    }
    
    // İlgili blogları getir
    if (blog.value.tags && blog.value.tags.length > 0) {
      const response = await $fetch('/api/blogs', {
        params: {
          tags: blog.value.tags.join(','),
          limit: 3,
          excludeId: blog.value._id,
          published: true
        }
      });
      
      relatedPosts.value = response.blogs || [];
    }
  });
} else {
  error.value = fetchError.value?.message || 'Blog yazısı bulunamadı';
  isLoading.value = false;
}

// SEO meta etiketleri - SERVER SIDE RENDERING ile çalışması için burada tanımla
if (blog.value) {
  const title = `${blog.value.title || ''} | ASMA GERME`;
  const description = blog.value.description || '';
  const url = `https://asma-germe.com/blog/${blog.value.slug}`;
  const imageUrl = blog.value.coverImage || 'https://asma-germe.com/og.webp';
  
  // Structured data JSON-LD için - Gelişmiş SEO ve AI arama optimizasyonu
  const blogData = getBlogData(blog.value);
  const blogTitle = blogData.title;
  const blogDescription = blogData.description;
  const blogContent = blogData.content;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    },
    'headline': blogTitle,
    'alternativeHeadline': blogDescription,
    'description': blogDescription,
    'image': {
      '@type': 'ImageObject',
      'url': imageUrl,
      'width': 1200,
      'height': 630,
      'caption': blogTitle
    },
    'author': {
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
    'publisher': {
      '@type': 'Organization',
      'name': 'ASMA GERME',
      'url': 'https://asma-germe.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://asma-germe.com/logo.svg',
        'width': 600,
        'height': 60
      }
    },
    'datePublished': blog.value.createdAt,
    'dateModified': blog.value.updatedAt || blog.value.createdAt,
    'url': url,
    'wordCount': blogContent.replace(/<[^>]+>/g, '').split(' ').length || 0,
    'keywords': blog.value.tags?.join(', ') || '',
    'articleSection': 'Asma Germe',
    'inLanguage': locale.value === 'tr' ? 'tr-TR' : 'en-US',
    'isAccessibleForFree': true,
    'genre': ['Asma Germe', 'Tensioned Membrane', 'Architecture', 'Balcony Design'],
    'audience': {
      '@type': 'Audience',
      'audienceType': locale.value === 'tr' 
        ? 'Asma germe hizmeti arayan kişiler, mimarlar, dekoratörler'
        : 'People seeking awning services, architects, decorators'
    },
    'about': [
      {
        '@type': 'Thing',
        'name': 'Asma Germe',
        'description': locale.value === 'tr' 
          ? 'Balkon, teras ve pergola alanları için profesyonel asma germe hizmetleri'
          : 'Professional awning services for balcony, terrace and pergola areas'
      },
      {
        '@type': 'Service',
        'name': locale.value === 'tr' ? 'Asma Germe Hizmeti' : 'Awning Service',
        'serviceType': 'Construction Service',
        'provider': {
          '@type': 'Organization',
          'name': 'ASMA GERME'
        }
      }
    ],
    'mentions': blog.value.tags?.map((tag: string) => ({
      '@type': 'Thing',
      'name': tag
    })) || [],
    // AI arama için ek bilgiler
    'hasPart': [
      {
        '@type': 'WebPageElement',
        'isAccessibleForFree': true,
        'cssSelector': '.blog-content'
      }
    ],
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['.blog-title', '.blog-description', '.blog-content h2']
    }
  };

  // useSeoMeta ile server-side SEO tanımlaması - AI arama için optimize edildi
  useSeoMeta({
    title: `${blogTitle} | ASMA GERME`,
    description: blogDescription,
    keywords: () => blog.value.tags?.join(', ') || 'asma germe, balkon germe, teras germe, istanbul asma germe, tensioned membrane, awning',
    
    // Open Graph
    ogTitle: `${blogTitle} | ASMA GERME`,
    ogDescription: blogDescription,
    ogImage: imageUrl,
    ogUrl: url,
    ogType: 'article',
    ogSiteName: 'ASMA GERME',
    ogLocale: locale.value === 'tr' ? 'tr_TR' : 'en_US',
    
    // Twitter/X
    twitterCard: 'summary_large_image',
    twitterTitle: `${blogTitle} | ASMA GERME`,
    twitterDescription: blogDescription,
    twitterImage: imageUrl,
    twitterSite: '@asma_germe',
    
    // Article specific
    articleSection: 'Asma Germe',
    articleTag: blog.value.tags?.join(', ') || '',
    articlePublishedTime: blog.value.createdAt,
    articleModifiedTime: blog.value.updatedAt || blog.value.createdAt,
    
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
  
  // JSON-LD yapılandırılmış veri, canonical ve AI arama için ek meta
  useHead({
    link: [
      { rel: 'canonical', href: url },
      // Çoklu dil alternatifleri
      { rel: 'alternate', hreflang: 'tr', href: url.replace('/en/', '/tr/') },
      { rel: 'alternate', hreflang: 'en', href: url.replace('/tr/', '/en/') },
      { rel: 'alternate', hreflang: 'x-default', href: url }
    ],
    meta: [
      // AI arama için ek meta
      { name: 'author', content: 'ASMA GERME' },
      { name: 'publisher', content: 'ASMA GERME' },
      { name: 'copyright', content: 'ASMA GERME' },
      { name: 'language', content: locale.value === 'tr' ? 'Turkish' : 'English' },
      { name: 'subject', content: locale.value === 'tr' ? 'Asma Germe Hizmetleri' : 'Awning Services' },
      { name: 'topic', content: locale.value === 'tr' ? 'Asma Germe' : 'Tensioned Membrane' },
      { name: 'classification', content: 'Business' },
      { name: 'category', content: 'Architecture, Construction, Services' },
      { name: 'coverage', content: 'Turkey' },
      { name: 'distribution', content: 'Global' },
      { name: 'rating', content: 'General' },
      { name: 'audience', content: 'All' },
      { name: 'page-type', content: 'Blog Post' },
      { name: 'content-language', content: locale.value === 'tr' ? 'tr' : 'en' },
      // Sosyal medya optimizasyonu
      { property: 'article:author', content: 'https://asma-germe.com' },
      { property: 'article:publisher', content: 'https://asma-germe.com' }
    ],
    script: [
      { 
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd)
      },
      // BreadcrumbList için ayrı schema
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Ana Sayfa',
              'item': 'https://asma-germe.com'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Blog',
              'item': 'https://asma-germe.com/blog'
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': blogTitle,
              'item': url
            }
          ]
        })
      }
    ]
  });
}

// Tarihi formatla
const formatDate = (dateString: any) => {
  if (!dateString) return '';
  
  const options = {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  };
  
  return new Date(dateString).toLocaleDateString('tr-TR', options);
};

// Metni belirli bir uzunlukta kırp
const truncate = (text: string, length: number): string => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

// Scroll to top on page change
onMounted(() => {
  if (process.client) {
    window.scrollTo(0, 0);
  }
});
</script>

<template>
  <UContainer>
    <!-- Yükleniyor durumu -->
    <div v-if="isLoading || pending" class="py-20 flex flex-col items-center justify-center">
      <UIcon name="i-lucide-loader-2" class="text-primary-500 animate-spin h-12 w-12" />
      <p class="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
        {{ locale === 'tr' ? 'Blog içeriği yükleniyor...' : 'Loading blog content...' }}
      </p>
    </div>
    
    <!-- Hata durumu -->
    <div v-else-if="error" class="py-20 flex flex-col items-center justify-center">
      <UIcon name="i-lucide-alert-triangle" class="text-error-500 h-12 w-12" />
      <p class="mt-4 text-lg text-neutral-600 dark:text-neutral-400">{{ error }}</p>
      <UButton to="/" icon="i-lucide-home" class="mt-6">
        {{ locale === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home' }}
      </UButton>
    </div>
    
    <!-- Blog içeriği -->
    <article v-else-if="blog" class="py-10 max-w-3xl mx-auto">
      <!-- Blog başlık kısmı -->
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-primary-900 dark:text-primary-100 mb-4">{{ getBlogData(blog).title }}</h1>
        <div class="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <div class="flex items-center">
            <UIcon name="i-lucide-calendar" class="mr-1" />
            <time :datetime="blog.createdAt">{{ formatDate(blog.createdAt) }}</time>
          </div>
          <div class="flex items-center">
            <UIcon name="i-lucide-eye" class="mr-1" />
            <span>{{ blog.viewCount || 0 }} {{ t('blog.blog.views') }}</span>
          </div>
          
          <!-- Son güncelleme bilgisi eklendi -->
          <div v-if="blog.updatedAt && blog.updatedAt !== blog.createdAt" class="flex items-center">
            <UIcon name="i-lucide-refresh-cw" class="mr-1" />
            <span>{{ locale === 'tr' ? 'Güncelleme:' : 'Updated:' }} {{ formatDate(blog.updatedAt) }}</span>
          </div>
        </div>
        
        <!-- Etiketler -->
        <div class="flex flex-wrap gap-2 mt-4" v-if="getBlogData(blog).tags && getBlogData(blog).tags.length">
          <UBadge 
            v-for="tag in getBlogData(blog).tags" 
            :key="tag" 
            :label="tag"
            color="primary" 
            variant="subtle"
            size="sm"
          />
        </div>
      </header>
      
      <!-- Kapak resmi -->
      <figure v-if="blog.coverImage" class="mb-8">
        <img 
          :src="blog.coverImage" 
          :alt="getBlogData(blog).title" 
          class="w-full h-auto rounded-lg object-cover shadow-md"
          loading="lazy"
        />
        <figcaption class="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          {{ getBlogData(blog).title }}
        </figcaption>
      </figure>
      
      <!-- Blog açıklaması -->
      <div class="text-lg text-neutral-700 dark:text-neutral-300 mb-8 font-medium border-l-4 border-primary-500 pl-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-r">
        {{ getBlogData(blog).description }}
      </div>
      
      <!-- Blog metni -->
      <div class="blog-content max-w-none prose dark:prose-invert prose-headings:text-primary-800 dark:prose-headings:text-primary-200 prose-a:text-primary-600 dark:prose-a:text-primary-400" v-html="getBlogData(blog).content"></div>
      
      <!-- Call to action -->
      <div class="bg-primary-50 dark:bg-primary-900/40 rounded-lg p-6 shadow-sm my-12">
        <h3 class="text-xl font-semibold text-primary-800 dark:text-primary-200 mb-2">
          {{ locale === 'tr' ? 'Profesyonel Asma Germe Hizmeti Mi Arıyorsunuz?' : 'Looking for Professional Awning Services?' }}
        </h3>
        <p class="text-neutral-700 dark:text-neutral-300 mb-4">
          {{ locale === 'tr' 
            ? 'ASMA GERME olarak tüm dünyada profesyonel asma germe hizmetleri sunuyoruz. Balkon, teras veya pergola asma germe ihtiyacınız için hemen bizimle iletişime geçin.'
            : 'As ASMA GERME, we provide professional awning services in all districts of Turkey. Contact us immediately for your balcony, terrace or pergola awning needs.'
          }}
        </p>
        <div class="flex flex-wrap gap-4 mt-4">
          <UButton 
            to="https://wa.me/905497222100" 
            target="_blank" 
            color="success" 
            icon="i-simple-icons-whatsapp"
            size="lg"
          >
            {{ locale === 'tr' ? 'WhatsApp\'tan Yazın' : 'Message on WhatsApp' }}
          </UButton>
          <UButton 
            to="tel:05497222100" 
            color="primary" 
            variant="outline" 
            icon="i-lucide-phone"
            size="lg"
          >
            {{ locale === 'tr' ? 'Bizi Arayın' : 'Call Us' }}
          </UButton>
        </div>
      </div>
      
      <!-- İlgili Bloglar -->
      <div v-if="relatedPosts && relatedPosts.length > 0" class="mt-16 border-t border-neutral-200 dark:border-neutral-800 pt-10">
        <h2 class="text-2xl font-bold mb-8 text-primary-900 dark:text-primary-100">{{ t('blog.blog.related_posts') }}</h2>
        
        <BlogMore 
          :posts="relatedPosts"
          :title="t('blog.blog.related_posts')"
          :show-button="false"
        />
      </div>
    </article>
  </UContainer>
</template>
