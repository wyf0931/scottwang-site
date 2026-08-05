"use client";

import { useEffect, useId, useState } from "react";

export function MermaidDiagram({ chart }: { chart: string }) {
  const id = `mermaid-${useId().replace(/:/g, "")}`;
  const [svg, setSvg] = useState<string>();
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: document.documentElement.dataset.theme === "dark" ? "dark" : "neutral" });
        const result = await mermaid.render(id, chart);
        if (!cancelled) setSvg(result.svg);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [chart, id]);

  if (error) return <pre className="mermaid-fallback"><code>{chart}</code></pre>;
  if (svg) return <div className="mermaid-diagram" aria-label="Mermaid diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
  return <div className="mermaid-diagram" aria-label="Mermaid diagram"><span>Rendering diagram…</span></div>;
}
