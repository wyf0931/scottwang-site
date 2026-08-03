import type { ReactNode } from "react";

export function Callout({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" | "success" }) {
  return <aside className={`callout callout-${tone}`} role="note">{children}</aside>;
}
