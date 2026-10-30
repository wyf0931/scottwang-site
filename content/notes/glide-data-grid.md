---
title: "glide-data-grid：百万行 Canvas 表格，和 35 个还没做完的功能"
description: "一张能扛百万行的 React 数据表格，底层用 Canvas 直接画格子，格子不占 DOM 节点。能力清单已经很长，但从 2024 年 2 月的 v6.0.3 之后只出 alpha，35 个功能请求还挂在 issue 上。"
date: "2026-10-30"
type: "notes"
kind: "note"
tags:
  - 前端
  - 数据表格
  - React
  - Canvas
  - 开源
---

**glide-data-grid** 是 Glide 团队开源的 React 数据表格，[仓库](https://github.com/glideapps/glide-data-grid) 有 5421 颗 Star，MIT 协议。它最初是给自家产品 Glide Data Editor 打底用的，后来独立成库。这个项目最值得程序员看的地方，是它用 HTML Canvas 直接画格子，格子不占 DOM 节点。

## 为什么是 Canvas

原版实现用 react-virtualized 做横向纵向双方向虚拟化。问题出在滚动性能上，一帧要挂载和卸载几百个 DOM 元素，帧率救不回来。加个低保真渲染模式，只在每个 cell 里画一个元素，画面滚到几百个 cell 时又开始卡。换成 Canvas 之后，格子绘制全走 canvas 2D context，浏览器不需要为每个 cell 维护 DOM 节点，滚动性能上了一个台阶。代价是格子的渲染、命中检测、文本测量这些本来交给 DOM 的活，全要自己写。

## 已实现的能力

能力清单，每项都能在源码里找到对应实现。

**Cell 类型，12 种**。`GridCellKind` 枚举定义在 `packages/core/src/internal/data-grid/data-grid-types.ts`，uri、text、image、row-id、number、bubble、boolean、loading、markdown、drilldown、protected、custom。custom 是逃逸口，用 `customRenderers` 注册自己的 Canvas 渲染器，`DrawCellCallback` 拿到 cell 内容和绘制参数，爱怎么画怎么画，这是最核心的扩展点。

**列**。列宽能定死也能自适应（`useColumnSizer`、`measureColumn`），能拖拽调宽，能拖拽换序。列头支持图标、右键菜单、分组（`group` 字段）。

**行**。行高可变，支持行标记（`rowMarkers`，方形或圆形，可当新增行按钮用），支持拖拽排序，支持行分组。

**分组**。列分组是声明式的，`group` 字段一填就成组。行分组复杂一些，`useRowGrouping` 接受 `RowGroupingOptions`，能表达嵌套组、折叠状态、高度、主题覆盖、导航和选择行为（`navigationBehavior`、`selectionBehavior`）。这一块是后来加的，下面 gap 部分会说到。

**选择**。range、column、row 三个维度各有 none/single/multi 档位，`CellSet` 做紧凑选择集，`compactSelection` 管理，`rangeSelect`、`columnSelect`、`rowSelect` 三个 prop 分别控制，还有 selection blending 混合模式。

**编辑**。内置编辑（`onCellEdited`），`provideEditor` 可以替换任意 cell 的编辑器，`validateCell` 做校验，粘贴支持 `coercePasteValue` 做值转换，`onPaste` 可以拦下来自己处理。

**搜索**。内置的，你提供触发入口，它做搜索，实现在 `data-grid-search` 目录。

**冻结列**。`freezeColumns` prop。

**填充柄**。`FillHandle`，`allowedFillDirections` 控制方向，`onFillPattern` 回调。

**图片窗口加载**。`ImageWindowLoader` 只加载可视窗口内的图片，`imageEditorOverride` 可以替换编辑器。

**主题**。`Theme` 对象，以 CSS 变量形式暴露（`--gdg-bg-cell` 这类），支持暗色模式，`themeOverride` 可以按列、按行覆盖。

**无障碍**。README 把它列为一等公民，键盘导航、屏幕阅读器、`trapFocus` 焦点圈禁。但 FAQ 也坦诚开发团队没有无障碍用户，实现里可能有没有意识到的缺陷。

**数据接入**。`getCellContent` 是 `(cell) => GridCell` 回调，库不关心数据从哪来，只要求你按坐标给格子。这设计让它能接任意数据源，但也意味着排序过滤这类活得你自己做。

**其他**。copy-paste 模块、markdown 渲染（marked）、sprites 图标、复制表头、`editOnType` 边输边编辑、`cellActivationBehavior`（单击/双击/二次点击激活）、`scaleToRem`、`portalElementRef`。

## 35 个还挂在 issue 上的功能请求

仓库现在有 133 个开放 issue，其中 35 个标了 `type:enhancement`。这些是社区要的、但还没做或没做完的能力。按关注度挑着说。

**分组**。`#823 Group rows API`，30 条评论，Streak（YC S11）2023 年 12 月提的，要的是电子表格那种可折叠行分组。这个诉求其实已经通过 `useRowGrouping` 落地了一大半，但 issue 还开着，说明 API 形态还没让请求方满意。`#837` 要多级列分组，`#985` 要能拖整组列头。

**过滤**。`#396 Column Filters`（9 条评论）和 `#1002 Row filtering`。README 自己说了，过滤排序不做进库，因为很依赖具体数据源，在数据库查询里做更高效。但社区还是想要内置的列过滤器。

**右侧冻结**。`#469`、`#919`、`#957` 都是同一件事，现在只支持左侧冻结列，想要右侧也能钉住。

**新 cell 类型**。`#842` JSON cell，`#846` Code cell，`#843`/`#853` Number cell 的 BigInt 支持，`#966` ImageCell 想改用 string 而不是 string[]，`#904` 想自定义标准 cell 类型。

**交互细节**。`#796` 想用方向键触发编辑（9 条评论），`#658` Tab 想跳到下一行，`#767` 第一列图标绑定事件，`#777` custom cell 里的图标按钮，`#946` 可点击的行标记，`#991` 表头字体和右对齐，`#930` 表头换行，`#805` RTL 支持。

**数据生命周期**。`#394` 粘贴时自动加行，`#994` `useAsyncDataSource` 缓存失效，`#844` 导出 CSV/Excel/PDF 的 hook，`#838` 校验消息展示，`#1012` 禁用表头 prop，`#976` 选择表头 cell 的 API。

## 选型要称一称的地方

维护节奏值得掂量。最新稳定版本是 v6.0.3，2024 年 2 月发布，到现在两年多。package.json 已经到 `6.0.4-alpha25`，稳定版一直没出。2025 年只有零星几个 commit，2026 年到现在只有 1 个（1 月 21 日的 alpha 版本号 bump）。Star 有 5421，但开发节奏明显放缓。对一个要长期依赖的表格组件，这是必须算进去的账。它很成熟，能力清单很长，但你要接受它可能停留在 alpha 迭代，或者哪天被 Glide 的商业优先级挤到后面。

## 关联词

- **glide-data-grid**，Glide 团队开源的 React 数据表格，Canvas 渲染，MIT 协议，约 5421 颗 Star。
- **GridCellKind**，cell 类型枚举，12 种内置类型，custom 是自定义渲染器的逃逸口。
- **useRowGrouping**，行分组的 hook，接受 RowGroupingOptions，支持嵌套和折叠。
- **getCellContent**，数据接入回调，库只要求你按坐标给格子，不关心数据源。
- **freezeColumns**，冻结列 prop，目前只支持左侧。

## 小结

glide-data-grid 把复杂度压进底层，Canvas 渲染换来了滚动性能和百万行能力，代价是格子的一切都得自己画。能力清单覆盖了大部分表格该有的东西，但过滤、右侧冻结、BigInt、JSON/Code cell 这些还在等，35 个功能请求挂着。选它之前，先把维护节奏和这些 gap 一起称一称。

## 参考资料

- [GitHub: glideapps/glide-data-grid](https://github.com/glideapps/glide-data-grid)
- [API 文档](https://grid.glideapps.com/docs/index.html)
- [Storybook](https://quicktype.github.io/glide-data-grid)
- [croc 笔记](/notes/croc/)
- [RAGFlow 笔记](/notes/ragflow/)
