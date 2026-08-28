---
title: "Apache 2.0：宽松许可里给企业加了一层专利保护"
description: 'Apache 2.0 是最常见的宽松许可证之一。允许商用、闭源、任意修改，但附加了专利保护条款和 NOTICE 文件机制。Android、Kubernetes、TensorFlow、Spring Boot 都用它。'
date: "2026-08-28"
type: "notes"
kind: "note"
tags:
  - 开源
  - License
---

**Apache License Version 2.0** 是 Apache Software Foundation 在 2004 年 1 月 25 日发布的一份开源许可证，SPDX 官方标识符是 Apache-2.0。它诞生在 GPL 主导开源世界的那段时期，目标是给企业用户提供一份比 MIT 多一层保险、又比 GPL 松得多的许可。十几年过去，它成了 GitHub 平台上最主流的开源许可证之一，Android、Kubernetes、TensorFlow、Spring Boot 都挂在它的名下。

## 条款长什么样

Apache 2.0 一共 9 条，前两条讲基础定义和版权许可，Section 3 讲专利许可，Section 4 讲重分发，Section 5 讲贡献提交，Section 6 讲商标，Section 7 到 Section 9 处理免责声明、责任限制和担保。整份文件比 MIT 长得多，但也只有 MIT 的十倍左右，读完并不费力。

Section 1 定义了六组术语，Source、Object、Work、Derivative Works、Contribution、Contributor。它有一条容易被忽略的边界，只是链接到 Work 接口的作品不算 Derivative Works，这个界定在 GPL 里不存在，也是 Apache 2.0 更宽容的地方之一。Section 2 是版权授权，每个 Contributor 授予用户永久、全球、免费、免版税、不可撤销的版权许可，条款措辞非常直接。

## Section 3 是核心

Section 3 处理专利，是 Apache 2.0 和 MIT 拉开差距的关键一条。原文写的是，每个 Contributor 授予用户不可撤销的专利许可，允许用户制造、使用、许诺销售、销售和进口包含 Contribution 的物品。这条的正面作用是显式专利授权，用户不用担心将来贡献者反咬一口告专利侵权。

反面是它带一个对等的约束，如果你针对这份 Work 发起专利诉讼，指控它直接侵犯你的专利，你从本许可证获得的专利许可会终止。这是典型的"你告我，我就收专利授权"的写法，在宽松许可里算是相当强硬的条款。MIT 完全没有这一条，用户用了 MIT 代码之后，贡献者的专利授权状态在法律上是不明确的。

## Section 4 是重分发义务

Section 4 把重分发拆成四项具体要求。第一是给其他接收者许可证副本，第二是修改过的文件要标注你改了，第三是保留所有版权、专利、商标和归属声明，第四是如果原 Work 带了 NOTICE 文件，你必须把其中的归属声明保留下来。

NOTICE 是 Apache 2.0 独有的机制。它是一份纯文本文件，通常和项目根目录的 LICENSE 并列存在，列出原项目作者、第三方依赖的版权信息、以及作者希望使用者看到的致谢文字。你在发布衍生版本时，如果原项目有 NOTICE，就必须把它保留或者合并到自己的 NOTICE 里。这条义务比 MIT 的"保留 LICENSE"稍重一点，因为它要求你主动维护一份致谢清单。

## 实际使用场景

Apache 2.0 在企业级基础设施项目里用得特别多。Kubernetes 用 Apache 2.0，Google 主导、Linux 基金会托管的云原生编排平台，几乎所有容器化项目都靠它。TensorFlow 用 Apache 2.0，Google 的开源深度学习框架，商用分发链条很长。Spring Boot 用 Apache 2.0，Pivotal 和 VMware 主导的 Java 生态事实标准。Android 平台的源代码也是 Apache 2.0，这一点在 AOSP 仓库里可以逐条看到。

原因很直接，这些项目都需要大量企业贡献者参与，贡献者所在公司担心专利风险，Apache 2.0 的显式专利授权给了他们一个可以写进法务审查报告的条款。相比之下，MIT 在法律团队眼里过于宽松到不保险，GPL 又过于严格到企业不愿意碰。

## 常见误解

一种是以为"宽松许可意味着没要求"。Apache 2.0 允许闭源和商用，但保留许可证副本、标注修改、保留 NOTICE 三项义务一项都少不了，跳过就是违规。

另一种是以为"专利诉讼条款对我没影响，因为我永远不会起诉任何公司"。这条约束只在真正发起诉讼时才触发，日常使用不会碰到，但一旦你的产品被指控专利侵权，反诉时就要重新算一笔账。

还有一种是混淆了 Apache 2.0 和 GPL 的兼容性。Apache 2.0 和 GPL 是单向兼容，Apache 2.0 的代码可以合入 GPL 项目，GPL 的代码不能合入 Apache 2.0 项目。这个方向性在依赖决策时经常被忽略，导致一些项目明明想用 Apache 2.0，实际却被间接传染成了 GPL。

## 关联词

- **Apache 2.0**，Apache Software Foundation 2004 年发布的宽松许可证，SPDX ID 为 Apache-2.0。
- **Section 3**，Apache 2.0 里的专利许可条款，显式授予专利，并对提专利诉讼的行为附带约束。
- **NOTICE**，Apache 2.0 独有的第三方致谢文件，重分发时必须保留其中的归属声明。
- **SPDX**，Software Package Data Exchange，SPDX License List 是 SPDX 官方维护的许可证标识符字典。
- **OSI**，Open Source Initiative，Apache 2.0 是 OSI 认证的开源许可证。
- **Patent Grant**，显式专利授权，Apache 2.0 有，MIT 没有。
- **Derivative Works**，衍生作品，Apache 2.0 明确排除了仅链接接口的场景。
- **Copyleft**，GPL 的强制继承机制，Apache 2.0 不属于 copyleft 家族。

## 小结

Apache 2.0 是宽松许可证里对法务团队最友好的一份。它保留了 MIT 那种允许闭源、允许商用的核心姿态，又通过 Section 3 的显式专利授权和 Section 4 的 NOTICE 机制补上了 MIT 缺的两块短板。真正使用它的项目，合规成本主要在维护一份准确的 NOTICE 文件，专利风险可以量化，但日常维护义务不会缺席。选它还是选 MIT，看团队对专利风险的容忍度，选它还是选 GPL，看项目愿不愿意放弃闭源发布。

## 参考资料

- [Apache License 2.0 官方文本](https://www.apache.org/licenses/LICENSE-2.0.txt)
- [OSI：Apache License 2.0](https://opensource.org/license/apache-2-0)
- [Wikipedia：Apache License](https://en.wikipedia.org/wiki/Apache_License)
