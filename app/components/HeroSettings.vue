<template>
    <div class="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
        <h2 class="text-xl font-bold mb-4">Hero Bölümü Ayarları</h2>

        <div class="space-y-4">
            <UCard v-if="heroSettings.videoOpacity !== undefined">
                <div class="relative w-full h-48 overflow-hidden rounded-lg">
                    <div class="absolute inset-0 overflow-hidden"
                        :class="heroSettings.useGradientMask ? 'gradient-mask' : 'gradient-mask-vertical'">
                        <video autoplay muted loop playsinline class="w-full h-full object-cover"
                            :class="heroSettings.isVideoFixed ? 'fixed' : 'absolute'"
                            :style="{ opacity: heroSettings.videoOpacity / 100 }">
                            <source :src="heroSettings.videoUrl || '/bg.mp4'" type="video/mp4">
                        </video>
                        <div class="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-700/70"></div>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="text-white text-xl font-bold bg-black/30 px-4 py-2 rounded-md">Önizleme</div>
                    </div>
                </div>
            </UCard>
            <UFormField label="Video Opaklığı (%)" help="Arka plan videosunun opaklık değeri (0-100 arası)">
                <USlider v-model="heroSettings.videoOpacity" :step="10" size="xl" class="w-full" :format-options="{
                }" :min="0" :max="100" />
            </UFormField>

            <UFormField label="Video URL" help="Video dosyasının adresi (boş bırakılırsa varsayılan video kullanılır)">
                <UInput v-model="heroSettings.videoUrl" placeholder="/bg.mp4" size="xl" class="w-full">
                    <template #trailing>
                        <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-refresh-ccw"
                            @click="heroSettings.videoUrl = '/bg.mp4'" />
                    </template>
                </UInput>
                <template #hint>
                    <span class="text-xs text-gray-500">Varsayılan: /bg.mp4</span>
                </template>
            </UFormField>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <USwitch label="Video Pozisyonu" description="Arka plan videosunun ekranı takip edecek"
                    v-model="heroSettings.isVideoFixed" size="xl" />

                <USwitch v-model="heroSettings.useGradientMask" size="xl" label="Maskeleme"
                    description="Aşağı doğru silinme uygulanacak" />
            </div>


            <div class="flex justify-end mt-10">
                <UButton :loading="isSavingSettings" :disabled="isSavingSettings" block color="primary"
                    @click="saveSettings" icon="i-lucide-save">
                    Hero Ayarlarını Güncelle
                </UButton>
            </div>
        </div>
    </div>
</template>

<script setup>
const heroSettings = reactive({
    videoOpacity: 100,
    useGradientMask: true,
    isVideoFixed: false, // false: absolute, true: fixed
    videoUrl: '/bg.mp4' // varsayılan video url'si
})

const isSavingSettings = ref(false)

// Hero ayarlarını çek
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
        showToast({
            title: 'Hata',
            description: 'Hero ayarları getirilemedi.',
            color: 'error'
        })
    }
}

// Hero ayarlarını güncelle
const saveSettings = async () => {
    try {
        isSavingSettings.value = true

        const response = await $fetch('/api/settings', {
            method: 'PUT',
            body: {
                key: 'heroSettings',
                value: {
                    videoOpacity: parseInt(heroSettings.videoOpacity) || 100,
                    useGradientMask: heroSettings.useGradientMask,
                    isVideoFixed: heroSettings.isVideoFixed,
                    videoUrl: heroSettings.videoUrl || '/bg.mp4'
                },
                description: 'Anasayfa hero bölümü video ve gradient ayarları'
            }
        })

        if (response.success) {
            showToast({
                title: 'Başarılı',
                description: 'Hero ayarları başarıyla güncellendi.',
                color: 'success'
            })
        } else {
            throw new Error(response.message || 'Bir hata oluştu')
        }
    } catch (error) {
        console.error('Hero ayarları güncellenemedi:', error)
        showToast({
            title: 'Hata',
            description: 'Hero ayarları güncellenemedi.',
            color: 'error'
        })
    } finally {
        isSavingSettings.value = false
    }
}

// Toast mesajları için yardımcı fonksiyon
const showToast = ({ title, description, color }) => {
    const toast = useToast()
    toast.add({
        title,
        description,
        color
    })
}

// Sayfa yüklendiğinde verileri çek
onMounted(() => {
    fetchHeroSettings()
})
</script>

<style scoped>
.gradient-mask-horizontal {
    mask-image: linear-gradient(to right, black 50%, transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black 50%, transparent 100%);
}
</style>
