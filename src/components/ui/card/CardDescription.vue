<template>
  <p :class="cn('text-sm text-muted-foreground', props.class)" v-bind="$attrs">
    <slot />
  </p>
</template>

<script setup>
import { cn } from '@/utils'

const props = defineProps({
  class: {
    type: String,
    default: ''
  }
})
</script>
