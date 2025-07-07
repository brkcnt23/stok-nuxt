import Project from '../../models/Project'

export default defineEventHandler(async (event) => {
  try {
    // Check authentication
    const session = await verifyAuthSession(event)
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const body = await readBody(event)

    // Validate required fields
    const requiredFields = ['title.tr', 'shortDescription.tr', 'content.tr', 'year', 'country', 'category']
    
    for (const field of requiredFields) {
      const fieldValue = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], body)
        : body[field]
      
      if (!fieldValue) {
        throw createError({
          statusCode: 400,
          statusMessage: `Missing required field: ${field}`
        })
      }
    }

    // Generate slug if not provided
    if (!body.slug?.tr) {
      body.slug = {
        tr: generateSlug(body.title.tr),
        en: body.title.en ? generateSlug(body.title.en) : undefined
      }
    }

    // Check for slug uniqueness
    const existingProject = await Project.findOne({
      $or: [
        { 'slug.tr': body.slug.tr },
        ...(body.slug.en ? [{ 'slug.en': body.slug.en }] : [])
      ]
    })

    if (existingProject) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug already exists'
      })
    }

    // Create new project
    const project = new Project(body)
    await project.save()

    return {
      success: true,
      data: project
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error creating project:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

// Helper function to generate slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Auth verification helper - should be implemented in auth middleware
async function verifyAuthSession(event: any) {
  try {
    const { data } = await $fetch('/api/auth/session', {
      headers: {
        cookie: getHeader(event, 'cookie') || ''
      }
    })
    return data
  } catch {
    return null
  }
}
