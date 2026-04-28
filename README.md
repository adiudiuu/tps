# TPS Calculator

一个偏学习参考的 GPU 推理性能估算工具。  
给定显卡、模型、量化与运行参数后，快速估算：

- 显存占用与 OOM 风险
- Decode / Prefill token/s
- TTFT / TPOT / 总时延
- 带宽瓶颈还是算力瓶颈
- 多卡 TP 通信效率

在线地址：[tps.bunai.cc](https://tps.bunai.cc)  
英文说明：[README.en.md](README.en.md)  
算法文档：[Docs.md](Docs.md)

## 这项目适合干什么

它更适合：

- 学习推理性能建模
- 做方案初筛和参数对比
- 快速理解量化、KV Cache、TP、Roofline 这些概念

它不适合：

- 直接替代真实 benchmark
- 把单次估算值当作生产承诺

## 当前实现重点

当前代码已经把这些因素接进计算：

- 权重量化和 KV Cache 量化
- GQA / MHA / MQA 对 prefill 的结构系数
- Flash Attention 对 prefill 的区间增益
- Prefix Cache 对有效 Prompt 和 TTFT 的影响
- 框架效率区间
- 多卡 TP 通信效率

想看真实算法，请直接读 [Docs.md](Docs.md)。这份文档是按当前代码写的，不是脱离实现的示意稿。

## 快速开始

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## 学习声明

这是一个学习参考项目，欢迎拿来读代码、改公式、做实验。

- 结果用于理解趋势，比用于承诺数字更合适
- 上线前请一定用真实压测校验
- 傻逼公司禁止学习

## 协议

自定义非商业协议：[LICENSE](LICENSE)

**使用说明**

- 个人学习、研究、非商业用途：自由使用，无需打招呼。
- 公司 / 团队 / 商业产品中使用本项目的任何部分（包括二次开发、集成、插件化、次生商业服务等）：**需要联系作者获得单独授权。**

## 参考资料

- **模型参数来源**：[HuggingFace](https://huggingface.co) model cards 及 [Ollama](https://ollama.com) 官方页面
- **算法理论**：Roofline 性能模型 — Williams, Waterman & Patterson, [*Roofline: An Insightful Visual Performance Model*](https://dl.acm.org/doi/10.1145/1498765.1498785), CACM 2009
- **MoE CPU Offload 场景**：[val1813/kaiwu](https://github.com/val1813/kaiwu) — 本地 MoE 部署自动调优工具，启发了 PCIe 带宽瓶颈建模
