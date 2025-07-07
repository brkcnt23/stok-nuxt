<script setup lang="ts">
// Import i18n
const { locale } = useI18n()

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

const props = defineProps({
  blogPosts: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete']);

// URL kopyalama işlevselliği için reactive değişkenler
const copiedBlogId = ref(null);
const baseUrl = ref('');

// Component mount olduğunda base URL'i ayarla
onMounted(() => {
  if (process.client) {
    baseUrl.value = window.location.origin;
  }
});

// Blog URL'sini kopyalama fonksiyonu
const copyBlogUrl = (blogId: any, slug: any) => {
  if (process.client) {
    const blogUrl = `${baseUrl.value}/blog/${slug || blogId}`;
    navigator.clipboard.writeText(blogUrl);

    // Hangi blog'un kopyalandığını işaretle
    copiedBlogId.value = blogId;

    // 2 saniye sonra kopyalama efektini sıfırla
    setTimeout(() => {
      copiedBlogId.value = null;
    }, 2000);
  }
};

// Blog yazısının ilk 100 karakterini göster
const truncateContent = (content: any, maxLength = 100) => {
  if (!content) return '';
  // HTML etiketlerini kaldır
  const plainText = content.replace(/<[^>]+>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
};

// Tarihi Türkçe formatla
const formatDate = (dateString: any) => {
  if (!dateString) return '';

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Date(dateString).toLocaleDateString('tr-TR', options);
};

// Yayınlanma durumuna göre etiket stil sınıfları
const getPublishBadgeClass = (isPublished: any) => {
  return isPublished
    ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 border-success-200 dark:border-success-800'
    : 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400 border-warning-200 dark:border-warning-800';
};

// Çift yönlü gri çubuklar arasında görüntülenen görüntüleme sayısı için stil
const getViewCountClass = (count: any) => {
  if (count > 1000) return 'text-success-600 dark:text-success-400 font-medium';
  if (count > 500) return 'text-primary-600 dark:text-primary-400 font-medium';
  if (count > 100) return 'text-info-600 dark:text-info-400 font-medium';
  return 'text-neutral-600 dark:text-neutral-400';
};

// Blog yazısının yayın durumunu kontrol et
const getStatus = (blog: any) => {
  if (!blog.isPublished) return 'Taslak';
  return 'Yayında';
};

// Blog yazısının etiketlerini göster
const getTags = (tags: any) => {
  if (!tags || tags.length === 0) return '';
  return tags.join(', ');
};
</script>

<template>
  <!-- Yükleniyor görünümü - İskelet yükleme animasyonu -->
  <div v-if="isLoading" class="space-y-6">
    <div v-for="i in 3" :key="i"
      class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div class="p-6 flex flex-col md:flex-row md:items-start gap-4">
        <!-- Blog kapak görseli iskeleti -->
        <div class="w-full md:w-48 h-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg shrink-0"></div>

        <!-- Blog bilgileri iskeleti -->
        <div class="flex-1 space-y-3">
          <div class="h-7 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div class="h-4 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div class="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          <div class="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>

        <!-- İşlem butonları iskeleti -->
        <div class="shrink-0 mt-4 md:mt-0">
          <div class="flex gap-2">
            <div class="h-9 w-9 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
            <div class="h-9 w-9 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Blog listesi - Yeni modern tasarım -->
  <div v-else-if="blogPosts && blogPosts.length > 0" class="space-y-6">
    <TransitionGroup name="blog-list">
      <div v-for="blog in blogPosts" :key="blog._id"
        class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-300">
        <!-- Düzenle butonu -->
        <UButtonGroup class="w-full">
          <!-- Sil butonu -->
          <UButton @click="emit('delete', blog)" color="error" variant="ghost" class="flex items-center gap-2" size="sm"
            icon="i-lucide-trash-2">
            Sil
          </UButton>
          <UButton @click="emit('edit', blog)" color="primary" variant="ghost" class="flex items-center gap-2" size="sm"
            block icon="i-lucide-edit-3">
            Düzenle
          </UButton>
        </UButtonGroup>

        <div class="p-6 flex flex-col md:flex-row md:items-start gap-4 relative">
          <!-- Blog kapak görseli -->
          <div class="w-full md:w-48 h-32 shrink-0 overflow-hidden rounded-lg">
            <img :src="(blog as any).coverImage || '/og.webp'" :alt="getBlogData(blog as any).title"
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
          </div>

          <!-- Blog bilgileri - Zenginleştirilmiş -->
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <!-- Yayın durumu etiketi -->
              <span :class="`px-2 py-1 text-xs rounded-full border ${getPublishBadgeClass((blog as any).isPublished)}`">
                {{ getStatus(blog as any) }}
              </span>

              <!-- Oluşturma tarihi -->
              <span class="text-xs text-neutral-500 dark:text-neutral-400 flex items-center">
                <UIcon name="i-lucide-calendar" class="mr-1 h-3.5 w-3.5" />
                {{ formatDate((blog as any).createdAt) }}
              </span>

              <!-- Görüntülenme sayısı -->
              <span class="text-xs flex items-center border-l border-r px-2 border-neutral-200 dark:border-neutral-700">
                <UIcon name="i-lucide-eye" class="mr-1 h-3.5 w-3.5" />
                <span :class="getViewCountClass((blog as any).viewCount || 0)">{{ (blog as any).viewCount || 0 }}</span>
              </span>
            </div>

            <!-- Blog başlığı -->
            <h3 class="text-lg font-bold text-primary-800 dark:text-primary-200 mb-1">
              {{ getBlogData(blog as any).title }}
            </h3>

            <!-- Blog açıklaması -->
            <p class="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
              {{ getBlogData(blog as any).description }}
            </p>

            <div class="flex flex-wrap gap-2 mt-2">
              <!-- Etiketler -->
              <div v-if="getBlogData(blog as any).tags && getBlogData(blog as any).tags.length" class="flex flex-wrap gap-1.5 items-center">
                <UBadge v-for="(tag, index) in getBlogData(blog as any).tags.slice(0, 3)" :key="index" :label="tag" size="xs"
                  color="secondary" variant="subtle" />
                <UBadge v-if="getBlogData(blog as any).tags.length > 3" :label="`+${getBlogData(blog as any).tags.length - 3}`" size="xs" color="neutral"
                  variant="subtle" />
              </div>

              <!-- Blog linki -->
              <UButton :to="`/blog/${(blog as any).slug || (blog as any)._id}`" target="_blank" size="xs" color="primary" variant="ghost"
                icon="i-lucide-external-link">
                Görüntüle
              </UButton>
            </div>
          </div>
        </div>

        <!-- Blog URL bilgisi ve kopyalama butonu - YENİ DÜZENLENEN ALAN -->
        <div
          class="bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 px-4 py-2 flex items-center">
          <UInput :model-value="`/blog/${(blog as any).slug || (blog as any)._id}`" :ui="{
            base: 'min-w-0 text-xs text-neutral-500 dark:text-neutral-400',
            trailing: 'pr-0.5'
          }" size="xs" class="w-full" variant="ghost" readonly>
            <template #trailing>
              <UTooltip :text="copiedBlogId === (blog as any)._id ? 'Kopyalandı!' : 'URL\'i kopyala'"
                :content="{ side: 'right' }">
                <UButton :color="copiedBlogId === (blog as any)._id ? 'success' : 'neutral'" variant="link" size="xs"
                  :icon="copiedBlogId === (blog as any)._id ? 'i-lucide-check' : 'i-lucide-copy'" aria-label="URL'i kopyala"
                  @click="copyBlogUrl((blog as any)._id, (blog as any).slug)" />
              </UTooltip>
            </template>
          </UInput>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Liste animasyonları */
.blog-list-enter-active,
.blog-list-leave-active {
  transition: all 0.5s ease;
}

.blog-list-enter-from,
.blog-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Kapak görseli hover efekti */
.image-hover:hover img {
  transform: scale(1.05);
}
</style>
