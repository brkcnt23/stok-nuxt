<script setup>
// Import i18n composables and locales
import { useI18n } from 'vue-i18n'
import * as locales from '@nuxt/ui-pro/locale'

// Get i18n locale
const { locale } = useI18n()

// Auth işlemlerini ilk olarak kontrol et
const auth = useAuth();
const isAuthReady = ref(false);
const isLoading = ref(true);
const route = useRoute();

// Sound player functionality directly in app.vue
const soundFiles = [
  '/sounds/c1.mp3',
  '/sounds/c2.mp3',
  '/sounds/c3.mp3',
  '/sounds/c4.mp3'
];

const audioElements = ref([]);

const initializeAudio = () => {
  if (process.client) {
    soundFiles.forEach(sound => {
      const audio = new Audio(sound);
      audio.preload = 'auto';
      audioElements.value.push(audio);
    });
  }
};

const playRandomSound = () => {
  if (!audioElements.value.length) return;

  const randomIndex = Math.floor(Math.random() * audioElements.value.length);
  const selectedAudio = audioElements.value[randomIndex];

  // Reset the audio to the beginning if it's currently playing
  selectedAudio.currentTime = 0;

  // Play the selected sound
  selectedAudio.play().catch(error => {
    console.error('Error playing sound:', error);
  });
};

// Function to handle link clicks and play sound
const handleLinkClick = (event) => {
  // Check if the clicked element is a link or has a link parent
  const isLink = event.target.tagName === 'A' || event.target.closest('a');

  if (isLink) {
    playRandomSound();
  }
};

// Ana sayfa için auth kontrolü yapmaya gerek yok, diğer sayfalar için kontrol yap
onBeforeMount(async () => {
  if (process.client) {
    // Ana sayfa (/) için hemen yüklemeyi tamamla
    if (route.path === '/') {
      isAuthReady.value = true;
      isLoading.value = false;
      // Arka planda auth kontrolü yap 
      auth.checkAuthStatus();
    } else {
      // Diğer sayfalar için auth kontrolünü bekle
      try {
        await auth.checkAuthStatus();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        isAuthReady.value = true;
        isLoading.value = false;
      }
    }

    // Initialize audio elements
    initializeAudio();

    // Add click event listener to document to capture link clicks
    document.addEventListener('click', handleLinkClick);
  }
});

// Clean up event listener when component is unmounted
onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('click', handleLinkClick);
  }
});

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: computed(() => locale.value),
    dir: computed(() => locales[locale.value]?.dir || 'ltr')
  }
})

const { t } = useI18n()
const title = computed(() => locale.value === 'tr'
  ? 'ASMA GERME | Türkiye Asma Germe Şirketi'
  : 'ASMA GERME | Turkey Awning Company')
const description = computed(() => locale.value === 'tr'
  ? 'ASMA GERME, Türkiye\'nin en iyi asma germe şirketidir. Hızlı ve güvenilir hizmet sunuyoruz.'
  : 'ASMA GERME is Turkey\'s best awning company. We provide fast and reliable service.')

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://asma-germe.com/og.webp',
  twitterImage: 'https://asma-germe.com/og.webp',
  twitterCard: 'summary_large_image',
  keywords: computed(() => locale.value === 'tr'
    ? 'asma germe, balkon germe, teras germe, pergola, İstanbul, Türkiye, Global, World güvenilir, asma germe şirketi, asma germe hizmeti, asma germe firması'
    : 'awning, balcony awning, terrace awning, pergola, Turkey, reliable, awning company, awning service, awning firm'),
  additionalMeta: [
    { name: 'author', content: 'ASMA GERME' },
    { name: 'robots', content: 'index, follow' }
  ]
})
</script>

<template>
  <UApp :locale="locales[locale]">
    <!-- Auth yükleniyor durumu - sadece korumalı sayfalarda gösterilir -->
    <div v-if="isLoading && route.path !== '/' == '/blog/'"
      class="fixed inset-0 flex items-center justify-center z-50 bg-background">
      <div class="text-center">
        <Logo class="w-auto h-14 md:h-20" />
        <UIcon name="i-lucide-loader-2" class="text-primary animate-spin h-12 w-12" />
      </div>
    </div>
    <template v-if="!isLoading || route.path === '/'">
      <Header />
      <AdminMenu />
      <Cursor />
      <LazyAwningBackground :element-count="12" theme="mixed" speed="normal" primary-color="var(--ui-primary)"
        secondary-color="var(--ui-secondary)" />
      <UMain>
        <NuxtPage />
      </UMain>
      <Footer />
      <Social />
    </template>
  </UApp>
</template>
