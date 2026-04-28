/**
 * Sanitize HTML content using a whitelist approach.
 * Strips potentially dangerous tags and attributes.
 *
 * For production, consider using 'dompurify' with JSDOM for full sanitization.
 * This simple version removes script tags and event handlers.
 */

/**
 * Basic HTML sanitizer — removes <script> tags and any on* event handlers.
 * @param {string} html
 * @returns {string} sanitized HTML
 */
function sanitizeHtml(html) {
  if (!html) return html;

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers like onclick, onload, etc.
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*("([^"]*)"|'([^']*)'|([^"'\s>]+))/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/\s*href\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^"'\s>]+)/gi, 'href="#"');
  sanitized = sanitized.replace(/\s*src\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^"'\s>]+)/gi, 'src="#"');

  return sanitized;
}

module.exports = { sanitizeHtml };
