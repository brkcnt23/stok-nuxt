<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';

// Tip tanımlamaları
interface BlogData {
  i18n: {
    tr: {
      title: string;
      description: string;
      content: string;
      tags: string[];
    };
    en: {
      title: string;
      description: string;
      content: string;
      tags: string[];
    };
  };
  slug: string;
  coverImage: string;
  tags: string[];
  isPublished: boolean;
}

interface ToastOptions {
  title: string;
  description: string;
  color: 'error' | 'success' | 'info' | 'warning' | 'neutral' | 'primary' | 'secondary';
}

interface BlogPost {
  _id: string;
  i18n: {
    tr: {
      title: string;
      description: string;
      content: string;
      tags: string[];
    };
    en: {
      title: string;
      description: string;
      content: string;
      tags: string[];
    };
  };
  slug: string;
  coverImage: string;
  tags: string[];
  isPublished: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
}

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

interface Project {
  _id: string;
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
  author: string;
  createdAt: string;
  updatedAt: string;
}

const auth = useAuth();
const user = auth.user;

// Blog state
const currentBlogId = ref<string | null>(null);
const blogPosts = ref<BlogPost[]>([]);
const isLoading = ref(true);
const activeTab = ref('create');
const isEditMode = ref(false);
const isDeletingBlog = ref(false);
const blogToDelete = ref<BlogPost | null>(null);
const showDeleteConfirmModal = ref(false);
const blogEditor = ref<any>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const totalBlogs = ref(0);
const perPage = ref(10);
const searchQuery = ref('');
const isSubmitting = ref(false);

// Projects state
const projectsTab = ref('create');
const currentProjectId = ref<string | null>(null);
const projects = ref<Project[]>([]);
const isLoadingProjects = ref(true);
const isEditModeProject = ref(false);
const isDeletingProject = ref(false);
const projectToDelete = ref<Project | null>(null);
const showDeleteProjectConfirmModal = ref(false);
const projectEditor = ref<any>(null);
const currentProjectPage = ref(1);
const totalProjectPages = ref(1);
const totalProjects = ref(0);
const projectsPerPage = ref(10);
const projectSearchQuery = ref('');
const isSubmittingProject = ref(false);

// Main navigation state
const mainTab = ref('blog');
const settingsTab = ref('stats');

// Debounced search fonksiyonu - now using proper import
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1; // Arama yapıldığında ilk sayfaya dön
  fetchBlogs();
}, 500);

// Debounced project search
const debouncedProjectSearch = useDebounceFn(() => {
  currentProjectPage.value = 1;
  fetchProjects();
}, 500);

watch(searchQuery, () => {
  debouncedSearch();
});

watch(projectSearchQuery, () => {
  debouncedProjectSearch();
});

const submitBlog = async (blogData: BlogData) => {
  // i18n verilerini kontrol et
  const trData = blogData.i18n?.tr;
  if (!trData || !trData.title || !trData.content || !trData.description) {
    showToast({
      title: 'Eksik Bilgi',
      description: 'Lütfen gerekli alanları doldurun.',
      color: 'error'
    });
    return;
  }

  try {
    isSubmitting.value = true;

    if (isEditMode.value && currentBlogId.value) {
      await $fetch(`/api/blogs/${currentBlogId.value}`, {
        method: 'PUT',
        body: blogData
      });

      showToast({
        title: 'Başarılı',
        description: 'Blog yazısı başarıyla güncellendi',
        color: 'success'
      });
      isEditMode.value = false;
      currentBlogId.value = null;
    } else {
      await $fetch('/api/blogs', {
        method: 'POST',
        body: {
          ...blogData,
          author: user.value?._id
        }
      });

      showToast({
        title: 'Başarılı',
        description: 'Blog yazısı başarıyla oluşturuldu',
        color: 'success'
      });
    }

    if (blogEditor.value) {
      blogEditor.value.clearForm();
    }
    fetchBlogs();
    activeTab.value = 'list';
  } catch (error) {
    showToast({
      title: 'Hata',
      description: isEditMode.value ? 'Blog yazısı güncellenirken bir hata oluştu' : 'Blog yazısı oluşturulurken bir hata oluştu',
      color: 'error'
    });
    console.error('Blog işlem hatası:', error);
  } finally {
    isSubmitting.value = false;
  }
};
const showToast = ({ title, description, color }: ToastOptions) => {
  const toast = useToast();

  toast.add({
    title,
    description,
    color
  });
};

const fetchBlogs = async () => {
  try {
    isLoading.value = true;

    // API isteğinde pagination ve search parametrelerini ekle
    const response = await $fetch('/api/blogs', {
      params: {
        page: currentPage.value,
        limit: perPage.value,
        search: searchQuery.value || undefined, // Boşsa undefined gönder
        author: user.value?._id // Sadece kullanıcının kendi bloglarını getir
      }
    });

    if (response && response.blogs) {
      blogPosts.value = response.blogs as BlogPost[];
      totalBlogs.value = response.total || 0;
      totalPages.value = Math.ceil(totalBlogs.value / perPage.value);
    } else {
      console.warn('API yanıtında blogs verisi bulunamadı:', response);
      blogPosts.value = [];
      totalBlogs.value = 0;
      totalPages.value = 0;
    }
  } catch (error) {
    console.error('Blog yazılarını getirme hatası:', error);
    showToast({
      title: 'Hata',
      description: 'Blog yazıları getirilirken bir hata oluştu',
      color: 'error'
    });
    blogPosts.value = [];
    totalBlogs.value = 0;
    totalPages.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// Sayfa değiştiğinde blogları yeniden yükle
const onPageChange = (page: number) => {
  currentPage.value = page;
  fetchBlogs();
};

// Initialize data on mount
onMounted(async () => {
  await Promise.all([
    fetchBlogs(),
    fetchProjects()
  ]);
});

definePageMeta({
  layout: 'default',
  middleware: 'auth'
});

useSeoMeta({
  title: 'Blog Yönetim Paneli - ASMA GERME',
  description: 'ASMA GERME blog yönetim sistemi ile asma germe ipuçları ve sektör hakkında bilgilendirici yazılar ekleyin.',
  ogTitle: 'Blog Yönetim Paneli - ASMA GERME',
  ogDescription: 'ASMA GERME blog yönetim sistemi ile asma germe ipuçları ve sektör hakkında bilgilendirici yazılar ekleyin.',
  twitterTitle: 'Blog Yönetim Paneli - ASMA GERME',
  twitterDescription: 'ASMA GERME blog yönetim sistemi ile asma germe ipuçları ve sektör hakkında bilgilendirici yazılar ekleyin.'
});

const editBlog = async (blog: BlogPost) => {
  try {
    isLoading.value = true;
    const blogData = await $fetch(`/api/blogs/${blog._id}`) as BlogPost;

    console.log('Blog içeriği yükleniyor:', blogData.i18n?.tr?.content ? 'İçerik var (' + blogData.i18n.tr.content.length + ' karakter)' : 'İçerik yok');

    // Önce UI'da düzenleme modunu açalım
    currentBlogId.value = blogData._id;
    isEditMode.value = true;
    activeTab.value = 'create';

    // Tab değişimi ve DOM güncellenmesi için bir sonraki tick'i bekleyelim
    await nextTick();

    // Daha uzun bir gecikme kullanarak DOM'un tamamen güncellendiğinden emin olalım
    setTimeout(async () => {
      if (blogEditor.value) {
        // İçerik güncellemeden önce editörün hazır olduğundan emin olalım
        blogEditor.value.setFormData(blogData);

        // Eğer içerik hala yüklenmezse, bir kez daha deneyelim
        setTimeout(() => {
          if (blogEditor.value && blogEditor.value.editor && blogEditor.value.editor.value) {
            if (blogEditor.value.editor.value.isEmpty && blogData.i18n?.tr?.content) {
              console.log('İçerik tekrar yükleniyor (ikinci deneme)');
              blogEditor.value.editor.value.commands.setContent(blogData.i18n.tr.content);
            }
          }
        }, 500);
      } else {
        console.error("BlogEditor bileşeni bulunamadı!");
        // Alternatif çözüm denemesi
        const editorEl = document.querySelector('.blog-editor-component');
        if (editorEl) {
          // Vue component instance'ını direkt erişim yerine ref üzerinden bul
          blogEditor.value = (editorEl as any)?.__vueParentComponent?.exposed;
          if (blogEditor.value) {
            blogEditor.value.setFormData(blogData);

            // Yedek çözüm - ikinci deneme
            setTimeout(() => {
              if (blogEditor.value?.editor && blogEditor.value.editor.value && blogEditor.value.editor.value.isEmpty) {
                console.log('Alternatif içerik yükleme denemesi');
                blogEditor.value.editor.value.commands.setContent(blogData.i18n?.tr?.content || '');
              }
            }, 500);
          }
        }
      }

      showToast({
        title: 'Düzenleme Modu',
        description: 'Blog yazısını düzenleme modundasınız',
        color: 'info'
      });
    }, 400); // DOM'un güncellendiğinden emin olmak için daha uzun bir gecikme eklendi
  } catch (error) {
    console.error('Blog yazısı getirme hatası:', error);
    showToast({
      title: 'Hata',
      description: 'Blog yazısı getirilirken bir hata oluştu',
      color: 'error'
    });
  } finally {
    isLoading.value = false;
  }
};
const deleteBlog = async () => {
  if (!blogToDelete.value) return;
  try {
    isDeletingBlog.value = true;
    await $fetch(`/api/blogs/${blogToDelete.value._id}`, {
      method: 'DELETE'
    });
    showToast({
      title: 'Başarılı',
      description: 'Blog yazısı başarıyla silindi',
      color: 'success'
    });
    await fetchBlogs();
    showDeleteConfirmModal.value = false;
    blogToDelete.value = null;
  } catch (error) {
    console.error('Blog silme hatası:', error);
    showToast({
      title: 'Hata',
      description: 'Blog yazısı silinirken bir hata oluştu',
      color: 'error'
    });
  } finally {
    isDeletingBlog.value = false;
  }
};
const confirmDeleteBlog = (blog: BlogPost) => {
  blogToDelete.value = blog;
  showDeleteConfirmModal.value = true;
};

const handleCancelEdit = () => {
  if (blogEditor.value) {
    blogEditor.value.clearForm();
  }
  currentBlogId.value = null;
  isEditMode.value = false;
  showToast({
    title: 'Düzenleme İptal',
    description: 'Blog yazısı düzenleme işlemi iptal edildi',
    color: 'neutral'
  });
};

// PROJECT FUNCTIONS
const submitProject = async (projectData: ProjectData) => {
  // i18n verilerini kontrol et
  const trData = projectData.i18n?.tr;
  if (!trData || !trData.title || !trData.description) {
    showToast({
      title: 'Eksik Bilgi',
      description: 'Lütfen gerekli alanları doldurun.',
      color: 'error'
    });
    return;
  }

  try {
    isSubmittingProject.value = true;

    if (isEditModeProject.value && currentProjectId.value) {
      await $fetch(`/api/projects/admin/${currentProjectId.value}`, {
        method: 'PUT',
        body: projectData
      });

      showToast({
        title: 'Başarılı',
        description: 'Proje başarıyla güncellendi',
        color: 'success'
      });
      isEditModeProject.value = false;
      currentProjectId.value = null;
    } else {
      await $fetch('/api/projects/admin', {
        method: 'POST',
        body: {
          ...projectData,
          author: user.value?._id
        }
      });

      showToast({
        title: 'Başarılı',
        description: 'Proje başarıyla oluşturuldu',
        color: 'success'
      });
    }

    if (projectEditor.value) {
      projectEditor.value.clearForm();
    }
    fetchProjects();
    projectsTab.value = 'list';
  } catch (error) {
    showToast({
      title: 'Hata',
      description: isEditModeProject.value ? 'Proje güncellenirken bir hata oluştu' : 'Proje oluşturulurken bir hata oluştu',
      color: 'error'
    });
    console.error('Proje işlem hatası:', error);
  } finally {
    isSubmittingProject.value = false;
  }
};

const fetchProjects = async () => {
  try {
    isLoadingProjects.value = true;

    const response = await $fetch('/api/projects/admin', {
      params: {
        page: currentProjectPage.value,
        limit: projectsPerPage.value,
        search: projectSearchQuery.value || undefined,
        author: user.value?._id
      }
    });

    if (response && response.projects) {
      projects.value = response.projects as Project[];
      totalProjects.value = response.total || 0;
      totalProjectPages.value = Math.ceil(totalProjects.value / projectsPerPage.value);
    } else {
      console.warn('API yanıtında projects verisi bulunamadı:', response);
      projects.value = [];
      totalProjects.value = 0;
      totalProjectPages.value = 0;
    }
  } catch (error) {
    console.error('Projeler getirme hatası:', error);
    showToast({
      title: 'Hata',
      description: 'Projeler getirilirken bir hata oluştu',
      color: 'error'
    });
    projects.value = [];
    totalProjects.value = 0;
    totalProjectPages.value = 0;
  } finally {
    isLoadingProjects.value = false;
  }
};

const editProject = async (project: Project) => {
  try {
    isLoadingProjects.value = true;
    const projectData = await $fetch(`/api/projects/admin/${project._id}`) as Project;

    currentProjectId.value = projectData._id;
    isEditModeProject.value = true;
    projectsTab.value = 'create';

    await nextTick();

    setTimeout(async () => {
      if (projectEditor.value) {
        projectEditor.value.setFormData(projectData);
      }

      showToast({
        title: 'Düzenleme Modu',
        description: 'Projeyi düzenleme modundasınız',
        color: 'info'
      });
    }, 400);
  } catch (error) {
    console.error('Proje getirme hatası:', error);
    showToast({
      title: 'Hata',
      description: 'Proje getirilirken bir hata oluştu',
      color: 'error'
    });
  } finally {
    isLoadingProjects.value = false;
  }
};

const confirmDeleteProject = (project: Project) => {
  projectToDelete.value = project;
  showDeleteProjectConfirmModal.value = true;
};

const deleteProject = async () => {
  if (!projectToDelete.value) return;
  try {
    isDeletingProject.value = true;
    await $fetch(`/api/projects/admin/${projectToDelete.value._id}`, {
      method: 'DELETE'
    });
    showToast({
      title: 'Başarılı',
      description: 'Proje başarıyla silindi',
      color: 'success'
    });
    await fetchProjects();
    showDeleteProjectConfirmModal.value = false;
    projectToDelete.value = null;
  } catch (error) {
    console.error('Proje silme hatası:', error);
    showToast({
      title: 'Hata',
      description: 'Proje silinirken bir hata oluştu',
      color: 'error'
    });
  } finally {
    isDeletingProject.value = false;
  }
};

const handleCancelProjectEdit = () => {
  if (projectEditor.value) {
    projectEditor.value.clearForm();
  }
  currentProjectId.value = null;
  isEditModeProject.value = false;
  showToast({
    title: 'Düzenleme İptal',
    description: 'Proje düzenleme işlemi iptal edildi',
    color: 'neutral'
  });
};

const onProjectPageChange = (page: number) => {
  currentProjectPage.value = page;
  fetchProjects();
};
</script>

<template>
  <div class="py-12">
    <UContainer>
      <UCard class="backdrop-blur-xs bg-opacity-0" spotlight>
        <template #header>
          <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Yönetim Paneli</h1>
            <UBadge color="info" class="px-3 py-1 text-sm">
              Hoş Geldiniz, {{ user?.username }}
            </UBadge>
          </div>

          <!-- Ana sekmeler: Blog Yönetimi, Projeler Yönetimi ve Site Ayarları -->
          <UTabs v-model="mainTab" :items="[
            { label: 'Blog Yönetimi', value: 'blog', icon: 'i-lucide-file-text', description: 'Blog yazılarını yönet' },
            { label: 'Projeler Yönetimi', value: 'projects', icon: 'i-lucide-building-2', description: 'Projeleri yönet ve düzenle' },
            { label: 'Site Ayarları', value: 'settings', icon: 'i-lucide-settings', description: 'Site istatistiklerini ve ayarlarını yönet' }
          ]" color="primary" size="lg" class="mb-6" :ui="{
              list: 'relative flex p-1 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700',
            }" />

          <!-- Blog yönetimi sekmeleri - sadece mainTab 'blog' iken görünür -->
          <UTabs v-if="mainTab === 'blog'" v-model="activeTab" ref="tabsRef" :items="[
            { label: 'Yeni Blog Oluştur', value: 'create', icon: 'i-lucide-file-plus', description: 'Blog yazısı oluştur ve düzenle' },
            { label: 'Blog Yazılarım', value: 'list', icon: 'i-lucide-list', description: 'Tüm blog yazılarını yönet', count: totalBlogs }
          ]" color="primary" variant="pill" size="lg" :ui="{
              leadingIcon: 'size-10',
              root: 'w-full',
              list: 'relative flex p-1 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700',
              indicator: 'absolute transition-all duration-300 ease-in-out rounded-lg shadow-md bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-800',
              trigger: 'relative flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg font-medium transition-all duration-200 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 focus-visible:outline-none',
              content: 'mt-6 focus:outline-none',
            }">
            <template #default="{ item }">
              <div class="flex items-center gap-2">
                <div>
                  <span class="font-medium">{{ item.label }}</span>
                  <span v-if="item.count && item.count > 0"
                    class="ml-2 px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">{{
                    item.count }}</span>
                </div>
              </div>
              <div class="text-xs text-neutral-700 dark:text-neutral-400 mt-0.5 hidden md:block">{{ item.description }}
              </div>
            </template>

            <!-- Her sekme için özel içerik ayarları -->
            <template #content="{ item }">
              <UCard variant="soft" v-if="mainTab === 'blog' && item.value === activeTab">
                <div v-if="activeTab === 'create'" class="space-y-6">
                  <BlogEditor ref="blogEditor" class="blog-editor-component" :is-submitting="isSubmitting"
                    :is-edit-mode="isEditMode" :total-blogs="totalBlogs" @submit="submitBlog"
                    @cancel-edit="handleCancelEdit" />
                </div>
                <div v-else-if="activeTab === 'list'" class="space-y-4">
                  <!-- Arama çubuğu - placeholder güncellendi -->
                  <div class="mb-6">
                    <UInput v-model="searchQuery" placeholder="URL yada Blog başlığına göre ara..."
                      icon="i-lucide-search" size="lg" class="mb-2 w-full" @input="debouncedSearch" />
                    <div v-if="!isLoading"
                      class="text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
                      <span>
                        Toplam {{ totalBlogs }} blog yazısı bulundu
                        <template v-if="searchQuery">
                          "{{ searchQuery }}" araması için
                        </template>
                      </span>
                      <span v-if="totalPages > 1">
                        Sayfa {{ currentPage }}/{{ totalPages }}
                      </span>
                    </div>
                  </div>

                  <!-- Blog listesi -->
                  <BlogList :blog-posts="blogPosts" :is-loading="isLoading" @edit="editBlog"
                    @delete="confirmDeleteBlog" />

                  <!-- Pagination -->
                  <div v-if="totalPages > 1" class="mt-8 flex justify-center">
                    <UPagination v-model="currentPage" :page-count="totalPages" :total="totalBlogs"
                      :items-per-page="perPage" show-edges
                      @update:page="onPageChange" />
                  </div>

                  <!-- Sonuç bulunamadı mesajı -->
                  <div v-if="!isLoading && blogPosts.length === 0" class="text-center py-12">
                    <UIcon name="i-lucide-file-question" class="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
                    <h3 class="mt-4 text-xl font-medium">Sonuç bulunamadı</h3>
                    <p class="mt-2 text-gray-500 dark:text-gray-400">
                      <template v-if="searchQuery">
                        "{{ searchQuery }}" için blog yazısı bulunamadı. Farklı anahtar kelimelerle tekrar deneyin.
                      </template>
                      <template v-else>
                        Henüz blog yazısı oluşturmadınız. "Yeni Blog Oluştur" sekmesine geçerek ilk blogunuzu oluşturun.
                      </template>
                    </p>
                    <UButton v-if="searchQuery" icon="i-lucide-x" class="mt-4" @click="searchQuery = ''; fetchBlogs()">
                      Aramayı Temizle
                    </UButton>
                  </div>
                </div>
              </UCard>
            </template>
          </UTabs>

          <!-- Projeler yönetimi sekmeleri - sadece mainTab 'projects' iken görünür -->
          <UTabs v-if="mainTab === 'projects'" v-model="projectsTab" :items="[
            { label: 'Yeni Proje Oluştur', value: 'create', icon: 'i-lucide-plus-circle', description: 'Yeni proje ekle ve düzenle' },
            { label: 'Projelerim', value: 'list', icon: 'i-lucide-folder', description: 'Tüm projeleri yönet', count: totalProjects }
          ]" color="primary" variant="pill" size="lg" :ui="{
              leadingIcon: 'size-10',
              root: 'w-full',
              list: 'relative flex p-1 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700',
              indicator: 'absolute transition-all duration-300 ease-in-out rounded-lg shadow-md bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-800',
              trigger: 'relative flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg font-medium transition-all duration-200 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 focus-visible:outline-none',
              content: 'mt-6 focus:outline-none',
            }">
            <template #default="{ item }">
              <div class="flex items-center gap-2">
                <div>
                  <span class="font-medium">{{ item.label }}</span>
                  <span v-if="item.count && item.count > 0"
                    class="ml-2 px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">{{
                    item.count }}</span>
                </div>
              </div>
              <div class="text-xs text-neutral-700 dark:text-neutral-400 mt-0.5 hidden md:block">{{ item.description }}
              </div>
            </template>

            <!-- Her sekme için özel içerik ayarları -->
            <template #content="{ item }">
              <UCard variant="soft" v-if="mainTab === 'projects' && item.value === projectsTab">
                <div v-if="projectsTab === 'create'" class="space-y-6">
                  <ProjectEditor ref="projectEditor" class="project-editor-component" :is-submitting="isSubmittingProject"
                    :is-edit-mode="isEditModeProject" :total-projects="totalProjects" @submit="submitProject"
                    @cancel-edit="handleCancelProjectEdit" />
                </div>
                <div v-else-if="projectsTab === 'list'" class="space-y-4">
                  <!-- Arama çubuğu -->
                  <div class="mb-6">
                    <UInput v-model="projectSearchQuery" placeholder="Proje adı veya ülkeye göre ara..."
                      icon="i-lucide-search" size="lg" class="mb-2 w-full" @input="debouncedProjectSearch" />
                    <div v-if="!isLoadingProjects"
                      class="text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
                      <span>
                        Toplam {{ totalProjects }} proje bulundu
                        <template v-if="projectSearchQuery">
                          "{{ projectSearchQuery }}" araması için
                        </template>
                      </span>
                      <span v-if="totalProjectPages > 1">
                        Sayfa {{ currentProjectPage }}/{{ totalProjectPages }}
                      </span>
                    </div>
                  </div>

                  <!-- Projeler listesi -->
                  <ProjectList :projects="projects" :is-loading="isLoadingProjects" @edit="editProject"
                    @delete="confirmDeleteProject" />

                  <!-- Pagination -->
                  <div v-if="totalProjectPages > 1" class="mt-8 flex justify-center">
                    <UPagination v-model="currentProjectPage" :page-count="totalProjectPages" :total="totalProjects"
                      :items-per-page="projectsPerPage" show-edges
                      @update:page="onProjectPageChange" />
                  </div>

                  <!-- Sonuç bulunamadı mesajı -->
                  <div v-if="!isLoadingProjects && projects.length === 0" class="text-center py-12">
                    <UIcon name="i-lucide-folder-open" class="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
                    <h3 class="mt-4 text-xl font-medium">Sonuç bulunamadı</h3>
                    <p class="mt-2 text-gray-500 dark:text-gray-400">
                      <template v-if="projectSearchQuery">
                        "{{ projectSearchQuery }}" için proje bulunamadı. Farklı anahtar kelimelerle tekrar deneyin.
                      </template>
                      <template v-else>
                        Henüz proje oluşturmadınız. "Yeni Proje Oluştur" sekmesine geçerek ilk projenizi oluşturun.
                      </template>
                    </p>
                    <UButton v-if="projectSearchQuery" icon="i-lucide-x" class="mt-4" @click="projectSearchQuery = ''; fetchProjects()">
                      Aramayı Temizle
                    </UButton>
                  </div>
                </div>
              </UCard>
            </template>
          </UTabs>

          <!-- Site Ayarları içeriği - mainTab 'settings' iken görünür -->
          <div v-if="mainTab === 'settings'" class="mt-4">
            <!-- Site ayarları için alt sekmeler -->
            <UTabs v-model="settingsTab" :items="[
              { label: 'Site İstatistikleri', value: 'stats', icon: 'i-lucide-bar-chart-2' },
              { label: 'Hero Ayarları', value: 'hero', icon: 'i-lucide-video' },
            ]" color="secondary" size="md" class="mb-6" />

            <!-- Seçilen sekmeye göre içerik gösterimi -->
            <div class="mt-6">
              <!-- İstatistik ayarları -->
              <SiteStats v-if="settingsTab === 'stats'" />

              <!-- Hero bölümü ayarları -->
              <HeroSettings v-else-if="settingsTab === 'hero'" />
            </div>
          </div>
        </template>

        <!-- Footer artık tabs altında içerik olmadığı için doğrudan gösteriliyor -->
        <template #footer>
          <div class="flex justify-between items-center mt-4">
            <UButton variant="ghost" icon="i-lucide-help-circle" size="sm">
              {{ mainTab === 'blog' ? 'Blog Yazma İpuçları' : 'Site Ayarları Yardımı' }}
            </UButton>
            <UButton @click="async () => {
              await auth.logout();
              navigateTo('/login');
            }" color="error" variant="ghost" icon="i-lucide-log-out" size="sm">
              Çıkış Yap
            </UButton>
          </div>
        </template>
      </UCard>
      <!-- Delete Modals -->
      <DeleteConfirmModal v-model:show="showDeleteConfirmModal" :blog="blogToDelete as any" :is-deleting="isDeletingBlog"
        @confirm="deleteBlog" />
      
      <DeleteConfirmModal v-model:show="showDeleteProjectConfirmModal" :blog="projectToDelete as any" :is-deleting="isDeletingProject"
        @confirm="deleteProject" />
    </UContainer>
  </div>
</template>

<style scoped>
/* Sekmelerin görselini ve etkileşimini iyileştirilmesi için css geçişleri */
:deep(.transition-all) {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Aktif sekme göstergesinin daha yumuşak animasyonu için */
:deep(.tab-indicator) {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Sekmelere hover efektleri */
:deep(.tab-button:hover) {
  background-color: rgba(var(--color-primary-500), 0.1);
}
</style>
