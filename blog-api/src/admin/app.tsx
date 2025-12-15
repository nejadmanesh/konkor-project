import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [],
  },
  bootstrap(app: StrapiApp) {
    // Inject comprehensive RTL and Persian support styles
    const style = document.createElement('style');
    style.textContent = `
      /* ============================================
         Persian/RTL Support for Strapi Richtext Editor
         ============================================ */
      
      /* Main Editor Container */
      [data-testid="richtext-editor"],
      .tiptap-editor,
      .ProseMirror {
        direction: rtl !important;
        text-align: right !important;
        font-family: 'Vazir', 'Tahoma', 'Arial', 'Segoe UI', sans-serif !important;
      }
      
      /* Paragraphs */
      .ProseMirror p {
        direction: rtl !important;
        text-align: right !important;
        line-height: 1.8 !important;
        margin: 1em 0 !important;
      }
      
      /* Headings */
      .ProseMirror h1,
      .ProseMirror h2,
      .ProseMirror h3,
      .ProseMirror h4,
      .ProseMirror h5,
      .ProseMirror h6 {
        direction: rtl !important;
        text-align: right !important;
        font-weight: bold !important;
        margin: 1.5em 0 0.5em 0 !important;
      }
      
      .ProseMirror h1 { font-size: 2em !important; }
      .ProseMirror h2 { font-size: 1.75em !important; }
      .ProseMirror h3 { font-size: 1.5em !important; }
      .ProseMirror h4 { font-size: 1.25em !important; }
      .ProseMirror h5 { font-size: 1.1em !important; }
      .ProseMirror h6 { font-size: 1em !important; }
      
      /* Lists */
      .ProseMirror ul,
      .ProseMirror ol {
        direction: rtl !important;
        padding-right: 2em !important;
        padding-left: 0 !important;
        margin: 1em 0 !important;
      }
      
      .ProseMirror ul li {
        list-style-type: disc !important;
        margin: 0.5em 0 !important;
      }
      
      .ProseMirror ol li {
        list-style-type: decimal !important;
        margin: 0.5em 0 !important;
      }
      
      /* Blockquotes */
      .ProseMirror blockquote {
        direction: rtl !important;
        border-right: 4px solid #e0e0e0 !important;
        border-left: none !important;
        padding-right: 1.5em !important;
        padding-left: 0 !important;
        margin: 1.5em 1em 1.5em 0 !important;
        font-style: italic !important;
        background-color: #f9f9f9 !important;
        border-radius: 4px !important;
      }
      
      /* Code blocks */
      .ProseMirror pre {
        direction: ltr !important;
        text-align: left !important;
        font-family: 'Courier New', monospace !important;
        background-color: #f4f4f4 !important;
        padding: 1em !important;
        border-radius: 4px !important;
        overflow-x: auto !important;
      }
      
      .ProseMirror code {
        font-family: 'Courier New', monospace !important;
        background-color: #f4f4f4 !important;
        padding: 0.2em 0.4em !important;
        border-radius: 3px !important;
      }
      
      /* Links */
      .ProseMirror a {
        color: #007bff !important;
        text-decoration: underline !important;
      }
      
      .ProseMirror a:hover {
        color: #0056b3 !important;
      }
      
      /* Images */
      .ProseMirror img {
        max-width: 100% !important;
        height: auto !important;
        border-radius: 4px !important;
        margin: 1em 0 !important;
      }
      
      /* Tables */
      .ProseMirror table {
        direction: rtl !important;
        width: 100% !important;
        border-collapse: collapse !important;
        margin: 1em 0 !important;
      }
      
      .ProseMirror table th,
      .ProseMirror table td {
        border: 1px solid #ddd !important;
        padding: 0.75em !important;
        text-align: right !important;
      }
      
      .ProseMirror table th {
        background-color: #f2f2f2 !important;
        font-weight: bold !important;
      }
      
      /* Toolbar RTL */
      [data-testid="richtext-toolbar"],
      .tiptap-toolbar {
        direction: rtl !important;
      }
      
      /* Editor Focus */
      .ProseMirror:focus {
        outline: 2px solid #007bff !important;
        outline-offset: 2px !important;
      }
      
      /* Placeholder */
      .ProseMirror p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: right;
        color: #adb5bd;
        pointer-events: none;
        height: 0;
      }
      
      /* Preview Mode Styles */
      .content-preview-mode {
        direction: rtl !important;
        text-align: right !important;
        font-family: 'Vazir', 'Tahoma', 'Arial', sans-serif !important;
        padding: 2em !important;
        background: #fff !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 8px !important;
        margin-top: 1em !important;
        max-height: 600px !important;
        overflow-y: auto !important;
      }
      
      .content-preview-mode h1,
      .content-preview-mode h2,
      .content-preview-mode h3,
      .content-preview-mode h4,
      .content-preview-mode h5,
      .content-preview-mode h6 {
        direction: rtl !important;
        text-align: right !important;
        font-weight: bold !important;
        margin-top: 1.5em !important;
        margin-bottom: 0.5em !important;
      }
      
      .content-preview-mode p {
        direction: rtl !important;
        text-align: right !important;
        line-height: 1.8 !important;
        margin: 1em 0 !important;
      }
      
      .content-preview-mode ul,
      .content-preview-mode ol {
        direction: rtl !important;
        padding-right: 2em !important;
        padding-left: 0 !important;
      }
      
      .content-preview-mode blockquote {
        direction: rtl !important;
        border-right: 4px solid #e0e0e0 !important;
        border-left: none !important;
        padding-right: 1.5em !important;
        padding-left: 0 !important;
        margin: 1.5em 1em 1.5em 0 !important;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .ProseMirror {
          font-size: 14px !important;
        }
        
        .content-preview-mode {
          padding: 1em !important;
        }
      }
    `;
    
    // Add styles when DOM is ready
    if (document.head) {
      document.head.appendChild(style);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.head.appendChild(style);
      });
    }
    
    // Add RTL attribute to editor containers when they're created
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node as Element;
            // Find richtext editor containers
            const editors = element.querySelectorAll?.('.ProseMirror, [data-testid="richtext-editor"]');
            editors?.forEach((editor) => {
              (editor as HTMLElement).setAttribute('dir', 'rtl');
              (editor as HTMLElement).setAttribute('lang', 'fa');
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
};

