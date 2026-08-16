import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return <div className="home-page">
    <section className="home-intro" aria-label="ScottWang profile">
      <div className="home-avatar">
        <Image className="home-avatar-image" src="/avatar.jpg" alt="ScottWang 头像" width={156} height={156} priority />
      </div>
      <h1>ScottWang</h1>
      <p className="home-role">全栈程序员 / 架构师 / 创业者</p>
      <p className="home-copy">记录技术笔记、行业观察、资源分享和一些还在形成中的判断。</p>
      <div className="home-links">
        <a href="https://github.com/wyf0931" target="_blank" rel="noreferrer" aria-label="GitHub"><GithubIcon /><span>GitHub</span></a>
        <a href="https://x.com/wyf0931" target="_blank" rel="noreferrer" aria-label="X"><XIcon /><span>X</span></a>
        <a href="mailto:wyf0931@gmail.com" aria-label="Email"><MailIcon /><span>Email</span></a>
        <Link href="/about" aria-label="About ScottWang"><UserIcon /><span>About</span></Link>
      </div>
    </section>
  </div>;
}

function GithubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.86 8.35 6.84 9.71.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.04.36.32.68.95.68 1.92v2.76c0 .27.18.59.69.49A10.04 10.04 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" /></svg>;
}

function XIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.53 3h3.1l-6.78 7.75L21.82 21h-6.24l-4.88-6.38L5.1 21H2l7.25-8.29L1.6 3h6.4l4.42 5.84L17.53 3Zm-1.09 16.2h1.72L7.06 4.7H5.22l11.22 14.5Z" /></svg>;
}

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5h15A2.5 2.5 0 0 1 22 7.5v9A2.5 2.5 0 0 1 19.5 19h-15A2.5 2.5 0 0 1 2 16.5v-9A2.5 2.5 0 0 1 4.5 5Zm0 2a.5.5 0 0 0-.5.5v.27l8 5.08 8-5.08V7.5a.5.5 0 0 0-.5-.5h-15Zm15.5 3.14-7.46 4.74a1 1 0 0 1-1.08 0L4 10.14v6.36a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5v-6.36Z" /></svg>;
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.58-5-8-5Z" /></svg>;
}
