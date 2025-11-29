/**
 * Markdown to HTML converter
 * Converts markdown syntax to HTML for chat messages
 */

/**
 * Convert markdown text to HTML
 * @param {string} text - Markdown text
 * @returns {string} - HTML string
 */
export const markdownToHtml = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      return ''
    }

    // Check if content is already HTML (contains HTML tags)
    const isAlreadyHtml = /<[^>]+>/.test(text)
    
    if (isAlreadyHtml) {
      // Already HTML, return as is (but ensure it's safe)
      return text
    }

    let html = text

    // Escape existing HTML to prevent XSS (but preserve markdown)
    // First, temporarily escape markdown patterns to avoid double processing
    const markdownPlaceholders = {
      bold: [],
      italic: [],
      bullet: []
    }
    
    // Store bold patterns
    let boldIndex = 0
    html = html.replace(/\*\*(.*?)\*\*/g, (match, content) => {
      const placeholder = `__BOLD_${boldIndex}__`
      markdownPlaceholders.bold[boldIndex] = content
      boldIndex++
      return placeholder
    })
    
    // Store italic patterns - simpler approach: find single * that's not part of **
    let italicIndex = 0
    // First, protect all ** patterns, then process single *
    const protectedBold = []
    let boldProtectIndex = 0
    html = html.replace(/\*\*([^*]+?)\*\*/g, (match) => {
      const placeholder = `__PROTECT_BOLD_${boldProtectIndex}__`
      protectedBold[boldProtectIndex] = match
      boldProtectIndex++
      return placeholder
    })
    
    // Now process single asterisks for italic
    html = html.replace(/\*([^*]+?)\*/g, (match, content) => {
      const placeholder = `__ITALIC_${italicIndex}__`
      markdownPlaceholders.italic[italicIndex] = content
      italicIndex++
      return placeholder
    })
    
    // Restore protected bold patterns
    protectedBold.forEach((pattern, index) => {
      html = html.replace(`__PROTECT_BOLD_${index}__`, pattern)
    })
    
    // Store bullet patterns
    let bulletIndex = 0
    html = html.replace(/(^|\n)([↑•])\s+(.+)/g, (match, prefix, bullet, content) => {
      const placeholder = `__BULLET_${bulletIndex}__`
      markdownPlaceholders.bullet[bulletIndex] = { prefix, bullet, content }
      bulletIndex++
      return prefix + placeholder
    })

    // Now escape HTML
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Restore and convert bold
    markdownPlaceholders.bold.forEach((content, index) => {
      html = html.replace(`__BOLD_${index}__`, `<strong>${content}</strong>`)
    })

    // Restore and convert italic
    markdownPlaceholders.italic.forEach((content, index) => {
      html = html.replace(`__ITALIC_${index}__`, `<em>${content}</em>`)
    })

    // Restore and convert bullets
    markdownPlaceholders.bullet.forEach((item, index) => {
      html = html.replace(`__BULLET_${index}__`, `<span class="chat-bullet">${item.bullet}</span> ${item.content}`)
    })

    // Line breaks: convert \n to <br> for proper display
    html = html.replace(/\n/g, '<br>')

    return html
  } catch (error) {
    console.error('Markdown conversion error:', error)
    // Return escaped text if conversion fails
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
  }
}

export default markdownToHtml

