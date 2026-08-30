---
title: "dsh 自定义 plugin 入门"
description: "DeepSeek Harness 一切皆 plugin。文章从一个最小的 web-access plugin 出发，走一遍 Cordis 的 apply/inject/config 三件套、defineTool 的注册结构，以及 npx @deepseek-ai/dsh web 下的安装步骤。"
date: "2026-08-30"
type: "writing"
kind: "note"
tags: ["DeepSeek", "dsh", "Plugin", "Agent", "工具开发"]
draft: false
---

DeepSeek 8 月初开源了 dsh（DeepSeek Harness），口号是 Everything is a plugin。这个说法比实际做的事更硬，因为官方内置的 bash、fs、web、schedule、goal、todo、jobs、pwsh 全都走同一套插件机制，没有例外。想加一个新的 tool，写一个 plugin，往 profile 里挂一下，就跑起来了。

我本地是 `npx @deepseek-ai/dsh web` 启动的，这篇文章按这个路径走。假设我们有一个专门的后端 API，能同时提供 web search 和 web fetch 两个能力，我们想用它替换掉内置的 web tool。

## 先看清楚内置 web plugin 长什么样

官方包是 `@deepseek-ai/dsh-tool-web`，两个 tool，`web_search` 和 `web_fetch`，代码只有 852 行，主要就三件事，注册一个 tool、注入一个 system prompt section、暴露一个 config schema。

```js
// lib/index.js 简化后
export const name = "tool-web";
export const inject = ["tools", "web", "systemPrompt"];

export const Config = z.object({
  search: z.boolean().default(true),
  fetch: z.boolean().default(true),
  searchMaxResults: z.number().default(8),
  fetchTimeoutMs: z.number().default(30000),
  // ...
});

export function apply(ctx, config) {
  if (config.search) applyWebSearchTool(ctx, config.searchMaxResults, /* ... */);
  if (config.fetch) applyWebFetchTool(ctx, config.fetchTimeoutMs, /* ... */);
}
```

一个 dsh plugin 的最小形态就是这三个 export。`name` 是 Cordis 用来识别插件的唯一标识。`inject` 声明这个插件要从容器里拿哪些服务，缺一个就直接启动失败，不用等 apply 里才知道。`Config` 是配置 schema，dsh 会把 profile 里的配置对象解析成 `apply` 里的第二个参数。`apply` 是唯一的入口，插件在这个函数里注册 tool、system prompt、hook 或者别的什么。

`apply` 的第一参数 `ctx` 是整个 Cordis 的上下文，`ctx.tools` 是 tool registry，`ctx.systemPrompt` 是 prompt section registry，`ctx.web` 是 web 能力接口。tool 注册走 `defineTool`，来自 `@deepseek-ai/dsh-tools`。

```js
import { defineTool } from "@deepseek-ai/dsh-tools";

ctx.tools.register(defineTool({
  name: "web_search",
  description: "Search the web for current information.",
  parameters: {
    queries: { type: "array", required: true, items: { type: "string" } }
  },
  output: {
    schema: { /* 返回值的 JSON schema */ },
    render: (_args, value) => [{ type: "text", text: formatOutput(value) }]
  },
  timeoutMs: 30000,
  isConcurrencySafe: () => true,
  async execute(args, exec) {
    const res = await myBackend.search(args.queries, { signal: exec.signal });
    return { /* normalized result */ };
  }
}));
```

`defineTool` 的字段比看起来多，但一个最小 plugin 只用这七个。`parameters` 是模型看到的入参 schema，`output.schema` 是返回值 schema，`output.render` 把返回值转成模型看到的文本，`timeoutMs` 是插件给这个 tool 声明的协作超时预算，由 `dsh-tool-call-timeout-policy` 强制执行，`execute` 是真正干活的地方，`exec.signal` 会把上层传下来的取消信号转发到下游 HTTP 请求，`isConcurrencySafe` 告诉调度器这个 tool 可以并发执行，返回 `true` 通常就够。

## 一个最小 web-access plugin

假设我们有自己的 API，端点是 `POST https://api.example.com/v1/search` 和 `POST https://api.example.com/v1/fetch`，接受 JSON，返回 JSON。插件目录长这样

```
my-dsh-web-plugin/
  package.json
  src/
    index.ts
    search.ts
    fetch.ts
    client.ts
```

`package.json` 先写出来

```json
{
  "name": "@mycompany/dsh-tool-web",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@deepseek-ai/dsh-tools": "^0.1.1-rc.2",
    "@deepseek-ai/cordis": "^4.0.1",
    "@deepseek-ai/schemastery": "^3.18.1"
  },
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }
  }
}
```

`schemastery` 是官方用来写 JSON schema 的库，跟 `zod` 类似，dsh 里所有 tool 都用它。`peerDependencies` 里列的都是官方包，让宿主 dsh 提供，我们不再重复打包。

`src/client.ts`，一个极简的 HTTP client，只暴露两个方法。真实的实现里要处理认证、超时、错误映射，这里只保留骨架

```ts
// src/client.ts
export class WebApi {
  constructor(private baseUrl: string, private apiKey: string) {}

  async search(queries: string[], signal: AbortSignal) {
    const res = await fetch(`${this.baseUrl}/v1/search`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ queries }),
      signal
    });
    if (!res.ok) throw new Error(`search api ${res.status}`);
    return await res.json() as {
      answer?: string;
      sources: Array<{ url: string; title?: string; snippet?: string }>;
    };
  }

  async fetchUrl(url: string, signal: AbortSignal) {
    const res = await fetch(`${this.baseUrl}/v1/fetch`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ url }),
      signal
    });
    if (!res.ok) throw new Error(`fetch api ${res.status}`);
    return await res.json() as { url: string; status: number; markdown: string };
  }
}
```

`src/index.ts` 是最小可用的插件入口，两个 tool 都注册，共用一个 config

```ts
import z from "@deepseek-ai/schemastery";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { WebApi } from "./client";

export const name = "my-tool-web";
export const inject = ["tools", "systemPrompt"];

export const Config = z.object({
  baseUrl: z.string().default("https://api.example.com"),
  apiKey: z.string().default(""),
  searchMaxResults: z.number().default(8),
  fetchTimeoutMs: z.number().default(30000)
});

export function apply(ctx, config) {
  const api = new WebApi(config.baseUrl, config.apiKey);

  ctx.systemPrompt.section({
    name: "tool:web_search",
    order: 110,
    text: "Use web_search to discover current information on the web. " +
          "It returns source URLs. Follow up with web_fetch for the full body."
  });

  ctx.tools.register(defineTool({
    name: "web_search",
    description: "Search the web. Returns source URLs.",
    parameters: {
      queries: { type: "array", required: true, items: { type: "string" } }
    },
    output: {
      schema: {
        type: "object",
        properties: {
          answer: { type: "string" },
          sources: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: { type: "string", required: true },
                title: { type: "string" },
                snippet: { type: "string" }
              }
            }
          }
        }
      },
      render: (_args, v) => [{
        type: "text",
        text: v.sources.map(s => `- [${s.title || s.url}](${s.url})`).join("\n")
      }]
    },
    timeoutMs: config.fetchTimeoutMs,
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      const res = await api.search(args.queries.slice(0, config.searchMaxResults), exec.signal);
      return { answer: res.answer, sources: res.sources };
    }
  }));

  ctx.tools.register(defineTool({
    name: "web_fetch",
    description: "Fetch the content of a URL as markdown.",
    parameters: {
      url: { type: "string", required: true }
    },
    output: {
      schema: {
        type: "object",
        properties: {
          url: { type: "string", required: true },
          status: { type: "number", required: true },
          markdown: { type: "string", required: true }
        }
      },
      render: (_args, v) => [{ type: "text", text: v.markdown }]
    },
    timeoutMs: config.fetchTimeoutMs,
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      return await api.fetchUrl(args.url, exec.signal);
    }
  }));
}
```

两个 tool 的差别只在 `parameters` 和 `execute`。骨架完全一样，`systemPrompt.section` 里补一句告诉模型这两个 tool 该怎么配合用，就够了。

## 怎么装到本地

`npx @deepseek-ai/dsh web` 启动的 web profile，第一次跑的时候会自动初始化到 `$DSH_HOME/profiles/web`。这个 profile 目录下面有 `package.json` 和 `cordis.patch.yml` 两个文件。

`package.json` 里有个 `dsh.profile` 字段，`bundles` 数组按顺序列出要加载的 bundle。官方包直接从 dsh 安装目录解析，第三方包走 `node_modules`，profile 目录的 `node_modules` 通过 pnpm 管理。

`cordis.patch.yml` 是用户自己写的补丁层，profile 自己的配置、插件参数、system prompt 覆盖都写在这里。启动时按 bundle 顺序应用，然后是这个文件，然后是 `$DSH_HOME/cordis.patch.yml`。

装我们的插件走三步。

第一步，进 profile 目录，把插件加为依赖

```bash
cd ~/.dsh/profiles/web
dsh plugin --profile web add @mycompany/dsh-tool-web
```

`dsh plugin` 是官方命令，转手给 pnpm 干活。这条命令结束后，profile 的 `package.json` 会多一条 `@mycompany/dsh-tool-web` 依赖，pnpm lock 也会更新。

第二步，把插件挂到 `cordis.patch.yml`。文件里加一个 entry，`id` 任意，`name` 必须和 `package.json` 的 `name` 字段一致，`config` 就是我们在插件里定义的 `Config` 的实例

```yaml
- id: my-tool-web
  name: '@mycompany/dsh-tool-web'
  config:
    baseUrl: 'https://api.example.com'
    apiKey: 'sk-xxx'
    searchMaxResults: 8
    fetchTimeoutMs: 30000
```

第三步，重启 dsh

```bash
npx @deepseek-ai/dsh web
```

启动时 Cordis 会按顺序应用所有 patch layer，我们的 entry 会被解析成 `apply(ctx, { baseUrl, apiKey, searchMaxResults, fetchTimeoutMs })` 一次调用，两个 tool 就注册好了。模型下一次调用就会看到 `web_search` 和 `web_fetch`。

## 几个容易踩的点

`name` 字段必须和插件 `package.json` 里的 `name` 完全一致。`inject` 里少了必需的服务，插件会启动失败，错误在 apply 之前抛出。tool 名不能和内置的冲突，如果你写的是 `web_search`，官方 web plugin 也注册了同名 tool，最后谁赢取决于加载顺序，通常后面的会覆盖前面的。生产环境最好用一个不冲突的前缀，比如 `my_web_search`。

`timeoutMs` 只是这个 tool 声明的协作超时预算，真正的强制是靠 `dsh-tool-call-timeout-policy` 这个 wrapper 在 `tools/execute` 上面套的。我们的 HTTP client 里必须把 `exec.signal` 转发到 fetch 的 `signal` 参数上，否则超时不会中断在途请求，只是让 tool 返回超时错误而已。

返回值经过 `render` 变成模型看到的文本，同时也走一遍 `output.schema` 校验。schema 里定义的字段必须是 `execute` 返回对象里真实存在的字段，不然校验会挂掉，模型拿不到结果。`output.schema` 用 z 的 object 语法写，字段要标 `required: true` 的必须真的返回，可选项不填就当作 undefined 处理。

system prompt 的 `order` 决定 section 在 prompt 里出现的先后位置。官方的 `web_search` 用 110，`web_fetch` 用 120。我们想插到它们中间就夹一个 115，想放到最前面就压低 order 值。

## 一个真实的对照

官方 `@deepseek-ai/dsh-tool-web` 有 852 行，做了几件我们这里没做的事。多 query 搜索的并发扇出和结果合并、HTML 到 markdown 的 turndown 转换（GFM 表格、删除线）、`presentCall`/`presentResult` 用来生成 UI 卡片、`output.presentationMeta` 把结构化元数据带给 UI 层、`isConcurrencySafe` 的细粒度声明、`Config` 的完整校验（每个数值必须正整数）。

我们的最小 plugin 有 60 行左右，跑通了 tool 注册、system prompt 注入、config 解析、并发调度、超时转发。剩下的都是打磨。

MCP 把工具标准化到 agent 能调用的层次。dsh 把 agent 本身也插件化了，bash、fs、web、schedule 全是 plugin，官方没有任何特殊分支。这个方向比 MCP 走得更远，但也意味着写一个 plugin 的成本已经低到接近写一个 SDK 的 tool handler。

## 参考

- [DeepSeek Harness · Everything is a plugin](https://github.com/deepseek-ai/deepseek-harness)
- [`@deepseek-ai/dsh` npm](https://www.npmjs.com/package/@deepseek-ai/dsh)
- [`@deepseek-ai/dsh-tool-web` 源码](https://github.com/deepseek-ai/deepseek-harness/tree/main/packages/web/tool-web)
- [dsh Developer Preview](https://www.deepseek.com/harness/en/)
