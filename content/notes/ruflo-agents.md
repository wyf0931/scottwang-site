---
title: "Ruflo 的 98 个 Agent 全清单"
description: "把 Ruflo 仓库自带的 98 个专精 Agent 按类别全列一遍，说明每个负责什么、依赖什么、什么场景下会被调用。"
date: "2026-09-10"
kind: "note"
tags: [AI, Agent, 开源项目]
---

前一篇写过 Ruflo 的定位，模型之外的骨架，Agent 等于 Model 加 Harness。这篇文章只做一件事，把 Ruflo 仓库自带的 98 个专精 Agent 全列一遍，让读者有个具体抓手。数字来源是仓库里 `v3/@claude-flow/mcp/.claude/agents/` 目录下的 98 个 Markdown 文件，代码里在 `init.ts` 的 ADR-128 Phase 3 里也硬编码了 98 这个数字。

顺便说一个坑。仓库里有一批 agent 是"重复注册"的，比如 `analysis/analyze-code-quality.md` 和 `analysis/code-review/analyze-code-quality.md` 内容几乎一样，一个是 v1.0.0，一个是历史迁移过来的。98 里包含了这些重复项，实际"能干活的不同角色"大概在 70 到 80 之间。列在下面的是所有 98 个文件，重复项会标注。

## Core，5 个骨架角色

Ruflo 的默认底座。用户 `npx ruflo init` 不指定参数时，就是这一组先被加载。

- **planner**，任务规划调度官，把大任务拆成子任务、算依赖、分配资源。是其他 Agent 的上游。
- **coder**，实施工程师，写代码、重构、优化。带自学习能力，从 ReasoningBank 里调以前成功的模式。
- **reviewer**，代码审查员，安全审计、性能分析、最佳实践检查。
- **tester**，测试工程师，单测、集成、E2E、性能、安全测试全套。
- **researcher**，调研员，代码分析、依赖追踪、文档调研。

这 5 个都有 v2.0.0-alpha 的"自学习四件套"，self_learning、context_enhancement、fast_processing、smart_coordination，本质是给每个 Agent 都接上了 ReasoningBank、GNN 搜索、Flash Attention、MoE 路由。

## Templates，9 个可复用模板

不是给某个具体任务用的，是给别人做 Agent 时的模板。想让团队自己造 Agent，先从这里抄。

- **task-orchestrator**，任务分解中枢，处理依赖管理、结果聚合。
- **sparc-coord**，SPARC 方法论的编排器，管五个阶段的推进。
- **swarm-init**，Swarm 拓扑初始化和资源分配。
- **memory-coordinator**，跨会话记忆管理，命名空间协调。
- **smart-agent**，按能力匹配动态孵化 Agent，负载预测加自动扩容。
- **pr-manager**，Pull Request 全生命周期模板。
- **sparc-coder**，把规范翻译成代码，带 TDD。
- **perf-analyzer**，工作流瓶颈分析模板。
- **base-template-generator**，给新组件、新 API、新项目生成骨架代码。

## SPARC，4 个阶段专家

SPARC 是 Ruflo 主推的方法论，Spec、Pseudocode、Architecture、Refinement 四步走完。每个阶段一个专职 Agent。

- **specification**，需求分析，收集约束、定义验收标准。
- **pseudocode**，算法设计，逻辑流、数据结构、复杂度分析。
- **architecture**，系统设计，组件架构、接口设计、可扩展性规划。
- **refinement**，迭代打磨，代码优化、测试、性能调优。

## Swarm 拓扑，3 个协调器

Swarm 是 Ruflo 的核心抽象，多个 Agent 协同干活。三种拓扑模式各配一个协调器。

- **hierarchical-coordinator**，皇后式分层协调，一个女王指挥一群工人。
- **mesh-coordinator**，P2P 网格协调，无中心，容错靠共识。
- **adaptive-coordinator**，拓扑自适应，按负载实时切换形态。

## V3，16 个安全、记忆、性能专项

这一批是 v3.x 迭代加进来的，多数围绕安全、记忆系统、性能优化。也包含大量 ReasoningBank 集成。

- **security-architect**，安全架构师，威胁建模、CVE 追踪、零信任设计。用 HNSW 索引做威胁模式匹配，声称比暴力搜索快 150 到 12500 倍。
- **security-architect-aidefence**，上一个的 Aidefence 增强版，带 50 多种提示注入模式检测、越狱检测、PII 屏蔽、Lyapunov 行为异常检测。
- **security-auditor**，漏洞扫描、CVE 数据库查询、OWASP Top 10 检测、合规审计。
- **aidefence-guardian**，实时监控所有 Agent 输入输出，防提示注入和越狱。
- **injection-analyst**，提示注入攻击的深度分析，模式分类和威胁情报。
- **pii-detector**，代码和数据里的敏感信息扫描，凭据、密钥、个人数据。
- **claims-authorizer**，基于 ADR-010 的细粒度授权，跨 Agent 和 MCP 工具做访问控制。
- **memory-specialist**，HNSW 索引、混合后端、向量量化、EWC++ 抗遗忘。
- **swarm-memory-manager**，跨 Agent 分布式记忆同步，CRDT 复制、命名空间协调。
- **reasoningbank-learner**，ReasoningBank 集成的核心，轨迹追踪、判决判定、模式蒸馏、经验回放。
- **collective-intelligence-coordinator**，集体智能协调，含拜占庭容错和涌现智能。
- **performance-engineer**，Flash Attention 优化（声称 2.49 到 7.47 倍加速）、WASM SIMD、token 用量压缩（50 到 75%）。
- **ddd-domain-expert**，领域驱动设计专家，限界上下文、聚合设计、通用语言。
- **adr-architect**，架构决策记录管理，与 ReasoningBank 联动做模式学习。
- **sparc-orchestrator**，SPARC 全流程编排，管五个阶段的推进和交接。
- **v3-integration-architect**，跟 agentic-flow@alpha 的深度集成，消除重复代码。

## GitHub，13 个仓库协同

Ruflo 对 GitHub 的集成做得最重，一批 Agent 都围绕 repo、PR、issue 转。

- **pr-manager**，Pull Request 全生命周期，创建、审查、测试、合并。
- **swarm-pr**，PR 的 Swarm 版，多 Agent 协同审查和验证。
- **swarm-issue**，把 GitHub issue 拆成多 Agent 任务，自动分解和进度追踪。
- **issue-tracker**，issue 管理和项目协调，含跨仓库同步。
- **code-review-swarm**，部署专门 Agent 群做超越静态分析的深度审查。
- **release-manager**，发布协调，含 ruv-swarm 的多包版本管理。
- **release-swarm**，复杂发布编排，从 changelog 到多平台部署。
- **repo-architect**，仓库结构优化和多 repo 管理。
- **multi-repo-swarm**，跨仓库 Swarm，做组织级自动化。
- **sync-coordinator**，多仓库同步协调，版本对齐、依赖同步。
- **project-board-sync**，把 Swarm 状态同步到 GitHub Projects 面板。
- **github-modes**，GitHub 集成的总入口，工作流编排、PR、issue、release 都在里面。
- **workflow-automation**，GitHub Actions 工作流自动化，自适应优化。

## Consensus，7 个分布式共识

给分布式系统设计的共识算法 Agent，很多是从传统分布式系统论文搬过来的。

- **raft-manager**，Raft 算法，领导者选举、日志复制、成员变更。
- **byzantine-coordinator**，拜占庭容错共识，含恶意节点检测。
- **gossip-coordinator**，Gossip 协议协调，最终一致、可扩展。
- **crdt-synchronizer**，冲突无相关复制数据类型，状态/操作两种 CRDT。
- **quorum-manager**，动态仲裁调整，加权投票、成员管理。
- **security-manager**，共识协议的安全层，加密通信、攻击检测。
- **performance-benchmarker**，共识协议的性能基准测试。

## Flow Nexus，9 个云端平台 Agent

Flow Nexus 是 Ruflo 配套的云端服务，这一批 Agent 都是它的功能模块。

- **flow-nexus-auth**，认证和用户管理。
- **flow-nexus-app-store**，应用市场，发布、发现、部署。
- **flow-nexus-challenges**，编程挑战和游戏化。
- **flow-nexus-neural**，神经网络训练和推理，跑在云基础设施上。
- **flow-nexus-payments**，信用管理和计费。
- **flow-nexus-sandbox**，E2B 沙箱部署，隔离执行环境。
- **flow-nexus-swarm**，云端 Swarm 编排和扩容。
- **flow-nexus-user-tools**，用户资料、存储、实时订阅。
- **flow-nexus-workflow**，事件驱动工作流自动化。

## Sublinear，5 个子线性算法 Agent

用子线性时间算法解决特定领域的计算问题，追求比输入数据本身还快。

- **consensus-coordinator**，子线性共识协调，拜占庭容错和投票机制。
- **matrix-optimizer**，矩阵分析和优化，条件数估计、对角占优检查。
- **pagerank-analyzer**，图分析和 PageRank，社交网络、推荐系统、Swarm 拓扑优化。
- **performance-optimizer**，系统性能优化，资源管理和效率最大化。
- **trading-predictor**，金融交易，"在行情到达前预测并执行"的时序优势算法，高频交易场景。

## Optimization，5 个性能优化

跟 sublinear 有区别，这个类别是运维视角的通用优化。

- **Benchmark Suite**，性能基准、回归检测、性能验证。
- **Load Balancing Coordinator**，动态任务分发、工作窃取、自适应负载。
- **Performance Monitor**，实时指标采集、瓶颈分析、SLA 监控。
- **Resource Allocator**，自适应资源分配、预测性扩容、容量规划。
- **Topology Optimizer**，Swarm 拓扑重构和通信模式优化。

## Testing，2 个

- **production-validator**，生产验证，端到端测试和部署就绪检查。
- **tdd-london-swarm**，伦敦学派 TDD，mock 驱动的 mock-first 开发。

## Analysis，3 个

- **analyst**（`analysis/code-analyzer.md`），代码质量、性能瓶颈、安全漏洞、架构模式、依赖、复杂度。这个最完整。
- **code-analyzer**（`analysis/analyze-code-quality.md`），代码审查、重构建议、技术债识别。v1.0.0 版本。
- **code-analyzer**（`analysis/code-review/analyze-code-quality.md`），与上一个重复，历史迁移残留。

## Architecture，2 个

两个都是 **system-architect**，做系统设计、架构模式、可扩展性规划，需要人工审批重大决策。文件里一个是 `architecture/arch-system-design.md`，一个是 `architecture/system-design/arch-system-design.md`，重复。

## Development，2 个

两个都是 **backend-dev**，后端 API 开发，含 REST 和 GraphQL。一个 v1.0.0，一个 v2.0.0-alpha 带自学习。重复。

## DevOps，2 个

两个都是 **cicd-engineer**，GitHub Actions 流水线和部署。重复。

## Documentation，2 个

两个都是 **api-docs**，OpenAPI/Swagger 文档，一个 v1.0.0，一个 v2.0.0-alpha 带模式学习。重复。

## Data，2 个

两个都是 **ml-developer**，机器学习模型开发、训练、部署。一个 v1.0.0，一个 v2.0.0-alpha 带自学习超参数优化。重复。

## Specialized，2 个

两个都是 **mobile-dev**，React Native 跨平台 iOS Android 开发。重复。

## Goal，2 个

- **goal-planner**，GOAP（目标导向行动规划）专家，用游戏 AI 技术做动态规划，A* 搜索状态空间。
- **sublinear-goal-planner**，同一个东西，文件名和内容重复。

## Sona，1 个

- **sona-learning-optimizer**，SONA 驱动的自优化 Agent，LoRA 微调、EWC++ 记忆保持、LLM 路由、亚毫秒学习。

## Payments，1 个

- **agentic-payments**，多 Agent 支付授权，带密码学验证和拜占庭共识。这个方向比较少见，是把 AI 商用化做成了 Agent 协作。

## Custom，1 个

- **test-long-runner**，能跑 30 分钟以上的长任务测试 Agent。看起来是开发 Ruflo 自己时用来测长任务的测试桩。

## 小结

98 这个数字本身有点宣传味道。仓库里能清楚看到至少有 8 到 10 个"内容重复"的 Agent（analysis、architecture、development、devops、documentation、data、specialized、goal 这几个类别都是重复对），加上一些只是文件名不同、description 一模一样的模板级 Agent。实际"角色"应该在 70 到 80 之间。

真正的亮点不在数量，在两个方向。一个是 V3 里的安全栈，从 ADR 到 claims 授权到 Aidefence 到 PII 检测一整套，把零信任做到了 Agent 协议层。另一个是 sublinear 那 5 个，把子线性时间算法做成了专用 Agent，这个思路比较激进，尤其是 trading-predictor，声称能"在行情数据到达前"预测，属于典型的营销话术，实际效果要实测。

从工程角度看，Ruflo 更像是一个"想把 Claude Code 的 Harness 层做成独立生态"的尝试，98 个 Agent 是这个尝试的外化。真正决定它能不能立得住的，还是记忆系统和 Swarm 编排这两个核心，Agent 只是应用层。

## 参考资料

- [ruvnet/ruflo 仓库](https://github.com/ruvnet/ruflo)，71,774 star，MIT 协议，TypeScript
- 98 个 Agent 定义文件位于 `v3/@claude-flow/mcp/.claude/agents/`
- 数字在 `v3/@claude-flow/cli/src/commands/init.ts` 的 ADR-128 Phase 3 注释里
- 前文 Ruflo 总览，[/notes/ruflo/](/notes/ruflo/)
