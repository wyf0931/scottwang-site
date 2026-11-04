---
title: "后端工程师的补充准则"
description: "给后端工程师的额外要求：错误码、日志、内部错误与面向用户的错误消息分开。"
date: "2026-11-03"
type: "notes"
kind: "note"
series: "Google 技术写作"
tags:
  - 错误消息
  - Google 技术写作
draft: true
---
本课包含专门针对后端软件工程师的建议。

## 提供错误码

如果存在错误码，请将其作为错误消息的一部分。错误码有助于技术用户识别错误，并从错误索引或错误目录中查找更多信息。

不推荐
> 错误：你已经拥有这个存储桶。请从下拉列表中选择另一个名称。

推荐
> 错误 409：你已经拥有这个存储桶。请从下拉列表中选择另一个名称。

## 包含错误标识符

工程师会解析日志来了解错误是如何发生、为何发生；因此，请包含一个错误标识符，帮助工程师更容易找到特定错误。错误标识符应保持恒定，即使文本错误消息发生变化。

更多信息，请参阅 [AIP-193 的 Errors 单元](https://google.aip.dev/193)。

不推荐
> ```json
> { "error" : "Bad Request - Request is missing a required parameter: -collection_name. Update parameter and resubmit." }
> ```

推荐
> ```json
> { "error" : "Bad Request - Request is missing a required parameter: -collection_name. Update parameter and resubmit. Issue Reference Number BR0x0071" }
> ```
