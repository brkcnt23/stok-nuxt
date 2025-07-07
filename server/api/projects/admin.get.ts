import Project from '../../models/Project'
import { isAuthenticated } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  try {
    // Kimlik doğrulama
    const { user } = await isAuthenticated(event)

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string
    const author = query.author as string

    const skip = (page - 1) * limit

    // MongoDB filter objesi
    let filter: any = {}

    // Yazar filtresi
    if (author) {
      filter.author = author
    }

    // Arama filtresi
    if (search) {
      filter.$or = [
        { 'i18n.tr.title': { $regex: search, $options: 'i' } },
        { 'i18n.tr.description': { $regex: search, $options: 'i' } },
        { 'i18n.tr.shortDescription': { $regex: search, $options: 'i' } },
        { 'i18n.en.title': { $regex: search, $options: 'i' } },
        { 'i18n.en.description': { $regex: search, $options: 'i' } },
        { 'i18n.en.shortDescription': { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { materials: { $in: [new RegExp(search, 'i')] } },
        { slug: { $regex: search, $options: 'i' } }
      ]
    }

    // Toplam proje sayısını al
    const total = await Project.countDocuments(filter)

    // Projeleri getir
    const projects = await Project.find(filter)
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return {
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error) {
    console.error('Projeler getirme hatası:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Projeler getirilirken bir hata oluştu'
    })
  }
})
