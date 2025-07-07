import trHome from './locales/tr/home'
import trBlog from './locales/tr/blog'
import trProjects from './locales/tr/projects'
import trProducts from './locales/tr/products'
import enHome from './locales/en/home'
import enBlog from './locales/en/blog'
import enProjects from './locales/en/projects'
import enProducts from './locales/en/products'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'tr',
  fallbackLocale: 'tr',
  messages: {
    tr: {
      ...trHome,
      blog: trBlog,
      projects: trProjects,
      products: trProducts,
      common: {
        error: 'Hata',
        loading: 'Yükleniyor...',
        previous: 'Önceki',
        next: 'Sonraki',
        save: 'Kaydet',
        cancel: 'İptal',
        delete: 'Sil',
        edit: 'Düzenle',
        view: 'Görüntüle',
        search: 'Ara',
        filter: 'Filtrele',
        all: 'Tümü',
        yes: 'Evet',
        no: 'Hayır',
        close: 'Kapat',
        open: 'Aç'
      }
    },
    en: {
      ...enHome,
      blog: enBlog,
      projects: enProjects,
      products: enProducts,
      common: {
        error: 'Error',
        loading: 'Loading...',
        previous: 'Previous',
        next: 'Next',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        search: 'Search',
        filter: 'Filter',
        all: 'All',
        yes: 'Yes',
        no: 'No',
        close: 'Close',
        open: 'Open'
      }
    }
  }
}))
