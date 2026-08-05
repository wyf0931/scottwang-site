import { Children, isValidElement, type ReactNode } from "react";
import { MermaidDiagram } from "./MermaidDiagram";

type CodeElementProps = { className?: string; children?: ReactNode };

export function MarkdownPre({ children }: { children?: ReactNode }) {
  const child = Children.toArray(children)[0];
  if (isValidElement<CodeElementProps>(child)) {
    const props = child.props;
    if (props.className?.includes("language-mermaid")) return <MermaidDiagram chart={String(props.children ?? "").replace(/\n$/, "")} />;
  }
  return <pre>{children}</pre>;
}
