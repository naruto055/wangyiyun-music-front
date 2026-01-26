<template>
	<div :class="cn('flex items-center p-6 pt-0', props.class)" v-bind="$attrs">
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
