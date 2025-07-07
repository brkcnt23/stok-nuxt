import Project from '../../models/Project'

export default defineEventHandler(async (event) => {
  try {
    // Get unique categories
    const categories = await Project.distinct('category', { status: 'published' })
    
    // Get unique countries
    const countries = await Project.distinct('country', { status: 'published' })
    
    // Get unique years
    const years = await Project.distinct('year', { status: 'published' })
    
    // Get unique materials
    const materials = await Project.distinct('materials', { status: 'published' })

    return {
      success: true,
      data: {
        categories: categories.sort(),
        countries: countries.sort(),
        years: years.sort((a, b) => parseInt(b) - parseInt(a)), // Descending order
        materials: materials.filter(Boolean).sort() // Filter out null/empty values
      }
    }
  } catch (error) {
    console.error('Error fetching project filters:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
