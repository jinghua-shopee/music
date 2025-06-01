<template>
	<view class="container">
		<LearningPage @navigate="navigateBack" />
	</view>
</template>

<script>
	import LearningPage from '@/components/LearningPage.vue'
	
	export default {
		name: 'Learning',
		
		components: {
			LearningPage
		},
		
		data() {
			return {
				mode: '',
				maxQuestions: 0
			}
		},
		
		onLoad(options) {
			console.log('Learning page loaded with options:', options)
			this.mode = options.mode || 'practice'
			this.maxQuestions = parseInt(options.maxQuestions) || 15
			
			// 初始化游戏状态
			const gameData = {
				mode: this.mode,
				maxQuestions: this.maxQuestions === 999999 ? Infinity : this.maxQuestions
			}
			
			this.$store.dispatch('startGame', gameData)
		},
		
		methods: {
			navigateBack() {
				uni.navigateBack()
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