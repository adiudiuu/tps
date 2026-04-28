<template>
  <div class="flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 w-full lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
    <!-- 左侧配置栏 -->
    <aside class="w-full lg:w-[22rem] xl:w-[26rem] 2xl:w-[30rem] flex-shrink-0 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-1">
      <div class="space-y-4">
        <slot name="config" />
      </div>
    </aside>
    <!-- 右侧结果面板 -->
    <main class="flex-1 min-w-0 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-1">
      <div class="space-y-4">
        <slot name="result" />
      </div>
    </main>
  </div>
</template>
