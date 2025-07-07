<script setup>
// Import i18n
const { t, locale } = useI18n()

const servicesRef = ref(null)
const aboutRef = ref(null)
const statsRef = ref(null)
const blogRef = ref(null)
const faqRef = ref(null)
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

// SEO metadata - i18n uyumlu
const title = computed(() => locale.value === 'tr' 
  ? 'ASMA GERME - Hakkımızda | Türkiye\'nin Asma Germe Şirketi'
  : 'ASMA GERME - About Us | Turkey\'s Awning Company')

const description = computed(() => locale.value === 'tr'
  ? 'Asma Germe özel bir asma germe şirketidir. Türkiye genelinde profesyonel asma germe hizmetleri sunmaktadır, her türlü asma germe ihtiyacınıza çözüm üretmektedir.'
  : 'Asma Germe is a specialized awning company. We provide professional awning services throughout Turkey, offering solutions for all your awning needs.')

const keywords = computed(() => locale.value === 'tr'
  ? 'asma germe hakkında, profesyonel asma germe, balkon germe, teras germe, pergola germe, asma germe şirketi, asma germe firması'
  : 'about awning company, professional awning, balcony awning, terrace awning, pergola awning, awning company, awning services')

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: '/og.webp' },
    { property: 'og:url', content: 'https://asma-germe.com/hakkimizda' },
    { property: 'og:type', content: 'website' }
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
  <div>

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
      <img src="/1.webp" :alt="t('about.imageAlt')" v-motion="scaleIn"
        class="w-full rounded-lg shadow-xl" loading="lazy" />
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

    <USeparator class="my-8" />
    <UContainer>
      <UPageCTA ref="ctaRef" v-motion="scaleIn" :title="t('contact.cta_title')"
        :description="t('contact.cta_description')"
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

</style>
