import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';

/**
 * Render Markdown content to a target DOM element.
 *
 * @param {HTMLElement} el - The target DOM element where the viewer will be rendered.
 * @param {string} content - Markdown formatted text.
 * @returns {Viewer} - An instance of the Toast UI Viewer.
 */
export function renderMarkdown(el, content) {
  if (!el) return null;

  // Clear previous content to avoid duplicating viewers on the same element
  el.innerHTML = '';
  
  return new Viewer({
    el: el,
    initialValue: content,
    theme: 'dark' // Use dark theme by default or modify based on app settings
  });
}
