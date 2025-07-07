<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const items = computed(() => [
    {
        label: t('nav.home'),
        to: localePath('/#anasayfa'),
        active: route.path === '/' && (!route.hash || route.hash === '#anasayfa')
    },
    {
        label: t('nav.about'),
        to: localePath('/hakkimizda'),
        active: route.path === '/hakkimizda'
    },
    {
        label: t('nav.projects'),
        to: localePath('/projeler'),
        active: route.path.startsWith('/projeler')
    },
    {
        label: t('nav.products'),
        to: localePath('/urunler'),
        active: route.path.startsWith('/urunler')
    },
    {
        label: t('nav.blog'),
        to: localePath('/blog'),
        active: route.path.startsWith('/blog')
    },
    {
        label: t('nav.contact'),
        to: localePath('/iletisim'),
        active: route.path === '/iletisim'
    }
])

// Mobile menu state
const isOpen = ref(false)

// Rota değişimini izleyerek mobil menüyü kapat
watch(() => route.fullPath, () => {
    isOpen.value = false
})
</script>

<template>
    <UHeader :ui="{
        container: 'py-3'
    }">
        <template #left>
            <NuxtLink :to="localePath('/#home')" class="flex items-center">
                <Logo class="w-auto h-10 sm:h-14 shrink-0 mr-2" />
            </NuxtLink>
        </template>

        <!-- Desktop Navigation -->
        <UNavigationMenu :items="items" variant="link" class="hidden md:flex" />

        <template #right>
            <!-- Language Switcher -->
            <LanguageSelector class="hidden md:inline-flex" />

            <RenkSec />
  
        </template>

        <!-- Mobile Menu Content -->
        <template #body>
            <!-- Mobile Language Switcher -->
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium">{{ t('nav.language') }}</span>
                <LanguageSelector size="sm" />
            </div>

            <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />

            <USeparator class="my-6" />

            <UButton :label="t('nav.call')" color="primary" variant="subtle" to="tel:05497222100" icon="i-lucide-phone"
                block class="mb-3" />
            <UButton :label="t('nav.whatsapp')" color="success" icon="i-simple-icons-whatsapp"
                to="https://wa.me/905497222100" target="_blank" block />
        </template>
    </UHeader>
</template>
