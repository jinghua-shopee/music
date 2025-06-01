<template>
	<view class="container">
		<HomePage @navigate="navigateToLearning" />
	</view>
</template>

<script>
	import HomePage from '@/components/HomePage.vue'
	
	export default {
		name: 'Index',
		
		components: {
			HomePage
		},
		
		data() {
			return {
				
			}
		},
		
		onLoad() {
			console.log('Index page loaded')
		},
		
		methods: {
			navigateToLearning(data) {
				console.log('Navigate to learning with data:', data)
				uni.navigateTo({
					url: '/pages/learning/learning?mode=' + data.mode + '&maxQuestions=' + data.maxQuestions
				})
			}
		}
	}
</script>

<style scoped>
	.container {
		width: 100%;
		min-height: 100vh;
	}
</style> 