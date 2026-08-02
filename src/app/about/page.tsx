export const metadata = { title: "About" };

export default function AboutPage() {
  return <section className="about-page"><p className="eyebrow accent">/ identity</p><h1>Keep learning.<br /><em>Keep building.</em></h1><div className="about-grid"><div><p className="lead">我是王云飞，英文名 ScottWang。曾是互联网出行公司的架构师，最近几年全心专注于 AI 领域。</p><p>这里记录我关注的行业信息、技术笔记、开源项目，以及仍在形成中的想法。希望这些内容能连接同样关心长期主义、系统能力和技术创造的人。</p></div><aside className="about-card"><p className="eyebrow">Core values</p><div className="about-values"><strong>共赢</strong><strong>专注</strong><strong>精进</strong></div><p className="eyebrow">Contact</p><a href="mailto:wyf0931@gmail.com">wyf0931@gmail.com</a><div className="wechat-card">WeChat<br /><span>echo-scott</span></div></aside></div></section>;
}
