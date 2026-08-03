import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import { compileMDX } from "next-mdx-remote/rsc";
import { BilibiliEmbed, YouTubeEmbed } from "@/components/content/VideoEmbed";
import { Callout } from "@/components/content/Callout";

export async function renderMarkdown(markdown: string) {
  const file = await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeSlug).use(rehypeStringify).process(markdown);
  return String(file);
}

export async function renderMdx(source: string) {
  const result = await compileMDX({
    source,
    components: { BilibiliEmbed, YouTubeEmbed, Callout },
    options: { parseFrontmatter: false },
  });
  return result.content;
}
