import { site } from "@/lib/seo/site";

export const dynamic = "force-static";

const about = `# ScottWang\\n\\n## 偈言\\n\\n明月松间照，清泉石上流。\\n\\n## Contact\\n\\nEmail: wyf0931@gmail.com\\n\\nGitHub: https://github.com/wyf0931\\n\\nX: https://x.com/wyf0931\\n\\n本站：${site.url}\\n`;

export function GET() { return new Response(about, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" } }); }
