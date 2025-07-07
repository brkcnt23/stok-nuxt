import Project from '../../../models/Project'
import { isAuthenticated } from '../../../middleware/auth'

export default defineEventHandler(async (event) => {
  try {
    // Kimlik doğrulama
    const { user } = await isAuthenticated(event)
    
    const projectId = getRouterParam(event, 'id')
    
    if (getMethod(event) === 'GET') {
      // Tek proje getir
      const project = await Project.findById(projectId).populate('author', 'username email')
      
      if (!project) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Proje bulunamadı'
        })
      }

      // Sadece proje sahibi veya admin erişebilir  
      if (project.author._id.toString() !== user._id.toString()) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Bu projeye erişim izniniz yok'
        })
      }

      return project
    }

    if (getMethod(event) === 'PUT') {
      // Proje güncelle
      const body = await readBody(event)
      
      const project = await Project.findById(projectId)
      
      if (!project) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Proje bulunamadı'
        })
      }

      // Sadece proje sahibi güncelleyebilir
      if (project.author.toString() !== user._id.toString()) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Bu projeyi güncelleme izniniz yok'
        })
      }

      // Slug güncellenmiyorsa, mevcut slug'ı koru
      if (body.slug && body.slug !== project.slug) {
        const existingProject = await Project.findOne({ slug: body.slug, _id: { $ne: projectId } })
        if (existingProject) {
          throw createError({
            statusCode: 409,
            statusMessage: 'Bu slug zaten kullanılıyor'
          })
        }
      }

      // Projeyi güncelle
      Object.assign(project, body)
      await project.save()
      await project.populate('author', 'username email')

      return project
    }

    if (getMethod(event) === 'DELETE') {
      // Proje sil
      const project = await Project.findById(projectId)
      
      if (!project) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Proje bulunamadı'
        })
      }

      // Sadece proje sahibi silebilir
      if (project.author.toString() !== user._id.toString()) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Bu projeyi silme izniniz yok'
        })
      }

      await Project.findByIdAndDelete(projectId)

      return { success: true, message: 'Proje başarıyla silindi' }
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })

  } catch (error: any) {
    console.error('Proje işlem hatası:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Proje işlemi sırasında bir hata oluştu'
    })
  }
})
