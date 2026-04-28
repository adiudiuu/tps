# TPS Calculator

A learning-oriented GPU inference estimator for LLM workloads.
It gives fast estimates for:

- VRAM usage and OOM risk
- Decode / Prefill token/s
- TTFT / TPOT / total latency
- Bandwidth-bound vs compute-bound behavior
- Multi-GPU TP communication efficiency

Live site: [tps.bunai.cc](https://tps.bunai.cc)  
Chinese README: [README.md](README.md)  
Algorithm notes: [Docs.md](Docs.md)

## What It Is For

This project is best used for:

- learning inference performance modeling
- quick architecture comparison
- exploring how quantization, KV cache, TP, and Roofline interact

It is not meant to:

- replace real benchmarks
- serve as a production SLA calculator

## What The Current Code Models

The current implementation already includes:

- weight quantization and KV cache quantization
- GQA / MHA / MQA structure factor for prefill
- Flash Attention boost ranges for prefill
- Prefix Cache effect on effective prompt length and TTFT
- framework efficiency ranges
- TP communication efficiency

If you want the real algorithm instead of a marketing overview, read [Docs.md](Docs.md). It is written against the current codebase.

## Quick Start

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Learning Note

This is a study and experimentation project.

- use it to understand trends
- validate final numbers with real benchmarks
- dumb companies are forbidden to study

## License

Custom Non-Commercial License: [LICENSE](LICENSE)

**Usage Terms**

- Personal use, study, and non-commercial purposes: free to use, no permission needed.
- Any use by a company, team, or commercial product (including integration, plugins, derived services, etc.): **explicit written permission from the author is required.**

## References

- **Model data**: [HuggingFace](https://huggingface.co) model cards and [Ollama](https://ollama.com) official pages
- **Algorithm**: Roofline performance model — Williams, Waterman & Patterson, [*Roofline: An Insightful Visual Performance Model*](https://dl.acm.org/doi/10.1145/1498765.1498785), CACM 2009
- **MoE CPU Offload scenario**: [val1813/kaiwu](https://github.com/val1813/kaiwu) — a local MoE deployment auto-tuner that inspired the PCIe bandwidth bottleneck modeling
