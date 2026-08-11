---
title: "Acorn：JavaScript 生态里那个最不起眼又绕不开的解析器"
description: "Acorn 把 JavaScript 源码变成结构化的 AST，ESLint、Babel、webpack 底层都靠它。讲清楚它怎么工作、为什么能做得这么快，以及你在什么场景下会直接用到它。"
date: "2026-08-11"
type: "writing"
tags: ["JavaScript", "Parser", "AST", "Node.js"]
draft: false
---

写一个 ESLint 插件，配置 Babel 转译 TypeScript，用 webpack 打包的时候让 acorn 报了个语法错误。这三个工具看起来各管各的，但它们的底层解析器可能是同一个东西。

Acorn。一个把 JavaScript 源代码字符串变成抽象语法树（AST）的小模块，GitHub 上 11.4k Stars。Babel 的解析器 @babel/preset-env 底层基于它，ESLint 的默认解析器基于它，UglifyJS 和 webpack 的部分工具链也用了它。

官方就一句话定位。"A tiny, fast JavaScript parser written in JavaScript."

## 一行代码发生了什么

```js
const ast = acorn.parse("1 + 1", { ecmaVersion: 2020 })
```

输入五个字符的源码，输出一棵 ESTree 规范的树。

```json
{
  "type": "Program",
  "start": 0,
  "end": 5,
  "body": [{
    "type": "ExpressionStatement",
    "expression": {
      "type": "BinaryExpression",
      "operator": "+",
      "left": { "type": "Literal", "value": 1 },
      "right": { "type": "Literal", "value": 1 }
    }
  }]
}
```

每个节点有 `type` 标识自己是什么东西。`BinaryExpression` 节点记住了运算符是 `+`，左边是字面量 `1`，右边也是 `1`。顶层是 `Program`，body 里装着语句列表。这棵树就是 JavaScript 代码的完整结构描述，丢掉了空格和注释，保留下所有语法信息。

AST 拿到手以后，遍历、分析、改写代码都有了依据。静态分析工具看这棵树做检查，Babel 看这棵树做转换，minifier 看这棵树做压缩。解析器做的事就是造这棵树。

## 它为什么能这么快

JavaScript 解析器不多。Esprima 起步最早，Acorn 的作者 Marijn Haverbeke（CodeMirror 作者）当年觉得 Esprima 太慢，自己写了一个。后来 Babel 团队也 fork 了 Acorn 出了自己的解析器，但核心算法一脉相承。

Acorn 快的原因比较直接。第一，它只做解析，不做转换。拿到 AST 后的遍历和改写交给 acorn-walk 或者调用方自己处理。第二，模块本身很小，核心包不到 30KB gzipped，没有多余依赖。第三，解析过程只用一次线性扫描，不回溯。

ECMAScript 语法虽然复杂，但解析器不需要处理所有情况。`sourceType` 选项告诉它期望的是 `"script"`、`"module"` 还是 `"commonjs"`，`ecmaVersion` 告诉它支持到哪个标准。范围收窄以后，分支判断少了很多。

```js
const ast = acorn.parse(code, {
  ecmaVersion: "latest",
  sourceType: "module",
  locations: true,
  ranges: true,
  onComment: [],
  onToken: []
})
```

`locations` 给每个节点加上行列号，`ranges` 加上字符区间，`onComment` 和 `onToken` 收集注释和 token。这些选项按需开，不开就有开销。

还有一个实用方法 `parseExpressionAt`。大多数时候需要解析完整文件，但有时候只想从一个偏移位置开始解析一个表达式。

```js
const expr = acorn.parseExpressionAt("a + b * 2", 2, { ecmaVersion: 2020 })
// 从 offset=2 开始，只解析 b * 2
```

模板引擎和代码补全经常用到这个。用户还在打字，编辑器需要知道光标位置那段不完整的文本到底在表达什么。

## 遍历和实战

acorn-walk 是 Acorn 的配套模块，专门递归遍历 AST 节点。

```js
import { walk } from "acorn-walk"

const code = `
function add(a, b) { return a + b }
function sub(a, b) { return a - b }
const mul = (a, b) => a * b
`

const ast = acorn.parse(code, { ecmaVersion: "latest" })

walk.simple(ast, {
  FunctionDeclaration(node) {
    console.log(`函数声明: ${node.id.name}`)
  },
  ArrowFunctionExpression(node) {
    if (node.parent.type === "VariableDeclarator") {
      console.log(`箭头函数: ${node.parent.id.name}`)
    }
  }
})
```

输出是三个函数名。这段代码做的事情很直白，找到所有函数声明和箭头函数赋值，打印它们的名字。

真实场景里，这种遍历能做的事情远不止统计函数。检查未使用的变量、发现 console.log 调用、统计代码复杂度、自动生成文档，原理都是一样的，遍历树，匹配节点类型，拿到信息。

语法错误处理也考虑得很周全。

```js
try {
  acorn.parse("function foo(", { ecmaVersion: 2020 })
} catch (err) {
  console.log(err.message) // Unexpected end of input
  console.log(err.pos)     // 字符偏移
  console.log(err.loc)     // { line: 1, column: 14 }
}
```

报错信息带位置，编辑器拿到 `pos` 或 `loc` 就能把光标跳到出错的地方。IDE 的实时错误提示，底层就是这个机制。

## 什么时候你会直接用它

大多数时候间接用了 Acorn 还不知道，通过 ESLint、Babel 或者 webpack。但有几种场景会直接面对它。

做自定义 lint 规则的时候。ESLint 的自定义规则本质上就是一个 AST visitor，拿到节点以后写判断逻辑。理解 Acorn 的输出结构是写好规则的前提。

做代码转换工具的时候。比如要把所有 `var` 声明改成 `const` 或 `let`，需要遍历 AST，找到 `VariableDeclaration` 节点，改它的 `kind` 属性，再序列化回去。

做编辑器插件的时候。代码补全、语法高亮、错误提示，都需要在用户编辑过程中实时解析。`parseExpressionAt` 能处理不完整的代码片段，这在 IDE 场景下很关键。

做源码分析工具的时候。依赖关系图、代码复杂度度量、自动重构建议，这些工具的起点都是 AST。Acorn 给了起点，acorn-walk 给了遍历能力。

Acorn 在 JavaScript 生态里的位置有点像 Linux 里的 many small tools philosophy。它只做一件事，把代码变成树，做完就交出去。Babel 在这棵树上做转换，ESLint 在这棵树上做检查，webpack 在这棵树上做模块分析。各自处理各自的逻辑，不需要关心解析这件事本身。

这个分工之所以成立，是因为 AST 是一个非常稳定的中间表示。ECMAScript 标准在演进，AST 规范（ESTree）也在跟着更新，但节点类型和树结构的组织方式已经稳定了很多年。写一个 visitor 去匹配 `FunctionDeclaration`，十年前和现在没有本质区别。

这也是 Acorn 能活这么久的原因。它解决的问题足够底层，接口足够简单，性能足够好，替换它带来的收益远不够覆盖迁移成本。于是一个 2012 年左右的项目，到现在仍然是 ESLint 和 Babel 的解析基础。
