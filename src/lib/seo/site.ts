export const site = {
  name: "ScottWang",
  author: "ScottWang",
  description: "ScottWang 的 AI、Agent 架构、技术内容、资源与个人思考。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/content", label: "Blog" },
    { href: "/projects", label: "Projects" },
    { href: "https://games.wyf0931.cn", label: "Games", external: true },
    { href: "/research", label: "Research" },
    { href: "/about", label: "About" },
  ],
} as const;

export function contentOgImagePath(kind: string, slug: string) { return `/og/${kind}/${slug}.svg`; }

export function personStructuredData() {
  return { "@context": "https://schema.org", "@type": "Person", name: "ScottWang", description: site.description, url: site.url, email: "wyf0931@gmail.com", knowsAbout: ["Artificial Intelligence", "Agent Architecture", "Internet Technology"] };
}

export function articleStructuredData(entry: { title: string; description: string; date: Date; updated?: Date; type: string; slug: string; tags: string[] }) {
  return { "@context": "https://schema.org", "@type": "Article", headline: entry.title, description: entry.description, datePublished: entry.date.toISOString(), dateModified: (entry.updated ?? entry.date).toISOString(), author: personStructuredData(), mainEntityOfPage: `${site.url}/${entry.type}/${entry.slug}`, keywords: entry.tags };
}
