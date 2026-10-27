---
title: "oma-watermark"
description: "本地运行的图片去水印工具，OpenCV 快速修补加 LaMa AI 补全，图片只在内存里处理，不上传、不留记录。"
date: "2026-10-21"
status: "Active"
visibility: "Open Source"
stack: ["Python", "FastAPI", "OpenCV", "LaMa", "Alpine.js", "PyInstaller", "Tauri"]
featured: true
repository: "https://github.com/wyf0931/oma-watermark"
---

## 素材不适合离开本机

图片上去水印的需求经常很急，但大多数在线工具要上传原图。素材、合同截图、带平台标的水印图，这类内容往往不适合离开本机。

oma-watermark 把这件事放回本地。上传图片，框选水印区域，工具只检测区域内的高亮度像素并填补。全程图片存在本机内存里，没有账号、没有历史、没有第三方服务。

## 选区、遮罩、修补三步

后端是 FastAPI，前端是原生 HTML/CSS/JS。Web 端和 macOS 桌面端共用同一套接口和页面。

修补逻辑分三步。前端把图片、选区、阈值、边缘扩展和模式发到 `POST /api/remove`。服务端用 `cv2.inRange` 在选区内挑出 B、G、R 三通道都高于阈值的像素，再做膨胀得到遮罩。然后按模式修补，Fast 走 `cv2.inpaint` 的 Telea 算法，AI 在遮罩周围裁一块正方形，用 OpenCV DNN 跑 512x512 的 LaMa，最后只把被遮罩的像素贴回去。

AI 模式用 [OpenCV LaMa ONNX 模型](https://huggingface.co/opencv/inpainting_lama)，约 93 MB，一次性下载。模型不在或者下载不到时，自动回退到 Fast 模式，所以不装模型也能用。

两个可调参数。Threshold 控制亮度阈值，残留就调低，误选背景就调高。Edge expand 向外扩遮罩覆盖毛边、阴影和抗锯齿，默认 6px，范围 0-12。

## 能力清单与本地启动

现在支持这些。

- 拖拽或选择图片，PNG、JPEG、WebP、BMP，上限 25 MB
- 框选矩形指定修复区域，只改这个范围
- 两种修补引擎，默认 LaMa AI，无模型时自动降级 OpenCV
- Result 和 Mask 双视图切换，看到修补结果和检测到的水印区域
- 浏览器里直接用，也能装成 macOS 原生应用
- Windows 提供 ZIP 包

本地跑起来两步。

```bash
uv sync
uv run oma-watermark
```

打开 `http://127.0.0.1:8000`。要用 AI 模式先下模型。

```bash
uv run oma-watermark-download-model
```

桌面版从 [GitHub Releases](https://github.com/wyf0931/oma-watermark/releases) 下载 DMG，LaMa 模型已经打包在里面，离线可用。

License 是 MIT。内置的 LaMa 模型本身是 Apache-2.0。