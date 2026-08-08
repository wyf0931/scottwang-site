---
title: "oma-drop"
description: "一个自托管的局域网文字和文件快传工具，启动一个本地服务，同一网络里的电脑和手机打开地址就能互传内容。"
date: "2026-08-06"
status: "Active"
visibility: "Open Source"
stack: ["Node.js", "Express", "WebSocket", "Multer", "JavaScript", "npm", "Homebrew"]
featured: true
repository: "https://github.com/wyf0931/oma-drop"
---

## Why

很多跨设备传东西的需求其实很小。电脑上有一段文字、一个链接、几张图片，想丢给手机或另一台机器。打开聊天软件会留下额外记录，用网盘又太重。

oma-drop 服务的是这个很窄的场景。在可信局域网里，启动一个本地服务，其他设备打开同一个地址，就能完成这一次分享。它不追求账号、历史和协作空间，只负责把眼前这次传递做快。

## How

实现上它保持单服务结构。Node.js 提供 HTTP 页面和 API，WebSocket 负责实时消息，Multer 负责文件上传。HTTP 和 WebSocket 共用一个端口，前端用原生 HTML、CSS 和 JavaScript，没有单独的构建步骤。

![oma-drop 的网页界面](/projects/oma-drop.png)

消息放在内存里，新设备连接后会同步当前服务进程里的消息。上传文件保存在运行时目录，下载时保留原始文件名，包括中文文件名。服务重启后，本次会话里的消息和文件会被清空。

这个边界很重要。它适合家里、办公室、测试环境这类可信网络，不适合作为公网文件服务，也不提供访问控制和长期保存。

## What

现在它已经可以作为一个小工具直接使用。

- 文字消息实时同步
- 新客户端自动获得当前会话内容
- 文件上传和下载，单文件上限 100 MB
- 电脑和手机浏览器都能使用
- npm 和 Homebrew 两种安装方式
- CLI 支持启动、停止、重启、状态和日志查看

快速安装。

```bash
npm install --global oma-drop
oma-drop start
```

不想全局安装，也可以直接运行。

```bash
npx oma-drop start
```

使用 Homebrew。

```bash
brew tap wyf0931/oma-drop
brew install oma-drop
oma-drop start
```

启动后会输出本机地址和局域网地址。

```text
Access URLs:
  Local: http://localhost:3000
  LAN: http://192.168.0.46:3000
```

其他设备连接同一个 Wi-Fi 后，打开 `LAN` 地址即可。需要换端口时可以这样启动。

```bash
oma-drop start --port 8080
```

常用管理命令。

```bash
oma-drop status
oma-drop stop
oma-drop restart
oma-drop logs
```

如果从源码运行。

```bash
npm install
./bin/ops.sh start
./bin/ops.sh status
./bin/ops.sh stop
```
