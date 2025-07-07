import Project from '../../models/Project'
import { isAuthenticated } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  try {
    // Kimlik doğrulama
    const { user } = await isAuthenticated(event)

    const body = await readBody(event)

    // Gerekli alanları kontrol et
    if (!body.i18n?.tr?.title || !body.i18n?.tr?.description || !body.slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Gerekli alanlar eksik'
      })
    }

    // Slug benzersizliğini kontrol et
    const existingProject = await Project.findOne({ slug: body.slug })
    if (existingProject) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Bu slug zaten kullanılıyor'
      })
    }

    // Yeni proje oluştur
    const project = new Project({
      ...body,
      author: user._id
    })

    await project.save()
    await project.populate('author', 'username email')

    return project
  } catch (error: any) {
    console.error('Proje oluşturma hatası:', error)
    
    if (error.statusCode) {
      throw error
    }

    if (error.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Bu slug zaten kullanılıyor'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Proje oluşturulurken bir hata oluştu'
    })
  }
})
