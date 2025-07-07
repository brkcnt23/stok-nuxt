import { uploadImage } from '../../utils/fileUpload'

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  try {
    const result = await uploadImage(event.node.req, {
      maxFileSize: 25 * 1024 * 1024, // 25MB
      maxWidth: 2000,
      quality: 80
    })

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.error || 'Upload failed'
      })
    }

    return {
      success: true,
      url: result.url,
      filename: result.filename
    }

  } catch (error) {
    console.error('Upload API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Internal server error'
    })
  }
})
