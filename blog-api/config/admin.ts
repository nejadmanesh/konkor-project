// Function to generate preview pathname based on content type and document
const getPreviewPathname = (uid: string, { locale, document }: { locale?: string; document: any }): string | null => {
  const { slug } = document || {};

  // Handle different content types with their specific URL patterns
  switch (uid) {
    // Handle blog posts
    case "api::post.post": {
      if (!slug) {
        return "/blog"; // Blog listing page
      }
      return `/blog/${slug}`; // Individual post page
    }
    // Handle categories
    case "api::category.category": {
      if (!slug) {
        return "/blog"; // Blog listing page
      }
      return `/blog?category=${slug}`; // Category filtered page
    }
    // Handle authors
    case "api::author.author": {
      if (!slug) {
        return "/blog"; // Blog listing page
      }
      return `/blog`; // Author page (if you have one)
    }
    // Handle tags - tags don't have preview pages typically
    case "api::tag.tag": {
      return null; // Tags don't need preview
    }
    default: {
      return null;
    }
  }
};

export default ({ env }) => {
  // Get environment variables
  const clientUrl = env("CLIENT_URL", "http://localhost:3000"); // Frontend application URL
  const previewSecret = env("PREVIEW_SECRET", "your-secret-key-change-in-production"); // Secret key for preview authentication

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    // Preview configuration
    preview: {
      enabled: true,
      config: {
        allowedOrigins: clientUrl,
        async handler(uid: string, { documentId, locale, status }: { documentId: string; locale?: string; status?: string }) {
          // Type assertion for Strapi v5 - uid is a string but documents() expects ContentType
          const document = await strapi.documents(uid as any).findOne({ documentId });
          const pathname = getPreviewPathname(uid, { locale, document });

          if (!pathname) {
            return null; // No preview for this content type
          }

          // For draft content, use Next.js draft mode
          if (status === 'draft') {
            // Extract slug from pathname for preview route
            // If pathname is /blog/slug, extract just the slug part
            let slug = pathname;
            if (pathname.startsWith('/blog/')) {
              slug = pathname.replace('/blog/', '');
            } else if (pathname.startsWith('/blog')) {
              slug = '';
            }
            // Use Next.js draft mode preview route
            return `${clientUrl}/api/preview?secret=${previewSecret}&slug=${slug}`;
          }

          // For published content, return the normal URL
          return `${clientUrl}${pathname}`;
        },
      },
    },
  };
};
