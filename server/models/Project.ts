import mongoose from 'mongoose';

// Interface for TypeScript
export interface IProject {
  _id?: string;
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
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema<IProject>({
  i18n: {
    tr: {
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true,
        trim: true
      },
      content: {
        type: String,
        default: ''
      },
      shortDescription: {
        type: String,
        required: true,
        trim: true
      }
    },
    en: {
      title: {
        type: String,
        default: ''
      },
      description: {
        type: String,
        default: ''
      },
      content: {
        type: String,
        default: ''
      },
      shortDescription: {
        type: String,
        default: ''
      }
    }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  year: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['residential', 'commercial', 'industrial', 'public', 'restoration']
  },
  materials: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    required: true,
    enum: ['completed', 'ongoing', 'planning', 'on-hold']
  },
  gallery: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    isHero: {
      type: Boolean,
      default: false
    }
  }],
  specifications: [{
    key: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  area: {
    type: String,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index'ler
projectSchema.index({ author: 1 });
projectSchema.index({ isPublished: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ year: 1 });
projectSchema.index({ country: 1 });
projectSchema.index({ createdAt: -1 });

// Arama için text index
projectSchema.index({
  'i18n.tr.title': 'text',
  'i18n.tr.description': 'text',
  'i18n.tr.shortDescription': 'text',
  'i18n.en.title': 'text',
  'i18n.en.description': 'text',
  'i18n.en.shortDescription': 'text',
  country: 'text',
  materials: 'text',
  slug: 'text'
});

// Virtual field for hero image
projectSchema.virtual('heroImage').get(function(this: IProject) {
  return this.gallery.find((item: any) => item.isHero) || this.gallery[0] || null;
});

// Ensure only one hero image
projectSchema.pre('save', function(this: IProject, next) {
  if (this.gallery && this.gallery.length > 0) {
    const heroCount = this.gallery.filter((item: any) => item.isHero).length;
    
    if (heroCount === 0) {
      // Eğer hiç hero yoksa, ilk görseli hero yap
      this.gallery[0].isHero = true;
    } else if (heroCount > 1) {
      // Eğer birden fazla hero varsa, sadece ilkini bırak
      let foundFirst = false;
      this.gallery.forEach((item: any) => {
        if (item.isHero && !foundFirst) {
          foundFirst = true;
        } else if (item.isHero && foundFirst) {
          item.isHero = false;
        }
      });
    }
  }
  next();
});

// JSON output'ta virtual field'ları dahil et
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

export default mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);
