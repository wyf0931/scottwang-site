import Link from "next/link";

export function Footer() {
  return <footer className="site-footer"><span>明月松间照 · 清泉石上流</span><span><Link href="/about">About ScottWang</Link> · <a href="mailto:wyf0931@gmail.com">Email</a></span></footer>;
}
