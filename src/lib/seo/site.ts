export const site = {
  name: "ScottWang",
  author: "王云飞 / ScottWang",
  description: "王云飞（ScottWang）的 AI、Agent 架构、技术写作与个人思考。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/writing", label: "Writing" },
    { href: "/notes", label: "Notes" },
    { href: "/thoughts", label: "Thoughts" },
    { href: "/about", label: "About" },
  ],
} as const;
