import { site } from "@/lib/seo/site";

export const dynamic = "force-static";

const about = `# ScottWang\n\n## Values\n\n共赢，共同创造长期价值。\n\n专注，把重要的事情做深。\n\n精进，持续学习和构建。\n\n## Contact\n\nEmail: wyf0931@gmail.com\n\nGitHub: https://github.com/wyf0931\n\nX: https://x.com/wyf0931\n\n本站：${site.url}\n`;

export function GET() { return new Response(about, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" } }); }
