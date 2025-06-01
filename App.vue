<template>
	<div id="app">
		<div v-if="currentPage === 'home'" class="page">
			<HomePage @navigate="navigateToPage" />
		</div>
		<div v-else-if="currentPage === 'learning'" class="page">
			<LearningPage @navigate="navigateToPage" />
		</div>
	</div>
</template>

<script>
	import HomePage from '@/components/HomePage.vue'
	import LearningPage from '@/components/LearningPage.vue'
	
	export default {
		name: 'App',
		
		components: {
			HomePage,
			LearningPage
		},
		
		data() {
			return {
				currentPage: 'home'
			}
		},
		
		mounted() {
			console.log('App mounted!')
			// 设置全局导航函数
			window.navigateTo = (options) => {
				const path = options.url || options
				if (path.includes('learning')) {
					this.currentPage = 'learning'
				}
			}
			
			window.navigateBack = () => {
				this.currentPage = 'home'
			}
		},
		
		methods: {
			navigateToPage(page) {
				this.currentPage = page
			}
		}
	}
</script>

<style>
	* {
		box-sizing: border-box;
	}
	
	body, html {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}
	
	#app {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	.page {
		min-height: 100vh;
	}
</style> 