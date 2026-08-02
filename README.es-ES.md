

<p align="center">
  <br/>
  <br/>
  <br/>
  <img src="https://img.shields.io/badge/TPS-Calculator-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="TPS Calculator" height="80"/>
  <br/>
  <br/>
</p>

<h1 align="center">TPS Calculator</h1>

<p align="center">
  <strong>Herramienta de estimación de rendimiento de inferencia de GPU</strong>
</p>

<p align="center">
  Dadas una GPU, un modelo, la cuantización y los parámetros de ejecución, estima rápidamente el uso de memoria VRAM, el rendimiento de throughput, las métricas de latencia y el análisis de cuellos de botella
</p>

<p align="center">
  <a href="https://tps.bunai.cc"><strong>Prueba en línea →</strong></a>
</p>

<br/>

<p align="center">
  <a href="https://tps.bunai.cc">
    <img src="https://img.shields.io/badge/demo-online-4FC08D" alt="demo">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-Custom%20Non--Commercial-blue" alt="license">
  </a>
  <a href="https://github.com/vuejs/core">
    <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js" alt="vue">
  </a>
  <a href="https://vitejs.dev">
    <img src="https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite" alt="vite">
  </a>
  <a href="README.en.md">
    <img src="https://img.shields.io/badge/lang-English-orange" alt="English">
  </a>
</p>

<br/>
<br/>

## Características

- 🎯 **Modelado preciso** — Cobertura total de pesos, KV Cache y sobrecarga del sistema, alerta de riesgo OOM
- ⚡ **Análisis de rendimiento** — Cálculo preciso de tokens/s en Decode/Prefill, evaluación completa de TTFT/TPOT/latencia total
- 📊 **Modelo Roofline** — Identificación científica de cuellos de botella de ancho de banda/rendimiento computacional
- 🌍 **Amplia cobertura** — 170+ modelos de GPU, 351+ modelos principales (Dense 280 + MoE 71)
- 🔗 **Características avanzadas** — Paralelismo Tensor, Flash Attention, cuantización de KV Cache, Prefix Cache
- 🎨 **Soporte multi-framework** — vLLM、TensorRT-LLM、SGLang、LMDeploy、TGI、llama.cpp、ExLlamaV2、MLX

## Alcance de soporte

| Categoría | Detalles |
| --- | --- |
| **Modelos** | 351+ modelos principales (Dense 280 + MoE 71) · 0.5B - 671B parámetros · Publicados entre 2022-2026 |
| **Arquitecturas** | Dense · MoE · MLA (DeepSeek) · Atención híbrida (Gemma) · Mamba (SSM) |
| **GPU** | 170+ modelos · NVIDIA (RTX/Tesla/H100/B200/B300) · AMD (RX/MI) · Intel Arc · Apple Silicon · Chips nacionales |
| **Cuantización** | FP32 · BF16 · FP8 · INT8 · INT4 · Q6_K · Q5_K · Q3_K · INT2 |
| **Frameworks** | vLLM · TensorRT-LLM · SGLang · LMDeploy · TGI · llama.cpp · ExLlamaV2 · MLX |
| **Características avanzadas** | Flash Attention · Cuantización de KV Cache · Prefix Cache · MoE CPU Offload |

## Casos de uso

**Adecuado para:**
- 📚 Aprender los principios de modelado de rendimiento de inferencia de LLM
- 🔬 Comparación rápida de selección de hardware y planes de configuración
- 🛠️ Verificación de viabilidad de hardware y estimación de requisitos de VRAM
- 💡 Comprender conceptos como cuantización, KV Cache, TP y Roofline

**No adecuado para:**
- ❌ Reemplazar benchmarks reales o compromisos de SLA en entornos de producción
- ❌ Cálculo de costos preciso sin calibración mediante pruebas reales
- ⚠️ El rendimiento real está influenciado por múltiples factores como versión del controlador, configuración del sistema, modo de concurrencia, etc.

> **Nota:** Esta es una herramienta de referencia para aprendizaje. Es fundamental realizar pruebas de estrés reales antes del despliegue en producción.

## Inicio rápido

### Uso en línea

Visita **[tps.bunai.cc](https://tps.bunai.cc)** para usarlo sin necesidad de instalación.

### Desarrollo local

```bash
# 克隆项目
git clone https://github.com/yourusername/tps-calculator.git
cd tps-calculator

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

### Requisitos del entorno

- Node.js >= 18.0.0
- npm >= 9.0.0
- Navegadores modernos (Chrome, Firefox, Safari, Edge)

## Estructura del proyecto

```
src/
├── components/       # Componentes Vue
│   ├── config/      # Panel de configuración (Selección GPU/Modelo/Framework)
│   ├── result/      # Visualización de resultados (Tarjetas de velocidad/latencia/VRAM)
│   ├── layout/      # Componentes de layout
│   └── ui/          # Componentes UI genéricos
├── data/            # Definición de datos
│   ├── gpus/        # Datos de especificaciones GPU (Clasificados por fabricante)
│   ├── models/      # Datos de parámetros de modelos (348+ modelos)
│   ├── constants.js # Constantes de cuantización/framework/interconexión
│   └── runtime.js   # Opciones de configuración en tiempo de ejecución
├── utils/           # Funciones utilitarias
│   ├── calc.js      # Lógica de cálculo central
│   ├── model.js     # Análisis de estructura de modelo
│   ├── format.js    # Formateo de datos
│   ├── exportMd.js  # Exportación de informes Markdown
│   ├── detectGpu.js # Detección automática de GPU local
│   └── useUrlState.js # Sincronización de estado URL
├── i18n/            # Internacionalización (Chino/Inglés)
├── pages/           # Componentes de página
└── router/          # Configuración de enrutamiento
```

## Arquitectura del sistema

<details>
<summary>Ver diagrama de arquitectura del sistema</summary>

```mermaid
graph TD
    A[用户输入参数] --> B[模型配置层]
    A --> C[GPU硬件配置层]
    A --> D[框架配置层]
    
    B --> B1[模型参数量]
    B --> B2[量化精度]
    B --> B3[Dense / MoE / MLA]
    B --> B4[KV Cache结构]
    
    C --> C1[显存容量]
    C --> C2[带宽 BW]
    C --> C3[算力 FLOPS]
    C --> C4[多卡互联 NVLink / PCIe]
    
    D --> D1[vLLM]
    D --> D2[llama.cpp]
    D --> D3[TRT-LLM]
    D --> D4[MLX / SGLang]
    
    B1 --> E[权重大小计算]
    B2 --> E
    B3 --> E
    
    B4 --> F[KV Cache计算]
    
    C1 --> G[VRAM容量校验]
    E --> G
    F --> G
    
    C2 --> H[Decode Roofline]
    E --> H
    
    C3 --> I[Prefill Roofline]
    B3 --> I
    
    C4 --> J[TP通信损耗]
    
    D1 --> K[Framework效率系数]
    D2 --> K
    D3 --> K
    D4 --> K
    
    H --> L[Decode TPS]
    I --> M[Prefill TPS]
    J --> L
    K --> L
    K --> M
    
    M --> N[TTFT]
    L --> O[TPOT]
    
    N --> P[总延迟 Total Latency]
    O --> P
    
    G --> Q[是否可运行]
    L --> R[吞吐分析]
    M --> R
    P --> R
    
    R --> S[结果面板]
    Q --> S
    S --> T[Markdown报告导出]
```

**Puntos destacados de la implementación central:**

- Modelado de cuantización de pesos y KV Cache
- Impacto de los coeficientes estructurales GQA/MHA/MQA en Prefill
- Ganancia de eficiencia de Flash Attention
- Soporte de optimización de Prefix Cache para TTFT
- Rangos de eficiencia de framework basados en benchmarks reales
- Sobrecarga de comunicación TP multicard (NVLink/PCIe)

Consulta los algoritmos y fórmulas detallados en [Docs.md](Docs.md).

</details>

## Guía de contribución

¡Las contribuciones son bienvenidas! Agradecemos especialmente:

- 🔧 **Datos de GPU** — Agregar especificaciones de nuevos modelos de GPU
- 🤖 **Datos de modelos** — Agregar parámetros estructurales de nuevos modelos
- 📊 **Coeficientes de framework** — Proveer datos de benchmarks reales para calibrar la eficiencia
- 🐛 **Corrección de errores** — Reportar o corregir errores de cálculo
- 📝 **Mejoras de documentación** — Refinar explicaciones y ejemplos

**Proceso de contribución:**

1. Haz un fork de este repositorio
2. Crea una rama de característica (`git checkout -b feature/AmazingFeature`)
3. Realiza commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Empuja a la rama (`git push origin feature/AmazingFeature`)
5. Envía un Pull Request

## Descargo de responsabilidad

Esta es una **herramienta de referencia para aprendizaje**, diseñada para comprender los principios de modelado de rendimiento de inferencia de LLM.

- ✅ Los resultados son aptos para **análisis de tendencias** y **comparación de arquitecturas**
- ⚠️ El rendimiento real está influenciado por múltiples factores (versión del controlador, configuración del sistema, modo de concurrencia, etc.)
- 🔬 **Es fundamental realizar pruebas de estrés reales antes del despliegue en producción**
- 📊 Los coeficientes de eficiencia de framework se basan en muestras limitadas y pueden variar significativamente según el escenario

## Licencia de código abierto

Este proyecto utiliza una **licencia personalizada de uso no comercial**, consulta [LICENSE](LICENSE) para detalles.

### Términos de uso

- ✅ **Uso personal** — Libre para aprendizaje, investigación y fines no comerciales, sin necesidad de autorización
- ⚠️ **Uso comercial** — Para empresas/equipos/productos comerciales (incluyendo desarrollo secundario, integración, plugins, servicios derivados, etc.) se requiere contactar al autor para obtener autorización por escrito

**Está prohibido aprender para empresas estúpidas.**

## Agradecimientos

### Fuentes de datos

- **Parámetros de modelo** — Repositorios oficiales como [HuggingFace](https://huggingface.co), [Ollama](https://ollama.com), [ModelScope](https://modelscope.cn)
- **Especificaciones de GPU** — Documentación técnica oficial de los fabricantes
- **Cobertura de modelos** — 351+ modelos, abarcando modelos de código abierto principales de 2022-2026, con escalas de parámetros de 0.5B a 671B

### Base teórica

- **Modelo Roofline** — Williams, Waterman & Patterson, [*Roofline: An Insightful Visual Performance Model*](https://dl.acm.org/doi/10.1145/1498765.1498785), CACM 2009
- **MoE CPU Offload** — El proyecto [val1813/kaiwu](https://github.com/val1813/kaiwu) inspiró el modelado del cuello de botella de ancho de banda PCIe

### Datos de validación

- LMSYS DGX Spark Review
- XiongjieDai GPU Benchmarks
- Blog vLLM Wide-EP
- Datos de pruebas reales contribuidos por la comunidad

## Apoya al proyecto

<div align="center">

| Moneda | Dirección |
|:---:|:---|
| **USDT (Tron)** | `TMKDPMFNXukHbt1ThQxorCs9sZytSX7GkR` |
| **ETH (Ethereum)** | `0x5696293023683F7B5a0312eC9f0C1f05f2b03e81` |
| **SOL (Solana)** | `5avgsJtAdJst3KUdTsBsN2sUkyWYFrj8b1zADRPitTrj` |

**¡Tu apoyo es mi motivación para mantener y mejorar continuamente el proyecto!** 🙏

</div>

## Documentación

- **[Documentación de algoritmos (Docs.md)](Docs.md)** — Fórmulas de cálculo detalladas, flujos de datos y detalles de implementación
- **[English README](README.en.md)** — English version of this document

## Contacto

- 🐛 **Informes de problemas** — [GitHub Issues](https://github.com/yourusername/tps-calculator/issues)
- 💬 **Discusiones** — [GitHub Discussions](https://github.com/yourusername/tps-calculator/discussions)
- 📧 **Licencia comercial** — Por favor, contacta mediante Issues o la página principal del proyecto

---

<div align="center">

**¡Si este proyecto te ha sido útil, dale un ⭐ Star para apoyar!**

Made with ❤️ for the LLM community

</div>
