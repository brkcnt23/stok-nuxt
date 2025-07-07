<template>
  <div class="urunler-page">
    <!-- Hero Section -->
    <UContainer class="py-16">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">
          {{ $t('products.title') }}
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ $t('products.description') }}
        </p>
      </div>
    </UContainer>

    <!-- Product Categories -->
    <UContainer class="pb-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <UCard
          v-for="category in productCategories"
          :key="category.id"
          class="hover:shadow-lg transition-shadow duration-300"
        >
          <template #header>
            <div class="aspect-video bg-gradient-to-br from-primary-500 to-primary-600 rounded-t-lg flex items-center justify-center">
              <UIcon :name="category.icon" class="w-16 h-16 text-white" />
            </div>
          </template>

          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">
              {{ category.name }}
            </h3>
            
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              {{ category.description }}
            </p>

            <!-- Properties -->
            <div class="space-y-2 mb-4">
              <div
                v-for="property in category.properties"
                :key="property.key"
                class="flex justify-between text-sm"
              >
                <span class="text-gray-600 dark:text-gray-400">{{ property.label }}:</span>
                <span class="font-medium">{{ property.value }}</span>
              </div>
            </div>

            <!-- Applications -->
            <div class="mb-4">
              <h4 class="font-semibold mb-2 text-sm">{{ $t('products.applications') }}:</h4>
              <div class="flex flex-wrap gap-1">
                <UBadge
                  v-for="app in category.applications"
                  :key="app"
                  :label="app"
                  variant="soft"
                  size="sm"
                />
              </div>
            </div>
            
            <UButton variant="outline" class="w-full">
              {{ $t('products.viewDetails') }}
              <UIcon name="i-lucide-arrow-right" class="ml-2" />
            </UButton>
          </div>
        </UCard>
      </div>
    </UContainer>

    <!-- Technical Specifications -->
    <UContainer class="pb-16">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
        <h2 class="text-2xl font-bold mb-6 text-center">
          {{ $t('products.technicalSpecs') }}
        </h2>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-2">{{ $t('products.material') }}</th>
                <th class="text-left py-3 px-2">{{ $t('products.thickness') }}</th>
                <th class="text-left py-3 px-2">{{ $t('products.uvResistance') }}</th>
                <th class="text-left py-3 px-2">{{ $t('products.lightTransmittance') }}</th>
                <th class="text-left py-3 px-2">{{ $t('products.lifespan') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="spec in technicalSpecs"
                :key="spec.material"
                class="border-b border-gray-200 dark:border-gray-700"
              >
                <td class="py-3 px-2 font-medium">{{ spec.material }}</td>
                <td class="py-3 px-2">{{ spec.thickness }}</td>
                <td class="py-3 px-2">{{ spec.uvResistance }}</td>
                <td class="py-3 px-2">{{ spec.lightTransmittance }}</td>
                <td class="py-3 px-2">{{ spec.lifespan }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UContainer>

    <!-- Call to Action -->
    <UContainer class="pb-16">
      <div class="bg-primary-500 text-white rounded-lg p-8 text-center">
        <h2 class="text-2xl font-bold mb-4">
          {{ $t('products.cta.title') }}
        </h2>
        <p class="text-lg mb-6 max-w-2xl mx-auto">
          {{ $t('products.cta.description') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/iletisim">
            <UButton color="white" size="lg">
              {{ $t('products.cta.contact') }}
            </UButton>
          </NuxtLink>
          <UButton variant="outline" color="white" size="lg">
            {{ $t('products.cta.catalog') }}
            <UIcon name="i-lucide-download" class="ml-2" />
          </UButton>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
// i18n
const { t } = useI18n()

// SEO
useSeoMeta({
  title: t('products.seo.title'),
  description: t('products.seo.description'),
  ogTitle: t('products.seo.title'),
  ogDescription: t('products.seo.description'),
  twitterTitle: t('products.seo.title'),
  twitterDescription: t('products.seo.description')
})

// Product categories data
const productCategories = ref([
  {
    id: 'ptfe',
    name: 'PTFE Membrane',
    description: 'Yüksek dayanıklılık ve 30+ yıl ömür sunan premium membran malzemesi',
    icon: 'i-lucide-shield-check',
    properties: [
      { key: 'thickness', label: 'Kalınlık', value: '0.5-1.5 mm' },
      { key: 'fire', label: 'Yangın Direnci', value: 'A2 (yanmaz)' },
      { key: 'temperature', label: 'Sıcaklık', value: '-40°C - +200°C' }
    ],
    applications: ['Stadyumlar', 'Havaalanları', 'Büyük Açıklıklar']
  },
  {
    id: 'pvc',
    name: 'PVC Membrane',
    description: 'Maliyet etkin ve esnek kullanım imkanı sunan popüler membran seçeneği',
    icon: 'i-lucide-layers',
    properties: [
      { key: 'thickness', label: 'Kalınlık', value: '0.5-1.2 mm' },
      { key: 'fire', label: 'Yangın Direnci', value: 'B1' },
      { key: 'flexibility', label: 'Esneklik', value: 'Yüksek' }
    ],
    applications: ['Pergolalar', 'Gölgelikler', 'Ticari Binalar']
  },
  {
    id: 'etfe',
    name: 'ETFE Foil',
    description: 'Şeffaf ve kendini temizleyen yüzey özelliği ile yenilikçi çözüm',
    icon: 'i-lucide-sun',
    properties: [
      { key: 'thickness', label: 'Kalınlık', value: '50-250 μm' },
      { key: 'transparency', label: 'Şeffaflık', value: '%90-95' },
      { key: 'weight', label: 'Ağırlık', value: 'Camın 1/100\'ü' }
    ],
    applications: ['Botanik Bahçeler', 'Atrium', 'Modern Cepheler']
  },
  {
    id: 'pvc-mesh',
    name: 'PVC Mesh',
    description: 'Havalandırma özelliği olan delikli membran yapı malzemesi',
    icon: 'i-lucide-wind',
    properties: [
      { key: 'perforation', label: 'Delik Oranı', value: '%10-50' },
      { key: 'ventilation', label: 'Havalandırma', value: 'Doğal' },
      { key: 'shading', label: 'Gölgeleme', value: '%20-60' }
    ],
    applications: ['Ofis Cepheleri', 'Otopark Gölgelikleri', 'Spor Tesisleri']
  },
  {
    id: 'stfe',
    name: 'STFE Membrane',
    description: 'Silikon kaplı özel membran, yüksek sıcaklık direnci',
    icon: 'i-lucide-flame',
    properties: [
      { key: 'thickness', label: 'Kalınlık', value: '0.8-1.5 mm' },
      { key: 'temperature', label: 'Sıcaklık', value: '-40°C - +200°C' },
      { key: 'resistance', label: 'Kimyasal Direnç', value: 'Yüksek' }
    ],
    applications: ['Endüstriyel Tesisler', 'Kimya Sanayi', 'Özel Projeler']
  },
  {
    id: 'special-fabrics',
    name: 'Özel Kumaşlar',
    description: 'Özel ihtiyaçlar için tasarlanmış teknik tekstil ürünleri',
    icon: 'i-lucide-sparkles',
    properties: [
      { key: 'customization', label: 'Özelleştirme', value: 'Tam' },
      { key: 'applications', label: 'Kullanım Alanı', value: 'Çok Amaçlı' },
      { key: 'performance', label: 'Performans', value: 'Özel Gereksinimler' }
    ],
    applications: ['Özel Projeler', 'Ar-Ge Çalışmaları', 'Prototip Üretim']
  }
])

// Technical specifications table data
const technicalSpecs = ref([
  {
    material: 'PTFE',
    thickness: '0.5-1.5 mm',
    uvResistance: '30+ yıl',
    lightTransmittance: '%10-40',
    lifespan: '30+ yıl'
  },
  {
    material: 'PVC',
    thickness: '0.5-1.2 mm',
    uvResistance: '15-20 yıl',
    lightTransmittance: '%5-15',
    lifespan: '15-20 yıl'
  },
  {
    material: 'ETFE',
    thickness: '50-250 μm',
    uvResistance: '25+ yıl',
    lightTransmittance: '%90-95',
    lifespan: '25+ yıl'
  },
  {
    material: 'PVC Mesh',
    thickness: '0.5-1.0 mm',
    uvResistance: '10-15 yıl',
    lightTransmittance: '%30-70',
    lifespan: '10-15 yıl'
  },
  {
    material: 'STFE',
    thickness: '0.8-1.5 mm',
    uvResistance: '20-25 yıl',
    lightTransmittance: '%5-20',
    lifespan: '20-25 yıl'
  }
])
</script>
