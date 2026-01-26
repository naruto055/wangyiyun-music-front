<template>
  <h3 :class="cn('font-semibold leading-none tracking-tight', props.class)" v-bind="$attrs">
    <slot />
  </h3>
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
