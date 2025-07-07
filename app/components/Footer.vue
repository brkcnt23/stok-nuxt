<script setup lang="ts">
// Import i18n
const { t, locale } = useI18n()

// Footer kolonları - i18n ile dinamik
const columns = computed(() => [{
  label: t('footer.services'),
  children: [{
    label: t('footer.services_items.balcony'),
    to: '/#services'
  }, {
    label: t('footer.services_items.terrace'),
    to: '/#services'
  }, {
    label: t('footer.services_items.pergola'),
    to: '/#services'
  }, {
    label: t('footer.services_items.consultation'),
    to: '/#contact'
  }]
}, {
  label: t('footer.corporate'),
  children: [{
    label: t('footer.corporate_items.about'),
    to: '/#about'
  }, {
    label: t('footer.corporate_items.stats'),
    to: '/#services'
  }, {
    label: t('footer.corporate_items.faq'),
    to: '/#faq'
  }, {
    label: t('footer.corporate_items.blog'),
    to: '/blog'
  }]
}, {
  label: t('footer.contact'),
  children: [{
    label: t('footer.contact_items.address'),
    to: '/#contact'
  }, {
    label: t('footer.contact_items.phone'),
    to: 'tel:05497222100'
  }, {
    label: t('footer.contact_items.email'),
    to: 'mailto:info@asma-germe.com'
  }, {
    label: t('footer.contact_items.whatsapp'),
    to: 'https://wa.me/905497222100',
    target: '_blank'
  }]
}])

// Son eklenen blogları getir
const recentBlogs = ref<any[]>([])
const isLoading = ref(true)

// Blogları yükle
const fetchRecentBlogs = async () => {
  try {
    isLoading.value = true
    const response = await $fetch('/api/blogs', {
      params: {
        limit: 5, // Son 4 blog
        page: 1,
        published: 'true', // Sadece yayınlanmış olanlar
      }
    })

    recentBlogs.value = response.blogs || []
  } catch (error) {
    console.error('Son blogları getirme hatası:', error)
  } finally {
    isLoading.value = false
  }
}

// Component yüklendiğinde blogları getir
onMounted(() => {
  fetchRecentBlogs()
})

// Kısa blog başlığı oluştur
const truncateTitle = (blog: any, maxLength = 40) => {
  // i18n formatında blog var mı kontrol et
  let title = '';
  if (blog.i18n && blog.i18n[locale.value]) {
    title = blog.i18n[locale.value].title || blog.i18n.tr.title || ''
  } else {
    // Eski format için basit title kullan
    title = blog.title || ''
  }
  
  if (!title) return ''
  return title.length <= maxLength ? title : `${title.substring(0, maxLength)}...`
}
</script>
<template>
  <div class="mt-6">
  <div class="hidden sm:block">
  <USeparator>
    <Logo />
  </USeparator>
  <UFooter>
    <template #top>
      <UContainer>
        <UFooterColumns :columns="columns">
          <template #right>
            <!-- Sağ kısım - Son Bloglar -->
            <div class="col-span-1 lg:col-span-1">
              <h3 class="font-bold text-sm mb-4">{{ t('footer.recentBlogs') }}</h3>
              <!-- Yükleniyor durumu -->
              <div v-if="isLoading" class="space-y-3">
                <div v-for="i in 5" :key="i" class="animate-pulse flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
                </div>
              </div>
              <!-- Blog listesi -->
              <ul v-else-if="recentBlogs.length > 0" class="space-y-2">
                <li v-for="blog in recentBlogs" :key="blog._id" class="group transition-all">
                  <NuxtLink :to="`/blog/${blog.slug || blog._id}`"
                    class="flex items-center gap-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <UIcon name="i-lucide-file-text"
                      class="text-primary-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                    <span
                      class="text-sm line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {{ truncateTitle(blog) }}
                    </span>
                  </NuxtLink>
                </li>
              </ul>
              <!-- Blog bulunamadı durumu -->
              <div v-else class="text-sm text-neutral-500 dark:text-neutral-400 italic">
                {{ t('footer.noBlogs') }}
              </div>
            </div>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>
  </UFooter>
  </div>
  <USeparator>
    <div class="container mx-auto">
      <div class="flex flex-col items-center justify-center">
        <div class="flex space-x-6">
          <a href="https://x.com/asmagerme" target="_blank" rel="noopener noreferrer"
            class="hover:text-neutral-400 transition-colors">
            <UIcon name="i-simple-icons-x" class="w-6 h-6" />
          </a>
          <a href="https://instagram.com/asmagerme" target="_blank" rel="noopener noreferrer"
            class="hover:text-fuchsia-400 transition-colors">
            <UIcon name="i-simple-icons-instagram" class="w-6 h-6" />
          </a>
          <a href="https://facebook.com/asmagerme" target="_blank" rel="noopener noreferrer"
            class="hover:text-blue-400 transition-colors">
            <UIcon name="i-simple-icons-facebook" class="w-6 h-6" />
          </a>
          <a href="https://wa.me/905497222100" target="_blank" rel="noopener noreferrer"
            class="hover:text-green-400 transition-colors">
            <UIcon name="i-simple-icons-whatsapp" class="w-6 h-6" />
          </a>
        </div>
      </div>
    </div>
  </USeparator>
  <div class="py-8">
    <NuxtLink to="https://upcreate.art" target="_blank"
      class="text-xs text-neutral-500 dark:text-neutral-400 w-full flex relative items-center justify-center">
      <div class="flex items-center justify-center absolute">
        <div
          class="relative px-4 py-1 bg-transparent border border-neutral-500 rounded-full hover:bg-primary-500/10 hover:border-primary-500 duration-1000">
          <div class="flex flex-col items-center">
            © ASMA GERME
            {{ new Date().getFullYear() }} · Upcreate · {{ t('footer.copyright') }}
          </div>
        </div>
      </div>
    </NuxtLink>
  </div></div>
</template>