<template>
  <div class="project-detail-page">
    <!-- Loading State -->
    <div v-if="pending" class="min-h-screen flex items-center justify-center">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold mb-2">{{ $t('common.error') }}</h1>
        <p class="text-gray-600 dark:text-gray-300">{{ $t('projects.notFound') }}</p>
        <NuxtLink :to="localePath('/projeler')">
          <UButton class="mt-4">
            <UIcon name="i-lucide-arrow-left" class="mr-2" />
            {{ $t('projects.backToProjects') }}
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Project Content -->
    <div v-else-if="project">
      <!-- Hero Section -->
      <div class="relative h-[60vh] bg-gray-900 overflow-hidden">
        <img
          v-if="heroImage?.url"
          :src="heroImage.url"
          :alt="heroImage.alt || currentContent?.title"
          class="w-full h-full object-cover opacity-80"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div class="absolute bottom-0 left-0 right-0 p-8">
          <UContainer>
            <div class="text-white">
              <div class="flex items-center gap-2 mb-4">
                <UBadge :label="project.year" variant="outline" />
                <UBadge :label="getCountryLabel(project.country)" color="primary" variant="soft" />
                <UBadge v-if="project.category" :label="getCategoryLabel(project.category)" color="neutral" variant="soft" />
              </div>
              <h1 class="text-4xl md:text-6xl font-bold mb-4">
                {{ currentContent?.title }}
              </h1>
              <p class="text-xl max-w-2xl">
                {{ currentContent?.shortDescription }}
              </p>
            </div>
          </UContainer>
        </div>
      </div>

      <!-- Project Details -->
      <UContainer class="py-16">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Main Content -->
          <div class="lg:col-span-2">
            <!-- Description -->
            <div class="prose prose-lg dark:prose-invert max-w-none mb-12">
              <div class="whitespace-pre-wrap">{{ currentContent?.description }}</div>
              <div v-if="currentContent?.content" class="mt-6 whitespace-pre-wrap">{{ currentContent.content }}</div>
            </div>

            <!-- Technical Specifications -->
            <div v-if="project.specifications" class="mb-12">
              <h2 class="text-2xl font-bold mb-6">{{ $t('projects.specifications') }}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  v-for="spec in project.specifications"
                  :key="spec.key"
                  class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                >
                  <dt class="font-semibold text-gray-900 dark:text-white">
                    {{ spec.label }}
                  </dt>
                  <dd class="text-gray-600 dark:text-gray-300 mt-1">
                    {{ spec.value }}
                  </dd>
                </div>
              </div>
            </div>

            <!-- Gallery -->
            <div v-if="project.gallery && project.gallery.length > 0" class="mb-12">
              <h2 class="text-2xl font-bold mb-6">{{ $t('projects.gallery') }}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="(image, index) in project.gallery"
                  :key="index"
                  class="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 group relative"
                  @click="openLightbox(index)"
                >
                  <img
                    :src="image.url"
                    :alt="image.alt || currentContent?.title"
                    class="w-full h-full object-cover"
                  />
                  <!-- Hover Overlay -->
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <UIcon name="i-lucide-zoom-in" class="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <!-- Project Info -->
            <UCard class="mb-8">
              <template #header>
                <h3 class="text-lg font-semibold">{{ $t('projects.projectInfo') }}</h3>
              </template>

              <dl class="space-y-4">
                <div>
                  <dt class="font-semibold text-gray-900 dark:text-white">
                    {{ $t('projects.year') }}
                  </dt>
                  <dd class="text-gray-600 dark:text-gray-300">
                    {{ project.year }}
                  </dd>
                </div>

                <div>
                  <dt class="font-semibold text-gray-900 dark:text-white">
                    {{ $t('projects.country') }}
                  </dt>
                  <dd class="text-gray-600 dark:text-gray-300">
                    {{ getCountryLabel(project.country) }}
                  </dd>
                </div>

                <div v-if="project.category">
                  <dt class="font-semibold text-gray-900 dark:text-white">
                    {{ $t('projects.category') }}
                  </dt>
                  <dd class="text-gray-600 dark:text-gray-300">
                    {{ getCategoryLabel(project.category) }}
                  </dd>
                </div>

                <div v-if="project.area">
                  <dt class="font-semibold text-gray-900 dark:text-white">
                    {{ $t('projects.area') }}
                  </dt>
                  <dd class="text-gray-600 dark:text-gray-300">
                    {{ project.area }}
                  </dd>
                </div>

                <div v-if="project.materials && project.materials.length > 0">
                  <dt class="font-semibold text-gray-900 dark:text-white">
                    {{ $t('projects.materialsLabel') }}
                  </dt>
                  <dd class="text-gray-600 dark:text-gray-300">
                    <div class="flex flex-wrap gap-1 mt-1">
                      <UBadge
                        v-for="material in project.materials"
                        :key="material"
                        :label="getMaterialLabel(material)"
                        variant="soft"
                        size="sm"
                      />
                    </div>
                  </dd>
                </div>

                <div v-if="project.specifications && project.specifications.length > 0">
                  <dt class="font-semibold text-gray-900 dark:text-white">
                    {{ $t('projects.specifications') }}
                  </dt>
                  <dd class="text-gray-600 dark:text-gray-300">
                    <dl class="space-y-2 mt-2">
                      <div 
                        v-for="spec in project.specifications"
                        :key="spec.key"
                        class="flex justify-between"
                      >
                        <dt class="text-sm">{{ spec.label }}:</dt>
                        <dd class="text-sm font-medium">{{ spec.value }}</dd>
                      </div>
                    </dl>
                  </dd>
                </div>
              </dl>
            </UCard>
          </div>
        </div>
      </UContainer>

      <!-- Navigation -->
      <UContainer class="pb-16">
        <div class="flex justify-between items-center">
          <NuxtLink :to="localePath('/projeler')">
            <UButton variant="outline">
              <UIcon name="i-lucide-arrow-left" class="mr-2" />
              {{ $t('projects.backToProjects') }}
            </UButton>
          </NuxtLink>

          <div class="flex gap-2">
            <UButton
              v-if="project.previousProject"
              :to="localePath(`/projeler/${project.previousProject.slug}`)"
              variant="outline"
            >
              <UIcon name="i-lucide-chevron-left" class="mr-2" />
              {{ $t('common.previous') }}
            </UButton>
            
            <UButton
              v-if="project.nextProject"
              :to="localePath(`/projeler/${project.nextProject.slug}`)"
              variant="outline"
            >
              {{ $t('common.next') }}
              <UIcon name="i-lucide-chevron-right" class="ml-2" />
            </UButton>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Lightbox -->
    <Lightbox
      :images="project?.gallery || []"
      :initial-index="lightboxIndex"
      :is-open="isLightboxOpen"
      @close="closeLightbox"
      @index-change="lightboxIndex = $event"
    />
  </div>
</template>

<script setup lang="ts">
// i18n
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// Reactive data
const { data: project, pending, error } = await useLazyAsyncData(
  `project-${route.params.slug}`,
  async () => {
    try {
      return await $fetch(`/api/projects/${route.params.slug}`)
    } catch (err: any) {
      console.error('Proje detay hatası:', err)
      throw err
    }
  }
)

// Computed properties
const heroImage = computed(() => {
  if (!project.value?.gallery) return null
  return project.value.gallery.find((img: any) => img.isHero) || project.value.gallery[0] || null
})

// Current language content
const currentContent = computed(() => {
  if (!project.value?.i18n) return null
  
  const currentLang = locale.value as 'tr' | 'en'
  const content = project.value.i18n[currentLang]
  const fallback = project.value.i18n.tr
  
  return {
    title: content?.title || fallback.title,
    description: content?.description || fallback.description,
    content: content?.content || fallback.content,
    shortDescription: content?.shortDescription || fallback.shortDescription
  }
})

// Category label helper
const getCategoryLabel = (category: string) => {
  // Try to get translation from locales first
  const categoryKey = `projects.categories.${category}`
  const translation = t(categoryKey)
  
  // If translation exists and is not the key itself, return it
  if (translation && translation !== categoryKey) {
    return translation
  }
  
  // Fallback to hardcoded translations for backward compatibility
  const labels: Record<string, Record<string, string>> = {
    residential: { tr: 'Konut', en: 'Residential' },
    commercial: { tr: 'Ticari', en: 'Commercial' },
    industrial: { tr: 'Endüstriyel', en: 'Industrial' },
    public: { tr: 'Kamu', en: 'Public' },
    restoration: { tr: 'Restorasyon', en: 'Restoration' }
  }
  
  const currentLang = locale.value as 'tr' | 'en'
  return labels[category]?.[currentLang] || category
}

// Country label helper
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

// Material label helper
const getMaterialLabel = (material: string) => {
  // Try to get translation from locales first
  const materialKey = material.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '')
  const translationKey = `projects.materials.${materialKey}`
  const translation = t(translationKey)
  
  // If translation exists and is not the key itself, return it
  if (translation && translation !== translationKey) {
    return translation
  }
  
  // Return original if no translation found
  return material
}

// Lightbox state
const isLightboxOpen = ref(false)
const lightboxIndex = ref(0)

// SEO
useSeoMeta({
  title: () => currentContent.value ? `${currentContent.value.title} | ${t('projects.seo.title')}` : t('projects.seo.title'),
  description: () => currentContent.value?.shortDescription || t('projects.seo.description'),
  ogTitle: () => currentContent.value ? `${currentContent.value.title} | ${t('projects.seo.title')}` : t('projects.seo.title'),
  ogDescription: () => currentContent.value?.shortDescription || t('projects.seo.description'),
  ogImage: () => heroImage.value?.url,
  twitterTitle: () => currentContent.value ? `${currentContent.value.title} | ${t('projects.seo.title')}` : t('projects.seo.title'),
  twitterDescription: () => currentContent.value?.shortDescription || t('projects.seo.description'),
  twitterImage: () => heroImage.value?.url
})

// Methods
const openLightbox = (index: number) => {
  lightboxIndex.value = index
  isLightboxOpen.value = true
}

const closeLightbox = () => {
  isLightboxOpen.value = false
}
</script>
