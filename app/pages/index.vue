<script setup>
// Import i18n
const { t, locale } = useI18n()

// Animation references
const heroRef = ref(null)
const servicesRef = ref(null)
const aboutRef = ref(null)
const statsRef = ref(null)
const blogRef = ref(null)
const faqRef = ref(null)
const contactRef = ref(null)
const ctaRef = ref(null)

// Animation presets
const fadeIn = {
  initial: { opacity: 0, y: 40 },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 800,
      type: 'spring'
    }
  }
}

const fadeLeft = {
  initial: { opacity: 0, x: -100 },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 800,
      type: 'spring'
    }
  }
}

const fadeRight = {
  initial: { opacity: 0, x: 100 },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 800,
      type: 'spring'
    }
  }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 800,
      type: 'spring'
    }
  }
}

// Helper for staggered animations
const getMotionWithDelay = (index, motionBase) => {
  return {
    ...motionBase,
    enter: {
      ...motionBase.enter,
      transition: {
        ...motionBase.enter.transition,
        delay: index * 200,
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1
    },
    intersection: {
      threshold: 0.1
    }
  }
}

// SEO metadata
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  'name': 'ASMA GERME',
  'image': 'https://asma-germe.com/og.webp',
  'logo': 'https://asma-germe.com/logo.svg',
  '@id': 'https://asma-germe.com',
  'url': 'https://asma-germe.com',
  'telephone': '+905497222100',
  'address': {
    '@type': 'PostalAddress',
    'addressLocality': 'İstanbul',
    'addressRegion': 'Avcılar',
    'addressCountry': 'TR'
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': 38.4649,
    'longitude': 27.1717
  },
  'description': 'Türkiye\'de profesyonel asma germe hizmetleri. Balkon, teras, pergola ve açık alan asma germe çözümleri için kaliteli ve güvenilir hizmet.',
  'priceRange': '$$',
  'openingHoursSpecification': [
    {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday'
      ],
      'opens': '08:00',
      'closes': '18:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': 'Saturday',
      'opens': '09:00',
      'closes': '15:00'
    }
  ],
  'sameAs': [
    'https://www.instagram.com/asmagerme',
    'https://www.facebook.com/asmagerme'
  ]
};

// SEO metadata - i18n uyumlu
const title = computed(() => locale.value === 'tr' 
  ? 'ASMA GERME - İstanbul Profesyonel Asma Germe Hizmetleri'
  : 'ASMA GERME - Professional Awning Services in Turkey')

const description = computed(() => locale.value === 'tr'
  ? 'İstanbul\'de profesyonel asma germe hizmetleri. Balkon, teras, pergola ve açık alan asma germe çözümleri için kaliteli ve güvenilir hizmet.'
  : 'Professional awning services in Turkey. Quality and reliable service for balcony, terrace, pergola and outdoor awning solutions.')

const keywords = computed(() => locale.value === 'tr'
  ? 'istanbul asma germe, profesyonel asma germe, balkon germe, teras germe, pergola germe, bayraklı asma germe, istanbul asma germe firması, asma germe'
  : 'turkey awning, professional awning, balcony awning, terrace awning, pergola awning, awning company, awning service')

useHead({
  title,
  meta: [
    // Temel meta etiketleri
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    
    // Canonical URL
    { name: 'canonical', content: 'https://asma-germe.com/' },
    
    // Open Graph etiketleri
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://asma-germe.com/og.webp' },
    { property: 'og:url', content: 'https://asma-germe.com' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'ASMA GERME' },
    { property: 'og:locale', content: 'tr_TR' },
    
    // Twitter Card etiketleri
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'ASMA GERME - İstanbul Profesyonel Asma Germe Hizmetleri' },
    { name: 'twitter:description', content: 'İstanbul\'de profesyonel asma germe hizmetleri. Balkon, teras, pergola ve açık alan asma germe çözümleri için kaliteli ve güvenilir hizmet.' },
    { name: 'twitter:image', content: 'https://asma-germe.com/og.webp' },
    
    // Diğer meta etiketleri
    { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
    { name: 'author', content: 'ASMA GERME' },
    { name: 'geo.region', content: 'TR-34' },
    { name: 'geo.placename', content: 'İstanbul' }
  ],
  link: [
    { rel: 'canonical', href: 'https://asma-germe.com/' }
  ],
  script: [
    { type: 'application/ld+json', children: JSON.stringify(structuredData) }
  ]
})

// Stats verileri için reactive değişkenler
const stats = reactive({
  customers: 0,
  experience: 0,
  staff: 0,
  quality: 0
})

const targetStats = reactive({
  customers: 0,
  experience: 0,
  staff: 0,
  quality: 0
})

// Hero ayarları için değişkenler
const heroSettings = reactive({
  videoOpacity: 100,
  useGradientMask: true,
  isVideoFixed: false, // false: absolute, true: fixed
  videoUrl: '/bg.mp4' // varsayılan video url'si
})

// Video elementi referansı
const videoElement = ref(null)

// Video hata durumunu kontrol etmek için
const handleVideoError = (e) => {
  console.error('Video yüklenirken hata oluştu:', e)
  
  // Hata durumunda varsayılan videoya geri dön
  if (heroSettings.videoUrl !== '/bg.mp4') {
    heroSettings.videoUrl = '/bg.mp4'
  }
}

// Ayarlardan stats verilerini çek
const fetchStatsSettings = async () => {
  try {
    const response = await $fetch('/api/settings', {
      query: { key: 'stats' }
    })

    if (response.success && response.data) {
      // Hedef değerleri ayarla
      targetStats.customers = response.data.customers || 0
      targetStats.experience = response.data.experience || 0
      targetStats.staff = response.data.staff || 0
      targetStats.quality = response.data.quality || 0
    }
  } catch (error) {
    console.error('Stats verileri getirilemedi:', error)
  }
}

// Ayarlardan hero video ayarlarını çek
const fetchHeroSettings = async () => {
  try {
    const response = await $fetch('/api/settings', {
      query: { key: 'heroSettings' }
    })
    
    if (response.success && response.data) {
      heroSettings.videoOpacity = response.data.videoOpacity ?? 100
      heroSettings.useGradientMask = response.data.useGradientMask ?? true
      heroSettings.isVideoFixed = response.data.isVideoFixed ?? false
      heroSettings.videoUrl = response.data.videoUrl || '/bg.mp4'
          }
  } catch (error) {
    console.error('Hero ayarları getirilemedi:', error)
  }
}

// FAQ items - i18n ile dinamik
const faqItems = computed(() => {
  const items = t('faq.items', [], { returnObjects: true })
  return Array.isArray(items) ? items.map((item, index) => ({
    label: item.question,
    icon: ['i-lucide-map', 'i-lucide-shield', 'i-lucide-award', 'i-lucide-receipt', 'i-lucide-clock'][index] || 'i-lucide-help-circle',
    content: item.answer
  })) : []
})

// Function to animate stats
const animateStats = () => {
  const duration = 2000 // 2 seconds
  const frameDuration = 1000 / 60 // 60fps
  const totalFrames = Math.round(duration / frameDuration)
  let frame = 0

  const timer = setInterval(() => {
    frame++
    const progress = frame / totalFrames

    stats.customers = Math.floor(progress * targetStats.customers)
    stats.experience = Math.floor(progress * targetStats.experience)
    stats.staff = Math.floor(progress * targetStats.staff)
    stats.quality = Math.floor(progress * targetStats.quality)

    if (frame === totalFrames) {
      clearInterval(timer)
    }
  }, frameDuration)
}

// Fetch blog posts on page load
onMounted(async () => {
  // Stats verilerini çek
  await fetchStatsSettings()
  
  // Hero ayarlarını çek
  await fetchHeroSettings()

  if (process.client) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target === statsRef.value) {
          animateStats()
        }
      })
    }, { threshold: 0.2 })

    if (statsRef.value) {
      observer.observe(statsRef.value)
    }
  }

  // Blog yazılarını çek
  await fetchHomepagePosts();
})

// State for blog posts in homepage
const homepagePosts = ref([]);

// Fetch homepage blog posts
const fetchHomepagePosts = async () => {
  try {
    const response = await $fetch('/api/blogs', {
      params: {
        limit: 3,
        page: 1,
        published: 'true'
      }
    });

    homepagePosts.value = response.blogs || [];
  } catch (error) {
    console.error('Error fetching homepage blog posts:', error);
  }
}
</script>

<template>
  <div class="overflow-x-hidden">
    <!-- Hero Section -->
    <div class="hero-overlay inset-0 -z-10 overflow-hidden animate-fade-in" :class="{ 'gradient-mask-horizontal': heroSettings.useGradientMask }">
      <video autoplay muted loop playsinline alt="İstanbul Profesyonel Asma Germe Hizmetleri - ASMA GERME"
        :class="[heroSettings.isVideoFixed ? 'fixed' : 'absolute', 'right-0 bottom-0 min-w-full min-h-full w-screen h-screen object-cover -z-10']"
        :style="{ opacity: heroSettings.videoOpacity / 100 }"
        :src="heroSettings.videoUrl || '/bg.mp4'"
        @error="handleVideoError"
        ref="videoElement"
        >
      </video>
      <div class="absolute inset-0 bg-gradient-to-r from-primary-100/90 to-primary-300/70 dark:bg-gradient-to-r dark:from-primary-900/70 dark:to-primary-700/50">
      </div>
    </div>

    <UPageHero id="anasayfa" ref="heroRef"
      class="h-screen flex items-center justify-center -top-10 relative animate-fade-in">
      <UContainer class="relative z-10">
        <div class="">
          <h1
            class="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-md text-center mb-6 tracking-tight leading-tight">
            {{ t('hero.title') }}
          </h1>
          <p class="text-xl md:text-2xl text-white/90 text-center mb-8 drop-shadow-md leading-relaxed">
            {{ t('hero.subtitle') }}
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <UButton to="https://wa.me/905497222100" target="_blank" color="success" size="xl" block
              icon="i-simple-icons-whatsapp"
              class="font-medium px-6 py-4 transform hover:px-20 duration-500 transition-all">
              {{ t('hero.cta.primary') }}
            </UButton>
            <UButton to="tel:05497222100" color="secondary" variant="solid" size="xl" block icon="i-lucide-phone"
              class="font-medium px-6 py-4 transform hover:px-20 duration-500 transition-all">
              {{ locale === 'tr' ? 'Bizi Arayın' : 'Call Us' }}
            </UButton>
          </div>

          <div class="mt-8 flex items-center text-white justify-center text-xs drop-shadow-md gap-1">
            <span>{{ t('hero.discover') }}</span>
            <UIcon name="i-lucide-chevron-down" class="animate-bounce size-4" />
          </div>
        </div>

        <div class="flex justify-center relative text-xs my-10">
          <div class="flex flex-col md:flex-row gap-6 text-white/80 drop-shadow-md">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="text-secondary-300" />
              <span>{{ t('hero.features.consultation') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="text-secondary-300" />
              <span>{{ t('hero.features.guarantee') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="text-secondary-300" />
              <span>{{ t('hero.features.support') }}</span>
            </div>
          </div>
        </div>
      </UContainer>
    </UPageHero>

    <!-- About Section -->
    <UPageSection id="about" ref="aboutRef" :title="t('about.subtitle')" v-motion="fadeIn"
      :description="t('about.description')"
      :headline="t('about.title')" orientation="horizontal" :features="[
        {
          title: t('about.features.expertise.title'),
          description: t('about.features.expertise.description'),
          icon: 'i-lucide-check',
        },
        {
          title: t('about.features.quality.title'),
          description: t('about.features.quality.description'),
          icon: 'i-lucide-leaf',
        },
        {
          title: t('about.features.reliability.title'),
          description: t('about.features.reliability.description'),
          icon: 'i-lucide-clock',
        },
        {
          title: t('about.features.guarantee.title'),
          description: t('about.features.guarantee.description'),
          icon: 'i-lucide-shield',
        }
      ]" class=" backdrop-blur-sm">
      <div v-motion="scaleIn" class="w-full h-96 md:h-[500px] lg:h-[600px]">
        <PhotoSphere360 
          image-url="/bg.webp" 
          :auto-rotate="true"
          auto-rotate-speed="0.5rpm"
          :enable-gyroscope="true"
          height="100%"
          class="w-full h-full"
        />
      </div>
    </UPageSection>

    <!-- Services Section -->
    <UPageSection id="services" ref="servicesRef" :title="t('services.title')"
      :description="t('services.subtitle')">
      <UPageGrid class="mt-10 text-center">
        <UPageCard v-motion="getMotionWithDelay(0, fadeLeft)" :title="t('services.balkon.title')"
          :description="t('services.balkon.description')"
          icon="i-lucide-home"
          :ui="{ title: 'font-black text-3xl py-4', description: 'text-md font-base', leadingIcon: 'size-20 mt-4', wrapper: 'z-50' }"
          spotlight class="group aspect-square overflow-hidden rounded-3xl">
          <img src="/2.webp" :alt="t('services.balkon.imageAlt')"
            class="w-full h-full object-cover absolute left-0 top-0 opacity-20 pointer-events-none" loading="lazy" />
        </UPageCard>

        <UPageCard v-motion="getMotionWithDelay(1, fadeIn)" :title="t('services.teras.title')"
          :description="t('services.teras.description')"
          icon="i-lucide-sun"
          :ui="{ title: 'font-black text-3xl py-4', description: 'text-md font-base', leadingIcon: 'size-20 mt-4', wrapper: 'z-50' }"
          spotlight class="group aspect-square overflow-hidden rounded-3xl">
          <img src="/3.webp" :alt="t('services.teras.imageAlt')"
            class="w-full h-full object-cover absolute left-0 top-0 opacity-20 pointer-events-none" loading="lazy" />
        </UPageCard>

        <UPageCard v-motion="getMotionWithDelay(2, fadeRight)" :title="t('services.pergola.title')"
          :description="t('services.pergola.description')"
          icon="i-lucide-trees"
          :ui="{ title: 'font-black text-3xl py-4', description: 'text-md font-base', leadingIcon: 'size-20 mt-4', wrapper: 'z-50' }"
          spotlight class="group aspect-square overflow-hidden rounded-3xl">
          <img src="/1.webp" :alt="t('services.pergola.imageAlt')"
            class="w-full h-full object-cover absolute left-0 top-0 opacity-20 pointer-events-none" loading="lazy" />
        </UPageCard>
      </UPageGrid>
    </UPageSection>

    <!-- Stats Section -->
    <section id="stats-section" ref="statsRef" class="py-16 bg-primary-500 text-white">
      <UContainer>
        <h2 class="text-center text-white mb-10 sr-only">{{ t('stats.title') }}</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center" v-motion="getMotionWithDelay(0, fadeIn)">
            <UBadge color="white" variant="soft" size="xl" class="px-6 py-3 mb-3">
              <span class="text-4xl font-bold">+{{ stats.customers }}</span>
            </UBadge>
            <UProgress color="primary" :value="stats.customers / targetStats.customers * 100" class="my-2" />
            <div class="text-lg">{{ t('stats.customers') }}</div>
          </div>

          <div class="text-center" v-motion="getMotionWithDelay(1, fadeIn)">
            <UBadge color="white" variant="soft" size="xl" class="px-6 py-3 mb-3">
              <span class="text-4xl font-bold">+{{ stats.experience }}</span>
            </UBadge>
            <UProgress color="primary" :value="stats.experience / targetStats.experience * 100" class="my-2" />
            <div class="text-lg">{{ t('stats.experience') }}</div>
          </div>

          <div class="text-center" v-motion="getMotionWithDelay(2, fadeIn)">
            <UBadge color="white" variant="soft" size="xl" class="px-6 py-3 mb-3">
              <span class="text-4xl font-bold">+{{ stats.staff }}</span>
            </UBadge>
            <UProgress color="primary" :value="stats.staff / targetStats.staff * 100" class="my-2" />
            <div class="text-lg">{{ t('stats.staff') }}</div>
          </div>

          <div class="text-center" v-motion="getMotionWithDelay(3, fadeIn)">
            <UBadge color="white" variant="soft" size="xl" class="px-6 py-3 mb-3">
              <span class="text-4xl font-bold">{{ stats.quality }}%</span>
            </UBadge>
            <UProgress color="primary" :value="stats.quality" class="my-2" />
            <div class="text-lg">{{ t('stats.quality') }}</div>
          </div>
        </div>
      </UContainer>
    </section>

    <UContainer ref="blogRef">
      <BlogMore :posts="homepagePosts" v-motion="fadeIn" :title="t('blog.title')" :buttonText="t('blog.viewAll')"
        buttonLink="/blog" :showButton="true" />
    </UContainer>

    <!-- FAQ Section -->
    <UPageSection id="faq" ref="faqRef" v-motion="fadeIn" :title="t('faq.title')"
      :description="t('faq.subtitle')" class="backdrop-blur-sm">
      <UAccordion :items="faqItems" />
    </UPageSection>

    <!-- Contact Section -->
    <UPageSection id="contact" ref="contactRef" v-motion="fadeIn" :title="t('contact.title')"
      :description="t('contact.subtitle')"
      orientation="horizontal">
      <template #features>
        <div class="space-y-6">
          <div v-motion="getMotionWithDelay(0, fadeLeft)"
            class="flex items-center gap-3 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <UIcon name="i-lucide-map-pin" class="text-primary-500 text-xl flex-shrink-0" />
            <div>{{ t('contact.location') }}</div>
          </div>

          <div v-motion="getMotionWithDelay(1, fadeLeft)"
            class="flex items-center gap-3 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <UIcon name="i-lucide-phone" class="text-primary-500 text-xl flex-shrink-0" />
            <ULink to="tel:05497222100" class="hover:underline">{{ t('contact.phone') }}</ULink>
          </div>

          <div v-motion="getMotionWithDelay(2, fadeLeft)"
            class="flex items-center gap-3 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <UIcon name="i-lucide-mail" class="text-primary-500 text-xl flex-shrink-0" />
            <ULink to="mailto:info@asma-germe.com" class="hover:underline">info@asma-germe.com</ULink>
          </div>

          <div v-motion="getMotionWithDelay(3, fadeLeft)"
            class="flex items-center gap-3 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <UIcon name="i-lucide-clock" class="text-primary-500 text-xl flex-shrink-0" />
            <div>{{ t('contact.hours') }}</div>
          </div>

          <UAlert v-motion="getMotionWithDelay(4, fadeIn)" :title="t('contact.freeConsultation')"
            :description="t('contact.freeConsultationDescription')"
            color="info" variant="soft" icon="i-lucide-info" class="mt-6" />
        </div>
      </template>

      <iframe v-motion="scaleIn"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.8939755953556!2d28.716320315525755!3d41.013576379297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa70298c11c75%3A0x7a8a9a0a9a0a9a0a!2zQXZjxLFsYXIsIMSwc3RhbmJ1bA!5e0!3m2!1str!2str!4v1745084118281!5m2!1str!2str"
        width="100%" height="450" style="border:0; border-radius: 0.5rem;" allowfullscreen="" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade" title="ASMA GERME Konum - Google Haritalar"
        aria-label="İstanbul Avcılar'daki konumumuz"></iframe>
    </UPageSection>

    <USeparator class="my-8" />
    <UContainer>
      <UPageCTA ref="ctaRef" v-motion="scaleIn" :title="t('cta.title')"
        :description="t('cta.subtitle')"
        :links="[
          {
            label: t('contact.cta.whatsapp'),
            to: 'https://wa.me/905497222100',
            target: '_blank',
            color: 'success',
            size: 'xl',
            icon: 'i-simple-icons-whatsapp'
          },
          {
            label: t('contact.cta.call'),
            to: 'tel:05497222100',
            target: '_blank',
            color: 'primary',
            size: 'xl',
            variant: 'outline',
            icon: 'i-lucide-phone'
          }
        ]" variant="soft"
        class="overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-950 bg-opacity-0 backdrop-blur-sm">
        <div
          class="absolute rounded-full bg-primary-500/20 dark:bg-primary-400/10 blur-[150px] size-60 transform -translate-x-1/2 left-1/2 -translate-y-1/2" />
      </UPageCTA>
    </UContainer>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-in-out;
}

.animate-fade-in-delay-1 {
  animation: fadeIn 1s ease-in-out 0.2s;
  animation-fill-mode: both;
}

.animate-fade-in-delay-2 {
  animation: fadeIn 1s ease-in-out 0.4s;
  animation-fill-mode: both;
}

.animate-fade-in-delay-3 {
  animation: fadeIn 1s ease-in-out 0.6s;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Hero animasyonları */
.hero-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent);
  background-size: 10px 10px;
  animation: moveBackground 30s linear infinite;
  opacity: 0.1;
  pointer-events: none;
}

@keyframes moveBackground {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 100px 100px;
  }
}
</style>
