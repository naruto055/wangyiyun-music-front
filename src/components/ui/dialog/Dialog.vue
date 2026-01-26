<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { cn } from '@/utils'

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:open'])

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const handleEscape = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        @click.self="isOpen = false"
      />
    </Transition>

    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
        :class="props.class"
      >
        <div v-if="title || description || $slots.header" class="flex flex-col space-y-1.5 text-center sm:text-left">
          <slot name="header">
            <h2 v-if="title" class="text-lg font-semibold leading-none tracking-tight">
              {{ title }}
            </h2>
            <p v-if="description" class="text-sm text-muted-foreground">
              {{ description }}
            </p>
          </slot>
        </div>

        <div class="grid gap-4 py-4">
          <slot />
        </div>

        <div v-if="$slots.footer" class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <slot name="footer" />
        </div>

        <button
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          @click="isOpen = false"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span class="sr-only">Close</span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}
</style>
