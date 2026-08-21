import Link from "next/link";
import { SiteStats } from "./SiteStats";

export function Footer() {
  return <footer className="site-footer"><span>明月松间照 · 清泉石上流</span><span className="site-footer-links"><SiteStats /><span><Link href="/about">About ScottWang</Link> · <a href="mailto:wyf0931@gmail.com">Email</a></span></span></footer>;
}
