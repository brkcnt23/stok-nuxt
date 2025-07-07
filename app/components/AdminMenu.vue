<script setup lang="ts">
const auth = useAuth()
// Client-side rendering için isUserLoggedIn değişkeni
const isUserLoggedIn = ref(false)
const isMenuOpen = ref(false)
const menuRef = ref(null)

// Sadece client-side'da kullanıcı durumunu kontrol et (hydration eşleşmesizliğini önlemek için)
onMounted(() => {
  isUserLoggedIn.value = auth.isAuthenticated.value
  // Değişiklikleri izle
  watch(() => auth.isAuthenticated.value, (newVal) => {
    isUserLoggedIn.value = newVal
  })

  // Dışarı tıklamayı dinle
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Component temizlendiğinde event listener'ı kaldır
  document.removeEventListener('click', handleClickOutside)
})

// Kısayol tuşları tanımlama - defineShortcuts composable kullanarak
// Ctrl + ↑ kısayolu için Login sayfasına yönlendirme
defineShortcuts({
  'ctrl_arrowup': () => {
    navigateTo('/login')
  }
})

const handleLogout = async () => {
  await auth.logout()
  navigateTo('/login')
  closeMenu()
}

// Menüyü aç/kapa
const toggleMenu = (e: MouseEvent) => {
  // Olayın diğer işleyicilere yayılmasını engelle
  e.stopPropagation()
  isMenuOpen.value = !isMenuOpen.value
}

// Dışarı tıklamayı kontrol et
const handleClickOutside = (event: MouseEvent) => {
  // Menü açıksa ve tıklama menünün dışında ise kapat
  if (isMenuOpen.value && menuRef.value && !menuRef.value.contains(event.target)) {
    closeMenu()
  }
}

// Menüyü kapat
const closeMenu = () => {
  isMenuOpen.value = false
}

// Panel'e git ve menüyü kapat
const goToPanel = () => {
  navigateTo('/panel')
  closeMenu()
}
</script>

<template>
  <div v-if="isUserLoggedIn" ref="menuRef" class="fixed top-1/2 right-0 -translate-y-1/2 z-50 flex items-center">
    <!-- Sağ tarafta ortada duran buton -->
    <UButton @click="toggleMenu" :icon="isMenuOpen ? 'i-lucide-x' : 'i-lucide-settings'"
      class="flex justify-center items-center rounded-none rounded-l-lg cursor-pointer transition-all duration-300"
      variant="ghost" hint="Yönetim Menüsü">

    </UButton>

    <!-- Açılır menü -->
    <UCard v-if="isMenuOpen" class="absolute right-12 top-1/2 -translate-y-1/2 w-48 sm:w-52
             bg-primary-500/10 ring-0 backdrop-blur-md shadow-xl" variant="subtle" :ui="{
              root: 'rounded-xl',
              body: 'p-3'
            }">
      <div class="flex flex-col gap-2">
        <UButton @click="goToPanel" icon="i-lucide-layout-dashboard" block color="primary"
          class="transition-all duration-200">
          Panel
        </UButton>
        <UButton @click="handleLogout" icon="i-lucide-log-out" block color="error" class="transition-all duration-200">
          Çıkış Yap
        </UButton>
        <div class="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-2">
          <kbd
            class="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 shadow border border-neutral-200 dark:border-neutral-600 text-xs">Ctrl</kbd>
          +
          <kbd
            class="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 shadow border border-neutral-200 dark:border-neutral-600 text-xs">↑</kbd>
          : Panel
        </div>
      </div>
    </UCard>
  </div>
</template>

<!-- landingde 3 saniye sonra yazı kaybolsun butonlar küçülsün video-görseller izlensin
    
-->