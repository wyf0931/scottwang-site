import Link from "next/link";

export function Footer() {
  return <footer className="site-footer"><span>共赢 · 专注 · 精进</span><span><Link href="/about">About ScottWang</Link> · <a href="mailto:wyf0931@gmail.com">Email</a></span></footer>;
}
