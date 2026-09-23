---
title: "读 OpenDesign，看它怎么把 CLI 变成设计引擎"
description: "一个 5 个月拿到 97k star 的项目，它怎么把 CLI 变成设计引擎，桌面应用为什么是必经之路，CJK 为什么是短板。"
date: "2026-09-23"
type: "writing"
kind: "essay"
tags: ["OpenDesign", "Agent", "Design System", "Architecture"]
draft: false
---

Claude Design 让一条完整的 agent loop 第一次跑通，从需求澄清一路走到交付，全程在一个产品里。问题是它关着门，而且只认 Anthropic 的模型。

OpenDesign 的 README 第一句就把这件事点出来了。它自称 Claude Design 的开源替代品，读下去会发现，它替代的是那条 loop 的封闭性。

我 clone 下来翻了一遍仓库。项目 2026 年 4 月底创建，到 9 月 23 日拿 97,703 star 和 11,336 fork，Apache-2.0 协议。5 个月这个增速配得上一个具体判断，也值得花时间搞清楚它到底做了什么。

## 编码 agent 缺一个交付的位置

现在的编码 agent 写代码够用，产出物落地一直别扭。做个 landing page，agent 在终端里吐一堆 HTML，你自己开浏览器看。要做 deck、图片、短视频，工具链自己凑。

OpenDesign 想占这个位置。怎么生成它不管，管的是生成出来长什么样、在哪预览、怎么导出成 HTML、PDF、PPTX、MP4。

README 里一句话讲清了这件事，你的 CLI 变成设计引擎，笔记本变成工作室，团队的 DESIGN.md 变成品牌契约。三句话把 CLI 该干什么、产出物该去哪讲清楚了。

## 不重新实现 agent

这是整个项目最关键的决定，也是它和大多数 AI 设计产品分得最开的地方。

最重的一块在 apps/daemon，一个本地特权进程，对外暴露 `od` 命令行。它拥有 HTTP API、agent 进程管理、skills、design systems、artifacts、静态服务、SQLite 和 MCP server，摆在一起像个完整平台。

翻进 apps/daemon/src 会发现里面没有 agent loop。它 spawn 的是你本机已经装好的 CLI。README 列了 26 个受支持的本地可执行文件，Claude Code、Codex、Cursor、Hermes、Kimi、OpenCode、Antigravity 都在里面。DeepSeek Harness 通过官方 dsh CLI 是一等公民运行时，支持结构化流、模型发现、取消和 session resume。

接入走 MCP，`od mcp install claude` 一行装好。agent 通过 MCP 读仓库里的 skill 和 design system，写文件到 artifact 目录，daemon 用沙箱 iframe 预览，最后导出。

一个 CLI 都没装也有兜底。BYOK proxy 走 `POST /api/proxy/{anthropic,openai,azure,google,ollama,senseaudio}/stream`，贴 baseUrl、apiKey 和 model 就能跑，不 spawn 进程。daemon 边缘做 SSRF 防护，拦内网 IP、link-local 和 CGNAT。

docs/architecture.md 里有段历史说明，明确否定了第一版草稿里的 WebSocket session.generate 消息、内存 session bus、history.jsonl 和 three-root watched skill registry。实现落到了 HTTP/SSE、SQLite 持久化、request-time registry 和 packaged sidecar 上，旧方案被直接标成不是当前部署模式或兼容性承诺。

5 个月的项目，架构迭代过一次，旧账摊开写在文档里。这比只画一张架构图诚实。

## 内容比引擎重

我把仓库里的几个数字拉出来比了一下。

apps 层是五个子应用加十几个 package，代码量不小。项目形态由三个内容目录决定。skills/ 有 165 个，design-systems/ 有 154 个，design-templates/ 有 115 个，规模明显超过引擎代码。

skill 复用的是 Claude Code 的 Agent Skills 格式，一个目录加一个 SKILL.md，frontmatter 写 name、description、triggers 和 od 元数据，body 是自由 Markdown。OD 读它，不改它。docs/skills-protocol.md 里有一句兼容性承诺，带 SKILL.md 的 bundle 仍然能被任何支持 Agent Skills 格式的 agent 读取。

design-systems/ 里躺着一份份品牌设计系统，stripe、vercel、notion、linear、apple、airbnb、wechat、figma、claude 都在。它们是 DESIGN.md 文件，可版本管理，可以直接进你的 git 仓库。README 里说的品牌契约具体就是这些东西。

craft/ 目录放品牌无关的通用规则，skill 通过 `od.craft.requires` opt in。这套分层挺干净，品牌和技法解耦。

## 两个工程细节

mocks/ 目录让我停了一下。它是从匿名 Langfuse trace 构建的 replay-based mock CLI，覆盖 opencode、claude、codex、gemini、cursor-agent、deepseek、qwen、grok，还有 ACP 家族的 devin、hermes、kilo、kimi、kiro、vibe，以及 AMR 的 vela。用法是 PATH-overlay drop-in，丢进 PATH 就替换掉真实 CLI，跑测试和自检用。

支持 26 个 CLI 不是把名字列上就完事，每个 agent 的行为得可预测。mocks/ 干的就是这个。

CONTEXT.md 里是术语表，每个术语配一条 Avoid 清单。Project 不要叫 repo、folder 或 session。数据模型是 Project 包含若干 Normal Artifact，每个 Normal Artifact 由一个 Artifact Entry File 和一份 Artifact Manifest sidecar 元数据组成。Live Artifact 单独一类，是可刷新的输出，带 source data 和 preview state。MCP 调用不指定 target 时默认走 Active Project，也就是用户最近交互过的那个。

这套命名约束看着麻烦，但要被很多 agent 消费的协议必须这样。

## od 命令解决什么问题

想只用一行命令装好 od，再配合自己的 agent 干活，这条路当前是断的。

根因在 package.json 里，`"private": true`。`npm view open-design` 返回 404，这个包在 npm registry 上不存在。所以 `npm install -g open-design` 走不通，`brew install` 也没有官方 cask。

`od` 是个 npm bin 入口，定义在 `apps/daemon/bin/od.mjs`。它做的事很简单，`import` 同目录的 `../dist/cli.js`。dist 不存在就抛错，提示你 `pnpm bootstrap` 之后再试。

而 dist 是 `pnpm bootstrap` 编译出来的。这意味着 od 必须从源码 checkout 或桌面应用 bundle 里拿到，没有第三条独立路径。

官方提供的 `curl -fsSL https://open-design.ai/install.sh | sh -s <agent>` 看起来是一行安装。实际它先检查 `command -v od`，只负责注册 MCP 配置，你已经有 od 才能跑它。

README 里有一句容易看漏的说明，桌面应用 bundle 不会往 shell PATH 里加 od 软链。所以装了桌面应用，终端里还是敲不出 od，得去设置里复制带绝对路径的 MCP 配置片段。

还有一层路径冲突。macOS、Linux、WSL2 上 `/usr/bin/od` 是系统自带的八进制转储命令，会抢占 OpenDesign 的 od。install.sh 专门加了探针 `od mcp install --open-design-cli-probe` 来检测这件事，检测到就报错让你调 PATH。

所以桌面应用不是捆绑，它是 od 的唯一分发载体。沙箱 iframe 预览、导出 PDF、PPTX、MP4 需要本机渲染环境，Docker 部署也得挂一个浏览器。这条路径本身站得住。

但值得注意的转向发生在 0.9.0。这个版本自称 install-and-create release，官方话术很直白，老的 first-run tax 太狠了，装 CLI、找 API key、贴密钥、测认证、调 shell，然后也许才能开始设计。0.9.0 把它砍到三步，打开应用、登录 AMR、选模型。AMR 是官方模型服务，onboarding 第一个入口就是它，桌面常驻登录入口，安装包内置 vela 运行时，UI 处理钱包余额和充值链接。

本地 first-class 是 BYOK 加上 26 个 CLI。这个定位没变。只是首屏引导从 BYOK 换成了付费云，本地路径从默认变成了可选项。

## CJK 是明确的短板

中日韩字形问题在 issue 区有一条清晰的痕迹。

#5097 由日语母语者提出。日文文本渲染出了中文风格的字形。同码位不同字形这件事，不懂日语的人基本注意不到，但对方觉得不自然也不对。

修复在 #5104。问题描述写得很准，日文 fallback 被和中文、韩文归在一组，用的是中文优先的字体栈。对共享的 CJK 字符，这会渲染出中文字形。改动只有一行，`apps/web/src/styles/viewer/library.css`。

更早的 #2227 是另一件事。UI 语言切到中日韩以后，按钮和标签全是方块。原因是 `--sans` 字体栈里只有拉丁字体。修法是在 `:lang(zh)`、`:lang(ja)`、`:lang(ko)` 选择器下补 PingFang SC、Microsoft YaHei、Noto Sans SC 这些系统字体。

这两条都只改了 web 层的 CSS。

真正的问题在设计模板和 DESIGN.md 协议。我数了一下，114 个 design-templates 里 91 个文件含 CJK 字体名，占八成。但拆开看分布就清楚了。21 个在 example.html，14 个在 style.css，7 个在 template.json。

含 CJK 的 template.json 几乎全是 html-ppt-zhangzara-* 系列，字体配置里写 `"cn": "Noto Sans SC"`，style 字段标注 bilingual EN/CN。这些是有意识地做过中英双语的 deck 模板，作者显然是中文用户。

主流原型模板没有这层。web-prototype、saas-landing、mobile-app 的字体走 `var(--font-body)`、`var(--font-display)` 这类 CSS 变量，变量值来自 design system，而 design system 的字体定义是拉丁字优先。中文塞进去就靠系统 fallback 兜底，字重、行高、字间距全部失配。

DESIGN.md 协议本身也没有语言维度的 schema。它定义 display、body、mono 三类字体角色，没有 cn、jp 字段。CJK 支持是模板作者自己加的约定，不是协议保证的。

issue 区还有几条在印证同一件事。#6478 是 Albert Sans 没有西里尔覆盖，俄文靠 OS 兜底。#6085 是首页标题回退到随机系统衬线体，得手动打包 Source Serif 4。#6291 是 DESIGN.md 解析把 `Nunito Sans` 截成 `Nunito Sans,`，连带丢掉 Google Fonts 地址和字重元数据。#5644 和 #6839 是 PPTX 导出破坏 CJK 字重和字体。

CJK 是协议层的缺口。DESIGN.md 没有语言维度，模板作者各自为战，PPTX 导出还会把字重和字体再破坏一次。

## 判断

生成模型和设计编辑器它都没动，它占的是 agent 产出物落地的位置。

三个数字说明重心，165 skills、154 design-systems、115 templates。增长的动力在内容这一侧。Anthropic 的 loop 是产品，OpenDesign 的 loop 是文件系统，这是两者最根本的区别。

热度这一侧我持保留态度。开发节奏是真的，CHANGELOG 里每个版本都记了 PR 和贡献者数，0.1.0 是 45 个 PR 加 27 个贡献者，0.9.0 是 310 个 PR 加 88 个贡献者，7 天。到 5 月底已有 1748 个 commit，现在 3689 个。这种密度不是买来的。

但 star 曲线有人在质疑。发推当天的 HN 讨论里，有人贴出 star-history 的图，说仓库上线一周拿到 14k star，增速几乎精确地每天 1400，质疑存在刷量。也有人反驳，说 star 未必是买的，可能是 agent 在人类没明确指示的情况下顺手点的。两边都没有证据，我只能说这条曲线读着不顺。

社区反馈的调性比 star 数更值得看。HN 上 232 分、92 条评论，正面集中在"agent 原生"这个定位，有人直接问输出质量里有多少是 design system 和 skill 文件在做真功夫，有多少只是 Claude 本身擅长写 HTML。这个问题现在没有答案。

批评也很直接。设计师说看到的 LLM 产出物丑、平庸、不可用，提示词救不回来。有人指出 Claude Design 那种要生成完整网站的流程极耗 token，ChatGPT image 更快更便宜。还有人觉得 README 读起来像销售稿，翻到"six load-bearing ideas"就关掉了标签页。

对中文用户，实用建议很具体。避开 zhangzara 系列的 deck 模板去拿模板，改用 web-prototype 加自己的 DESIGN.md，手动指定中文字体栈。PPTX 导出会破坏 CJK，要发正式材料走 HTML 加浏览器打印。

风险也清楚。0.23.1 的版本号加 5 个月历史，架构契约还在快速变动。核心体验要么依赖你自己有 agent CLI，要么付费上 AMR Cloud，桌面应用是 od 的唯一分发载体，这个耦合短期解不开。CJK 支持不是靠等上游修就能解决的，DESIGN.md 协议没有语言维度，这件事需要自己做模板或者补 craft 规则。

## 资料来源

- 仓库源码，`nexu-io/open-design` 0.23.1，2026-09-23 浅克隆
- GitHub API 的 release 时间线、issues、PR 与 commit 分页计数
- Hacker News 讨论，Open Design 用你的编码 agent 做设计引擎，232 分 92 评论，2026-05-02
- CJK 相关 issue，#2227、#5097、#5104、#6085、#6291、#6478、#5644、#6839
- `CHANGELOG.md` 各版本 PR 与贡献者计数，`package.json`，`apps/daemon/bin/od.mjs`，`open-design.ai/install.sh`，`docs/architecture.md`，`docs/skills-protocol.md`，`CONTEXT.md`

Reddit 和 Stack Overflow 没有查到相关讨论。Stack Exchange 的搜索只返回 Visual Studio Designer 之类的无关结果，这个项目在那边没有存在感。
