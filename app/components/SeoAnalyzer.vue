<script setup lang="ts">
// SEO analiz bileşeni props'ları
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    default: ''
  },
  tags: {
    type: Array,
    default: () => []
  },
  coverImage: {
    type: String,
    default: ''
  }
});

// SEO durumu kontrol etme
const checkSeoStatus = () => {
  const seoScore = { score: 0, max: 100, messages: [] };

  // Başlık kontrolleri
  if (props.title) {
    if (props.title.length >= 50 && props.title.length <= 60) {
      seoScore.score += 20;
      seoScore.messages.push('✅ Başlık uzunluğu ideal (50-60 karakter)');
    } else if (props.title.length > 30) {
      seoScore.score += 10;
      seoScore.messages.push('⚠️ Başlık uzunluğu kabul edilebilir fakat ideal değil');
    } else {
      seoScore.messages.push('❌ Başlık çok kısa, daha açıklayıcı olmalı (50-60 karakter önerilir)');
    }
  }

  // Açıklama kontrolleri
  if (props.description) {
    if (props.description.length >= 140 && props.description.length <= 160) {
      seoScore.score += 20;
      seoScore.messages.push('✅ Meta açıklama uzunluğu ideal (140-160 karakter)');
    } else if (props.description.length > 100) {
      seoScore.score += 10;
      seoScore.messages.push('⚠️ Meta açıklama uzunluğu kabul edilebilir fakat ideal değil');
    } else {
      seoScore.messages.push('❌ Meta açıklama çok kısa (140-160 karakter önerilir)');
    }
  }

  // İçerik kontrolleri
  if (props.content) {
    const contentLength = props.content.replace(/<[^>]*>/g, '').length;
    if (contentLength > 300) {
      seoScore.score += 15;
      seoScore.messages.push('✅ İçerik uzunluğu yeterli');
    } else {
      seoScore.messages.push('❌ İçerik çok kısa, daha detaylı içerik hazırlayın');
    }
  }

  // Slug kontrolü
  if (props.slug && props.slug.length > 0) {
    seoScore.score += 15;
    seoScore.messages.push('✅ SEO dostu URL oluşturuldu');
  }

  // Kategoriler kontrolü
  if (props.tags && props.tags.length > 0) {
    seoScore.score += 15;
    seoScore.messages.push('✅ Kategori seçimi yapıldı');
  }

  // Görsel kontrolü
  if (props.coverImage && props.coverImage.length > 0) {
    seoScore.score += 15;
    seoScore.messages.push('✅ Kapak görseli eklenmiş');
  } else {
    seoScore.messages.push('⚠️ Kapak görseli eksik, görsel eklemek SEO için faydalıdır');
  }

  return seoScore;
};

// SEO skorunu hesapla
const seoStatus = computed(() => checkSeoStatus());

// Detayları göster/gizle durumu
const isDetailsVisible = ref(true);

// Detayları aç/kapat
const toggleDetails = () => {
  isDetailsVisible.value = !isDetailsVisible.value;
};

// Dışa aktarılacak değişkenler
defineExpose({
  seoStatus
});
</script>

<template>
  <div v-if="title || description || content || tags.length" class="sticky top-20 z-50 transition-all duration-300"
    :class="{ 'opacity-100 translate-y-0': title || description || content || tags.length, 'opacity-0 -translate-y-full': !title && !description && !content && tags.length === 0 }">
    <UCard variant="outline" :ui="{
      body: 'p-4'
    }" :color="seoStatus.score >= 70 ? 'success' : seoStatus.score >= 40 ? 'warning' : 'error'"
      class="mb-6 transition-all duration-300 hover:shadow-xl backdrop-blur-md bg-primary-500/20 ring-0 text-xs">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UBadge icon="i-simple-icons-google" color="info" variant="subtle" size="xs" label="Google Index" />
          <UBadge icon="i-lucide-activity" color="secondary" variant="solid" size="xs" label="SEO Analizi" />
        </div>
        <div class="flex items-center gap-2">
          <UProgress :value="seoStatus.score" :max="seoStatus.max"
            :color="seoStatus.score >= 70 ? 'success' : seoStatus.score >= 40 ? 'warning' : 'error'"
            class="w-24 hidden sm:block" />
          <UBadge :color="seoStatus.score >= 70 ? 'success' : seoStatus.score >= 40 ? 'warning' : 'error'"
            variant="solid">
            {{ seoStatus.score }}/{{ seoStatus.max }} puan
          </UBadge>
          <UButton size="xs" :icon="isDetailsVisible ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" color="neutral"
            variant="ghost" class="ml-1 h-6 w-6" @click="toggleDetails"
            :aria-label="isDetailsVisible ? 'Detayları gizle' : 'Detayları göster'" :aria-expanded="isDetailsVisible" />
        </div>
      </div>

      <transition enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-4 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-4 opacity-0">
        <div v-if="isDetailsVisible" class="space-y-3">
          <ul class="mt-3 space-y-1 text-xs grid grid-cols-1 md:grid-cols-2">
            <li v-for="(message, index) in seoStatus.messages" :key="index" class="transition-all duration-300" :class="{
              'text-success-600 dark:text-success-400': message.startsWith('✅'),
              'text-warning-600 dark:text-warning-400': message.startsWith('⚠️'),
              'text-error-600 dark:text-error-400': message.startsWith('❌')
            }">
              {{ message }}
            </li>
          </ul>

          <div
            class="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 border-t pt-2 border-neutral-200 dark:border-neutral-700">
            <div class="flex items-center">
              <UIcon name="i-simple-icons-google" class="text-blue-500 mr-1.5 w-3.5 h-3.5" />
              <span>Google Arama Konsolu ve SEO standartlarına uygun analiz</span>
            </div>
            <UTooltip text="Google SEO kriterleri dikkate alınmıştır">
              <UButton size="xs" icon="i-lucide-info" color="neutral" variant="ghost" class="text-[10px] h-5 w-5 p-0" />
            </UTooltip>
          </div>
        </div>
      </transition>
    </UCard>
  </div>
</template>

<style scoped>
/* Smooth shadow transition for the frosted glass effect */
.frosted-glass-card {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.frosted-glass-card:hover {
  transform: translateY(-2px);
}
</style>
