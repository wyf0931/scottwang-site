---
title: 'MIT License：世界上最短的开源许可证，但"宽松"不等于"没义务"'
description: 'MIT 是最简单的开源许可证，全文不到 200 字，只有一个核心义务，就是保留版权和许可声明。但"宽松"不等于没有要求，"AS IS"免责声明和商标条款都有边界。iOS、Node.js、React 都在用。'
date: "2026-08-28"
type: "notes"
kind: "note"
tags:
  - 开源
  - License
---

MIT License 是开源世界用得最广的一份许可证。它的名字来自麻省理工学院，但并不是学校官方发布的一份文件。这份模板最早的雏形出现在 20 世纪 70 年代末，X11 窗口系统沿用它之后在图形界面软件社区迅速扩散。1998 年自由软件基金会把它登记为 Expat 许可证，2000 年开放源代码促进会把它标准化为 MIT 许可证，从此成为 SPDX 官方标识符。

全文不到 200 字，分成三段，可以完整背下来。

```
Copyright <YEAR> <COPYRIGHT HOLDER>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

第一段是版权行，写清楚年份和著作权人是谁。第二段是许可声明，把使用权、复制、修改、合并、发布、分发、再许可、销售全部一次性授出去。第三段是免责声明，作者不担保质量，也不承担使用中的责任。

## 唯一义务

MIT 只强制一件事。你在自己的代码里用了 MIT 许可的依赖，就必须把对方的版权行和许可文本一起保留下来。

这条义务看起来轻，但真的被跳过。很多项目打包发布的时候，第三方依赖的 LICENSE 文件在构建过程里被剥离，用户拿到的产物只剩自己那份。严格讲，这已经是违规。商用软件的分发链条里，这条保留义务的漏损率，远高于很多人以为的程度。

## AS IS 免责声明

"AS IS"是法律术语，按原样提供，作者不对质量、适用性、非侵权做任何担保。后面那一长串"作者或版权持有人不会因使用软件而承担任何责任"是配套的责任限制条款，把直接责任、间接责任、特殊责任、附带责任和后果性责任全部排除。

这段文字保护的是软件作者。如果你用了 MIT 许可的代码，出事故后不能反过来向作者索赔。这是双方都需要理解的一半，另一半是你在生产环境部署前得自己承担质量验证。

## 和其他许可证对比

GPL 是强 copyleft 许可证，衍生作品必须沿用同样的许可。你把 GPL 代码合进闭源项目，整个项目就得开源。MIT 完全相反，衍生作品可以闭源、商用、随便发布。

Apache 2.0 比 MIT 长得多。它多了一个显式的专利授权条款，作者明确把专利让出去，用户不用担心将来被告专利侵权。它还要求一个 NOTICE 文件，用来列出第三方贡献者的致谢信息。MIT 这两条都没有。选 MIT 还是 Apache 2.0，很多时候取决于团队对专利风险的态度。

## 谁在用

React 用 MIT，Meta 用它发布所有前端库。Node.js 用 MIT，JavaScript 运行时生态里最主流的选择。jQuery 用 MIT，前端老库里留存率极高的一份。Swift 和 Xcode 用 MIT，苹果自己的核心工具链就是这份许可。GitHub 早期仓库也大量采用 MIT，它和 Apache 2.0 长期并列，是 GitHub 平台使用率最高的两份许可证。

## 常见误解

宽松是相对的。相对于 GPL，MIT 极其宽松，相对于 Apache 2.0，它少了一个专利保护。宽松不等于删除原文就行，也不等于可以拿原项目的商标做营销。商标授权是另一套规则，绝大多数开源许可证都不包含。

## 关联词

- **SPDX**，Software Package Data Exchange 的缩写，SPDX License List 是 SPDX 官方维护的许可证标识符字典，MIT 在其中的 ID 就是 MIT。
- **OSI**，Open Source Initiative，开放源代码促进会，MIT 是 OSI 认证的开源许可证。
- **Expat**，MIT 许可证的另一个名字，来自它早期出现在 Expat 项目的 LICENSE 文件里。
- **Copyleft**，GPL 的强制继承机制，衍生作品必须沿用同样的许可证。MIT 没有这个要求。
- **NOTICE**，Apache 2.0 特有的第三方致谢文件，MIT 没有对应的强制机制。
- **Patent Grant**，专利授权条款，Apache 2.0 有显式条款，MIT 没有。
- **Trademark**，商标授权，开源许可证一般不包含商标授权，需要看单独的政策。
- **Open Source License**，开源许可证的统称，OSI 官方维护约 70 份认证许可证，MIT 是最简短的一份。

## 小结

MIT 许可证是 OSI 认证的开源许可证里最短的一份，全文约 200 字，唯一强制义务是保留版权和许可声明。宽松是相对于 GPL 而言的，它和 Apache 2.0 之间的差别集中在专利授权和 NOTICE 机制上。用 MIT 依赖之前，确认分发链路里 LICENSE 文件真的被保留，是这份许可里最值得花一分钟检查的一件事。

## 参考资料

- [OSI：MIT License](https://opensource.org/license/mit)
- [SPDX License List：MIT](https://spdx.org/licenses/MIT.html)
- [Wikipedia：MIT License](https://en.wikipedia.org/wiki/MIT_License)
