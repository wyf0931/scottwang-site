---
title: "通用错误处理规则"
description: "错误处理的总规则：先解释问题，再给出解决办法，并避免归咎于用户。"
date: "2026-11-03"
type: "notes"
kind: "note"
series: "Google 技术写作"
order: 22
tags:
  - 错误消息
  - Google 技术写作
draft: true
---
在进入课程最有趣的部分——错误消息的措辞——之前，我们先讨论几条通用的错误处理规则。

## 不要静默失败

失败是难免的；不报告失败则是不可原谅的。
静默失败会造成以下问题：

- 用户会怀疑是不是出了问题。（*"为什么我的订单没有提交成功？"*）
- 客户支持会困惑是什么导致了问题。（*"日志文件中没有任何问题迹象。"*）

拥抱软件的缺陷性。假设用户在使用你的软件时会犯错。尽量减少误用软件的方式，但也要接受你无法完全消除误用。因此，在设计软件时就要规划好错误消息。

## 遵循编程语言指南

遵循 Google 各编程语言指南中关于错误处理的规范，包括：

- [Google C++ 风格指南](https://google.github.io/styleguide/cppguide.html)
- [Google Java 风格指南](https://google.github.io/styleguide/javaguide.html)
- [Google Python 风格指南](https://google.github.io/styleguide/pyguide.html)，特别是[错误消息章节](https://google.github.io/styleguide/pyguide.html#3102-error-messages)
- [Google JavaScript 风格指南](https://google.github.io/styleguide/jsguide.html)
- [Google Go 风格指南](https://google.github.io/styleguide/go)，特别是[错误处理章节](https://google.github.io/styleguide/go/best-practices#error-handling)

## 实现完整的错误模型

实现 [Google AIP 的 Errors 页面](https://google.aip.dev/193)中描述的完整错误模型。
例如，注意以下关于在服务中实现错误消息的引述：
> 当发生 API 错误时，服务必须返回一个 [google.rpc.Status](https://github.com/googleapis/api-common-protos/blob/master/google/rpc/status.proto) 消息，并且必须使用 [google.rpc.Code](https://github.com/googleapis/api-common-protos/blob/master/google/rpc/code.proto) 中定义的规范错误码。

[Google Cloud API 设计指南的 Errors 页面](https://cloud.google.com/apis/design/errors)提供了关于为 Google API 实现完整错误模型的有用信息。

## 避免吞掉根本原因

API 实现不应吞掉后端发生问题的根本原因。例如，许多不同情况都可能导致"服务器错误"问题，包括：

- 服务故障
- 网络连接断开
- 状态不匹配
- 权限问题

"服务器错误"是过于笼统的错误消息，无法帮助用户理解和修复问题。如果服务器日志包含会话内用户和操作的标识信息，我们建议提供关于特定失败情况的额外上下文。

## 记录错误码

数字**错误码**有助于客户支持监控和诊断错误。因此，在文本错误消息的同时指定数字错误码通常非常有价值。

你可以为内部错误和外部错误都指定错误码。
对于内部错误，提供合适的错误码，方便内部支持人员和工程师查找/调试。

记录所有错误码。

## 立即抛出错误

尽早抛出错误。把错误握在手里、稍后再抛，会大幅增加调试成本。
