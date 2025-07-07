import Project from '../../models/Project'

export default defineSitemapEventHandler(async () => {
  try {
    // Get all published projects
    const projects = await Project
      .find({ status: 'published' })
      .select('slug updatedAt')
      .lean()

    // Generate URLs for projects
    const projectUrls = projects.flatMap(project => {
      const urls = []
      
      // Turkish URL
      if (project.slug?.tr) {
        urls.push({
          loc: `/projeler/${project.slug.tr}`,
          lastmod: project.updatedAt,
          changefreq: 'monthly' as const,
          priority: 0.8 as const
        })
      }
      
      // English URL
      if (project.slug?.en) {
        urls.push({
          loc: `/en/projeler/${project.slug.en}`,
          lastmod: project.updatedAt,
          changefreq: 'monthly' as const,
          priority: 0.8 as const
        })
      }
      
      return urls
    })

    return projectUrls
  } catch (error) {
    console.error('Error generating projects sitemap:', error)
    return []
  }
})
