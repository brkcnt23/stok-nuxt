<template>
  <div class="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
    <h2 class="text-xl font-bold mb-4">Site İstatistikleri</h2>
    
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Mutlu Müşteri Sayısı" help="Anasayfada görünen müşteri sayısı">
          <UInputNumber v-model="statsForm.customers" placeholder="Örn: 2500" size="xl" class="w-full"/>
        </UFormField>
        
        <UFormField label="Yıllık Deneyim" help="Şirketin kaç yıllık deneyime sahip olduğu">
          <UInputNumber v-model="statsForm.experience" placeholder="Örn: 15" size="xl" class="w-full"/>
        </UFormField>
        
        <UFormField label="Profesyonel Personel" help="Çalışan personel sayısı">
          <UInputNumber v-model="statsForm.staff" placeholder="Örn: 50" size="xl" class="w-full"/>
        </UFormField>
        
        <UFormField label="Kalite Puanı (%)" help="Yüzdelik kalite puanı (0-100 arası)">
          <UInputNumber v-model="statsForm.quality" :min="0" :max="100" placeholder="Örn: 100" size="xl" class="w-full"/>
        </UFormField>
      </div>
      
      <div class="flex justify-end">
        <UButton 
          :loading="isSavingStats" 
          :disabled="isSavingStats" 
          color="primary" 
          @click="saveStats" 
          icon="i-lucide-save"
        >
          İstatistikleri Güncelle
        </UButton>
      </div>
    </div>
    
    <div class="mt-8">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Site Haritası (Sitemap)</h3>
            <div class="flex gap-2">
              <UButton
                color="primary"
                icon="i-lucide-refresh"
                :loading="isFetching"
                @click="updateStats"
                size="sm"
                variant="soft"
              >
                Yenile
              </UButton>
              <UButton
                color="primary"
                icon="i-lucide-refresh-cw"
                :loading="isFetching"
                @click="regenerateSitemap"
                size="sm"
              >
                Sitemap Oluştur
              </UButton>
            </div>
          </div>
        </template>
        
        <div v-if="showSuccessMessage" class="mb-4">
          <UAlert
            title="Sitemap Güncellendi"
            description="Site haritası başarıyla güncellendi."
            color="success"
            variant="soft"
            icon="i-lucide-check-circle"
          />
        </div>
        
        <div v-if="showErrorMessage" class="mb-4">
          <UAlert
            title="Hata"
            :description="errorMessage"
            color="error"
            variant="soft"
            icon="i-lucide-alert-triangle"
          />
        </div>
        
        <div class="space-y-4">
          <div class="bg-success-50 dark:bg-success-950 border border-success-200 dark:border-success-800 p-4 rounded-lg">
            <div class="flex gap-2 items-center">
              <UIcon name="i-lucide-check-circle" class="text-success" />
              <p class="text-success-700 dark:text-success-300 font-medium">
                Dinamik Sitemap Aktif
              </p>
            </div>
            <p class="text-neutral-700 dark:text-neutral-300 mt-2">
              Site haritanız dinamik olarak çalışıyor. Yeni blog yazıları eklendiğinde, güncellendiğinde veya silindiğinde
              otomatik olarak sitemap'e yansıtılacaktır.
            </p>
          </div>
          
          <div v-if="isFetching">
            <USkeleton class="h-24 mb-4" />
            <USkeleton class="h-24" />
          </div>
          
          <div v-else class="flex flex-col gap-2">
            <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-globe" class="text-primary" />
                <span>Sitemap URL</span>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-external-link"
                to="/sitemap.xml"
                target="_blank"
                size="sm"
              >
                /sitemap.xml
              </UButton>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-file-text" class="text-primary" />
                <span>Toplam Blog</span>
              </div>
              <span>{{ blogCount || 0 }} yazı</span>
            </div>
            
            <div v-if="sitemapInfo?.lastGenerated" class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-clock" class="text-primary" />
                <span>Son Güncelleme</span>
              </div>
              <span>{{ lastGenerated }}</span>
            </div>
            
            <div v-if="sitemapInfo?.exists" class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-check-circle" class="text-success" />
                <span>Sitemap Durumu</span>
              </div>
              <UBadge color="success" variant="subtle">Aktif</UBadge>
            </div>
            <div v-else class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-alert-triangle" class="text-warning" />
                <span>Sitemap Durumu</span>
              </div>
              <UBadge color="warning" variant="subtle">Henüz Oluşturulmadı</UBadge>
            </div>
          </div>
        </div>
        
        <template #footer>
          <div class="text-sm text-neutral-500 dark:text-neutral-400">
            <p><strong>Dinamik Sitemap:</strong> Blog yazıları site haritasına otomatik olarak eklenir.</p>
            <p class="mt-1">Her sitemap erişiminde en güncel blog listesi gösterilir.</p>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup>
const statsForm = reactive({
  customers: 0,
  experience: 0,
  staff: 0,
  quality: 0
})

const isSavingStats = ref(false)
const isFetching = ref(false);
const lastGenerated = ref('');
const sitemapInfo = ref(null);
const showSuccessMessage = ref(false);
const showErrorMessage = ref(false);
const errorMessage = ref('');
const toast = useToast();
const blogCount = ref(0);

// İstatistik verilerini çek
const fetchStatsData = async () => {
  try {
    const response = await $fetch('/api/settings', {
      query: { key: 'stats' }
    })
    
    if (response.success && response.data) {
      statsForm.customers = response.data.customers || 0
      statsForm.experience = response.data.experience || 0
      statsForm.staff = response.data.staff || 0
      statsForm.quality = response.data.quality || 0
    }
  } catch (error) {
    console.error('İstatistik verileri getirilemedi:', error)
    showToast({
      title: 'Hata',
      description: 'İstatistik verileri getirilemedi.',
      color: 'error'
    })
  }
}

// İstatistikleri güncelle
const saveStats = async () => {
  try {
    isSavingStats.value = true
    
    const response = await $fetch('/api/settings', {
      method: 'PUT',
      body: {
        key: 'stats',
        value: {
          customers: parseInt(statsForm.customers) || 0,
          experience: parseInt(statsForm.experience) || 0,
          staff: parseInt(statsForm.staff) || 0,
          quality: parseInt(statsForm.quality) || 0
        },
        description: 'Anasayfada gösterilen istatistik bilgileri'
      }
    })
    
    if (response.success) {
      showToast({
        title: 'Başarılı',
        description: 'İstatistikler başarıyla güncellendi.',
        color: 'success'
      })
    } else {
      throw new Error(response.message || 'Bir hata oluştu')
    }
  } catch (error) {
    console.error('İstatistikler güncellenemedi:', error)
    showToast({
      title: 'Hata',
      description: 'İstatistikler güncellenemedi.',
      color: 'error'
    })
  } finally {
    isSavingStats.value = false
  }
};

// Sitemap bilgilerini getir
const fetchSitemapInfo = async () => {
  try {
    isFetching.value = true;
    
    // Get blog counts to show in the UI
    const blogsResponse = await $fetch('/api/blogs', {
      params: {
        isPublished: true,
        count: true
      }
    });
    
    if (blogsResponse && blogsResponse.total !== undefined) {
      blogCount.value = blogsResponse.total;
    }
    
    // Get information about the sitemap file
    const result = await $fetch('/api/sitemap/info');
    sitemapInfo.value = result;
    
    if (result.lastGenerated) {
      lastGenerated.value = new Date(result.lastGenerated).toLocaleString();
    }
  } catch (error) {
    console.error('Sitemap bilgisi getirme hatası:', error);
    errorMessage.value = error.message || 'Sitemap bilgileri getirilemedi';
    showErrorMessage.value = true;
    setTimeout(() => {
      showErrorMessage.value = false;
    }, 5000);
  } finally {
    isFetching.value = false;
  }
};

// Refresh sitemap - now just accesses the sitemap URL
const regenerateSitemap = async () => {
  try {
    isFetching.value = true;
    
    // Visit the sitemap URL directly, bypassing cache
    const response = await $fetch('/sitemap.xml', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      query: { _t: Date.now() } // Cache-busting parameter
    });
    
    showSuccessMessage.value = true;
    toast.add({
      title: 'Başarılı',
      description: 'Sitemap yenilendi. Tüm bloglar otomatik olarak dahil edildi.',
      color: 'success'
    });
    
    // Refresh our info
    await fetchSitemapInfo();
    
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 5000);
  } catch (error) {
    console.error('Sitemap yenileme hatası:', error);
    errorMessage.value = error.message || 'Sitemap yenilenirken bir hata oluştu';
    showErrorMessage.value = true;
    
    toast.add({
      title: 'Hata',
      description: error.message || 'Sitemap yenilenirken bir hata oluştu',
      color: 'error'
    });
    
    setTimeout(() => {
      showErrorMessage.value = false;
    }, 5000);
  } finally {
    isFetching.value = false;
  }
};

// İstatistikleri güncelle
const updateStats = async () => {
  try {
    isFetching.value = true;
    await fetchSitemapInfo();
    
    toast.add({
      title: 'Başarılı',
      description: 'İstatistikler başarıyla güncellendi',
      color: 'success'
    });
  } catch (error) {
    console.error('İstatistikler güncellenemedi:', error);
    
    toast.add({
      title: 'Hata',
      description: 'İstatistikler güncellenirken bir hata oluştu',
      color: 'error'
    });
  } finally {
    isFetching.value = false;
  }
};

// Sayfa yüklendiğinde verileri çek
onMounted(() => {
  fetchStatsData()
  fetchSitemapInfo();
})
</script>
