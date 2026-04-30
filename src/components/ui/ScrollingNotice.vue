<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isVisible = ref(false)
let autoHideTimer = null

const closeNotice = (isManual = false) => {
  isVisible.value = false
  
  // 记录关闭时间戳
  try {
    if (isManual) {
      // 用户手动关闭，5天内不再显示
      const expireTime = Date.now() + (5 * 24 * 60 * 60 * 1000)
      localStorage.setItem('notice_dismissed_until', expireTime.toString())
    } else {
      // 自动关闭，2天内不再显示
      const expireTime = Date.now() + (2 * 24 * 60 * 60 * 1000)
      localStorage.setItem('notice_dismissed_until', expireTime.toString())
    }
  } catch (e) {
    // ignore
  }
  
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
    autoHideTimer = null
  }
}

onMounted(() => {
  // 检查用户是否在有效期内关闭过（自动2天或手动5天）
  try {
    const dismissedUntil = localStorage.getItem('notice_dismissed_until')
    if (dismissedUntil) {
      const expireTime = parseInt(dismissedUntil, 10)
      if (Date.now() < expireTime) {
        // 还在有效期内，不显示
        return
      } else {
        // 已过期，清除记录
        localStorage.removeItem('notice_dismissed_until')
      }
    }
  } catch (e) {
    // ignore
  }
  
  // 显示提示条
  isVisible.value = true
  
  // 10秒后自动隐藏（自动关闭，2天内不再显示）
  autoHideTimer = setTimeout(() => {
    closeNotice(false)
  }, 10000)
})

onUnmounted(() => {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
  }
})
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="isVisible"
      class="fixed top-12 sm:top-14 left-0 right-0 z-40 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b border-blue-200/50 shadow-sm"
    >
      <div class="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        <div class="flex items-start gap-2 sm:gap-3">
          <!-- 图标 -->
          <div class="flex-shrink-0 mt-0.5">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <!-- 提示内容 -->
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm text-blue-800/90 leading-relaxed">
              <span class="font-medium">💡 {{ t('notice.theoretical_value') }}</span>
              <span class="hidden sm:inline text-blue-700/70 mx-2">•</span>
              <span class="hidden sm:inline">{{ t('notice.actual_may_vary') }}</span>
            </p>
          </div>

          <!-- 关闭按钮 -->
          <button
            @click="closeNotice(true)"
            class="flex-shrink-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-1 transition-colors"
            :aria-label="t('notice.close')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-down-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
