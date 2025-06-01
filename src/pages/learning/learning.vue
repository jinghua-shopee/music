<template>
	<view class="container">
		<LearningPage />
	</view>
</template>

<script>
	import LearningPage from '@/components/LearningPage.vue'
	
	export default {
		components: {
			LearningPage
		},
		data() {
			return {
				
			}
		},
		onLoad() {
			console.log('学习页面加载完成')
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