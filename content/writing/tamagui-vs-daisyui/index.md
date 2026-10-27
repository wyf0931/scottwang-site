---
title: "Tamagui、DaisyUI 和 Arc 的架构选型笔记"
description: "三个 CSS 方案，三种架构哲学。从前端架构师选型角度，拆解 DaisyUI 的零运行时 CSS 路线、Tamagui 的编译时优化路线，以及 Arc 的代码复制路线。"
date: "2026-10-19"
type: "writing"
kind: "essay"
tags: ["TypeScript", "CSS", "React", "React Native", "Tailwind", "UI Framework"]
draft: false
---

## 三个方向

我最近在看三个 React UI 方案的源码，它们的架构思路差得很远。DaisyUI 把样式系统做到极致薄，Tamagui 用编译器做到极致深，Arc 走的是中间一条路，代码直接复制到项目里，你拿到的是组件源码本身。

DaisyUI 的官方描述是 "The most popular, free and open-source Tailwind CSS component library"，GitHub 4.2 万 stars，周下载量 66 万。Tamagui 的描述是 "Style React fast with 100% parity on React Native, an optional UI kit, and optimizing compiler"，1.4 万 stars，周下载量约 28 万。Arc 是 2026 年 9 月 24 日创建的项目，v1.0.0 在 9 月 29 日发布，到现在不到一个月，827 stars，还没有 npm 包，通过 shadcn CLI 分发。

星数差了五十倍，社区规模根本不在一个量级。但架构选型看的是根本问题，不是热度。

## DaisyUI，最薄的一层

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

## Tamagui，最重的一层

Tamagui 的复杂度高出一个量级。

它的 monorepo 里有 14 个 packages，光 `code/compiler` 下面就有 10 个子目录。编译器核心用 Rust 写的，仓库里 Rust 代码约 6,600 行，还有约 1,200 行 C++。TypeScript 代码约 50 万行占了绝大部分，但编译器这条线是实打实的系统级工程。

Tamagui 分三层。`@tamagui/core` 是样式引擎，提供 styled 组件和样式 props。`@tamagui/static` 是优化编译器，在构建时把 styled 组件编译成平台特定代码。`tamagui` 是 UI kit，提供跨平台的组件库。

编译器的做法是这样的。在 Web 端，一个 styled 组件经过编译后变成一个普通 `div` 加上一堆原子 CSS class。在 React Native 端，同一个组件编译成 `View`，样式对象被提升到模块级别。官方文档举了一个例子，Tamagui 自己的首页上大约 55 个内联 styled 组件，编译器把其中 49 个压成了 `div`，Lighthouse 得分提升了将近 15%。

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

## Arc，把代码交给你

Arc 走的是第三条路。它不发布 npm 包，不用 CSS-in-JS，不用编译器插件。它的分发方式是 shadcn CLI，运行 `npx shadcn add @uiarc/button` 就把组件源码复制进你的项目目录。或者你直接去 GitHub 把文件拷过来，都一样。

这意味着组件代码就是你自己的代码。改样式、改动画、改逻辑，不用去看库的 issue 或者提 PR。源码在 `registry/` 目录下，114 个组件、22 个 blocks，全部是 TypeScript 文件加 CSS Modules。

技术栈上，Arc 用了几个有意思的选择。底座是 Radix UI，10 个 `@radix-ui/react-*` 包做无头组件。动效引擎是 Motion（motion.dev），所有动画通过一个 `motion-tokens.ts` 统一管理。

```ts
export const motionTokens = {
  duration: { instant: 0.12, fast: 0.16, exit: 0.18, standard: 0.24, considered: 0.48 },
  ease: {
    enter: [0.16, 1, 0.3, 1],
    exit: [0.7, 0, 0.84, 0],
    standard: [0.22, 1, 0.36, 1],
  },
  spring: {
    responsive: { type: "spring", stiffness: 520, damping: 38 },
    gentle: { type: "spring", stiffness: 340, damping: 34 },
    snappy: { type: "spring", visualDuration: 0.26, bounce: 0.12 },
    smooth: { type: "spring", visualDuration: 0.4, bounce: 0 },
    morph: { type: "spring", visualDuration: 0.42, bounce: 0.16 },
  },
} as const;
```

颜色系统用 OKLCH 做 CSS 变量，`foundation.css` 里定义了一套从 `--neutral-0` 到 `--neutral-11` 的灰度阶梯，加上 accent、success、warning、danger 这些语义色。阴影分三层，resting、raised、floating。全部用 `color-mix(in oklab, ...)` 做动态混合，不需要 Tailwind。

DaisyUI 是 Tailwind 的插件，Arc 完全独立。你不用 Tailwind 也能用 Arc，它自带 `foundation.css` 搞定基础样式，组件用 CSS Modules 做隔离。

114 个组件的覆盖面比 DaisyUI 的 61 个宽得多，而且很多组件 DaisyUI 没有，比如 `command-palette`、`chat-thread`、`brush-chart`、`activity-heatmap`。Arc 还额外提供了 22 个 blocks，是带交互的复合组件，可以直接用到产品里。

## 三个方向的分野

DaisyUI 认为样式系统应该尽可能薄。CSS 能解决的就不需要 JS，构建时能处理完的就别留到运行时。组件不携带逻辑，样式和结构完全解耦。你拿到的是一个类名，至于这个类名渲染成什么，浏览器决定。

Tamagui 认为样式系统应该尽可能完整。它把样式、布局、响应式、主题、组件封装成一个类型安全的整体，而且不区分 Web 和 Native。编译器的逻辑是把运行时复杂度转移到构建时，让运行时只做平台特定的最优输出。

Arc 认为样式系统的边界应该在项目边界内。组件是源码不是依赖，设计 token 是项目的一部分，动效参数应该像业务配置一样可以随手改。它不试图提供跨框架或跨平台的抽象，它只做一件事，把 React 组件做到好用。

## 各自的代价

DaisyUI 的代价是天花板低。它只能处理 CSS 能处理的问题，复杂的交互状态、动效编排、跨平台差异都得在 JS 层解决。你写一个带展开动画的抽屉，DaisyUI 给你 CSS 变量和 class，展开动画怎么做到流畅，那是你自己的事。

Tamagui 的代价是引入成本。编译器插件、TypeScript 配置、styled 组件的调试，每一环都比写几个 CSS class 麻烦。如果你只是一个纯 Web 项目，不需要跨平台，Tamagui 的编译器和跨平台抽象是纯粹的额外负担。

Arc 的代价是维护负担。138 个条目全部在你项目里，每个组件的 CSS Modules 和 TSX 都是你自己在管。好处是自由，坏处是升级靠手动同步。项目才一个月，没有 npm 包，没有语义化版本管理，你复制进来的代码跟上游之间的版本关系全靠你自己记。827 个 stars 和 38 个 forks 说明社区还在早期，文档和工具链的成熟度需要时间验证。

另外一点，Arc 不支持 React Native，只支持 React。如果你的项目需要跨端，Arc 不在选项里。

## 选型怎么判断

基于项目场景而不是技术偏好。

纯 Web，已经在用 Tailwind，需要快速出 UI，团队不想被框架锁定，UI 复杂度中等偏低，选 DaisyUI。它是三个里引入成本最低的，CSS 层的改动不影响运行时。

需要 Web 和 React Native 共用代码，UI 复杂度高，响应式和状态密集，团队有 TypeScript 深度，愿意投入构建管道的复杂度换取开发效率和运行时性能，选 Tamagui。

纯 Web React 项目，对动效和设计品质要求高，不想被框架锁死，愿意把组件源码拿在手里自己管，选 Arc。它的 motion-tokens 和 OKLCH token 系统设计得相当讲究，适合做产品级 UI 而不是后台管理。

有一个中间地带值得注意。如果你只是用 React，不跨 Native，但想要比 Tailwind 更强的组件抽象，DaisyUI 配合 Radix UI 可能更灵活。Tamagui 自带的 UI kit 是一个选择，Arc 本质上也是 Radix UI 加 CSS Modules 的组合，但多了动效设计和 block 组件。

## 一个容易忽略的点

DaisyUI 5.x 在 2026 年 9 月发布了，从 v4 到 v5 是一次大版本迭代。它现在支持 Tailwind CSS v4 的配置方式，主题系统也有重构。66 万周下载量的增长说明它的用户基础在持续扩大，社区活跃度维持在高位，308 位贡献者。

Tamagui 这边的节奏更密集。v3.0 从 10 月 14 日一路小版本迭代到 10 月 18 日，五天出了五个 patch。242 位贡献者，编译器用 Rust 重写是近年的主要工程投入。

Arc 是一个月内从零到 v1.0.0 的项目，827 个 stars、38 个 forks、114 个组件全部在一个 release 里交付。这个速度说明作者有相当成熟的工程积累，但也意味着项目还处于非常早期的阶段。MIT 协议，`@uiarc` shadcn registry 已经上线，但 Pro 版组件不在这个仓库里。

三个项目都在活跃维护，不存在"已经没人管了"的风险。Arc 的风险不在维护，在成熟度。

架构选型是在两个合理的约束之间找一个匹配。DaisyUI 的约束是薄和通用，Tamagui 的约束是深和统一，Arc 的约束是自主和品质。看清楚自己项目的约束，答案就清楚了。
