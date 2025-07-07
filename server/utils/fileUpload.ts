import sharp from 'sharp'
import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { IncomingForm, File } from 'formidable'
import type { IncomingMessage } from 'http'

export interface UploadConfig {
  maxFileSize: number // bytes
  allowedExtensions: string[]
  outputDir: string
  maxWidth: number
  quality: number
}

export interface UploadResult {
  success: boolean
  url?: string
  filename?: string
  error?: string
}

const defaultConfig: UploadConfig = {
  maxFileSize: 25 * 1024 * 1024, // 25MB
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'],
  outputDir: 'uploads/images', // Fallback for relative path
  maxWidth: 2000,
  quality: 80
}

export async function uploadImage(
  req: IncomingMessage,
  config: Partial<UploadConfig> = {}
): Promise<UploadResult> {
  const finalConfig = { ...defaultConfig, ...config }
  
  try {
    // Parse form data
    const { files } = await parseForm(req, finalConfig.maxFileSize)
    
    if (!files.image) {
      return { success: false, error: 'No image file provided' }
    }

    const file = Array.isArray(files.image) ? files.image[0] : files.image
    
    if (!file || !file.filepath) {
      return { success: false, error: 'Invalid file' }
    }

    // Validate file extension
    const ext = extname(file.originalFilename || '').toLowerCase()
    if (!finalConfig.allowedExtensions.includes(ext)) {
      return { 
        success: false, 
        error: `Invalid file type. Allowed: ${finalConfig.allowedExtensions.join(', ')}` 
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const filename = `${timestamp}-${randomStr}.webp`
    
    // Use environment variable for storage path
    const fileStoragePath = process.env.FILE_STORAGE_PATH
    let uploadDir: string
    
    if (fileStoragePath) {
      // Use custom storage path from environment
      uploadDir = fileStoragePath
    } else {
      // Fallback to default path
      uploadDir = join(process.cwd(), 'public', finalConfig.outputDir)
    }
    
    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const outputPath = join(uploadDir, filename)
    
    // Process image with Sharp
    await sharp(file.filepath)
      .resize(finalConfig.maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: finalConfig.quality })
      .toFile(outputPath)

    // Generate URL based on environment
    let url: string
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (isProduction && fileStoragePath && fileStoragePath.includes('media.asma-germe.com')) {
      // For production/external storage, return full URL
      url = `https://media.asma-germe.com/public/images/${filename}`
    } else {
      // For development/local storage, return relative URL
      url = `/uploads/images/${filename}`
    }
    
    return {
      success: true,
      url,
      filename
    }

  } catch (error) {
    console.error('Image upload error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }
  }
}

function parseForm(req: IncomingMessage, maxFileSize: number): Promise<{ files: any, fields: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize,
      uploadDir: '/tmp',
      keepExtensions: true,
      multiples: false
    })

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      } else {
        resolve({ fields, files })
      }
    })
  })
}
