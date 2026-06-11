import DOMPurify from "dompurify";
import { marked } from "marked";

marked.use({
  gfm: true,
  breaks: true,
});

const toSafeHtml = (content = "") => DOMPurify.sanitize(marked.parse(content || ""));

/**
 * Render Markdown content to a target DOM element.
 *
 * @param {HTMLElement} el - The target DOM element where the content will be rendered.
 * @param {string} content - Markdown formatted text.
 * @returns {{ setMarkdown: Function, destroy: Function } | null}
 */
export function renderMarkdown(el, content) {
  if (!el) return null;

  const setMarkdown = (nextContent) => {
    el.innerHTML = toSafeHtml(nextContent);
  };

  setMarkdown(content);

  return {
    setMarkdown,
    destroy: () => {
      el.innerHTML = "";
    },
  };
}
