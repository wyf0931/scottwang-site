---
title: "OmniData"
description: "以数据为中心的 Agent 数据服务，为 Agent 提供 Web Search、Amazon 数据和公共分类数据 API。"
date: "2026-08-05"
status: "Active"
visibility: "Closed Source"
stack: ["AI", "Agent", "Data APIs", "Web Search", "Amazon Data"]
featured: true
url: "https://data.ohmyagent.ai/"
---

Agent 真正开始做事以后，很快会碰到数据问题。

模型本身知道很多公共知识，但任务里经常需要更新的、结构化的、可以被程序继续处理的数据。比如搜索结果、电商商品和类目、网页内容、公开站点里的表格。每个 Agent 都临时写一套抓取逻辑，短期看很快，后面会越来越难维护。

OmniData 做的是这一层数据服务。它把常见的数据获取能力整理成稳定接口，让 Agent 可以把注意力放在任务本身，而不是每次都重新处理搜索、抓取、清洗和字段整理。

当前已经提供这些能力。

- Web Search API
- Amazon 相关电商数据 API
- 公共分类数据 API

后续会继续扩展 Web Fetch，以及更多数据获取、清洗和处理能力。现阶段先处理 Agent 高频使用、容易重复造轮子的部分，把它们变成可复用接口。

项目暂不开源。公开页面主要介绍产品边界、已经支持的数据类型和适合接入的场景。
