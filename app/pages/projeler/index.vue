<template>
  <div class="projeler-page">
    <!-- Hero Section -->
    <UContainer class="py-16">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">
          {{ $t('projects.title') }}
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ $t('projects.description') }}
        </p>
      </div>
    </UContainer>

    <!-- Filters -->
    <UContainer class="pb-8">
      <div class="flex flex-wrap gap-4 justify-center">
        <UButton
          v-for="category in categories"
          :key="category.id || 'all'"
          :variant="selectedCategory === category.id ? 'solid' : 'outline'"
          @click="filterByCategory(category.id)"
        >
          {{ category.name }}
        </UButton>
      </div>
    </UContainer>

    <!-- Projects Grid -->
    <UContainer class="pb-16">
      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <USkeleton v-for="i in 6" :key="i" class="h-96 w-full" />
      </div>

      <!-- Projects -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NuxtLink 
          v-for="project in filteredProjects"
          :key="project._id"
          :to="localePath(`/projeler/${project.slug}`)"
          class="block group"
          @click="console.log('Navigating to:', localePath(`/projeler/${project.slug}`), 'Project:', project)"
        >
          <UCard class="hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] cursor-pointer h-full">
            <template #header>
              <div class="aspect-video bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                <NuxtImg
                  v-if="project.heroImage || project.gallery?.[0]"
                  :src="project.heroImage?.url || project.gallery?.[0]?.url"
                  :alt="project.heroImage?.alt || getProjectContent(project).title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <UIcon name="i-lucide-image" class="w-12 h-12" />
                </div>
              </div>
            </template>

            <div class="p-6 flex flex-col h-full">
              <div class="flex items-center gap-2 mb-2">
                <UBadge :label="project.year" variant="outline" />
                <UBadge :label="getCountryLabel(project.country)" color="primary" variant="soft" />
                <UBadge v-if="project.category" :label="getCategoryLabel(project.category)" color="neutral" variant="soft" />
              </div>
              
              <h3 class="text-xl font-bold mb-2 group-hover:text-primary-500 transition-colors">
                {{ getProjectContent(project).title }}
              </h3>
              
              <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
                {{ getProjectContent(project).description }}
              </p>
              
              <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
                <span>{{ $t('projects.viewDetails') }}</span>
                <UIcon name="i-lucide-arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && filteredProjects.length === 0" class="text-center py-16">
        <UIcon name="i-lucide-folder-open" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">
          {{ $t('projects.noProjects') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300">
          {{ $t('projects.noProjectsDescription') }}
        </p>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
// Types
interface Project {
  _id: string;
  i18n: {
    tr: {
      title: string;
      description: string;
      shortDescription: string;
    };
    en: {
      title: string;
      description: string;
      shortDescription: string;
    };
  };
  slug: string;
  year: string;
  country: string;
  category: string;
  gallery: Array<{
    url: string;
    alt: string;
    isHero: boolean;
  }>;
  heroImage?: {
    url: string;
    alt: string;
  };
}

// i18n
const { t, locale } = useI18n()
const localePath = useLocalePath()

// SEO
useSeoMeta({
  title: t('projects.seo.title'),
  description: t('projects.seo.description'),
  ogTitle: t('projects.seo.title'),
  ogDescription: t('projects.seo.description'),
  twitterTitle: t('projects.seo.title'),
  twitterDescription: t('projects.seo.description')
})

// Reactive data
const selectedCategory = ref<string | null>(null)
const projects = ref<Project[]>([])
const isLoading = ref(true)

// Helper functions
const getCategoryLabel = (category: string) => {
  // Try to get translation from locales first
  const categoryKey = `projects.categories.${category}`
  const translation = t(categoryKey)
  
  // If translation exists and is not the key itself, return it
  if (translation && translation !== categoryKey) {
    return translation
  }
  
  // Fallback to hardcoded translations for backward compatibility
  const categoryLabels: Record<string, Record<string, string>> = {
    residential: { tr: 'Konut', en: 'Residential' },
    commercial: { tr: 'Ticari', en: 'Commercial' },
    industrial: { tr: 'Endüstriyel', en: 'Industrial' },
    public: { tr: 'Kamu', en: 'Public' },
    restoration: { tr: 'Restorasyon', en: 'Restoration' }
  }
  
  const currentLang = locale.value as 'tr' | 'en'
  return categoryLabels[category]?.[currentLang] || categoryLabels[category]?.tr || category
}

const getProjectContent = (project: Project) => {
  const currentLang = locale.value as 'tr' | 'en'
  const content = project.i18n[currentLang]
  const fallback = project.i18n.tr
  
  return {
    title: content?.title || fallback.title,
    description: content?.description || fallback.description,
    shortDescription: content?.shortDescription || fallback.shortDescription
  }
}

const getCountryLabel = (country: string) => {
  // Try to get translation from locales first
  const countryKey = country.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '')
  const translationKey = `projects.countries.${countryKey}`
  const translation = t(translationKey)
  
  // If translation exists and is not the key itself, return it
  if (translation && translation !== translationKey) {
    return translation
  }
  
  // Return original if no translation found
  return country
}

// Categories (computed to react to locale changes)
const categories = computed(() => [
  { id: null, name: t('projects.allCategories') },
  { id: 'residential', name: getCategoryLabel('residential') },
  { id: 'commercial', name: getCategoryLabel('commercial') },
  { id: 'industrial', name: getCategoryLabel('industrial') },
  { id: 'public', name: getCategoryLabel('public') },
  { id: 'restoration', name: getCategoryLabel('restoration') }
])

// Computed
const filteredProjects = computed(() => {
  if (!selectedCategory.value) {
    return projects.value
  }
  return projects.value.filter(project => project.category === selectedCategory.value)
})

// Methods
const filterByCategory = (categoryId: string | null) => {
  selectedCategory.value = categoryId
}

const fetchProjects = async () => {
  try {
    isLoading.value = true
    const response = await $fetch('/api/projects') as { data: Project[] }
    projects.value = response.data || []
  } catch (error) {
    console.error('Projeler yüklenirken hata:', error)
    projects.value = []
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
