<template>
  <div class="space-y-6 project-editor-component">
    <!-- Dil Sekmeleri - Blog editörü tasarımıyla aynı -->
    <div class="mb-6">
      <div class="flex space-x-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
        <button
          @click="currentLanguage = 'tr'"
          :class="[
            'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
            currentLanguage === 'tr' 
              ? 'bg-primary-500 text-white shadow-sm' 
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          ]"
        >
          🇹🇷 Türkçe
        </button>
        <button
          @click="currentLanguage = 'en'"
          :class="[
            'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
            currentLanguage === 'en' 
              ? 'bg-primary-500 text-white shadow-sm' 
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          ]"
        >
          🇬🇧 English (Optional)
        </button>
      </div>
      
      <!-- Fallback bilgilendirmesi - sadece İngilizce sekmesinde -->
      <div v-if="currentLanguage === 'en'" class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div class="flex items-start gap-2">
          <UIcon name="i-lucide-info" class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-blue-800 dark:text-blue-200">
            <p class="font-medium">Automatic Fallback</p>
            <p class="text-blue-600 dark:text-blue-300">English fields are optional. If left empty, Turkish content will be used automatically when you save.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Proje Form - Blog editörü tasarımına uygun -->
    <form @submit.prevent="handleSubmit" class="space-y-6 w-full flex flex-col">
      <!-- Proje Başlığı -->
      <UFormField :label="currentLanguage === 'tr' ? 'Proje Başlığı' : 'Project Title'" required>
        <UTooltip text="SEO için 50-60 karakter arası başlık idealdir" :delay-duration="0">
          <UInput 
            class="w-full" 
            size="xl" 
            v-model="formData.i18n[currentLanguage].title" 
            :placeholder="currentLanguage === 'tr' ? 'Proje için SEO dostu bir başlık girin' : 'Enter project title (leave empty to use Turkish content)'" 
            variant="soft"
            :maxlength="90" 
            :color="formData.i18n[currentLanguage].title.length > 60 ? 'error' : formData.i18n[currentLanguage].title.length >= 20 ? 'success' : 'neutral'"
            icon="i-lucide-home" 
            :ui="{ trailing: 'pointer-events-none' }"
            :disabled="isSubmitting">
            <template #trailing>
              <div class="text-xs tabular-nums"
                :class="formData.i18n[currentLanguage].title.length > 60 ? 'text-red-500' : formData.i18n[currentLanguage].title.length >= 20 ? 'text-green-500' : 'text-neutral-500'"
                aria-live="polite" role="status">
                {{ formData.i18n[currentLanguage].title.length }}/60
              </div>
            </template>
          </UInput>
        </UTooltip>
        <template #hint>
          <span class="text-xs text-neutral-500">SEO için önemli: Bu başlık arama motorlarında gösterilecektir.</span>
        </template>
      </UFormField>

      <!-- Slug - sadece Türkçe modunda -->
      <UFormField v-if="currentLanguage === 'tr'" label="URL Adresi (Slug)" required>
        <UTooltip text="SEO dostu URL oluşturmak Google sıralamanızı etkiler" :delay-duration="0">
          <UInput 
            class="w-full" 
            size="xl" 
            v-model="formData.slug" 
            placeholder="proje-adi-url" 
            icon="i-lucide-link" 
            variant="soft"
            :maxlength="90"
            :disabled="isSubmitting || isEditMode">
            <template #trailing>
              <div class="text-xs tabular-nums"
                :class="formData.slug.length > 60 ? 'text-red-500' : formData.slug.length >= 20 ? 'text-green-500' : 'text-neutral-500'"
                aria-live="polite" role="status">
                {{ formData.slug.length }}/60
              </div>
            </template>
          </UInput>
        </UTooltip>
        <template #hint>
          <span class="text-xs text-neutral-500">
            <UIcon name="i-lucide-info" class="w-3 h-3 inline mr-1" />
            URL: {{ $config.public.siteUrl || 'https://asma-germe.com' }}/projeler/{{ formData.slug || 'proje-slug' }}
          </span>
        </template>
      </UFormField>

      <!-- Kısa Açıklama -->
      <UFormField :label="currentLanguage === 'tr' ? 'Kısa Açıklama' : 'Short Description'" required>
        <UTooltip text="Meta açıklama SEO için kritiktir" :delay-duration="0">
          <UTextarea 
            class="w-full" 
            v-model="formData.i18n[currentLanguage].shortDescription" 
            :placeholder="currentLanguage === 'tr' ? 'Proje için kısa ve öz açıklama girin (Google\'da görünür)' : 'Enter short description (leave empty to use Turkish content)'" 
            variant="soft"
            :rows="2"
            :maxlength="160"
            :color="formData.i18n[currentLanguage].shortDescription.length > 160 ? 'error' : formData.i18n[currentLanguage].shortDescription.length >= 120 ? 'success' : 'neutral'"
            :disabled="isSubmitting">
          </UTextarea>
          <div class="text-xs tabular-nums mt-1 text-right"
            :class="formData.i18n[currentLanguage].shortDescription.length > 160 ? 'text-red-500' : formData.i18n[currentLanguage].shortDescription.length >= 120 ? 'text-green-500' : 'text-neutral-500'"
            aria-live="polite" role="status">
            {{ formData.i18n[currentLanguage].shortDescription.length }}/160
          </div>
        </UTooltip>
        <template #hint>
          <span class="text-xs text-neutral-500">Meta açıklama: Google arama sonuçlarında bu metin görünür.</span>
        </template>
      </UFormField>

      <!-- Temel Bilgiler - İki Sütunlu Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sol Sütun -->
        <div class="space-y-6">
          <UFormField :label="currentLanguage === 'tr' ? 'Yıl' : 'Year'" required>
            <UInput 
              class="w-full" 
              size="lg" 
              v-model="formData.year" 
              :placeholder="currentLanguage === 'tr' ? 'Proje tamamlanma yılı' : 'Project completion year'" 
              icon="i-lucide-calendar"
              variant="soft"
              :disabled="isSubmitting"
              type="number"
              :min="1950"
              :max="2030"
            />
          </UFormField>

          <UFormField :label="currentLanguage === 'tr' ? 'Ülke' : 'Country'" required>
            <UInput 
              class="w-full" 
              size="lg" 
              v-model="formData.country" 
              :placeholder="currentLanguage === 'tr' ? 'Proje konumu (Türkiye)' : 'Project location (Turkey)'" 
              icon="i-lucide-map-pin"
              variant="soft"
              :disabled="isSubmitting"
            />
          </UFormField>

          <UFormField :label="currentLanguage === 'tr' ? 'Alan (m²)' : 'Area (m²)'">
            <UInput 
              class="w-full" 
              size="lg" 
              v-model="formData.area" 
              :placeholder="currentLanguage === 'tr' ? 'Proje alanı (1500)' : 'Project area (1500)'" 
              icon="i-lucide-ruler"
              variant="soft"
              :disabled="isSubmitting"
              type="number"
              min="0"
            />
          </UFormField>
        </div>

        <!-- Sağ Sütun -->
        <div class="space-y-6">
          <UFormField :label="currentLanguage === 'tr' ? 'Kategori' : 'Category'" required>
            <USelect
              class="w-full"
              size="lg"
              v-model="formData.category"
              :items="categoryOptions"
              :placeholder="currentLanguage === 'tr' ? 'Proje kategorisini seçin' : 'Select project category'"
              variant="soft"
              :disabled="isSubmitting"
            />
          </UFormField>

          <UFormField :label="currentLanguage === 'tr' ? 'Durum' : 'Status'" required>
            <USelect
              class="w-full"
              size="lg"
              v-model="formData.status"
              :items="statusOptions"
              :placeholder="currentLanguage === 'tr' ? 'Proje durumunu seçin' : 'Select project status'"
              variant="soft"
              :disabled="isSubmitting"
            />
          </UFormField>

          <!-- Yayın Durumu -->
          <UFormField :label="currentLanguage === 'tr' ? 'Yayın Durumu' : 'Publication Status'">
            <div class="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <USwitch v-model="formData.isPublished" :disabled="isSubmitting" size="lg" />
              <div class="flex-1">
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {{ formData.isPublished 
                    ? (currentLanguage === 'tr' ? 'Proje Yayında' : 'Project Published') 
                    : (currentLanguage === 'tr' ? 'Taslak Olarak Kaydet' : 'Save as Draft')
                  }}
                </p>
                <p class="text-xs text-neutral-500 mt-1">
                  {{ formData.isPublished 
                    ? (currentLanguage === 'tr' ? 'Proje sitede görünür olacak' : 'Project will be visible on the site') 
                    : (currentLanguage === 'tr' ? 'Proje sadece yönetici panelinde görünür' : 'Project will only be visible in admin panel')
                  }}
                </p>
              </div>
            </div>
          </UFormField>
        </div>
      </div>

      <!-- Detaylı Açıklama -->
      <UFormField :label="currentLanguage === 'tr' ? 'Detaylı Açıklama' : 'Detailed Description'" required>
        <UTooltip text="Projenin detaylı açıklaması ziyaretçiler için önemlidir" :delay-duration="0">
          <UTextarea 
            class="w-full" 
            v-model="formData.i18n[currentLanguage].description" 
            :placeholder="currentLanguage === 'tr' ? 'Proje hakkında detaylı açıklama yazın...' : 'Write detailed description about the project (leave empty to use Turkish content)'" 
            variant="soft"
            :rows="6"
            :disabled="isSubmitting"
          />
        </UTooltip>
        <template #hint>
          <span class="text-xs text-neutral-500">Proje sayfasında ana açıklama olarak görünecektir.</span>
        </template>
      </UFormField>

      <!-- İçerik (Opsiyonel) -->
      <UFormField :label="currentLanguage === 'tr' ? 'Ek İçerik (Opsiyonel)' : 'Additional Content (Optional)'">
        <UTextarea 
          class="w-full" 
          v-model="formData.i18n[currentLanguage].content" 
          :placeholder="currentLanguage === 'tr' ? 'Projeyle ilgili ek bilgiler, özellikler vb...' : 'Additional information, features about the project...'" 
          variant="soft"
          :rows="4"
          :disabled="isSubmitting"
        />
        <template #hint>
          <span class="text-xs text-neutral-500">İsteğe bağlı: Proje sayfasında ek bilgi olarak görünür.</span>
        </template>
      </UFormField>

      <!-- Malzemeler Yönetimi -->
      <UFormField :label="currentLanguage === 'tr' ? 'Kullanılan Malzemeler' : 'Materials Used'">
        <div class="space-y-4">
          <!-- Malzeme Ekleme -->
          <div class="flex gap-3">
            <UInput 
              class="flex-1" 
              size="lg"
              v-model="newMaterial" 
              :placeholder="currentLanguage === 'tr' ? 'Malzeme adı girin (PVC, Alüminyum, vb.)' : 'Enter material name (PVC, Aluminum, etc.)'" 
              icon="i-lucide-package"
              variant="soft"
              :disabled="isSubmitting"
              @keyup.enter="addMaterial"
            />
            <UButton 
              @click="addMaterial" 
              :disabled="isSubmitting || !newMaterial.trim()"
              size="lg"
              icon="i-lucide-plus"
              color="primary"
            >
              {{ currentLanguage === 'tr' ? 'Ekle' : 'Add' }}
            </UButton>
          </div>

          <!-- Malzeme Listesi -->
          <div v-if="formData.materials.length > 0" class="flex flex-wrap gap-2">
            <UBadge
              v-for="(material, index) in formData.materials"
              :key="index"
              color="primary"
              variant="soft"
              size="lg"
              class="cursor-pointer hover:bg-red-100 hover:text-red-600 transition-colors"
              @click="removeMaterial(index)"
            >
              {{ material }}
              <UIcon name="i-lucide-x" class="ml-2 h-3 w-3" />
            </UBadge>
          </div>
          
          <div v-else class="text-sm text-neutral-500 italic py-4 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
            {{ currentLanguage === 'tr' ? 'Henüz malzeme eklenmedi. Yukarıdaki alandan malzeme ekleyebilirsiniz.' : 'No materials added yet. You can add materials from the field above.' }}
          </div>
        </div>
        <template #hint>
          <span class="text-xs text-neutral-500">
            <UIcon name="i-lucide-info" class="w-3 h-3 inline mr-1" />
            {{ currentLanguage === 'tr' ? 'Malzemelere tıklayarak kaldırabilirsiniz.' : 'Click on materials to remove them.' }}
          </span>
        </template>
      </UFormField>

      <!-- Teknik Özellikler -->
      <UFormField :label="currentLanguage === 'tr' ? 'Teknik Özellikler' : 'Technical Specifications'">
        <div class="space-y-4">
          <!-- Özellik Ekleme -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <UInput 
              v-model="newSpec.key" 
              :placeholder="currentLanguage === 'tr' ? 'Anahtar (area)' : 'Key (area)'" 
              icon="i-lucide-key"
              variant="soft"
              :disabled="isSubmitting"
            />
            <UInput 
              v-model="newSpec.label" 
              :placeholder="currentLanguage === 'tr' ? 'Etiket (Alan)' : 'Label (Area)'" 
              icon="i-lucide-tag"
              variant="soft"
              :disabled="isSubmitting"
            />
            <div class="flex gap-2">
              <UInput 
                v-model="newSpec.value" 
                :placeholder="currentLanguage === 'tr' ? 'Değer (1500 m²)' : 'Value (1500 m²)'" 
                icon="i-lucide-type"
                variant="soft"
                :disabled="isSubmitting"
                @keyup.enter="addSpecification"
                class="flex-1"
              />
              <UButton 
                @click="addSpecification" 
                :disabled="isSubmitting || !newSpec.key.trim()"
                icon="i-lucide-plus"
                color="primary"
              >
                {{ currentLanguage === 'tr' ? 'Ekle' : 'Add' }}
              </UButton>
            </div>
          </div>

          <!-- Özellik Listesi -->
          <div v-if="formData.specifications.length > 0" class="space-y-2">
            <div
              v-for="(spec, index) in formData.specifications"
              :key="index"
              class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <div class="flex-1">
                <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ spec.label }}:</span>
                <span class="ml-2 text-neutral-600 dark:text-neutral-400">{{ spec.value }}</span>
                <div class="text-xs text-neutral-500 mt-1">Key: {{ spec.key }}</div>
              </div>
              <UButton
                color="error"
                variant="ghost"
                size="sm"
                @click="removeSpecification(index)"
                :disabled="isSubmitting"
                icon="i-lucide-trash-2"
              >
                {{ currentLanguage === 'tr' ? 'Kaldır' : 'Remove' }}
              </UButton>
            </div>
          </div>
          
          <div v-else class="text-sm text-neutral-500 italic py-4 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
            {{ currentLanguage === 'tr' ? 'Henüz teknik özellik eklenmedi.' : 'No technical specifications added yet.' }}
          </div>
        </div>
        <template #hint>
          <span class="text-xs text-neutral-500">
            {{ currentLanguage === 'tr' ? 'Proje sayfasında teknik detaylar bölümünde gösterilir.' : 'Displayed in the technical details section on the project page.' }}
          </span>
        </template>
      </UFormField>

      <!-- Proje Galerisi -->
      <UFormField :label="currentLanguage === 'tr' ? 'Proje Galerisi' : 'Project Gallery'" v-if="currentLanguage === 'tr'">
        <div class="space-y-6">
          <!-- Upload Area - Blog editörü tasarımıyla aynı -->
          <div class="relative border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-800 w-full mx-auto shadow-sm hover:border-primary-400 transition-colors">
            <div class="w-full h-[200px] relative">
              <!-- Upload zone -->
              <div class="w-full h-full flex flex-col items-center justify-center text-neutral-400 absolute inset-0 cursor-pointer" @click="() => fileInput?.click()">
                <UIcon name="i-lucide-upload-cloud" class="text-6xl mb-4 text-neutral-300" />
                <div class="text-center">
                  <p class="text-lg font-medium text-neutral-600 dark:text-neutral-300 mb-2">
                    {{ currentLanguage === 'tr' ? 'Proje Görsellerini Yükleyin' : 'Upload Project Images' }}
                  </p>
                  <p class="text-sm text-neutral-500">PNG, JPG, WEBP formatlarında en fazla 25MB</p>
                  <p class="text-xs text-neutral-400 mt-1">İlk yüklenen görsel otomatik kapak görseli olur</p>
                </div>
              </div>
            </div>
          </div>

          <!-- File input (hidden) -->
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/tiff,image/webp,video/mp4,video/webm"
            @change="handleFileUpload"
            class="hidden"
            :disabled="isSubmitting"
          />
          
          <!-- Upload Button -->
          <div class="flex flex-col sm:flex-row gap-3">
            <UButton
              @click="() => fileInput?.click()"
              icon="i-lucide-upload"
              variant="outline"
              color="primary"
              size="lg"
              :loading="isUploading"
              :disabled="isUploading"
              class="flex-1"
            >
              {{ isUploading ? (currentLanguage === 'tr' ? 'Yükleniyor...' : 'Uploading...') : (currentLanguage === 'tr' ? 'Görsel/Video Seç ve Yükle' : 'Select and Upload Images/Videos') }}
            </UButton>
          </div>

          <!-- Gallery Preview -->
          <div v-if="formData.gallery.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="(item, index) in formData.gallery"
              :key="index"
              class="relative group aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 shadow-md hover:shadow-lg transition-shadow"
            >
              <!-- Media Preview -->
              <img
                v-if="item.type === 'image'"
                :src="item.url"
                :alt="item.alt"
                class="w-full h-full object-cover"
              />
              <video
                v-else
                :src="item.url"
                class="w-full h-full object-cover"
                muted
                preload="metadata"
              />
              
              <!-- Overlay Controls -->
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <UButton
                  color="neutral"
                  size="sm"
                  @click="setAsHero(index)"
                  :variant="item.isHero ? 'solid' : 'outline'"
                  class="text-xs"
                >
                  {{ item.isHero ? (currentLanguage === 'tr' ? 'Kapak' : 'Cover') : (currentLanguage === 'tr' ? 'Kapak Yap' : 'Set Cover') }}
                </UButton>
                <UButton
                  color="error"
                  size="sm"
                  @click="removeFromGallery(index)"
                  :disabled="isSubmitting"
                  icon="i-lucide-trash-2"
                />
              </div>

              <!-- Hero Badge -->
              <div v-if="item.isHero" class="absolute top-2 left-2">
                <UBadge color="warning" variant="solid">
                  {{ currentLanguage === 'tr' ? 'Kapak' : 'Cover' }}
                </UBadge>
              </div>

              <!-- Media Type Badge -->
              <div class="absolute top-2 right-2">
                <UBadge :color="item.type === 'video' ? 'info' : 'success'" variant="solid" size="xs">
                  {{ item.type === 'video' ? '📹' : '🖼️' }}
                </UBadge>
              </div>
            </div>
          </div>
          
          <div v-else class="text-sm text-neutral-500 italic py-8 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
            {{ currentLanguage === 'tr' ? 'Henüz görsel eklenmedi. Yukarıdaki butonu kullanarak görsel ekleyebilirsiniz.' : 'No images added yet. You can add images using the button above.' }}
          </div>
        </div>
        <template #hint>
          <span class="text-xs text-neutral-500">
            <UIcon name="i-lucide-info" class="w-3 h-3 inline mr-1" />
            {{ currentLanguage === 'tr' ? 'İlk görsel otomatik kapak görseli olur. Kapak değiştirmek için "Kapak Yap" butonunu kullanın.' : 'First image automatically becomes cover image. Use "Set Cover" button to change cover.' }}
          </span>
        </template>
      </UFormField>

      <!-- Action Buttons - Blog editörü tasarımına uygun -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t border-neutral-200 dark:border-neutral-700">
        <UButton
          v-if="isEditMode"
          variant="outline"
          color="neutral"
          @click="$emit('cancel-edit')"
          :disabled="isSubmitting"
          size="lg"
          icon="i-lucide-x"
        >
          {{ currentLanguage === 'tr' ? 'İptal Et' : 'Cancel' }}
        </UButton>

        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <UButton
            type="button"
            variant="outline"
            color="neutral"
            @click="clearForm"
            :disabled="isSubmitting"
            size="lg"
            icon="i-lucide-rotate-ccw"
          >
            {{ currentLanguage === 'tr' ? 'Formu Temizle' : 'Clear Form' }}
          </UButton>
          <UButton
            type="submit"
            :loading="isSubmitting"
            :disabled="!isFormValid"
            size="lg"
            icon="i-lucide-save"
            class="min-w-[160px]"
          >
            {{ isEditMode 
              ? (currentLanguage === 'tr' ? 'Projeyi Güncelle' : 'Update Project')
              : (currentLanguage === 'tr' ? 'Proje Oluştur' : 'Create Project')
            }}
          </UButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
interface ProjectData {
  i18n: {
    tr: {
      title: string;
      description: string;
      content: string;
      shortDescription: string;
    };
    en: {
      title: string;
      description: string;
      content: string;
      shortDescription: string;
    };
  };
  slug: string;
  year: string;
  country: string;
  category: string;
  materials: string[];
  status: string;
  gallery: Array<{
    url: string;
    alt: string;
    type: 'image' | 'video';
    isHero: boolean;
  }>;
  specifications: Array<{
    key: string;
    label: string;
    value: string;
  }>;
  area?: string;
  isPublished: boolean;
}

interface Props {
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
  isEditMode: false
});

const emit = defineEmits<{
  submit: [data: ProjectData];
  'cancel-edit': [];
}>();

// Language toggle
const currentLanguage = ref<'tr' | 'en'>('tr');

// Form data
const formData = ref<ProjectData>({
  i18n: {
    tr: {
      title: '',
      description: '',
      content: '',
      shortDescription: ''
    },
    en: {
      title: '',
      description: '',
      content: '',
      shortDescription: ''
    }
  },
  slug: '',
  year: new Date().getFullYear().toString(),
  country: '',
  category: '',
  materials: [],
  status: '',
  gallery: [],
  specifications: [],
  area: '',
  isPublished: false
});

// Options
const categoryOptions = [
  { label: 'Konut', value: 'residential' },
  { label: 'Ticari', value: 'commercial' },
  { label: 'Endüstriyel', value: 'industrial' },
  { label: 'Kamu', value: 'public' },
  { label: 'Restorasyon', value: 'restoration' }
];

const statusOptions = [
  { label: 'Tamamlandı', value: 'completed' },
  { label: 'Devam Ediyor', value: 'ongoing' },
  { label: 'Planlama', value: 'planning' },
  { label: 'Askıda', value: 'on-hold' }
];

// Materials
const newMaterial = ref('');

const addMaterial = () => {
  const material = newMaterial.value.trim();
  if (material && !formData.value.materials.includes(material)) {
    formData.value.materials.push(material);
    newMaterial.value = '';
  }
};

const removeMaterial = (index: number) => {
  formData.value.materials.splice(index, 1);
};

// Specifications
const newSpec = ref({
  key: '',
  label: '',
  value: ''
});

const addSpecification = () => {
  if (newSpec.value.key.trim() && newSpec.value.label.trim() && newSpec.value.value.trim()) {
    formData.value.specifications.push({ ...newSpec.value });
    newSpec.value = { key: '', label: '', value: '' };
  }
};

const removeSpecification = (index: number) => {
  formData.value.specifications.splice(index, 1);
};

// File upload
const isUploading = ref(false);
const fileInput = ref<HTMLInputElement>();

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (!files || files.length === 0) return;

  try {
    isUploading.value = true;

    for (const file of Array.from(files)) {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await $fetch('/api/upload/image', {
        method: 'POST',
        body: formDataUpload
      });

      if (response.url) {
        formData.value.gallery.push({
          url: response.url,
          alt: formData.value.i18n.tr.title || 'Proje görseli',
          type: file.type.startsWith('video/') ? 'video' : 'image',
          isHero: formData.value.gallery.length === 0
        });
      }
    }
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
  } finally {
    isUploading.value = false;
    target.value = '';
  }
};

const setAsHero = (index: number) => {
  formData.value.gallery.forEach(item => item.isHero = false);
  if (formData.value.gallery[index]) {
    formData.value.gallery[index].isHero = true;
  }
};

const removeFromGallery = (index: number) => {
  if (!formData.value.gallery[index]) return;
  
  const wasHero = formData.value.gallery[index].isHero;
  formData.value.gallery.splice(index, 1);
  
  if (wasHero && formData.value.gallery.length > 0 && formData.value.gallery[0]) {
    formData.value.gallery[0].isHero = true;
  }
};

// Form validation
const isFormValid = computed(() => {
  const currentLang = formData.value.i18n[currentLanguage.value];
  return !!(
    currentLang.title.trim() &&
    currentLang.description.trim() &&
    formData.value.slug.trim() &&
    formData.value.year.trim() &&
    formData.value.country.trim() &&
    formData.value.category &&
    formData.value.status
  );
});

// Form submission
const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', formData.value);
  }
};

// Clear form
const clearForm = () => {
  formData.value = {
    i18n: {
      tr: {
        title: '',
        description: '',
        content: '',
        shortDescription: ''
      },
      en: {
        title: '',
        description: '',
        content: '',
        shortDescription: ''
      }
    },
    slug: '',
    year: new Date().getFullYear().toString(),
    country: '',
    category: '',
    materials: [],
    status: '',
    gallery: [],
    specifications: [],
    area: '',
    isPublished: false
  };
  newMaterial.value = '';
  newSpec.value = { key: '', label: '', value: '' };
  currentLanguage.value = 'tr';
};

// Set form data (for editing)
const setFormData = (data: any) => {
  formData.value = { ...data };
};

// Generate slug from title
watch(() => formData.value.i18n.tr.title, (newTitle) => {
  if (!props.isEditMode && newTitle) {
    formData.value.slug = newTitle
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ç/g, 'c')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
});

// Expose methods
defineExpose({
  clearForm,
  setFormData
});
</script>
