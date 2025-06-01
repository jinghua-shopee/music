<template>
	<view class="container">
		<HomePage />
	</view>
</template>

<script>
	import HomePage from '@/components/HomePage.vue'
	
	export default {
		components: {
			HomePage
		},
		data() {
			return {
				
			}
		},
		onLoad() {
			console.log('首页加载完成')
		},
		methods: {
			
		}
	}
</script>

<style>
	.container {
		width: 100%;
		height: 100vh;
	}
</style> 