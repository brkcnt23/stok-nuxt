<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    @click="closeLightbox"
    @keyup.esc="closeLightbox"
  >
    <!-- Close Button -->
    <button
      class="absolute top-4 right-4 z-60 p-2 text-white hover:text-gray-300 transition-colors"
      @click="closeLightbox"
    >
      <UIcon name="i-lucide-x" class="w-8 h-8" />
    </button>

    <!-- Navigation Buttons -->
    <button
      v-if="images.length > 1"
      class="absolute left-4 top-1/2 -translate-y-1/2 z-60 p-2 text-white hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      @click.stop="previousImage"
      :disabled="currentIndex === 0"
    >
      <UIcon name="i-lucide-chevron-left" class="w-8 h-8" />
    </button>

    <button
      v-if="images.length > 1"
      class="absolute right-4 top-1/2 -translate-y-1/2 z-60 p-2 text-white hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      @click.stop="nextImage"
      :disabled="currentIndex === images.length - 1"
    >
      <UIcon name="i-lucide-chevron-right" class="w-8 h-8" />
    </button>

    <!-- Image Container -->
    <div
      class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
      @click.stop
    >
      <img
        v-if="currentImage"
        :src="currentImage.url"
        :alt="currentImage.alt"
        class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        @load="imageLoaded = true"
      />
      
      <!-- Loading Spinner -->
      <div v-if="!imageLoaded" class="absolute inset-0 flex items-center justify-center">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-white animate-spin" />
      </div>
    </div>

    <!-- Image Info -->
    <div
      v-if="currentImage"
      class="absolute bottom-4 left-1/2 -translate-x-1/2 z-60 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
    >
      <p class="text-sm text-center">
        {{ currentImage.alt }}
      </p>
      <p v-if="images.length > 1" class="text-xs text-center text-gray-300 mt-1">
        {{ currentIndex + 1 }} / {{ images.length }}
      </p>
    </div>

    <!-- Thumbnails -->
    <div
      v-if="images.length > 1"
      class="absolute bottom-20 left-1/2 -translate-x-1/2 z-60 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 bg-black/50 rounded-lg backdrop-blur-sm"
    >
      <button
        v-for="(image, index) in images"
        :key="index"
        class="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all"
        :class="index === currentIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'"
        @click.stop="currentIndex = index"
      >
        <img
          :src="image.url"
          :alt="image.alt"
          class="w-full h-full object-cover"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LightboxImage {
  url: string;
  alt: string;
  type?: 'image' | 'video';
}

interface Props {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
  isOpen: false
});

const emit = defineEmits<{
  close: [];
  indexChange: [index: number];
}>();

// Reactive data
const currentIndex = ref(props.initialIndex);
const imageLoaded = ref(false);

// Computed
const currentImage = computed(() => {
  return props.images[currentIndex.value] || null;
});

// Watch for prop changes
watch(() => props.initialIndex, (newIndex) => {
  currentIndex.value = newIndex;
});

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    imageLoaded.value = false;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

watch(currentIndex, (newIndex) => {
  imageLoaded.value = false;
  emit('indexChange', newIndex);
});

// Methods
const closeLightbox = () => {
  emit('close');
};

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  }
};

const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// Keyboard navigation
const handleKeyboard = (event: KeyboardEvent) => {
  if (!props.isOpen) return;
  
  switch (event.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      previousImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyboard);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard);
  document.body.style.overflow = '';
});
</script>
