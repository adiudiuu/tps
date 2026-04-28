<script setup>
defineProps({ text: { type: String, required: true } })
</script>

<template>
  <span class="relative group cursor-default shrink-0">
    <span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold leading-none">?</span>
    <span class="pointer-events-none absolute left-0 top-full mt-1.5 z-10 w-56 rounded-lg bg-gray-800 text-white text-[11px] leading-snug px-2.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-normal">
      {{ text }}
    </span>
  </span>
</template>
