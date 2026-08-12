import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";

/**
 * Rehype plugin that preserves mermaid code blocks through rehype-pretty-code.
 *
 * rehype-pretty-code uses Shiki for syntax highlighting, which doesn't support
 * mermaid. Even worse, it wraps <pre> in <figure>, stripping unknown data
 * attributes. This plugin preserves mermaid blocks through that process.
 *
 * This plugin works in two phases:
 * - Phase 1 ("before"): Extracts mermaid <pre> blocks, replaces them with
 *   a bare <div data-mermaid-preserve="id"> placeholder that rehype-pretty-code
 *   ignores (no <pre>/<code> children to trigger figure wrapping).
 * - Phase 2 ("after"): Restores the original <pre><code> elements from the
 *   side-map, replacing the <div> placeholders.
 *
 * Usage: insert this plugin immediately before AND after rehype-pretty-code
 * in the plugin chain, calling with phase "before" then "after".
 */
export function rehypePreserveMermaid(phase: "before" | "after") {
  return (tree: Root) => {
    if (phase === "before") {
      // Find all <pre><code class="language-mermaid"> blocks, save their text,
      // and replace with a minimal placeholder so rehype-pretty-code ignores them.
      visit(tree, "element", (node: Element, idx, parent) => {
        if (!parent || idx == null || node.tagName !== "pre") return;

        const codeEl = node.children.find(
          (child): child is Element =>
            child.type === "element" && child.tagName === "code",
        );
        if (!codeEl) return;

        const classNames = codeEl.properties?.className as string[] | undefined;
        const isMermaid = classNames?.some(
          (c: string) => c === "language-mermaid" || c.startsWith("language-mermaid"),
        );

        if (!isMermaid) return;

        // Extract the raw text content
        const textNode = codeEl.children.find((c) => c.type === "text");
        const rawText = textNode ? (textNode as { type: "text"; value: string }).value : "";

        // Store in a module-level map keyed by a unique placeholder id
        const id = `mermaid-preserved-${idx}`;
        preservedBlocks.set(id, rawText);

        // Replace the entire <pre> with a bare <div> placeholder.
        // rehype-pretty-code only touches <pre><code> blocks, so a plain div
        // passes through untouched, preserving the data-mermaid-preserve attribute.
        const placeholder: Element = {
          type: "element",
          tagName: "div",
          properties: { "data-mermaid-preserve": id },
          children: [],
        };

        (parent.children as Element[])[idx] = placeholder;
      });
    } else {
      // Phase "after": restore original mermaid blocks from <div> placeholders
      visit(tree, "element", (node: Element, idx, parent) => {
        if (!parent || idx == null || node.tagName !== "div") return;

        const preserveId = node.properties?.["data-mermaid-preserve"];
        if (typeof preserveId !== "string") return;

        const rawText = preservedBlocks.get(preserveId);
        if (rawText === undefined) return;

        preservedBlocks.delete(preserveId);

        // Restore the original <pre><code class="language-mermaid"> block
        const restored: Element = {
          type: "element",
          tagName: "pre",
          properties: {},
          children: [
            {
              type: "element",
              tagName: "code",
              properties: {
                className: ["language-mermaid"],
                "data-language": "mermaid",
              },
              children: [
                { type: "text", value: rawText },
              ],
            },
          ],
        };

        (parent.children as Element[])[idx] = restored;
      });
    }
  };
}

// Side-map for passing data between "before" and "after" phases within a single
// render pipeline call. Because both phases run in the same synchronous unified
// pipeline (within the same `process()` or `compileMDX()` call), this module-level
// map is safe to use.
const preservedBlocks = new Map<string, string>();
