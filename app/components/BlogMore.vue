<script setup lang="ts">
// Import i18n
const { locale } = useI18n()

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
  tags?: string[];
  // Ortak alanlar
  coverImage?: string;
  slug: string;
}

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
    tags: blog.tags || []
  };
};

// Component props
const props = defineProps({
  posts: {
    type: Array as PropType<BlogPost[]>,
    default: () => []
  },
  title: {
    type: String,
    default: 'İlgili İçerikler'
  },
  buttonText: {
    type: String,
    default: 'Daha Fazla İçerik Gör'
  },
  buttonLink: {
    type: String,
    default: '/blog'
  },
  showButton: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div v-if="posts && posts.length > 0" class="mt-16 border-t border-neutral-200 dark:border-neutral-800 pt-10">
    <h2 class="text-2xl font-bold mb-8 text-primary-900 dark:text-primary-100">{{ title }}</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UBlogPost 
        v-for="post in posts" 
        :key="post._id"
        :title="getBlogData(post).title"
        :description="getBlogData(post).description"
        :image="post.coverImage || '/og.webp'"
        :to="`/blog/${post.slug}`"
        variant="subtle"
        class="transition-all duration-300 hover:shadow-lg"
        :badge="{ 
          label: getBlogData(post).tags?.[0] || 'Blog', 
          color: 'primary',
          variant: 'subtle',
          size: 'xs'
        }"
        :ui="{
          title: 'text-lg font-semibold text-primary-800 dark:text-primary-200 line-clamp-2',
          description: 'text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3',
          image: 'aspect-[16/9] object-cover rounded-t-lg',
          root: 'h-full flex flex-col rounded-lg overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
          meta: 'flex flex-col',
        }"
      />
    </div>

    <div v-if="showButton" class="flex justify-center mt-8">
      <UButton 
        :to="buttonLink" 
        color="primary"
        variant="outline"
        size="lg"
        icon="i-lucide-book-open"
        class="mt-4"
      >
        {{ buttonText }}
      </UButton>
    </div>
  </div>
</template>
