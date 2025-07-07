import Project from '../../models/Project'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 12
    const category = query.category as string
    const country = query.country as string
    const year = query.year as string
    const featured = query.featured as string
    const status = query.status as string || 'published'

    // Build filter object
    const filter: any = { isPublished: true }

    if (category) {
      filter.category = category
    }

    if (country) {
      filter.country = country
    }

    if (year) {
      filter.year = year
    }

    if (featured === 'true') {
      filter.featured = true
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute queries
    const [projects, total] = await Promise.all([
      Project
        .find(filter)
        .sort({ featured: -1, order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(filter)
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return {
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
