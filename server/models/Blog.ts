import mongoose from 'mongoose';

// i18n destekli blog şeması
const i18nSchema = new mongoose.Schema({
  tr: {
    title: {
      type: String,
      required: [true, 'Türkçe başlık alanı zorunludur'],
      trim: true,
      maxlength: [120, 'Başlık 120 karakterden uzun olamaz']
    },
    description: {
      type: String,
      required: [true, 'Türkçe açıklama alanı zorunludur'],
      trim: true,
      maxlength: [250, 'Açıklama 250 karakterden uzun olamaz']
    },
    content: {
      type: String,
      required: [true, 'Türkçe içerik alanı zorunludur']
    },
    tags: {
      type: [String],
      default: []
    }
  },
  en: {
    title: {
      type: String,
      required: [true, 'İngilizce başlık alanı zorunludur'],
      trim: true,
      maxlength: [120, 'Title cannot be longer than 120 characters']
    },
    description: {
      type: String,
      required: [true, 'İngilizce açıklama alanı zorunludur'],
      trim: true,
      maxlength: [250, 'Description cannot be longer than 250 characters']
    },
    content: {
      type: String,
      required: [true, 'İngilizce içerik alanı zorunludur']
    },
    tags: {
      type: [String],
      default: []
    }
  }
}, { _id: false });

export const Blog = mongoose.model(
  'Blog',
  new mongoose.Schema(
    {
      // i18n içerikleri
      i18n: {
        type: i18nSchema,
        required: true
      },
      // Dil bağımsız alanlar
      slug: {
        type: String,
        required: [true, 'Slug alanı zorunludur'],
        unique: true,
        trim: true
      },
      coverImage: {
        type: String,
        default: ''
      },
      // Kategori/alan bilgisi (dil bağımsız)
      category: {
        type: String,
        enum: ['asma-germe', 'etfe', 'acilir-kapanir', 'tekstil-cephe', 'akustik', 'genel'],
        default: 'genel'
      },
      tags: {
        type: [String],
        default: []
      },
      isPublished: {
        type: Boolean,
        default: true
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      viewCount: {
        type: Number,
        default: 0
      }
    },
    {
      timestamps: true
    }
  )
);

// Indexes
Blog.schema.index({ status: 1 })
Blog.schema.index({ category: 1 })
Blog.schema.index({ createdAt: -1 })
Blog.schema.index({ updatedAt: -1 })

export type BlogDocument = mongoose.InferSchemaType<typeof Blog.schema> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
