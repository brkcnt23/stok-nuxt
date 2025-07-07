import tr from '../locales/tr'
import en from '../locales/en'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'tr',
  fallbackLocale: 'tr',
  messages: {
    tr,
    en
  },
  silentTranslationWarn: true, // Çeviri uyarılarını sessizce işaret et
  silentFallbackWarn: true, // Fallback uyarılarını sessizce işaret et
  missing: (locale, key) => {
    // Eksik çevirileri konsolda gösterme
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[i18n] İçerik eksik: ${key} in ${locale}`)
    }
    // Key'in son kısmını varsayılan değer olarak döndür
    const keyParts = key.split('.')
    return keyParts[keyParts.length - 1]
  }
}))
