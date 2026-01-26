<template>
	<div :class="cn('animate-pulse rounded-md bg-primary/10', props.class)" v-bind="$attrs" />
</template>

<script setup>
import { cn } from '@/utils'

const props = defineProps({
	class: {
		type: String,
		default: '',
	},
})
</script>
