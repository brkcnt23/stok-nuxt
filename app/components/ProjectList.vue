<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="animate-pulse">
        <div class="bg-neutral-200 dark:bg-neutral-700 h-32 rounded-lg"></div>
      </div>
    </div>

    <!-- Projects List -->
    <div v-else-if="projects.length > 0" class="space-y-4">
      <UCard
        v-for="project in projects"
        :key="project._id"
        class="hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        <div class="flex flex-col md:flex-row">
          <!-- Project Image -->
          <div class="w-full md:w-48 h-48 md:h-32 relative overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-t-none">
            <img
              v-if="heroImage(project)"
              :src="heroImage(project)?.url"
              :alt="heroImage(project)?.alt"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
              <UIcon name="i-lucide-image" class="h-12 w-12 text-neutral-400" />
            </div>

            <!-- Status Badge -->
            <div class="absolute top-2 left-2">
              <UBadge :color="getStatusColor(project.status)">
                {{ getStatusLabel(project.status) }}
              </UBadge>
            </div>

            <!-- Published Badge -->
            <div v-if="!project.isPublished" class="absolute top-2 right-2">
              <UBadge color="warning">{{ $t('common.draft') }}</UBadge>
            </div>
          </div>

          <!-- Project Details -->
          <div class="flex-1 p-6">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  {{ project.i18n.tr.title }}
                </h3>
                <p class="text-neutral-600 dark:text-neutral-400 text-sm mb-3 line-clamp-2">
                  {{ project.i18n.tr.shortDescription }}
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 ml-4">
                <UButton
                  variant="outline"
                  size="sm"
                  @click="$emit('edit', project)"
                >
                  <UIcon name="i-lucide-edit" class="h-4 w-4" />
                </UButton>
                <UButton
                  color="error"
                  variant="outline"
                  size="sm"
                  @click="$emit('delete', project)"
                >
                  <UIcon name="i-lucide-trash-2" class="h-4 w-4" />
                </UButton>
              </div>
            </div>

            <!-- Project Meta -->
            <div class="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-calendar" class="h-4 w-4" />
                <span>{{ project.year }}</span>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-map-pin" class="h-4 w-4" />
                <span>{{ project.country }}</span>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-tag" class="h-4 w-4" />
                <span>{{ getCategoryLabel(project.category) }}</span>
              </div>
              <div v-if="project.area" class="flex items-center gap-1">
                <UIcon name="i-lucide-ruler" class="h-4 w-4" />
                <span>{{ project.area }} m²</span>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-images" class="h-4 w-4" />
                <span>{{ project.gallery.length }} {{ $t('common.images') }}</span>
              </div>
            </div>

            <!-- Materials -->
            <div v-if="project.materials.length > 0" class="flex flex-wrap gap-1 mb-4">
              <UBadge
                v-for="material in project.materials.slice(0, 3)"
                :key="material"
                variant="soft"
                size="sm"
              >
                {{ material }}
              </UBadge>
              <UBadge
                v-if="project.materials.length > 3"
                variant="soft"
                size="sm"
                color="neutral"
              >
                +{{ project.materials.length - 3 }}
              </UBadge>
            </div>

            <!-- Specifications -->
            <div v-if="project.specifications.length > 0" class="border-t border-neutral-100 dark:border-neutral-700 pt-4">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div
                  v-for="spec in project.specifications.slice(0, 6)"
                  :key="spec.key"
                  class="text-neutral-600 dark:text-neutral-400"
                >
                  <span class="font-medium">{{ spec.label }}:</span>
                  <span class="ml-1">{{ spec.value }}</span>
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="border-t border-neutral-100 dark:border-neutral-700 pt-3 mt-4 text-xs text-neutral-400 dark:text-neutral-500">
              <div class="flex justify-between">
                <span>{{ $t('common.created') }}: {{ formatDate(project.createdAt) }}</span>
                <span v-if="project.updatedAt !== project.createdAt">
                  {{ $t('common.updated') }}: {{ formatDate(project.updatedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <UIcon name="i-lucide-folder-open" class="h-16 w-16 mx-auto text-neutral-400 dark:text-neutral-600 mb-4" />
      <h3 class="text-xl font-medium text-neutral-900 dark:text-white">{{ $t('common.noResults') }}</h3>
      <p class="mt-2 text-neutral-500 dark:text-neutral-400">
        {{ $t('common.noResultsDescription') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// i18n
const { t } = useI18n()

interface Project {
  _id: string;
  i18n: {
    tr: {
      title: string;
      description: string;
      content: string;
      shortDescription: string;
    };
    en: {
      title: string;
      description: string;
      content: string;
      shortDescription: string;
    };
  };
  slug: string;
  year: string;
  country: string;
  category: string;
  materials: string[];
  status: string;
  gallery: Array<{
    url: string;
    alt: string;
    type: 'image' | 'video';
    isHero: boolean;
  }>;
  specifications: Array<{
    key: string;
    label: string;
    value: string;
  }>;
  area?: string;
  isPublished: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  projects: Project[];
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
});

const emit = defineEmits<{
  edit: [project: Project];
  delete: [project: Project];
}>();

// Helper functions
const heroImage = (project: Project) => {
  return project.gallery.find(item => item.isHero) || project.gallery[0];
};

const getStatusColor = (status: string) => {
  const colors = {
    completed: 'success',
    ongoing: 'info',
    planning: 'warning',
    'on-hold': 'error'
  };
  return colors[status as keyof typeof colors] || 'neutral';
};

const getStatusLabel = (status: string) => {
  const labels = {
    completed: 'Tamamlandı',
    ongoing: 'Devam Ediyor',
    planning: 'Planlama',
    'on-hold': 'Askıda'
  };
  return labels[status as keyof typeof labels] || status;
};

const getCategoryLabel = (category: string) => {
  const labels = {
    residential: 'Konut',
    commercial: 'Ticari',
    industrial: 'Endüstriyel',
    public: 'Kamu',
    restoration: 'Restorasyon'
  };
  return labels[category as keyof typeof labels] || category;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
