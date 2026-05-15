import sanitizeHtml from 'sanitize-html';

export function sanitize(html: string | undefined | null): string {
  if (!html) return '';
  
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'className']
    }
  });
}
