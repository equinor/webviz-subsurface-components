/**
 * Escapes the characters that are significant in HTML (`&`, `<`, `>`, `"`,
 * `'`) so that arbitrary text can be safely embedded in an HTML string
 * without being interpreted as markup.
 */
export function htmlEscape(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
