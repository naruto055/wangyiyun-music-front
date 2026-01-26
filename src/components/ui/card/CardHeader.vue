<template>
	<div :class="cn('flex flex-col space-y-1.5 p-6', props.class)" v-bind="$attrs">
		<slot />
	</div>
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
