<script setup lang="ts">
// TipTap Editör için
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'

// Props tanımlamaları
const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  totalBlogs: {
    type: Number,
    default: 0
  }
});

// Emit tanımlamaları
const emit = defineEmits(['submit', 'cancel-edit']);

// i18n composable
const { t } = useI18n();

// Aktif dil durumu
const currentLang = ref<'tr' | 'en'>('tr');

// i18n destekli blog verileri
const i18nData = ref({
  tr: {
    title: '',
    description: '',
    content: '',
    tags: ['Asma Germe']
  },
  en: {
    title: '',
    description: '',
    content: '',
    tags: ['Tensioned Membrane']
  }
});

// Dil bağımsız veriler
const slug = ref('');
const coverImage = ref(`https://picsum.photos/1200/630?random=${props.totalBlogs + 1}`);
const tags = ref<string[]>(['Asma Germe']);
const isPublished = ref(true);

// File upload states
const isUploading = ref(false);
const uploadError = ref('');
const uploadSuccess = ref(false);
const fileInput = ref<HTMLInputElement>();

// Type definitions for upload
interface UploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

// Kategori seçenekleri
const categories = ref([
  'Asma Germe',
  'ETFE Sistemler',
  'Açılır-Kapanır Sistemler',
  'Tekstil Cepheler',
  'Akustik Çözümler',
  'Genel'
]);

// Kategori oluşturma fonksiyonu
const createCategory = (category: string) => {
  categories.value.push(category);
  tags.value.push(category);
};

// TiptapEditor yapılandırması - orijinal tasarımla aynı
const editor = useEditor({
  content: i18nData.value[currentLang.value].content,
  editable: true,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6]
      },
      bulletList: {
        HTMLAttributes: {
          class: 'tiptap-bullet-list'
        }
      },
      orderedList: {
        HTMLAttributes: {
          class: 'tiptap-ordered-list'
        }
      },
      listItem: {
        HTMLAttributes: {
          class: 'tiptap-list-item'
        }
      },
      paragraph: {
        HTMLAttributes: {
          class: 'tiptap-paragraph'
        }
      },
      blockquote: {
        HTMLAttributes: {
          class: 'tiptap-blockquote'
        }
      }
    }),
    Underline.configure({
      HTMLAttributes: {
        class: 'tiptap-underline'
      }
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      defaultAlignment: 'left',
      alignments: ['left', 'center', 'right', 'justify'],
    }),
    Image.configure({
      allowBase64: true,
      inline: true,
      HTMLAttributes: {
        class: 'tiptap-image'
      }
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline tiptap-link'
      }
    }),
    Highlight.configure({
      HTMLAttributes: {
        class: 'tiptap-highlight'
      }
    })
  ],
  onUpdate: ({ editor }) => {
    const content = editor.getHTML();
    i18nData.value[currentLang.value].content = content;
    // console.log(`Editor updated ${currentLang.value} content:`, content.substring(0, 100) + '...');
  },
  editorProps: {
    attributes: {
      class: 'focus:outline-none tiptap-editor-content',
      spellcheck: 'false'
    }
  }
});

// Dil değiştirme fonksiyonu
const switchLanguage = (lang: 'tr' | 'en') => {
  if (editor.value) {
    // Mevcut içeriği kaydet
    const currentContent = editor.value.getHTML();
    i18nData.value[currentLang.value].content = currentContent;
    
    console.log(`Switching from ${currentLang.value} to ${lang}`);
    console.log(`Saved ${currentLang.value} content:`, currentContent);
    
    // Yeni dili ayarla
    currentLang.value = lang;
    
    // Editör içeriğini güncelle
    nextTick(() => {
      if (editor.value) {
        const newContent = i18nData.value[lang].content || '';
        console.log(`Loading ${lang} content:`, newContent);
        editor.value.commands.setContent(newContent);
      }
    });
  } else {
    currentLang.value = lang;
  }
};

// TipTap editör yardımcı fonksiyonları - orijinalden kopyalandı
const addImage = () => {
  const choice = window.confirm('Görsel eklemek için:\n\n• Tamam: URL ile ekle\n• İptal: Dosya yükle');
  
  if (choice) {
    // URL ile ekleme
    const url = window.prompt('Görsel URL\'si ekleyin:');
    if (url && editor.value) {
      editor.value.chain().focus().setImage({ src: url, alt: 'Blog görseli' }).run();
    }
  } else {
    // Dosya yükleme için input oluştur
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.addEventListener('change', async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        // Create form data
        const formData = new FormData();
        formData.append('image', file);
        
        // Upload file
        const response = await $fetch<UploadResponse>('/api/upload/image', {
          method: 'POST',
          body: formData
        });
        
        if (response.success && response.url && editor.value) {
          editor.value.chain().focus().setImage({ src: response.url, alt: 'Yüklenen görsel' }).run();
        } else {
          alert('Görsel yüklenemedi: ' + (response.error || 'Bilinmeyen hata'));
        }
        
      } catch (error: any) {
        console.error('Image upload error:', error);
        alert('Görsel yüklenirken hata oluştu: ' + error.message);
      } finally {
        // Clean up
        document.body.removeChild(input);
      }
    });
    
    document.body.appendChild(input);
    input.click();
  }
};

const setLink = () => {
  if (editor.value) {
    const previousUrl = editor.value.getAttributes('link').href;
    const url = window.prompt('Link URL\'si girin:', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.value.chain().focus().unsetLink().run();
      return;
    }
    
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = 'https://' + url;
    }
    
    editor.value.chain().focus().setLink({ href: formattedUrl }).run();
  }
};

const getHeadingLevel = () => {
  if (!editor.value) return 'paragraph';
  
  if (editor.value.isActive('heading', { level: 1 })) return 'heading-1';
  if (editor.value.isActive('heading', { level: 2 })) return 'heading-2';
  if (editor.value.isActive('heading', { level: 3 })) return 'heading-3';
  if (editor.value.isActive('heading', { level: 4 })) return 'heading-4';
  if (editor.value.isActive('heading', { level: 5 })) return 'heading-5';
  if (editor.value.isActive('heading', { level: 6 })) return 'heading-6';
  
  return 'paragraph';
};

const setHeadingLevel = (value: string) => {
  if (!editor.value) return;
  
  if (value === 'paragraph') {
    editor.value.chain().focus().setParagraph().run();
  } else if (value.startsWith('heading-')) {
    const levelStr = value.split('-')[1];
    if (levelStr) {
      const level = parseInt(levelStr) as 1 | 2 | 3 | 4 | 5 | 6;
      editor.value.chain().focus().setHeading({ level }).run();
    }
  }
};

// SEO için ideal karakter sınırlamaları
const maxSlugLength = 60;

// Slug oluşturucu - Türkçe başlıktan
const generateSlug = () => {
  const title = i18nData.value.tr.title;
  if (!title) return;
  
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  let slugText = title
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/Ş/g, 's')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
    
  slugText = slugText
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const dateSuffix = `-${dateStr}`;
  const maxBaseSlugLength = maxSlugLength - dateSuffix.length;
  
  if (slugText.length > maxBaseSlugLength) {
    slugText = slugText.substring(0, maxBaseSlugLength);
    if (slugText.endsWith('-')) {
      slugText = slugText.substring(0, maxBaseSlugLength - 1);
    }
  }
  
  slug.value = `${slugText}${dateSuffix}`;
};

// File upload handler
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;
  
  // Reset states
  uploadError.value = '';
  uploadSuccess.value = false;
  isUploading.value = true;
  
  try {
    // Validate file size (25MB)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Dosya boyutu 25MB\'tan büyük olamaz');
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Sadece JPG, PNG, GIF, BMP, TIFF ve WebP dosyaları desteklenir');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    
    // Upload file
    const response = await $fetch<UploadResponse>('/api/upload/image', {
      method: 'POST',
      body: formData
    });
    
    if (response.success && response.url) {
      coverImage.value = response.url;
      uploadSuccess.value = true;
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        uploadSuccess.value = false;
      }, 3000);
    } else {
      throw new Error(response.error || 'Yükleme başarısız');
    }
    
  } catch (error: any) {
    console.error('Upload error:', error);
    uploadError.value = error.message || 'Dosya yüklenirken bir hata oluştu';
    
    // Hide error message after 5 seconds
    setTimeout(() => {
      uploadError.value = '';
    }, 5000);
  } finally {
    isUploading.value = false;
    // Clear file input
    if (input) input.value = '';
  }
};

// Generate random image
const generateRandomImage = () => {
  const randomId = Math.floor(Math.random() * 1000) + 1;
  coverImage.value = `https://picsum.photos/1200/630?random=${randomId}`;
  uploadSuccess.value = false;
  uploadError.value = '';
};

// Remove cover image
const removeCoverImage = () => {
  coverImage.value = '';
  uploadSuccess.value = false;
  uploadError.value = '';
};

// Open image preview
const openImagePreview = () => {
  if (typeof window !== 'undefined' && coverImage.value) {
    window.open(coverImage.value, '_blank');
  }
};

// Türkçe başlık değiştiğinde otomatik slug oluşturma
watch(() => i18nData.value.tr.title, () => {
  if (!props.isEditMode) {
    generateSlug();
  }
});

// Blog gönderme işlemi
const submitBlog = () => {
  // Mevcut editör içeriğini kaydet
  if (editor.value) {
    i18nData.value[currentLang.value].content = editor.value.getHTML();
  }
  
  // Otomatik fallback için İngilizce içerik kontrolü - geliştirilmiş
  const finalData = {
    tr: { ...i18nData.value.tr },
    en: { ...i18nData.value.en }
  };
  
  // Boş string veya sadece boşluk karakterlerini kontrol eden helper fonksiyon
  const isEmpty = (value: string | undefined | null): boolean => {
    if (!value) return true;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      // TipTap editörünün boş içerikleri için kapsamlı kontrol
      const emptyPatterns = [
        '',
        '<p></p>',
        '<p><br></p>',
        '<p> </p>',
        '<p>&nbsp;</p>',
        '<div></div>',
        '<div><br></div>'
      ];
      
      // HTML etiketlerini kaldırıp sadece metin içeriğini kontrol et
      const textOnly = trimmed.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      
      return emptyPatterns.includes(trimmed) || textOnly === '';
    }
    return true;
  };

  // Content için özel boşluk kontrolü
  const isContentEmpty = (content: string | undefined | null): boolean => {
    if (!content) return true;
    
    // HTML etiketlerini kaldır ve gerçek metin içeriğini kontrol et
    const textContent = content
      .replace(/<[^>]*>/g, '') // HTML etiketlerini kaldır
      .replace(/&nbsp;/g, ' ') // Non-breaking space'leri normal space'e çevir
      .replace(/\s+/g, ' ')    // Birden fazla boşluğu tek boşluğa çevir
      .trim();                 // Baştaki ve sondaki boşlukları kaldır
    
    return textContent === '' || textContent.length < 3; // En az 3 karakter olsun
  };
  
  // Debug: Mevcut değerleri kontrol et
  console.log('=== SUBMIT BLOG DEBUG ===');
  console.log('Current language:', currentLang.value);
  console.log('TR data:', {
    title: finalData.tr.title,
    description: finalData.tr.description,
    content: finalData.tr.content?.substring(0, 100) + '...',
    contentLength: finalData.tr.content?.length,
    tags: finalData.tr.tags
  });
  console.log('EN data (before fallback):', {
    title: finalData.en.title,
    description: finalData.en.description,
    content: finalData.en.content?.substring(0, 100) + '...',
    contentLength: finalData.en.content?.length,
    tags: finalData.en.tags
  });
  
  // İngilizce içerik boşsa, Türkçe içeriği kullan (daha kapsamlı kontrol)
  if (isEmpty(finalData.en.title)) {
    finalData.en.title = finalData.tr.title;
    console.log('Using TR title for EN:', finalData.en.title);
  }
  
  if (isEmpty(finalData.en.description)) {
    finalData.en.description = finalData.tr.description;
    console.log('Using TR description for EN:', finalData.en.description);
  }
  
  if (isContentEmpty(finalData.en.content)) {
    finalData.en.content = finalData.tr.content;
    console.log('Using TR content for EN:', finalData.en.content);
  }
  
  // Tags kontrolü: boş array, undefined, ya da boş stringlerden oluşan array
  if (!finalData.en.tags || 
      finalData.en.tags.length === 0 || 
      finalData.en.tags.every(tag => isEmpty(tag))) {
    finalData.en.tags = [...finalData.tr.tags];
    console.log('Using TR tags for EN:', finalData.en.tags);
  }
  
  // Final debug
  console.log('EN data (after fallback):', {
    title: finalData.en.title,
    description: finalData.en.description,
    content: finalData.en.content?.substring(0, 100) + '...',
    contentLength: finalData.en.content?.length,
    tags: finalData.en.tags
  });
  console.log('=== END DEBUG ===');
  
  // Form verilerini hazırla
  const formData = {
    i18n: finalData,
    slug: slug.value,
    coverImage: coverImage.value,
    tags: tags.value,
    isPublished: isPublished.value
  };
  
  emit('submit', formData);
};

// Düzenleme modunu iptal et
const cancelEdit = () => {
  emit('cancel-edit');
};

// Form verilerini ayarlamak için dışa aktarılan metotlar
const setFormData = (blogData: any) => {
  if (blogData.i18n) {
    i18nData.value = { ...blogData.i18n };
  }
  slug.value = blogData.slug || '';
  coverImage.value = blogData.coverImage || '';
  tags.value = blogData.tags || [];
  isPublished.value = blogData.isPublished !== undefined ? blogData.isPublished : true;
  
  if (editor.value) {
    editor.value.commands.clearContent(true);
    
    setTimeout(() => {
      if (blogData.i18n?.[currentLang.value]?.content && editor.value) {
        editor.value.commands.setContent(blogData.i18n[currentLang.value].content);
        editor.value.commands.focus('end');
        
        setTimeout(() => {
          if (editor.value && editor.value.isEmpty && blogData.i18n[currentLang.value].content) {
            editor.value.commands.setContent(blogData.i18n[currentLang.value].content);
          }
        }, 200);
      }
    }, 300);
  }
};

// Form verilerini temizlemek için dışa aktarılan metot
const clearForm = () => {
  i18nData.value = {
    tr: { title: '', description: '', content: '', tags: ['Asma Germe'] },
    en: { title: '', description: '', content: '', tags: ['Tensioned Membrane'] }
  };
  slug.value = '';
  coverImage.value = `https://picsum.photos/1200/630?random=${props.totalBlogs + 1}`;
  tags.value = ['Asma Germe'];
  isPublished.value = true;
  currentLang.value = 'tr';
  
  // Reset upload states
  isUploading.value = false;
  uploadError.value = '';
  uploadSuccess.value = false;
  
  if (editor.value) {
    editor.value.commands.setContent('');
  }
};

// Form verilerini dışarıya aktar
const getFormData = () => {
  if (editor.value) {
    i18nData.value[currentLang.value].content = editor.value.getHTML();
  }
  
  return {
    i18n: i18nData.value,
    slug: slug.value,
    coverImage: coverImage.value,
    tags: tags.value,
    isPublished: isPublished.value
  };
};

// Dışa aktarılacak değişkenler ve metotlar
defineExpose({
  setFormData,
  clearForm,
  getFormData
});

// Düzenleme için watch kullanımı
watch(
  [() => props.isEditMode, () => i18nData.value[currentLang.value].content, () => editor.value],
  ([isEditMode, contentValue, editorValue]) => {
    if (isEditMode && editorValue && contentValue && editorValue.isEmpty) {
      nextTick(() => {
        editorValue.commands.setContent(contentValue);
        setTimeout(() => {
          if (editorValue.isEmpty && contentValue) {
            editorValue.commands.setContent(contentValue);
            editorValue.commands.focus('end');
          }
        }, 200);
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="space-y-6 blog-editor-component">
    <!-- Dil Sekmeleri - Orijinal tasarımı koruyarak -->
    <div class="mb-6">
      <div class="flex space-x-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
        <button
          @click="switchLanguage('tr')"
          :class="[
            'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
            currentLang === 'tr' 
              ? 'bg-primary-500 text-white shadow-sm' 
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          ]"
        >
          🇹🇷 Türkçe
        </button>
        <button
          @click="switchLanguage('en')"
          :class="[
            'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
            currentLang === 'en' 
              ? 'bg-primary-500 text-white shadow-sm' 
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          ]"
        >
          🇬🇧 English (Optional)
        </button>
      </div>
      
      <!-- Fallback bilgilendirmesi - sadece İngilizce sekmesinde -->
      <div v-if="currentLang === 'en'" class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div class="flex items-start gap-2">
          <UIcon name="i-lucide-info" class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-blue-800 dark:text-blue-200">
            <p class="font-medium">Automatic Fallback</p>
            <p class="text-blue-600 dark:text-blue-300">English fields are optional. If left empty, Turkish content will be used automatically when you save.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- SEO Analyzer - sadece Türkçe modunda -->
    <SeoAnalyzer 
      v-if="currentLang === 'tr'"
      :title="i18nData.tr.title" 
      :description="i18nData.tr.description" 
      :content="i18nData.tr.content" 
      :slug="slug" 
      :tags="tags"
      :coverImage="coverImage" 
    />

    <!-- Blog Form - Orijinal tasarım korunarak -->
    <div class="space-y-6 w-full flex flex-col">
      <UFormField :label="currentLang === 'tr' ? 'Blog Başlığı' : 'Blog Title'" required>
        <UTooltip text="SEO için 50-60 karakter arası başlık idealdir" :delay-duration="0">
          <UInput 
            class="w-full" 
            size="xl" 
            v-model="i18nData[currentLang].title" 
            :placeholder="currentLang === 'tr' ? 'Blog yazınız için SEO dostu bir başlık girin' : 'Enter title (leave empty to use Turkish content)'" 
            variant="soft"
            :maxlength="90" 
            :color="i18nData[currentLang].title.length > 60 ? 'error' : i18nData[currentLang].title.length >= 50 ? 'success' : 'neutral'"
            icon="i-lucide-heading" 
            :ui="{ trailing: 'pointer-events-none' }">
            <template #trailing>
              <div class="text-xs tabular-nums"
                :class="i18nData[currentLang].title.length > 60 ? 'text-(--ui-error)' : i18nData[currentLang].title.length >= 50 ? 'text-(--ui-success)' : 'text-(--ui-text-muted)'"
                aria-live="polite" role="status">
                {{ i18nData[currentLang].title.length }}/60
              </div>
            </template>
          </UInput>
        </UTooltip>
        <template #hint>
          <span class="text-xs text-neutral-500">SEO için önemli: Bu başlık Google aramalarında gösterilecektir.</span>
        </template>
      </UFormField>

      <!-- Slug - sadece Türkçe modunda -->
      <UFormField v-if="currentLang === 'tr'" label="URL Adresi (Slug)" required>
        <UTooltip text="SEO dostu URL oluşturmak Google sıralamanızı etkiler" :delay-duration="0">
          <UInput 
            class="w-full" 
            size="xl" 
            v-model="slug" 
            placeholder="blog-yazisi-url" 
            icon="i-lucide-link" 
            variant="soft"
            :maxlength="90">
            <template #trailing>
              <div class="text-xs tabular-nums"
                :class="slug.length > 60 ? 'text-(--ui-error)' : slug.length >= 50 ? 'text-(--ui-success)' : 'text-(--ui-text-muted)'"
                aria-live="polite" role="status">
                {{ slug.length }}/60
              </div>
            </template>
          </UInput>
        </UTooltip>
        <template #hint>
          <span class="text-xs text-neutral-500">Otomatik oluşturulur, gerekirse düzenleyebilirsiniz. SEO için önemlidir.</span>
        </template>
      </UFormField>

      <UFormField :label="currentLang === 'tr' ? 'Kısa Açıklama' : 'Short Description'" required>
        <UTooltip text="Meta açıklama için 140-160 karakter idealdir" :delay-duration="0">
          <UTextarea 
            class="w-full" 
            size="xl" 
            v-model="i18nData[currentLang].description" 
            variant="soft"
            :placeholder="currentLang === 'tr' ? 'Blog yazınız için kısa bir açıklama. Meta açıklama olarak kullanılacaktır.' : 'Enter description (leave empty to use Turkish content)'" 
            :rows="3"
            :maxlength="200" 
            autoresize 
            :maxrows="6"
            :color="i18nData[currentLang].description.length > 160 ? 'error' : i18nData[currentLang].description.length >= 140 ? 'success' : 'neutral'">
          </UTextarea>
        </UTooltip>
        <template #hint>
          <div class="flex justify-between">
            <span class="text-xs text-neutral-500">SEO için önemli: Bu açıklama Google aramalarında gösterilecektir.</span>
            <span class="text-xs text-neutral-500">{{ i18nData[currentLang].description.length }}/200</span>
          </div>
        </template>
      </UFormField>

      <!-- Kategori - sadece Türkçe modunda -->
      <UFormField v-if="currentLang === 'tr'" label="Blog Kategorisi" required>
        <UTooltip text="Kategori seçimi SEO ve içerik organizasyonu için önemlidir" :delay-duration="0">
          <USelectMenu 
            class="w-full" 
            size="xl" 
            v-model="tags" 
            :items="categories" 
            multiple 
            create-item 
            searchable 
            variant="soft"
            placeholder="Kategori seçin veya ekleyin" 
            icon="i-lucide-tag" 
            trailing-icon="i-lucide-chevron-down"
            :searchInput="{ placeholder: 'Ara...', variant: 'none' }" 
            @create="createCategory">
            <template #leading>
              <UIcon name="i-lucide-tag" />
            </template>
            <template #create-item-label="{ item }">
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-plus" class="text-primary" />
                <span>Yeni Ekle <span class="font-medium">{{ item }}</span></span>
              </div>
            </template>
          </USelectMenu>
        </UTooltip>
        <template #hint>
          <div class="flex justify-between">
            <span class="text-xs text-neutral-500">En az bir kategori seçin. Yeni kategori ekleyebilirsiniz.</span>
            <span v-if="tags.length > 0" class="text-xs text-(--ui-success)">{{ tags.length }} kategori seçildi</span>
          </div>
        </template>
      </UFormField>

      <!-- Kapak Görseli - sadece Türkçe modunda -->
      <UFormField v-if="currentLang === 'tr'" label="Kapak Görseli" required>
        <div class="relative w-full">
          <!-- Image preview container -->
          <div class="relative mb-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-800 w-full mx-auto shadow-sm hover:border-primary-400 transition-colors">
            <div class="w-full h-[330px] relative">
              <!-- Image preview with fixed dimensions and object-cover -->
              <img 
                v-if="coverImage" 
                :src="coverImage" 
                alt="Blog kapak görseli önizleme" 
                class="w-full h-full object-cover absolute inset-0"
              />
              
              <!-- Upload zone when no image -->
              <div v-else class="w-full h-full flex flex-col items-center justify-center text-neutral-400 absolute inset-0 cursor-pointer" @click="() => (fileInput as any)?.click()">
                <UIcon name="i-lucide-upload-cloud" class="text-6xl mb-4 text-neutral-300" />
                <div class="text-center">
                  <p class="text-lg font-medium text-neutral-600 dark:text-neutral-300 mb-2">Kapak Görseli Yükleyin</p>
                  <p class="text-sm text-neutral-500">PNG, JPG, WEBP formatlarında en fazla 25MB</p>
                  <p class="text-xs text-neutral-400 mt-1">Otomatik olarak optimize edilir ve WebP'ye dönüştürülür</p>
                </div>
              </div>

              <!-- Image overlay with edit options -->
              <div v-if="coverImage" class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <UButton
                  icon="i-lucide-eye"
                  color="neutral"
                  variant="solid"
                  size="sm"
                  @click="openImagePreview"
                  aria-label="Görseli önizle"
                >
                  Önizle
                </UButton>
                <UButton
                  icon="i-lucide-upload"
                  color="primary"
                  variant="solid"
                  size="sm"
                  @click="() => (fileInput as any)?.click()"
                  :loading="isUploading"
                  :disabled="isUploading"
                  aria-label="Yeni görsel yükle"
                >
                  {{ isUploading ? 'Yükleniyor...' : 'Değiştir' }}
                </UButton>
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="solid"
                  size="sm"
                  @click="removeCoverImage"
                  aria-label="Görseli kaldır"
                >
                  Kaldır
                </UButton>
              </div>
              
              <!-- Dimensions indicator overlay -->
              <div class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">
                1200 × 630 px (16:9)
              </div>
            </div>
          </div>

          <!-- File input (hidden) -->
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/tiff,image/webp"
            @change="handleFileUpload"
            class="hidden"
            :disabled="isUploading"
          />
          
          <!-- Upload controls -->
          <div class="mb-4 space-y-3">
            <div class="flex flex-col sm:flex-row gap-3">
              <!-- Primary upload button -->
              <UButton
                @click="() => (fileInput as any)?.click()"
                icon="i-lucide-upload"
                variant="outline"
                color="primary"
                size="md"
                :loading="isUploading"
                :disabled="isUploading"
                class="flex-1"
              >
                {{ isUploading ? 'Yükleniyor...' : (coverImage ? 'Farklı Görsel Seç' : 'Görsel Seç ve Yükle') }}
              </UButton>

              <!-- Secondary options -->
              <div class="flex gap-2">
                <UButton
                  @click="generateRandomImage"
                  icon="i-lucide-shuffle"
                  variant="soft"
                  color="neutral"
                  size="md"
                >
                  Rastgele
                </UButton>
                
                <UButton
                  v-if="coverImage"
                  @click="removeCoverImage"
                  icon="i-lucide-x"
                  variant="soft"
                  color="error"
                  size="md"
                >
                  Kaldır
                </UButton>
              </div>
            </div>

            <!-- Upload progress -->
            <div v-if="isUploading" class="w-full">
              <div class="flex items-center gap-2 text-sm text-neutral-600">
                <UIcon name="i-lucide-loader-2" class="animate-spin" />
                <span>Görsel yükleniyor ve optimize ediliyor...</span>
              </div>
              <div class="mt-2 text-xs text-neutral-500">
                • Maksimum 25MB boyut • Otomatik WebP dönüşümü • 2000px genişlik optimizasyonu • %80 kalite
              </div>
            </div>

            <!-- Upload error -->
            <div v-if="uploadError" class="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <div class="flex items-start gap-2">
                <UIcon name="i-lucide-alert-circle" class="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="font-medium">Yükleme Hatası</p>
                  <p class="text-xs mt-1">{{ uploadError }}</p>
                </div>
              </div>
            </div>

            <!-- Upload success -->
            <div v-if="uploadSuccess" class="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <div class="flex items-start gap-2">
                <UIcon name="i-lucide-check-circle" class="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="font-medium">Başarılı!</p>
                  <p class="text-xs mt-1">Görsel optimize edildi ve kaydedildi</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between items-center px-1">
            <span class="text-xs text-neutral-500">Tüm görseller SEO için 16:9 (1200×630px) oranında gösterilir</span>
            <span class="text-xs">
              <UBadge 
                :color="coverImage ? 'success' : 'warning'" 
                variant="subtle" 
                size="xs"
              >
                {{ coverImage ? 'Görsel hazır' : 'Görsel gerekli' }}
              </UBadge>
            </span>
          </div>
        </div>
      </UFormField>

      <!-- İçerik Editörü -->
      <UFormField :label="currentLang === 'tr' ? 'İçerik' : 'Content'" required>
        <UTooltip text="SEO için en az 300 kelimelik içerik oluşturun" :delay-duration="0">
          <div class="border rounded-md overflow-hidden">
            <!-- TipTap Menü -->
            <div v-if="editor" class="border-b p-2 flex flex-wrap gap-1 bg-neutral-50 dark:bg-neutral-800">
              <!-- Metin Formatları -->
              <UButtonGroup size="sm">
                <UButton 
                  title="Kalın"
                  :color="editor.isActive('bold') ? 'primary' : 'neutral'"
                  :variant="editor.isActive('bold') ? 'solid' : 'soft'"
                  icon="i-lucide-bold"
                  @click="editor.chain().focus().toggleBold().run()"
                />
                <UButton 
                  title="İtalik"
                  :color="editor.isActive('italic') ? 'primary' : 'neutral'"
                  :variant="editor.isActive('italic') ? 'solid' : 'soft'"
                  icon="i-lucide-italic"
                  @click="editor.chain().focus().toggleItalic().run()"
                />
                <UButton 
                  title="Altı Çizili"
                  :color="editor.isActive('underline') ? 'primary' : 'neutral'"
                  :variant="editor.isActive('underline') ? 'solid' : 'soft'"
                  icon="i-lucide-underline"
                  @click="editor.chain().focus().toggleUnderline().run()"
                />
                <UButton 
                  title="Üstü Çizili"
                  :color="editor.isActive('strike') ? 'primary' : 'neutral'"
                  :variant="editor.isActive('strike') ? 'solid' : 'soft'"
                  icon="i-lucide-strikethrough"
                  @click="editor.chain().focus().toggleStrike().run()"
                />
                <UButton 
                  title="Vurgula"
                  :color="editor.isActive('highlight') ? 'primary' : 'neutral'"
                  :variant="editor.isActive('highlight') ? 'solid' : 'soft'"
                  icon="i-lucide-highlighter"
                  @click="editor.chain().focus().toggleHighlight().run()"
                />
              </UButtonGroup>
              
              <!-- Hizalama -->
              <UButtonGroup size="sm">
                <UButton 
                  title="Sola Hizala"
                  :color="editor.isActive({ textAlign: 'left' }) ? 'primary' : 'neutral'"
                  :variant="editor.isActive({ textAlign: 'left' }) ? 'solid' : 'soft'"
                  icon="i-lucide-align-left"
                  @click="editor.chain().focus().setTextAlign('left').run()"
                />
                <UButton 
                  title="Ortala"
                  :color="editor.isActive({ textAlign: 'center' }) ? 'primary' : 'neutral'"
                  :variant="editor.isActive({ textAlign: 'center' }) ? 'solid' : 'soft'"
                  icon="i-lucide-align-center"
                  @click="editor.chain().focus().setTextAlign('center').run()"
                />
                <UButton 
                  title="Sağa Hizala"
                  :color="editor.isActive({ textAlign: 'right' }) ? 'primary' : 'neutral'"
                  :variant="editor.isActive({ textAlign: 'right' }) ? 'solid' : 'soft'"
                  icon="i-lucide-align-right"
                  @click="editor.chain().focus().setTextAlign('right').run()"
                />
                <UButton 
                  title="İki Yana Yasla"
                  :color="editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'neutral'"
                  :variant="editor.isActive({ textAlign: 'justify' }) ? 'solid' : 'soft'"
                  icon="i-lucide-align-justify"
                  @click="editor.chain().focus().setTextAlign('justify').run()"
                />
              </UButtonGroup>

              <!-- Başlık Seviyeleri -->
              <USelect
                size="sm"
                :ui="{ 
                  base: 'min-w-[130px]'
                }"
                placeholder="Paragraf"
                :items="[
                  { label: 'Paragraf', value: 'paragraph' },
                  { label: 'Başlık 1', value: 'heading-1' },
                  { label: 'Başlık 2', value: 'heading-2' },
                  { label: 'Başlık 3', value: 'heading-3' },
                  { label: 'Başlık 4', value: 'heading-4' },
                  { label: 'Başlık 5', value: 'heading-5' },
                  { label: 'Başlık 6', value: 'heading-6' }
                ]"
                :modelValue="getHeadingLevel()"
                @update:modelValue="setHeadingLevel($event)"
              />

              <!-- Liste ve Blok Öğeleri -->
              <UButtonGroup size="sm">
                <UButton 
                  title="Madde İşaretli Liste"
                  :color="editor.isActive('bulletList') ? 'primary' : 'neutral'"
                  :variant="editor.isActive('bulletList') ? 'solid' : 'soft'"
                  icon="i-lucide-list"
                  @click="editor.chain().focus().toggleBulletList().run()"
                />
                <UButton 
                  title="Numaralı Liste"
                  :color="editor.isActive('orderedList') ? 'primary' : 'neutral'"
                  :variant="editor.isActive('orderedList') ? 'solid' : 'soft'"
                  icon="i-lucide-list-ordered"
                  @click="editor.chain().focus().toggleOrderedList().run()"
                />
                <UButton 
                  title="Alıntı"
                  :color="editor.isActive('blockquote') ? 'primary' : 'neutral'"
                  :variant="editor.isActive('blockquote') ? 'solid' : 'soft'"
                  icon="i-lucide-quote"
                  @click="editor.chain().focus().toggleBlockquote().run()"
                />
                <UButton 
                  title="Kod Bloğu"
                  :color="editor.isActive('codeBlock') ? 'primary' : 'neutral'"
                  :variant="editor.isActive('codeBlock') ? 'solid' : 'soft'"
                  icon="i-lucide-code"
                  @click="editor.chain().focus().toggleCodeBlock().run()"
                />
              </UButtonGroup>

              <!-- Özel İşlemler -->
              <UButtonGroup size="sm">
                <UButton 
                  title="Görsel Ekle"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-image"
                  @click="addImage"
                />
                <UButton
                  title="Link Ekle"
                  :color="editor.isActive('link') ? 'primary' : 'neutral'"
                  :variant="editor.isActive('link') ? 'solid' : 'soft'"
                  icon="i-lucide-link"
                  @click="setLink"
                />
                <UButton
                  title="Yatay Çizgi"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-minus"
                  @click="editor.chain().focus().setHorizontalRule().run()"
                />
              </UButtonGroup>

              <!-- Geri Al / İleri Al -->
              <div class="ml-auto">
                <UButtonGroup size="sm">
                  <UButton
                    title="Geri Al"
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-undo"
                    @click="editor.chain().focus().undo().run()"
                  />
                  <UButton
                    title="İleri Al"
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-redo"
                    @click="editor.chain().focus().redo().run()"
                  />
                </UButtonGroup>
              </div>
            </div>
            
            <!-- TipTap Bubble Menu -->
            <BubbleMenu v-if="editor" :editor="editor" :tippy-options="{ maxWidth: 'none' }">
              <div class="flex gap-1 p-1 rounded-lg shadow-lg bg-white dark:bg-neutral-800 border">
                <UButton size="xs" :color="editor.isActive('bold') ? 'primary' : 'neutral'" :variant="editor.isActive('bold') ? 'solid' : 'soft'" icon="i-lucide-bold" @click="editor.chain().focus().toggleBold().run()" />
                <UButton size="xs" :color="editor.isActive('italic') ? 'primary' : 'neutral'" :variant="editor.isActive('italic') ? 'solid' : 'soft'" icon="i-lucide-italic" @click="editor.chain().focus().toggleItalic().run()" />
                <UButton size="xs" :color="editor.isActive('underline') ? 'primary' : 'neutral'" :variant="editor.isActive('underline') ? 'solid' : 'soft'" icon="i-lucide-underline" @click="editor.chain().focus().toggleUnderline().run()" />
              </div>
            </BubbleMenu>

            <div v-if="editor" class="p-4 tiptap-editor-wrapper">
              <EditorContent 
                :editor="editor"
                class="prose dark:prose-invert max-w-none min-h-[200px] tiptap-content" 
              />
            </div>
            <div v-else class="p-4 text-center text-neutral-500">
              <USkeleton class="h-48" />
            </div>
          </div>
        </UTooltip>
        <template #hint>
          <div class="flex justify-between">
            <span class="text-xs text-neutral-500">
              {{ currentLang === 'tr' 
                ? 'SEO için en az 300 kelime içerik önerilir' 
                : 'English content is optional - Turkish content will be used if empty'
              }}
            </span>
          </div>
        </template>
      </UFormField>

      <!-- Yayınlama Durumu -->
      <UFormField v-if="currentLang === 'tr'">
        <div class="flex items-center">
          <USwitch v-model="isPublished" />
          <span class="ml-2 text-sm">Hemen Yayınla</span>
        </div>
        <template #hint>
          <span class="text-xs text-neutral-500">İşaretlenmezse, blog yazınız taslak olarak kaydedilir.</span>
        </template>
      </UFormField>
      
      <!-- Yayınlama Durumu Bilgisi - İngilizce modunda sadece gösterim -->
      <UFormField v-if="currentLang === 'en'">
        <div class="flex items-center">
          <USwitch :model-value="isPublished" disabled />
          <span class="ml-2 text-sm text-neutral-500">{{ isPublished ? 'Will be published' : 'Will be saved as draft' }}</span>
        </div>
        <template #hint>
          <span class="text-xs text-neutral-500">Publication status is controlled from Turkish tab</span>
        </template>
      </UFormField>

      <!-- Form Butonları - her iki dilde de göster -->
      <div class="flex justify-end space-x-3 pt-4">
        <UButton v-if="isEditMode" color="neutral" @click="cancelEdit" icon="i-lucide-x" variant="outline">
          {{ currentLang === 'tr' ? 'Düzenlemeyi İptal Et' : 'Cancel Edit' }}
        </UButton>

        <UButton 
          @click="submitBlog" 
          :loading="isSubmitting" 
          :disabled="!i18nData.tr.title || !i18nData.tr.content || !i18nData.tr.description"
          icon="i-lucide-save" 
          color="primary">
          {{ currentLang === 'tr' 
            ? (isEditMode ? 'Değişiklikleri Kaydet' : 'Blog Yazısını Kaydet')
            : (isEditMode ? 'Save Changes' : 'Save Blog Post')
          }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<style>
/* Orijinal BlogEditor.vue'nun tüm stillerini koruyarak */
.tiptap-content {
  min-height: 200px;
  padding: 0.5rem;
  word-break: break-word;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  display: block;
  contain: content;
}

.tiptap-editor-wrapper {
  padding: 0 !important;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  display: block;
  contain: content;
}

.blog-editor-component {
  width: 100%;
  box-sizing: border-box;
  contain: layout;
}

.blog-editor-component .border {
  width: 100%;
  box-sizing: border-box;
  contain: content;
}

.tiptap-content h1 {
  font-size: 2em !important;
  font-weight: 700 !important;
  margin-top: 0.67em !important;
  margin-bottom: 0.67em !important;
  line-height: 1.2 !important;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
}

.tiptap-content h2 {
  font-size: 1.5em !important;
  font-weight: 600 !important;
  margin-top: 0.83em !important;
  margin-bottom: 0.83em !important;
  line-height: 1.3 !important;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
}

.tiptap-content h3 {
  font-size: 1.17em !important;
  font-weight: 600 !important;
  margin-top: 1em !important;
  margin-bottom: 1em !important;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
}

.tiptap-content h4 {
  font-size: 1em !important;
  font-weight: 600 !important;
  margin-top: 1.33em !important;
  margin-bottom: 1.33em !important;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
}

.tiptap-content h5 {
  font-size: 0.83em !important;
  font-weight: 600 !important;
  margin-top: 1.67em !important;
  margin-bottom: 1.67em !important;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
}

.tiptap-content h6 {
  font-size: 0.67em !important;
  font-weight: 600 !important;
  margin-top: 2.33em !important;
  margin-bottom: 2.33em !important;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
}

.tiptap-content p {
  margin-top: 1em !important;
  margin-bottom: 1em !important;
  line-height: 1.5 !important;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
}

.tiptap-content ul {
  display: block !important;
  list-style-type: disc !important;
  padding-left: 40px !important;
  margin-top: 1em !important;
  margin-bottom: 1em !important;
}

.tiptap-content ol {
  display: block !important;
  list-style-type: decimal !important;
  padding-left: 40px !important;
  margin-top: 1em !important;
  margin-bottom: 1em !important;
}

.tiptap-content li {
  display: list-item !important;
  list-style-position: outside !important;
}

.tiptap-bullet-list {
  list-style-type: disc !important;
  padding-left: 1.5em !important;
}

.tiptap-ordered-list {
  list-style-type: decimal !important;
  padding-left: 1.5em !important;
}

.tiptap-list-item {
  display: list-item !important;
}

.tiptap-content blockquote {
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 1em !important;
  border-left: 4px solid #e5e7eb !important;
  font-style: italic !important;
  margin-top: 1em !important;
  margin-bottom: 1em !important;
}

.tiptap-content pre {
  background-color: #f9fafb !important;
  border-radius: 0.375rem !important;
  padding: 1em !important;
  overflow-x: auto !important;
  margin-top: 1em !important;
  margin-bottom: 1em !important;
}

.tiptap-content pre code {
  white-space: pre-wrap !important;
  word-break: break-word !important;
}

.tiptap-content hr {
  border: none !important;
  border-top: 2px solid #e5e7eb !important;
  margin-top: 1.5em !important;
  margin-bottom: 1.5em !important;
}

.tiptap-content img {
  max-width: 100% !important;
  height: auto !important;
  margin: 1em 0 !important;
  border-radius: 0.25rem !important;
}

.dark .tiptap-content pre {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.dark .tiptap-content blockquote {
  border-left-color: rgba(255, 255, 255, 0.2) !important;
}

.dark .tiptap-content hr {
  border-top-color: rgba(255, 255, 255, 0.2) !important;
}

.tiptap-content .text-left {
  text-align: left !important;
}

.tiptap-content .text-center {
  text-align: center !important;
}

.tiptap-content .text-right {
  text-align: right !important;
}

.tiptap-content .text-justify {
  text-align: justify !important;
}

.tiptap-content > * {
  margin-left: 0 !important;
  margin-right: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
  overflow-wrap: break-word !important;
  box-sizing: border-box !important;
  text-overflow: ellipsis !important;
}

.tiptap-content *:not(img) {
  max-width: 100% !important;
  word-break: break-word !important;
  box-sizing: border-box !important;
  overflow-wrap: break-word !important;
}

.blog-editor-component .w-full {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

.tiptap-content pre {
  overflow-x: auto !important;
  white-space: pre-wrap !important;
  word-break: normal !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.prose {
  max-width: none !important;
  width: 100% !important;
  contain: content !important;
}

.ProseMirror {
  width: 100% !important;
  box-sizing: border-box !important;
  outline: none !important;
  contain: content !important;
  overflow: hidden !important;
}

.tiptap-content table {
  width: 100% !important;
  table-layout: fixed !important;
  overflow-wrap: break-word !important;
  border-collapse: collapse !important;
}

.tiptap-link {
  word-break: break-word !important;
  overflow-wrap: break-word !important;
}

.tiptap-content * {
  overflow-wrap: anywhere !important;
}
</style>
