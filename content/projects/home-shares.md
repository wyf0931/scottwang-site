---
title: "Home Shares"
description: "一个运行在局域网内的轻量消息和文件共享看板，打开网页就能在多台设备之间发送消息和文件。"
date: "2026-08-06"
status: "Active"
visibility: "Open Source"
stack: ["Node.js", "Express", "WebSocket", "Multer", "JavaScript"]
featured: true
repository: "https://github.com/wyf0931/home-shares"
---

Home Shares 解决的是一个很朴素的问题。几台设备在同一个局域网里，临时想传一段文字、一个链接、几张图或者一个文件，不一定值得打开聊天软件，也不一定想登录一套完整的协作系统。

它的做法很轻。启动服务以后，电脑和手机打开同一个网页，就可以发送消息和上传文件。在线设备会实时收到内容，新连接进来的客户端也会同步当前服务进程里的消息。

这个项目刻意没有做账号、认证和历史持久化。它更适合可信局域网里的临时共享，服务重启以后，消息和上传文件都会清空。这个边界让实现保持简单，也避免把一个小工具做成另一套文件系统。

目前它支持消息实时广播、文件上传下载、当前客户端和其他客户端的视觉区分，以及单个最大 100 MB 的文件上传。技术栈是 Node.js、Express、WebSocket、Multer 和原生 HTML、CSS、JavaScript。

如果你经常在家里、办公室或测试环境里需要跨设备传一点东西，这类工具会比正式系统更顺手。它不负责长期保存，只负责把眼前这一次分享做快。
