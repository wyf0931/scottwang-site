"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = window.localStorage.getItem("scottwang-theme");
    const next = stored ? stored === "dark" : false;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.requestAnimationFrame(() => setDark(next));
  }, []);
  const toggle = () => { const next = !dark; setDark(next); document.documentElement.dataset.theme = next ? "dark" : "light"; window.localStorage.setItem("scottwang-theme", next ? "dark" : "light"); };
  return <button className="theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${dark ? "light" : "dark"} mode`}>{dark ? "☼" : "◐"}</button>;
}
