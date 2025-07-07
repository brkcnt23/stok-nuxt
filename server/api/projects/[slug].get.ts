import Project from '../../models/Project'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug gerekli'
      })
    }

    // Sadece yayınlanmış projeyi getir
    const project = await Project.findOne({ 
      slug,
      isPublished: true 
    })

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Proje bulunamadı'
      })
    }

    return project
  } catch (error: any) {
    console.error('Proje detay hatası:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Sunucu hatası'
    })
  }
})
