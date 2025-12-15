import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::blog-navigation.blog-navigation', ({ strapi }) => ({
  async find(ctx: any) {
    const entity = await strapi.entityService.findMany('api::blog-navigation.blog-navigation', {
      populate: {
        mainMenuItems: {
          populate: {
            category: true
          }
        },
        filterMenuItems: {
          populate: {
            category: true
          }
        }
      }
    })
    
    return entity
  },
}))


















