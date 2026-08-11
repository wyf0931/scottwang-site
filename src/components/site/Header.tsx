import Link from "next/link";
import { site } from "@/lib/seo/site";
import { SearchDialog } from "./SearchDialog";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="ScottWang home">
        <span className="brand-mark">SW</span>
        <span>ScottWang</span>
      </Link>
      <nav aria-label="Primary navigation">
        {site.navigation.slice(1).map((item) =>
          "external" in item ? (
            <a key={item.href} href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
          ) : (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          )
        )}
        <ThemeToggle /><SearchDialog />
      </nav>
    </header>
  );
}
