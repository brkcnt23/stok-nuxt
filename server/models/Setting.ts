import mongoose from 'mongoose';

// MongoDB bağlantı şeması
const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Model oluşturulurken ilk kez oluşturulmuşsa kontrol et
settingSchema.post('save', function(doc) {
});

// Model export
export const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

// Varsayılan ayarları oluştur veya güncelle
export async function ensureDefaultSettings() {
  try {
    // Stats ayarları
    const statsSettings = {
      key: 'stats',
      value: {
        customers: 2500,
        experience: 21,
        staff: 50,
        quality: 100
      },
      description: 'Anasayfada gösterilen istatistik bilgileri'
    };

    // Hero ayarları
    const heroSettings = {
      key: 'heroSettings',
      value: {
        videoOpacity: 100,
        useGradientMask: true,
        gradientStart: 'rgba(0, 0, 0, 0.9)',
        gradientEnd: 'rgba(0, 0, 0, 0.7)'
      },
      description: 'Anasayfa hero bölümü video ve gradient ayarları'
    };

    // Ayarları oluştur veya güncelle (upsert)
    const settingsToCreate = [statsSettings, heroSettings];

    for (const setting of settingsToCreate) {
      await Setting.updateOne(
        { key: setting.key },
        { $set: setting },
        { upsert: true }
      );
    }

  } catch (error) {
    console.error('Varsayılan ayarlar oluşturulamadı:', error);
  }
}
