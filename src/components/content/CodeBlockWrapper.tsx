"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

function createCopyButton(pre: HTMLPreElement) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "code-copy-btn";
  btn.setAttribute("aria-label", "Copy code");
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

  btn.addEventListener("click", () => {
    const code = pre.querySelector("code");
    const text = code ? code.textContent ?? "" : pre.textContent ?? "";
    navigator.clipboard.writeText(text).then(() => {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
      btn.classList.add("code-copy-btn-copied");
      setTimeout(() => {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
        btn.classList.remove("code-copy-btn-copied");
      }, 2000);
    });
  });

  return btn;
}

export function CodeBlockWrapper({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const pres = container.querySelectorAll<HTMLPreElement>("pre");
    pres.forEach((pre) => {
      if (pre.parentElement?.querySelector(".code-copy-btn")) return;
      pre.parentElement?.appendChild(createCopyButton(pre));
    });

    // ensure figures have position:relative for button placement
    const figures = container.querySelectorAll<HTMLElement>("figure[data-rehype-pretty-code-figure]");
    figures.forEach((fig) => {
      fig.style.position = "relative";
    });

    forceUpdate(1);
  }, [children]);

  return <div ref={ref}>{children}</div>;
}
