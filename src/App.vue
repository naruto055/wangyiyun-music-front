<template>
	<main class="h-screen bg-white dark:bg-black">
		<h1 class="text-3xl font-bold underline text-black dark:text-white">Hello world!</h1>

		<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="toggleTheme">ToggleTheme</button>
	</main>
</template>

<script setup>
function toggleTheme() {
	document.documentElement.classList.toggle('dark');
}
</script>

<style scoped></style>
