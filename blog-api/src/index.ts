// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: any) {
    const enablePublicPermissions = async () => {
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
      if (!publicRole) return;

      // Enable permissions for all blog content types
      const actions = [
        // Posts
        'api::post.post.find',
        'api::post.post.findOne',
        // Categories
        'api::category.category.find',
        'api::category.category.findOne',
        // Tags
        'api::tag.tag.find',
        'api::tag.tag.findOne',
        // Authors
        'api::author.author.find',
        'api::author.author.findOne',
        // Blog Navigation
        'api::blog-navigation.blog-navigation.find',
      ];

      for (const action of actions) {
        const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({ 
          where: { action, role: publicRole.id } 
        });
        
        if (!existing) {
          await strapi.db.query('plugin::users-permissions.permission').create({ 
            data: { action, role: publicRole.id, enabled: true } 
          });
        } else if (!existing.enabled) {
          await strapi.db.query('plugin::users-permissions.permission').update({ 
            where: { id: existing.id }, 
            data: { enabled: true } 
          });
        }
      }
    };

    enablePublicPermissions().catch((err) => {
      console.error('Error enabling public permissions:', err);
    });
  },
};
