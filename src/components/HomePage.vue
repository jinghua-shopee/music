<template>
	<view class="home-page">
		<view class="home-content">
			<text class="title">🎵 五线谱简谱对照学习</text>
			
			<!-- 模式选择区域 -->
			<view class="mode-selection">
				<text class="selection-title">选择学习模式</text>
				<view class="mode-cards">
					<view 
						class="mode-card" 
						:class="{ active: selectedMode === 'practice' }"
						@click="selectMode('practice')"
					>
						<view class="mode-icon">📚</view>
						<view class="mode-name">练习模式</view>
						<view class="mode-desc">自主练习，提升技能</view>
					</view>
					<view 
						class="mode-card" 
						:class="{ active: selectedMode === 'pk' }"
						@click="selectMode('pk')"
					>
						<view class="mode-icon">⚔️</view>
						<view class="mode-name">PK模式</view>
						<view class="mode-desc">双人对战，竞技比拼</view>
					</view>
				</view>
			</view>

			<!-- 题目数量选择区域 -->
			<view class="question-selection">
				<text class="selection-title">选择题目数量</text>
				<view class="question-options">
					<view 
						class="question-option" 
						:class="{ active: selectedCount === 15 }"
						@click="selectCount(15)"
					>
						<view class="option-number">15</view>
						<view class="option-label">道题</view>
					</view>
					<view 
						class="question-option" 
						:class="{ active: selectedCount === 30 }"
						@click="selectCount(30)"
					>
						<view class="option-number">30</view>
						<view class="option-label">道题</view>
					</view>
					<view 
						class="question-option" 
						:class="{ 
							active: selectedCount === 'endless',
							disabled: selectedMode === 'pk'
						}"
						@click="selectCount('endless')"
					>
						<view class="option-number">∞</view>
						<view class="option-label">无尽模式</view>
					</view>
				</view>
			</view>

			<button 
				class="start-btn" 
				:class="{ disabled: !canStart }"
				@click="startLearning"
			>
				开始学习
			</button>
		</view>
		
		<!-- Toast提示 -->
		<view v-if="showToast" class="toast">
			{{ toastMessage }}
		</view>
	</view>
</template>

<script>
	import { mapActions } from 'vuex'
	
	export default {
		name: 'HomePage',
		
		data() {
			return {
				selectedMode: '',
				selectedCount: null,
				showToast: false,
				toastMessage: ''
			}
		},
		
		computed: {
			canStart() {
				return this.selectedMode && this.selectedCount !== null
			}
		},
		
		watch: {
			selectedMode(newMode) {
				// 如果选择PK模式，自动取消无尽模式
				if (newMode === 'pk' && this.selectedCount === 'endless') {
					this.selectedCount = null
				}
			}
		},
		
		methods: {
			...mapActions(['startGame']),
			
			selectMode(mode) {
				this.selectedMode = mode
				console.log('Selected mode:', mode)
			},
			
			selectCount(count) {
				// PK模式不允许选择无尽模式
				if (this.selectedMode === 'pk' && count === 'endless') {
					this.showToastMessage('PK模式不支持无尽模式')
					return
				}
				this.selectedCount = count
				console.log('Selected count:', count)
			},
			
			startLearning() {
				if (!this.canStart) {
					this.showToastMessage('请先选择学习模式')
					return
				}
				
				console.log('Starting learning with:', {
					mode: this.selectedMode,
					count: this.selectedCount
				})
				
				// 准备游戏数据
				const gameData = {
					mode: this.selectedMode,
					maxQuestions: this.selectedCount === 'endless' ? Infinity : this.selectedCount
				}
				
				// 初始化游戏状态
				this.startGame(gameData)
				
				// 使用uni-app导航
				uni.navigateTo({
					url: '/pages/learning/learning'
				})
			},
			
			showToastMessage(message) {
				this.toastMessage = message
				this.showToast = true
				setTimeout(() => {
					this.showToast = false
				}, 2000)
			}
		}
	}
</script>

<style scoped>
	.home-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px;
		box-sizing: border-box;
	}

	.home-content {
		width: 100%;
		max-width: 600px;
		text-align: center;
	}

	.title {
		color: #ffffff;
		font-size: 36px;
		font-weight: 700;
		letter-spacing: -0.5px;
		margin-bottom: 40px;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	/* 模式选择 */
	.mode-selection {
		margin-bottom: 40px;
	}

	.selection-title {
		color: #ffffff;
		font-size: 20px;
		font-weight: 600;
		margin-bottom: 20px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.mode-cards {
		display: flex;
		gap: 16px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.mode-card {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 16px;
		padding: 20px;
		width: 180px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.mode-card.active {
		background: rgba(255, 255, 255, 0.25);
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
	}

	.mode-icon {
		font-size: 32px;
		margin-bottom: 8px;
	}

	.mode-name {
		color: #ffffff;
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 4px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.mode-desc {
		color: rgba(255, 255, 255, 0.8);
		font-size: 14px;
		line-height: 1.4;
	}

	/* 题目数量选择 */
	.question-selection {
		margin-bottom: 40px;
	}

	.question-options {
		display: flex;
		gap: 12px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.question-option {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		padding: 16px 20px;
		min-width: 100px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
		cursor: pointer;
		text-align: center;
	}

	.question-option.active {
		background: rgba(255, 255, 255, 0.25);
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-1px);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
	}

	.question-option.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.option-number {
		color: #ffffff;
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 2px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.option-label {
		color: rgba(255, 255, 255, 0.8);
		font-size: 12px;
	}

	/* 开始按钮 */
	.start-btn {
		width: 100%;
		max-width: 300px;
		height: 50px;
		background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
		color: #ffffff;
		border: none;
		border-radius: 25px;
		font-size: 18px;
		font-weight: 700;
		letter-spacing: 1px;
		box-shadow: 0 4px 20px rgba(0, 122, 255, 0.4);
		transition: all 0.3s ease;
		margin: 0 auto;
		display: block;
		cursor: pointer;
	}

	.start-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 25px rgba(0, 122, 255, 0.5);
	}

	.start-btn:active {
		transform: translateY(0);
		box-shadow: 0 2px 10px rgba(0, 122, 255, 0.3);
	}

	.start-btn.disabled {
		opacity: 0.5;
		background: #cccccc;
		box-shadow: none;
		cursor: not-allowed;
	}

	/* Toast样式 */
	.toast {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.8);
		color: #ffffff;
		padding: 12px 24px;
		border-radius: 12px;
		font-size: 16px;
		z-index: 10000;
		backdrop-filter: blur(5px);
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
		.mode-cards {
			flex-direction: column;
			align-items: center;
		}
		
		.mode-card {
			width: 100%;
			max-width: 300px;
		}
		
		.title {
			font-size: 28px;
		}
		
		.selection-title {
			font-size: 18px;
		}
	}
</style> 