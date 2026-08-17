---
title: "七牛云全网搜索 API：接口、参数与 Python 调用示例"
description: "七牛云 AI 大模型推理平台提供的全网搜索 API 使用说明，涵盖百度 Search API 能力、鉴权、搜索过滤、返回字段和 Python 调用。"
date: "2026-08-18"
type: "notes"
kind: "resource"
resourceType: "website"
resourceUrl: "https://developer.qiniu.com/aitokenapi/13192/web-search-api"
tags:
  - API
  - Web Search
  - 七牛云
  - 百度
  - Agent
draft: false
---

七牛云 AI 大模型推理平台提供了一个全网搜索接口。官方文档把它标为百度 Search API，调用方通过七牛云的 API 地址提交查询，得到结构化的网页、视频或图片搜索结果。

这类接口适合给问答、内容聚合、信息检索和 Agent 工具调用补充实时网页信息。它返回的是搜索结果，不是经过业务验证的最终答案。标题、摘要、来源和评分都需要在应用层继续处理。

## 接口地址

API 基础地址如下。

```text
https://api.qnaigc.com/v1
```

网页搜索接口如下。

```text
POST https://api.qnaigc.com/v1/search/web
```

调用前需要在七牛云平台创建 AI API Key。API Key 只放在环境变量或密钥管理系统里，不要写入 Markdown、示例配置文件或代码仓库。

## 用 curl 发起搜索

下面的请求使用网页搜索，限制返回数量，并增加时间和站点过滤。

```bash
export QINIU_API_KEY="<你的七牛云 AI API Key>"

curl --location "https://api.qnaigc.com/v1/search/web" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $QINIU_API_KEY" \
  --data '{
    "query": "今日新闻",
    "max_results": 10,
    "search_type": "web",
    "time_filter": "year",
    "site_filter": ["news.cctv.com", "www.xinhuanet.com"]
  }'
```

最小请求只需要 `query`。

```bash
curl --location "https://api.qnaigc.com/v1/search/web" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $QINIU_API_KEY" \
  --data '{"query":"七牛云 AI API"}'
```

## 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `query` | string | 是 | 搜索关键词或查询语句 |
| `max_results` | integer | 否 | 返回数量。网页搜索默认 20，最大 50；视频最大 10，默认 5；图片最大 30，默认 15 |
| `search_type` | string | 否 | 搜索类型，默认是 `web`，还支持 `video` 和 `image` |
| `time_filter` | string | 否 | 时间过滤，可选 `week`、`month`、`year`、`semiyear` |
| `site_filter` | array | 否 | 限定搜索站点，最多 20 个域名 |

### 搜索类型

| 值 | 用途 |
|---|---|
| `web` | 网页搜索，默认类型 |
| `video` | 视频搜索 |
| `image` | 图片搜索 |

如果应用只需要某个站点的内容，可以使用 `site_filter` 缩小范围。站点过滤能减少无关结果，但也可能漏掉站外的重要资料，是否使用需要看任务目标。

## 返回结果

官方示例的外层结构如下。

```json
{
  "success": true,
  "data": {
    "query": "今日新闻",
    "results": [],
    "total": 17,
    "request_id": "3b3d247c-719a-4856-a231-f35614bfa840"
  }
}
```

### 外层字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `success` | boolean | 请求是否成功 |
| `message` | string | 失败时返回的错误信息 |
| `data` | object | 搜索结果数据 |

### `data` 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `query` | string | 本次搜索的查询词 |
| `results` | array | 搜索结果列表 |
| `total` | integer | 结果总数 |
| `request_id` | string | 本次请求的唯一标识，适合用于日志和问题排查 |

### 搜索结果字段

网页结果通常包含这些字段。

| 字段 | 说明 |
|---|---|
| `id` | 结果项 ID |
| `title` | 页面标题 |
| `url` | 页面链接 |
| `content` | 页面摘要 |
| `date` | 页面或内容的时间信息 |
| `source` | 来源网站名称 |
| `score` | 相关性评分 |
| `type` | 结果类型，例如 `web` 或 `news` |
| `icon` | 网站图标链接 |
| `authority_score` | 权威性评分 |

图片结果还可能带有 `image` 对象，其中包含图片 URL、高度和宽度。视频结果可能带有 `video` 对象，其中包含视频 URL、尺寸、时长和封面地址。部分视频只有页面 URL，没有可直接播放的视频 URL。

`score` 和 `authority_score` 可以作为排序或筛选的输入，不能单独作为事实准确性证明。涉及新闻、政策、价格、医疗或金融信息时，应用仍然需要打开来源页面，核对发布时间和原文口径。

## Python 调用示例

下面的封装只负责请求和基础错误处理。实际项目还应根据业务增加超时、重试、日志脱敏和结果去重。

```python
import os

import requests


API_URL = "https://api.qnaigc.com/v1/search/web"


def web_search(query: str, max_results: int = 10) -> dict | None:
    api_key = os.environ["QINIU_API_KEY"]
    response = requests.post(
        API_URL,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        json={
            "query": query,
            "max_results": max_results,
            "search_type": "web",
        },
        timeout=20,
    )
    response.raise_for_status()

    payload = response.json()
    if not payload.get("success"):
        raise RuntimeError(payload.get("message", "web search failed"))

    return payload["data"]


results = web_search("七牛云 AI API", max_results=5)
for item in results["results"]:
    print(item["title"], item["url"])
```

这里没有把 API Key 写进函数参数，调用前设置环境变量即可。

```bash
export QINIU_API_KEY="<你的七牛云 AI API Key>"
```

## 接入时需要注意什么

### 给 Agent 使用时保留来源

如果搜索 API 被用作 Agent 的工具，建议把每条结果的 `title`、`url`、`source`、`date` 和摘要一起传给模型。最终回答中保留来源链接，方便用户回看，也方便后续检查模型是否误读了摘要。

### 控制请求成本和延迟

先用较小的 `max_results` 验证查询质量，再根据召回情况调整数量。对重复查询可以在应用层缓存，对并发请求设置超时和重试上限，避免搜索服务成为整个任务的等待瓶颈。

### 区分搜索和事实核验

搜索结果解决的是“去哪里找资料”。它不能替代来源核验、内容抽取和业务判断。对于时效性强或风险较高的内容，至少检查来源页面、发布时间和多个结果之间是否互相支持。

## 官方资料

- [七牛云全网搜索 API](https://developer.qiniu.com/aitokenapi/13192/web-search-api)
- [获取七牛云 AI API Key](https://developer.qiniu.com/aitokenapi/12884/how-to-get-api-key)
