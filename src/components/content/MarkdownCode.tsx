import { Children, isValidElement, type ReactNode } from "react";
import { MermaidDiagram } from "./MermaidDiagram";

type CodeElementProps = { className?: string; "data-language"?: string; children?: ReactNode };

function extractCodeText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (isValidElement<CodeElementProps>(node)) {
    const props = node.props;
    if (props.children !== undefined) {
      return Children.toArray(props.children)
        .map((child) => (typeof child === "string" ? child : ""))
        .join("");
    }
  }
  return "";
}

function isMermaidCodeBlock(node: ReactNode): boolean {
  if (!isValidElement<CodeElementProps>(node)) return false;
  const props = node.props;
  return (
    props.className?.includes("language-mermaid") ||
    props["data-language"] === "mermaid"
  );
}

export function MarkdownPre({ children }: { children?: ReactNode }) {
  const child = Children.toArray(children)[0];

  // rehype-pretty-code wraps code in <figure>, extract the <code> inside
  if (isValidElement(child) && (child.props as Record<string, unknown>)["data-rehype-pretty-code-figure"] !== undefined) {
    const figureChildren = Children.toArray((child.props as Record<string, unknown>).children as ReactNode);
    const pre = figureChildren[0];
    if (isValidElement<Record<string, unknown>>(pre)) {
      const code = Children.toArray(pre.props.children as ReactNode)[0];
      if (isMermaidCodeBlock(code)) {
        return <MermaidDiagram chart={extractCodeText(code).replace(/\n$/, "")} />;
      }
    }
  }

  // fallback: direct <pre><code class="language-mermaid">
  if (isMermaidCodeBlock(child)) {
    return <MermaidDiagram chart={extractCodeText(child).replace(/\n$/, "")} />;
  }

  return <pre>{children}</pre>;
}
