<script setup>
import Header from './Header.vue'
import Footer from './Footer.vue'

defineProps({
  result: Object, model: Object,
  gpu: Object, gpuCount: Number, interconnect: Object,
  quant: Object, framework: Object,
  ctx: Number, batch: Number, promptLen: Number, outputLen: Number,
  flashAttention: Boolean, kvCacheQuant: Object,
  prefixCacheHit: Number, cpuOffload: Boolean, pcieBw: Object,
})
</script>

<template>
  <Header
    :result="result"
    :model="model"
    :gpu="gpu"
    :gpu-count="gpuCount"
    :interconnect="interconnect"
    :quant="quant"
    :framework="framework"
    :ctx="ctx"
    :batch="batch"
    :prompt-len="promptLen"
    :output-len="outputLen"
    :flash-attention="flashAttention"
    :kv-cache-quant="kvCacheQuant"
    :prefix-cache-hit="prefixCacheHit"
    :cpu-offload="cpuOffload"
    :pcie-bw="pcieBw"
  />
  <Footer />
</template>
