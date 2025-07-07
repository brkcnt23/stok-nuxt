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
}

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
    default: 6 // 6 blog post per page for better pagination
  }
});

// Blogları saklamak için ref
const blogs = ref<BlogPost[]>([]);
const isLoading = ref(false);
const hasMorePosts = ref(true);
const currentPage = ref(1);
const totalBlogs = ref(0);
const blogContainer = ref<HTMLElement | null>(null);

// SEO için meta bilgileri ayarla - i18n uyumlu
const seoTitle = computed(() => `${t('blog.blog.title')} | ASMA GERME`)
const seoDescription = computed(() => locale.value === 'tr' 
  ? 'ASMA GERME blog sayfası - asma germe hizmetleri, balkon germe, teras germe ve daha fazlası hakkında bilgiler.'
  : 'ASMA GERME blog page - information about awning services, balcony awnings, terrace awnings and more.')
const seoKeywords = computed(() => locale.value === 'tr'
  ? 'asma germe blog, asma germe ipuçları, balkon germe, teras germe, istanbul asma germe, profesyonel asma germe'
  : 'awning blog, awning tips, balcony awnings, terrace awnings, professional awning services')

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    { name: 'keywords', content: seoKeywords },
    
    // Open Graph
    { property: 'og:title', content: seoTitle },
    { property: 'og:description', content: seoDescription },
    { property: 'og:url', content: 'https://asma-germe.com/blog' },
    { property: 'og:type', content: 'website' }
  ],
  link: [
    { rel: 'canonical', href: 'https://asma-germe.com/blog' }
  ]
});

// İlk yükleme için
const loadInitialBlogs = async () => {
  isLoading.value = true;
  
  try {
    // API'den ilk blogları yükle
    const response = await $fetch<ApiResponse>(props.apiUrl, {
      params: {
        limit: props.perPage,
        page: 1,
        published: 'true'
      }
    });
    
    blogs.value = response.blogs || [];
    totalBlogs.value = response.total || 0;
    hasMorePosts.value = blogs.value.length < totalBlogs.value;
  } catch (error) {
    console.error('Bloglar yüklenirken hata oluştu:', error);
  } finally {
    isLoading.value = false;
  }
};

// Daha fazla blog yükleme fonksiyonu - Düzeltildi
const loadMoreBlogs = async () => {
  if (isLoading.value || !hasMorePosts.value) return;
  
  isLoading.value = true;
  const nextPage = currentPage.value + 1;
  
  try {
    const response = await $fetch<ApiResponse>(props.apiUrl, {
      params: {
        limit: props.perPage,
        page: nextPage,
        published: 'true'
      }
    });
    
    const newBlogs = response.blogs || [];
    blogs.value = [...blogs.value, ...newBlogs];
    currentPage.value = nextPage;
    
    // Bu kontrol düzeltildi: toplam blog sayısına göre daha fazla yükleme olup olmadığını kontrol ediyoruz
    hasMorePosts.value = blogs.value.length < totalBlogs.value;
    
  } catch (error) {
    console.error('Daha fazla blog yüklenirken hata oluştu:', error);
  } finally {
    isLoading.value = false;
  }
};

// Intersection observer ile lazy loading - Yeniden yazıldı
const setupIntersectionObserver = () => {
  if (!process.client) return null;
  
  // Scroll olayını daha agresif algılamak için observer ayarları
  const observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting && !isLoading.value) {
      // Daha fazla yüklenebilecek blog var mı kontrol et
      if (blogs.value.length < totalBlogs.value) {
        loadMoreBlogs();
      } else {
        hasMorePosts.value = false;
      }
    }
  }, { 
    threshold: 0,  // Tamamen görünür olmasına gerek yok, kısmen görünür olması yeterli
    rootMargin: '0px 0px 300px 0px'  // Sayfa sonuna daha erken ulaşmak için alt margin artırıldı
  });
  
  // Observer'ı bağla - setTimeout ile DOM'un tam yüklenmesini bekle
  setTimeout(() => {
    const target = document.querySelector('#loadMoreTrigger');
    if (target) {
      observer.observe(target);
    } else {
      console.warn('Lazy load trigger element bulunamadı!');
    }
  }, 500);
  
  return observer;
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

// Observer referansı
let observer: IntersectionObserver | null = null;

// Hooks - Yeniden düzenlendi
onMounted(async () => {
  await loadInitialBlogs();
  
  // Trigger'ı birkaç kez DOM'a bağlamaya çalış (Nuxt DOM güncellemeleri için)
  observer = setupIntersectionObserver();
  
  // Gecikmeli olarak tekrar dene (bazı durumlarda ilk bağlantı başarısız olabilir)
  setTimeout(() => {
    if (!observer) {
      observer = setupIntersectionObserver();
    }
  }, 1000);
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<template>
  <section class="py-10 md:py-16">
    <UContainer>
            <div v-if="blogs.length > 0" class="mb-10">
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
            :badge="getBlogData(blog).tags && getBlogData(blog).tags.length > 0 ? { 
              label: getBlogData(blog).tags[0], 
              color: 'primary',
              variant: 'subtle',
              size: 'xs'
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
      <div v-if="!isLoading && blogs.length === 0" class="py-20 text-center">
        <UIcon name="i-lucide-file-text" class="mx-auto h-16 w-16 text-neutral-300 dark:text-neutral-700" />
        <h3 class="mt-4 text-xl font-medium text-neutral-700 dark:text-neutral-300">{{ t('blog.blog.no_posts') }}</h3>
        <p class="mt-2 text-neutral-500 dark:text-neutral-400">{{ t('blog.blog.content_soon') }}</p>
        <UButton :to="localePath('/')" icon="i-lucide-home" class="mt-6">{{ t('blog.blog.go_home') }}</UButton>
      </div>
      
      <!-- Yükleniyor Göstergesi - Daha belirgin ve scroll sonrası yükleme için konumlandırıldı -->
      <div v-if="isLoading" class="py-8 flex flex-col items-center justify-center">
        <UIcon name="i-lucide-loader-2" class="animate-spin h-10 w-10 text-primary-500" />
        <p class="mt-4 text-neutral-600 dark:text-neutral-400">
          {{ currentPage === 1 
            ? t('blog.blog.loading_blogs') 
            : t('blog.blog.loading_more') }}
        </p>
      </div>
      
      <!-- Daha Fazla Yükleme Tetikleyicisi - Yüksekliği artırıldı ve margin eklendi -->
      <div id="loadMoreTrigger" ref="blogContainer" class="h-20 my-10"></div>
      
      <!-- Tüm İçerikler Yüklendi Mesajı - Görsel olarak geliştirildi -->
      <div v-if="!hasMorePosts && blogs.length > 0 && !isLoading" class="text-center py-8 border-t border-neutral-200 dark:border-neutral-800 mt-4">
        <UIcon name="i-lucide-check-circle" class="mx-auto h-8 w-8 text-primary-500 mb-2" />
        <p class="text-neutral-600 dark:text-neutral-400">{{ t('blog.blog.all_posts_displayed') }}</p>
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