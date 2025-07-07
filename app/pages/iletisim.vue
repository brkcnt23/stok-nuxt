<script setup>
// Import i18n
const { t, locale } = useI18n()
const localePath = useLocalePath()

const contactRef = ref(null)

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
const seoTitle = computed(() => `${t('contact.title')} - ASMA GERME`)
const seoDescription = computed(() => t('contact.description'))
const seoKeywords = computed(() => locale.value === 'tr'
  ? 'asma germe iletişim, balkon germe, teras germe, pergola germe, ücretsiz keşif, fiyat teklifi'
  : 'awning contact, balcony awning, terrace awning, pergola awning, free consultation, price quote')

useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    { name: 'keywords', content: seoKeywords },
    { property: 'og:title', content: seoTitle },
    { property: 'og:description', content: seoDescription },
    { property: 'og:image', content: '/og.webp' },
    { property: 'og:url', content: 'https://asma-germe.com/iletisim' },
    { property: 'og:type', content: 'website' }
  ]
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
            <ULink to="mailto:info@asma-germe.com" class="hover:underline">{{ t('contact.email') }}</ULink>
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
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3123.5680941506093!2d27.179441999999998!3d38.4745314!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b97dc6fdffd7c1%3A0xdef932fe872922cb!2zVEVNxLBaTcSwUiDEsHptaXIgVGVtaXpsaWsgxZ5pcmtldGk!5e0!3m2!1str!2str!4v1745084118281!5m2!1str!2str"
        width="100%" height="450" style="border:0; border-radius: 0.5rem;" allowfullscreen="" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade" title="ASMA-GERME Konum - Google Haritalar"
        aria-label="İstanbul'daki konumumuz"></iframe>
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
