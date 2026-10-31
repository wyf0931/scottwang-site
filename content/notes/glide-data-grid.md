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

**导入导出的边界要分清**。文件层面的导入导出没有内建 API。CSV/Excel 文件得自己解析（SheetJS、PapaParse 这类），再把数据喂给 `getCellContent`，没有 `loadFile` 这种入口。文件导出同样没有，`#844` 提议的 `useCsvExport`、`useExcelExport`、`usePdfExport` 三个 hook 还挂在 issue 上。内建的是剪贴板互操作，Copy 走 `getCellsForSelection`，Paste 走 `onPaste`，自动解析粘贴缓冲、触发 `onCellEdited`，`coercePasteValue` 做值转换，和 Excel 复制粘贴格式互通。也就是说，要的是「用户点按钮下载 Excel/CSV 文件」，得自己写；要的是「和 Excel 之间复制粘贴」，开箱即用。

**其他**。copy-paste 模块、markdown 渲染（marked）、sprites 图标、复制表头、`editOnType` 边输边编辑、`cellActivationBehavior`（单击/双击/二次点击激活）、`scaleToRem`、`portalElementRef`。

## 35 个还挂在 issue 上的功能请求

仓库现在有 133 个开放 issue，其中 35 个标了 `type:enhancement`。这些是社区要的、但还没做或没做完的能力。按关注度挑着说。

**分组**。`#823 Group rows API`，30 条评论，Streak（YC S11）2023 年 12 月提的，要的是电子表格那种可折叠行分组。这个诉求其实已经通过 `useRowGrouping` 落地了一大半，但 issue 还开着，说明 API 形态还没让请求方满意。`#837` 要多级列分组，`#985` 要能拖整组列头。

**过滤**。`#396 Column Filters`（9 条评论）和 `#1002 Row filtering`。README 自己说了，过滤排序不做进库，因为很依赖具体数据源，在数据库查询里做更高效。但社区还是想要内置的列过滤器。

**右侧冻结**。`#469`、`#919`、`#957` 都是同一件事，现在只支持左侧冻结列，想要右侧也能钉住。

**新 cell 类型**。`#842` JSON cell，`#846` Code cell，`#843`/`#853` Number cell 的 BigInt 支持，`#966` ImageCell 想改用 string 而不是 string[]，`#904` 想自定义标准 cell 类型。

**交互细节**。`#796` 想用方向键触发编辑（9 条评论），`#658` Tab 想跳到下一行，`#767` 第一列图标绑定事件，`#777` custom cell 里的图标按钮，`#946` 可点击的行标记，`#991` 表头字体和右对齐，`#930` 表头换行，`#805` RTL 支持。

**数据生命周期**。`#394` 粘贴时自动加行，`#994` `useAsyncDataSource` 缓存失效，`#844` 导出 CSV/Excel/PDF 的 hook，`#838` 校验消息展示，`#1012` 禁用表头 prop，`#976` 选择表头 cell 的 API。

## 真实应用场景

这个库在 HN 上只被提过两次，都是 1 分的小帖子，但 npm 的周下载量有 57.8 万，说明它是被大量项目静默依赖的工作马，不是社区明星。两者放在一起看，才是它真实的采用状态。

最硬的一个案例是 **analytics-grid**，2026 年 5 月的 Show HN 帖子标题就是「1B rows (14B cells) in the browser with DuckDB and Glide Data Grid」。作者说这是一个电池齐全的报告分析表格，引擎可换（demo 用 DuckDB），渲染层建在 Glide Data Grid 的一个 fork 上。帖子下的社区反应很真实，有人直接质疑「把 10 亿行全加载进浏览器是在解决什么问题，分页才是正道」。这是它被拿去做超大数据集产品的最直接证据。

**Infinite Pixels**（HN 44824056，250 分，2025 年 8 月）那场讨论里，有人把 Glide 和 TanStack Virtual 并列为「无限数据网格」的两个参考实现，说明这类库的实现方式（一个大滚动 DIV 加 viewport）已经是社区公认的范式。同一帖子里也确认了它和 TanStack 一样，底层是撑一个超高 DIV 来获得原生滚动条手感。

在无障碍方向上，2022 年 Datagridxl2.js 的作者公开拿 Glide 说事，原话是「Glide Data Grid 有完整可访问的 DOM 子树，用 Canvas 不一定要牺牲无障碍」，等于把它当成 canvas 网格无障碍的天花板。

Glide 团队自己也会在 r/reactjs 发版本公告，从 2021 年 1 月的「We are open sourcing our fast React Data Grid component」，到 2022 年 5 月的 4.0，再到 2024 年 1 月的 6.0，四次都有人跟帖。Teable（开源无代码数据库）上线时也有人专门问「和 Glide 的 data-grid 差在哪」。这些都是它在真实产品语境里被拿来比较的证据。

## 同类项目横向对比

数据网格是个拥挤的赛道，选型要先分清两类，DOM 渲染和 Canvas 渲染。

| 项目 | 渲染 | 授权 | 关键特色 |
|---|---|---|---|
| **glide-data-grid** | Canvas | MIT | 12 种 cell、自定义 Canvas 渲染器、百万行 |
| AG Grid | DOM | MIT 社区 + Enterprise 付费 | 服务器端操作、Excel 透视、master-detail 在 Enterprise |
| TanStack Table | 无头 | MIT | 不渲染 UI，配 TanStack Virtual 虚拟化 |
| MUI X DataGrid | DOM | open-core，核心 MIT，Pro 付费 | 多过滤、多排序、列钉住 |
| Comcast/react-data-grid | DOM | MIT | 虚拟化、冻结列、列分组、多列排序 |
| revogrid | Canvas | MIT | Web Component 框架无关，分组、透视 |
| rowsncolumns/grid | Canvas | MIT | 声明式 React Canvas 透视表，2023 年后停更 |

DOM 派是主流。AG Grid（15.7k star）功能最全，服务器端操作、Excel 式透视、master-detail 都在 Enterprise 版。MUI X DataGrid（5.9k）走 open-core，核心 MIT，Pro 版才有多过滤、多排序、列钉住。TanStack Table（28.5k）是反过来的，无头，不渲染，你拿它接自己的 UI。Comcast/react-data-grid（7.7k）是纯 DOM 的 React 实现，虚拟化、冻结列、列分组、多列排序都内置。Handsontable（22k）是电子表格观感，商业授权。

Canvas 派是少数派，但都冲着同一个目标，用画布绕开 DOM 性能墙。glide-data-grid 是 React 生态里最完整的 Canvas 网格。revogrid（3.5k）是 Web Component，框架无关，分组、透视都有。rowsncolumns/grid（635）是声明式 React Canvas 网格，能画透视表，但 2023 年 10 月后就没再更新。canvas-datagrid（1.6k）是最早的 canvas 网格之一，BSD 协议。SlickGrid（6.9k）是 jQuery 时代的经典快速网格，还在但节奏慢。

横向看，Glide 的定位是免费、高上限、Canvas 全控制。DOM 派把排序过滤做进库里，但到不了它的行数上限。商业派功能最全，但高级功能要钱。Glide 选了另一头，性能上限给到最大，代价是排序过滤这类活得你自己实现，而且维护节奏在放缓。选型的时候，这个权衡要先想清楚。

## 选型要称一称的地方

维护节奏值得掂量。最新稳定版本是 v6.0.3，2024 年 2 月发布，到现在两年多。package.json 已经到 `6.0.4-alpha25`，稳定版一直没出。2025 年只有零星几个 commit，2026 年到现在只有 1 个（1 月 21 日的 alpha 版本号 bump）。Star 有 5421，但开发节奏明显放缓。对一个要长期依赖的表格组件，这是必须算进去的账。它很成熟，能力清单很长，但你要接受它可能停留在 alpha 迭代，或者哪天被 Glide 的商业优先级挤到后面。

## 关联词

- **glide-data-grid**，Glide 团队开源的 React 数据表格，Canvas 渲染，MIT 协议，约 5421 颗 Star。
- **GridCellKind**，cell 类型枚举，12 种内置类型，custom 是自定义渲染器的逃逸口。
- **useRowGrouping**，行分组的 hook，接受 RowGroupingOptions，支持嵌套和折叠。
- **getCellContent**，数据接入回调，库只要求你按坐标给格子，不关心数据源。
- **freezeColumns**，冻结列 prop，目前只支持左侧。
- **analytics-grid**，真实案例，DuckDB 引擎加 Glide Data Grid 的 fork，宣称能撑 10 亿行。
- **AG Grid**，DOM 渲染数据网格，功能最全，Enterprise 版付费。
- **TanStack Table**，无头表格库，不渲染 UI，配 TanStack Virtual 做虚拟化。
- **npm 周下载**，57.8 万，采用率远超它在 HN 上的讨论热度。

## 小结

glide-data-grid 把复杂度压进底层，Canvas 渲染换来了滚动性能和百万行能力，代价是格子的一切都得自己画。能力清单覆盖了大部分表格该有的东西，但过滤、右侧冻结、BigInt、JSON/Code cell 这些还在等，35 个功能请求挂着。npm 周下载 57.8 万说明它是被大量项目依赖的工作马，但 HN 上几乎没人讨论，维护节奏也在放缓。选它之前，先把维护节奏、功能 gap 和 Canvas 派的窄赛道一起称一称。

## 参考资料

- [GitHub: glideapps/glide-data-grid](https://github.com/glideapps/glide-data-grid)
- [API 文档](https://grid.glideapps.com/docs/index.html)
- [Storybook](https://quicktype.github.io/glide-data-grid)
- [analytics-grid（Show HN，10 亿行案例）](https://analytics-grid.com/)
- [Infinite Pixels 讨论（HN 44824056）](https://news.ycombinator.com/item?id=44824056)
- [r/reactjs 开源公告（2021-01）](https://www.reddit.com/r/reactjs/comments/l2995f/)
- [AG Grid](https://github.com/ag-grid/ag-grid)
- [TanStack Table](https://github.com/TanStack/table)
- [MUI X](https://github.com/mui/mui-x)
- [Comcast/react-data-grid](https://github.com/adazzle/react-data-grid)
- [revogrid](https://github.com/revolist/revogrid)
- [croc 笔记](/notes/croc/)
- [RAGFlow 笔记](/notes/ragflow/)
