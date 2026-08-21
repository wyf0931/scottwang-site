import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { compileMDX } from "next-mdx-remote/rsc";
import { BilibiliEmbed, YouTubeEmbed } from "@/components/content/VideoEmbed";
import { Callout } from "@/components/content/Callout";
import { GithubRepoCard } from "@/components/content/GithubRepoCard";
import { LinkCard } from "@/components/content/LinkCard";
import { MarkdownPre } from "@/components/content/MarkdownCode";
import { rehypePreserveMermaid } from "./rehype-preserve-mermaid";

const prettyCodeOptions = {
  theme: { light: "github-light" as const, dark: "github-dark" as const },
  keepBackground: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const codeHighlighter = rehypePrettyCode(prettyCodeOptions) as any;

export async function renderMarkdown(markdown: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypePreserveMermaid, "before")
    .use(codeHighlighter)
    .use(rehypePreserveMermaid, "after")
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

export async function renderMdx(source: string) {
  const result = await compileMDX({
    source,
    components: { BilibiliEmbed, YouTubeEmbed, Callout, GithubRepoCard, LinkCard, pre: MarkdownPre },
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [rehypePreserveMermaid, "before"],
          [rehypePrettyCode, prettyCodeOptions],
          [rehypePreserveMermaid, "after"],
        ],
      },
      parseFrontmatter: false,
    },
  });
  return result.content;
}
