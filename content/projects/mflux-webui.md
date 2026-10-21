---
title: "mflux-webui"
description: "Apple Silicon 本地生图工作台，内置策展模型库、文生图、图生图、Qwen 多参考编辑和画廊，权重和提示词不离开本机。"
date: "2026-10-21"
status: "Active"
visibility: "Open Source"
stack: ["Python", "Flask", "MLX", "mflux", "Alpine.js", "daisyUI", "Tauri"]
featured: true
repository: "https://github.com/wyf0931/mflux-webui"
---

## Why

FLUX、Qwen-Image 这一批开源模型能力已经很接近商业 API，但要在本机跑出好看的图，得自己拼 mflux、MLX、推理脚本、模型下载和缓存。每一步都要装环境、对版本、调参数。

mflux-webui 把这些收进一个工作台。Flask 后端，Alpine.js 加 daisyUI 5 前端，推理交给 [mflux](https://github.com/mflux-community/mflux) 和 MLX。权重和提示词全程不出本机。

## How

模型是策展的，不是让用户自己找权重。内置 Qwen Image 2.1 Turbo、Krea 2 Turbo、Z-Image Turbo、FLUX.2 Klein，提供 q4 / q8 / 4-bit 量化档。每个模型有各自的默认 steps 和 guidance，比如 Qwen Turbo 固定 8 steps、guidance 1.0，不用每次手调。

参考图支持选文件或者 ⌘V / Ctrl+V 粘贴，可以预览、替换、移除，只有生成时才上传到内存。Qwen 多参考编辑能一次放 1-10 张图，按顺序编号，提示词里写"image one""figure 2"或者 `<image1>` `<image2>` 引用。原来的单图合成模式保留。

单独有个图生文页面。本地 Qwen3-VL 模型把任意图片转成一行提示词加七个结构化维度，可以复制，也可以一键带到生成页面。

生成走异步队列，显示状态、模型别名、耗时和结果，失败能展开完整堆栈日志。下载通道有 Hugging Face 和 ModelScope 两个，各自用 SDK 默认的模型缓存目录。

桌面版是 Tauri 2 打包的，打开像原生应用，不用装 Python 或 Node.js，首次使用时自己下模型。

## What

M4 Pro 48GB、1024x1024、8 steps 下实测过这几组数据。

| 模型 | 权重大小 | MLX 峰值内存 | 耗时 |
| --- | --- | --- | --- |
| Qwen Image 2.1 Turbo q4 | 10.0 GB | 20.5 GB | 93 s |
| Krea 2 Turbo q4 | 14.7 GB | 31.3 GB | 185 s |
| Qwen Image 2.1 Turbo q4 @ 512x512 | 10.0 GB | 14.3 GB | 22 s |

空闲时 Flask 后端 RSS 约 60 MB。内存是唯一硬约束，MLX 采样时会持有全部权重加激活，峰值约为模型磁盘体积的两倍。

硬件要求只支持 Apple Silicon，Intel Mac、Windows、Linux 不支持。推荐 M2 Pro / M3 / M4、32 GB、60 GB 空余。

跑起来四步。

```bash
git clone https://github.com/wyf0931/mflux-webui.git
cd mflux-webui
uv sync && npm install
npm run build && uv run python app.py
```

打开 `http://127.0.0.1:8090`，在 Models 页面下载模型，然后生成。后台运行用 `./ops.sh start|stop|status|logs`，打桌面包用 `./ops.sh build`。

`uv sync` 会把 mflux 固定在支持 Qwen Image 2.1 Turbo 的那个 commit 上，不要另外装全局 mflux。

License 是 MIT。桌面包里的 PyInstaller 是 GPL-2.0，仅构建时使用。