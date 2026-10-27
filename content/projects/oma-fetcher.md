---
title: "oma-fetcher"
description: "给 Agent 用的单 URL 网页读取与发现 API。一个地址进，干净 Markdown 出，四级策略降级抓取，可选 SQLite 存储与全文检索。"
date: "2026-10-26"
status: "Active"
visibility: "Open Source"
stack: ["Python", "FastAPI", "Trafilatura", "httpx", "curl-cffi", "Scrapling", "Playwright", "SQLite", "FTS5", "jieba", "MCP"]
featured: true
repository: "https://github.com/wyf0931/oma-fetcher"
---

## Why

Agent 要读网页，绕不开同一件事。同一个 URL，有的站一个 GET 就拿到正文，有的站换了 UA 还是返回反爬页面。

大多数调用方最后的解法是各自塞一套浏览器自动化。每个项目依赖一遍 Playwright 和 Chromium，每套服务自己维护选择器和反爬绕过，成本全花在同一个地方。

oma-fetcher 把这件事收进一个服务。上游只管发一个 URL，下游拿到干净 Markdown。抓取策略、降级顺序、robots 判断都在服务端。调用方不装浏览器，也不感知反爬。

## How

抓取不是单一路径，是一条降级链。`httpx` 先试，浏览器指纹不对就换 `curl-cffi`，还拿到占位页就上 Scrapling stealth，最后才起 Playwright 渲染。四级共用一个超时预算，不会一路重试把时间耗光。

判断只有一条。HTTP 200 不等于内容成功。 Trafilatura 抽不出有意义的正文时继续降级，不会因为请求通了就交回一个登录页。

提取交给 Trafilatura，输出 `markdown`、`txt`、`json`、`xml` 四种，默认 Markdown。服务还带内容评估，能识别出列表卡片、robots 文档、sitemap、cookie 弹窗和反爬占位符。

发现侧还有两项能力，读任意域名的原始 `robots.txt`，以及有界扩展 sitemap。存了内容的文档进 SQLite，配 jieba 分词和 FTS5 全文检索。

所有响应同一个信封 `{code, message, data, meta}`。失败时 `data` 为 null，`meta.attempts` 和 `meta.failback` 记录试过哪几条策略，调用方照着排错。命中路由按域名和抓取类型缓存七天。

安全性默认保守，私网和回环地址拒绝，robots 规则默认遵守，落库默认关闭，都要显式开启。

同一个服务还挂 Web UI 和 MCP server，`/mcp` 上暴露六个工具，Agent 直接调。

## What

现在支持这些。

- 单 URL 抓取，输出 Markdown / 纯文本 / JSON / XML
- 四级降级，httpx → curl-cffi → Scrapling stealth → Playwright
- 正文评估，识别反爬占位、列表页、robots 和 sitemap 文档
- robots.txt 读取与 sitemap 有界扩展
- SQLite 文档库，jieba + FTS5 全文检索
- Web UI 含 Playground、结果库、API Key 管理，代理无需重启热改
- MCP server，Streamable HTTP 暴露六个工具
- Docker Compose 或 macOS 单命令安装，镜像发布于 GHCR

macOS 上一行装好。

```sh
curl -fsSL https://raw.githubusercontent.com/wyf0931/oma-fetcher/main/scripts/install-macos.sh | bash
```

用 Docker Compose。

```sh
cp .env.example .env
docker compose pull
docker compose up -d
```

抓一个页面。

```sh
curl -sS -X POST 'http://127.0.0.1:7890/api/fetch' \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.iso.org/standard/87210.html","timeout_seconds":90}' \
  | jq -e 'if .code == 0 then .data else error(.message) end'
```

不想落地，只看服务用了哪条策略、试了几次。

```sh
curl -sS -X POST 'http://127.0.0.1:7890/api/fetch' \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.iso.org/standard/87210.html","timeout_seconds":90}' \
  | jq '{code, message, strategy: .meta.strategy, attempts: .meta.attempts}'
```

License 是 MIT。依赖里 Trafilatura 和 Playwright 是 Apache-2.0，其余见仓库的第三方许可清单。
