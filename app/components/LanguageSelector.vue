<script setup lang="ts">
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
  color?: 'neutral' | 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'ghost',
  color: 'neutral',
  class: ''
})

const { locale, t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

// Dil bilgileri ve flag iconları
const languages = {
    tr: {
        name: 'Türkçe',
        flag: '🇹🇷',
        icon: 'i-circle-flags-tr'
    },
    en: {
        name: 'English',
        flag: '🇬🇧',
        icon: 'i-circle-flags-gb'
    }
}

// Mevcut dil bilgisi
const currentLang = computed(() => languages[locale.value as keyof typeof languages])

// Diğer dil (toggle için)
const otherLang = computed(() => {
    const otherLocale = locale.value === 'tr' ? 'en' : 'tr'
    return {
        locale: otherLocale,
        ...languages[otherLocale as keyof typeof languages]
    }
})

// Dil değiştirme fonksiyonu
const switchLanguage = async () => {
    const newLocale = otherLang.value.locale as 'tr' | 'en'
    
    // Mevcut route'u al
    const currentRoute = router.currentRoute.value
    
    // Yeni dil için path oluştur
    const newPath = localePath(currentRoute.path, newLocale)
    
    // Nuxt router ile navigasyon yap - bu i18n state'ini doğru şekilde güncelleyecek
    await navigateTo(newPath)
}
</script>

<template>
    <ClientOnly>
        <UTooltip :text="t('nav.language') + `: ${otherLang.name}`" :delay-duration="100">
            <UButton 
                :aria-label="`Switch to ${otherLang.name}`" 
                :color="color" 
                :variant="variant"
                :size="size"
                :icon="currentLang.icon" 
                :class="['rounded-full', props.class]"
                @click="switchLanguage" 
            />
        </UTooltip>
        <template #fallback>
            <div class="size-4" />
        </template>
    </ClientOnly>
</template>
