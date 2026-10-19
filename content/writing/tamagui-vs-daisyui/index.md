---
title: "Tamagui 和 DaisyUI 的架构选型笔记"
description: "两个 CSS 方案，两种架构哲学。从前端架构师选型角度，拆解 DaisyUI 的零运行时 CSS 路线和 Tamagui 的编译时优化路线。"
date: "2026-10-19"
type: "writing"
tags: ["TypeScript", "CSS", "React", "React Native", "Tailwind", "UI Framework"]
draft: false
---

## 两个极端

我最近在看 DaisyUI 和 Tamagui 的项目，这两个库经常被放在一起比较，但它们的架构思路几乎是两个极端。

DaisyUI 的官方描述是 "The most popular, free and open-source Tailwind CSS component library"，GitHub 上 4.2 万 stars，周下载量 66 万。Tamagui 的描述是 "Style React fast with 100% parity on React Native, an optional UI kit, and optimizing compiler"，1.4 万 stars，周下载量约 28 万。

星数差了三倍，但决定架构选型的是它们解决的根本问题。

## DaisyUI 做了一件很轻的事

DaisyUI 的核心思路只有一个，给 Tailwind CSS 加一层组件级语义类。

你用 `class="btn btn-primary"` 就能得到一个按钮，用 `class="card card-bordered"` 得到一个带边框的卡片。没有 JavaScript 运行时，没有编译步骤，它就是 CSS。

源码里只有四个目录，`base`、`components`、`themes`、`utilities`。61 个组件，35 个主题，全是 CSS 文件。它的工作方式是扩展 Tailwind 的 CSS 变量系统，让 `btn-primary` 这类类名背后是一套颜色变量，主题切换就变成切换变量。

```css
/* DaisyUI 的 btn-primary 本质上是这样 */
.btn-primary {
  --btn-color: var(--p);
  --btn-color-mix: var(--pn);
}
```

这种设计的代价很小。没有 JS 包体，没有编译依赖，构建管道不需要改动。任何用了 Tailwind 的框架都能直接接上，React、Vue、Svelte、Solid、Angular 都行。DaisyUI 自己用 SvelteKit 写文档站，但它生成的 CSS 跟框架没关系。

适合的场景也很明确，纯 Web 项目，需要快速出 UI，不想被框架绑死。你已经在用 Tailwind，想要现成的组件样式但不想写一堆 utility class 拼按钮，DaisyUI 就是最直接的方案。

## Tamagui 做了一件重的事

Tamagui 的复杂度高出一个量级。

它的 monorepo 里有 14 个 packages，光 `code/compiler` 下面就有 10 个子目录。编译器核心用 Rust 写的，仓库里 Rust 代码 24 万行，还有 C++ 代码 3.6 万行。TypeScript 代码 1400 万行，占了绝大部分，但编译器这条线是实打实的系统级工程。

Tamagui 分三层。`@tamagui/core` 是样式引擎，提供 styled 组件和样式 props。`@tamagui/static` 是优化编译器，在构建时把 styled 组件编译成平台特定代码。`tamagui` 是 UI kit，提供跨平台的组件库。

编译器的核心逻辑是这样的。在 Web 端，一个 styled 组件经过编译后变成一个普通 `div` 加上一堆原子 CSS class。在 React Native 端，同一个组件编译成 `View`，样式对象被提升到模块级别。官方文档举了一个例子，Tamagui 自己的首页上大约 55 个内联 styled 组件，编译器把其中 49 个压成了 `div`，Lighthouse 得分提升了将近 15%。

```tsx
// Tamagui 源码，同一个组件跨平台
const Card = styled(View, {
  padding: 16,
  backgroundColor: '$background',
  borderRadius: 8,
  '@media (min-width: 768px)': {
    padding: 24,
  },
})
```

这个 `View` 在 Web 上变成 `div`，在 Native 上变成原生视图。样式在构建时就被解析、分类、优化，运行时只做最小必要工作。

但代价也在这里。Tamagui 只支持 React 和 React Native，Vue 和 Svelte 用户没有入场券。构建管道需要接入 Tamagui 的编译器插件，Vite、Next.js、Metro 各有对应的 plugin。学习曲线比 DaisyUI 陡得多，你不光要理解样式系统，还要理解编译器的工作方式。

## 架构哲学的分野

把这两个项目放在一起看，它们对样式系统边界的理解差了很远。

DaisyUI 认为样式系统应该尽可能薄。CSS 能解决的就不需要 JS，构建时能处理完的就别留到运行时。组件不携带逻辑，样式和结构完全解耦。你拿到的是一个类名，至于这个类名渲染成什么，浏览器决定。

Tamagui 认为样式系统应该尽可能完整。它把样式、布局、响应式、主题、组件封装成一个类型安全的整体，而且不区分 Web 和 Native。编译器的逻辑是把运行时复杂度转移到构建时，让运行时只做平台特定的最优输出。

两种思路都有道理，也都有代价。

DaisyUI 的代价是天花板低。它只能处理 CSS 能处理的问题，复杂的交互状态、动效编排、跨平台差异都得在 JS 层解决。你写一个带展开动画的抽屉，DaisyUI 给你 CSS 变量和 class，展开动画怎么做到流畅，那是你自己的事。

Tamagui 的代价是引入成本。编译器插件、TypeScript 配置、styled 组件的调试，每一环都比写几个 CSS class 麻烦。如果你只是一个纯 Web 项目，不需要跨平台，Tamagui 的编译器和跨平台抽象是纯粹的额外负担。

## 选型怎么判断

我整理了一个简单的判断框架，基于项目场景而不是技术偏好。

如果你的项目是这样的，选 DaisyUI，纯 Web，技术栈已经包含 Tailwind，需要快速出 UI，团队不想被框架锁定，UI 复杂度中等偏低，组件行为主要靠 CSS 就能实现。

如果项目是这样的，选 Tamagui，需要 Web 和 React Native 共用代码，UI 复杂度高，响应式和状态密集，团队有 TypeScript 深度，愿意投入构建管道的复杂度换取开发效率和运行时性能。

有一个中间地带值得注意。如果你只是用 React，不跨 Native，但想要比 Tailwind 更强的组件抽象，DaisyUI 配合 Headless UI 或者 Radix UI 可能更灵活。Tamagui 自带的 UI kit 是一个选择，但 Radix UI 的生态更广，无头组件模式更纯粹。

## 一个容易忽略的点

DaisyUI 5.x 在 2026 年 9 月发布了，从 v4 到 v5 是一次大版本迭代。它现在支持 Tailwind CSS v4 的配置方式，主题系统也有重构。66 万周下载量的增长说明它的用户基础在持续扩大，社区活跃度维持在高位，308 位贡献者。

Tamagui 这边的节奏更密集。v3.0 从 10 月 14 日一路小版本迭代到 10 月 18 日，五天出了五个 patch。242 位贡献者，编译器用 Rust 重写是近年的主要工程投入。

两个项目都在活跃维护，不存在"一个已经没人管了"的风险。选型的决定性因素还是你的项目需要什么，而不是哪个更"新"。

架构选型是在两个合理的约束之间找一个匹配。DaisyUI 的约束是薄和通用，Tamagui 的约束是深和统一。看清楚自己项目的约束，答案就清楚了。
