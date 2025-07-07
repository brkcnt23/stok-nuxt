import Project from '../../models/Project'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Project ID is required'
      })
    }

    let project
    
    // Check if it's an ObjectId or slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      project = await Project.findById(id)
    } else {
      // It's a slug
      project = await Project.findOne({
        slug: id,
        isPublished: true
      })
    }

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found'
      })
    }

    return project
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error fetching project:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
