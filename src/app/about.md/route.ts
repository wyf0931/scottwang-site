import { site } from "@/lib/seo/site";

export const dynamic = "force-static";

const about = `# 王云飞 / ScottWang\n\n我是王云飞，英文名 ScottWang。曾是互联网出行公司的架构师，最近几年全心专注于 AI 领域。\n\n## Values\n\n共赢，共同创造长期价值。\n\n专注，把重要的事情做深。\n\n精进，持续学习和构建。\n\n## Contact\n\nEmail: wyf0931@gmail.com\n\n本站：${site.url}\n`;

export function GET() { return new Response(about, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" } }); }
