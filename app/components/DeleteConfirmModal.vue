<template>
  <UModal
    :open="show"
    @update:open="$emit('update:show', $event)"
    prevent-close
    title="Blog Yazısını Sil"
    :ui="{
      header: 'text-(--ui-error)',
      title: 'flex items-center gap-2 text-lg font-medium'
    }"
  >
    <!-- Görünmeyen tetikleyici -->
    <div class="hidden"></div>

    <template #header-prepend>
      <UIcon name="i-lucide-alert-triangle" />
    </template>
    
    <template #body>
      <div v-if="blog" class="py-2">
        <p class="mb-3">
          <strong>"{{ blog.title }}"</strong> başlıklı blog yazısını silmek istediğinizden emin misiniz?
        </p>
        <p class="text-(--ui-error) text-sm">Bu işlem geri alınamaz!</p>
      </div>
    </template>
    
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton @click="closeModal" color="neutral">
          İptal
        </UButton>
        <UButton 
          @click="confirmDelete" 
          color="error" 
          :loading="isDeleting"
          icon="i-lucide-trash"
        >
          Evet, Sil
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  blog: {
    type: Object,
    default: null
  },
  isDeleting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:show', 'confirm']);

// Modal kapatma işlemi
function closeModal() {
  emit('update:show', false);
}

// Silme işlemi onaylama
function confirmDelete() {
  emit('confirm');
}
</script>
