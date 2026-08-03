# Projects Section Design

## Goal

让站点展示 ScottWang 正在构建或曾经参与的个人项目，不把“项目”默认等同于开源仓库。页面只呈现主动发布的公开信息，闭源项目可以只展示方向、状态和能力边界。

## Content model

项目使用 `content/projects/*.md` 管理，字段包括：

- `title`, `description`, `status`, `visibility`, `date`
- `stack`: 技术栈数组
- `featured`: 是否出现在首页
- `url`: 可选的项目主页或 Demo
- `repository`: 可选的 GitHub 仓库，仅对开源项目填写

`visibility` 支持 `Open Source`、`Private`、`Closed Source` 和 `Exploring`。未填写链接不会渲染空链接或推测性信息。

## Routes and integration

- `/projects`：项目总览，按更新时间倒序
- `/projects/[slug]`：项目详情，静态生成
- 首页增加精选项目区块
- 项目加入 sitemap、llms.txt 和搜索索引
- 顶部导航增加 Projects

## Design

沿用现有深色网格、绿色信号色和等宽标签。项目卡片使用状态 / 可见性作为第一层信息，开源仓库链接作为可选行动；闭源项目只展示公开描述，不暴露内部代码、客户或敏感业务信息。

## Validation

运行 lint、typecheck、unit tests、production build，并检查项目列表、项目详情、sitemap、llms.txt 和搜索索引。
