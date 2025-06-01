<template>
	<view class="home-page">
		<view class="home-content">
			<view class="title">五线谱简谱对照学习</view>
			
			<!-- 模式选择区域 -->
			<view class="mode-selection">
				<view class="selection-title">选择学习模式</view>
				<view class="mode-cards">
					<view 
						class="mode-card" 
						:class="{ active: selectedMode === 'practice' }"
						@tap="selectMode('practice')"
					>
						<view class="mode-icon">📚</view>
						<view class="mode-name">练习模式</view>
						<view class="mode-desc">自主练习，提升技能</view>
					</view>
					<view 
						class="mode-card" 
						:class="{ active: selectedMode === 'pk' }"
						@tap="selectMode('pk')"
					>
						<view class="mode-icon">⚔️</view>
						<view class="mode-name">PK模式</view>
						<view class="mode-desc">双人对战，竞技比拼</view>
					</view>
				</view>
			</view>

			<!-- 题目数量选择区域 -->
			<view class="question-selection">
				<view class="selection-title">选择题目数量</view>
				<view class="question-options">
					<view 
						class="question-option" 
						:class="{ active: selectedCount === 15 }"
						@tap="selectCount(15)"
					>
						<view class="option-number">15</view>
						<view class="option-label">道题</view>
					</view>
					<view 
						class="question-option" 
						:class="{ active: selectedCount === 30 }"
						@tap="selectCount(30)"
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
						@tap="selectCount('endless')"
					>
						<view class="option-number">∞</view>
						<view class="option-label">无尽模式</view>
					</view>
				</view>
			</view>

			<button 
				class="start-btn" 
				:class="{ disabled: !canStart }"
				@tap="startLearning"
			>
				开始学习
			</button>
		</view>
		
		<!-- Toast提示 -->
		<view v-if="showToast" class="toast">
			<text>{{ toastMessage }}</text>
		</view>
	</view>
</template>

<script>
	import { mapState, mapActions } from 'vuex'
	
	export default {
		data() {
			return {
				selectedMode: '',
				selectedCount: null,
				showToast: false,
				toastMessage: ''
			}
		},
		
		computed: {
			...mapState(['gameMode']),
			
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
			},
			
			selectCount(count) {
				// PK模式不允许选择无尽模式
				if (this.selectedMode === 'pk' && count === 'endless') {
					this.showToastMessage('PK模式不支持无尽模式')
					return
				}
				this.selectedCount = count
			},
			
			startLearning() {
				if (!this.canStart) {
					this.showToastMessage('请先选择学习模式')
					return
				}
				
				// 准备游戏数据
				const gameData = {
					mode: this.selectedMode,
					maxQuestions: this.selectedCount === 'endless' ? Infinity : this.selectedCount
				}
				
				// 初始化游戏状态
				this.startGame(gameData)
				
				// 跳转到学习页面
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
		padding: 40rpx;
		box-sizing: border-box;
	}

	.home-content {
		width: 100%;
		max-width: 600rpx;
		text-align: center;
	}

	.title {
		color: #ffffff;
		font-size: 68rpx;
		font-weight: 700;
		letter-spacing: -0.82rpx;
		margin-bottom: 64rpx;
		text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
	}

	/* 模式选择 */
	.mode-selection {
		margin-bottom: 64rpx;
	}

	.selection-title {
		color: #ffffff;
		font-size: 36rpx;
		font-weight: 600;
		margin-bottom: 32rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
	}

	.mode-cards {
		display: flex;
		gap: 24rpx;
		justify-content: center;
	}

	.mode-card {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 32rpx;
		padding: 32rpx;
		width: 240rpx;
		backdrop-filter: blur(20rpx);
		border: 2rpx solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.mode-card.active {
		background: rgba(255, 255, 255, 0.25);
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-4rpx);
		box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.2);
	}

	.mode-icon {
		font-size: 56rpx;
		margin-bottom: 16rpx;
	}

	.mode-name {
		color: #ffffff;
		font-size: 32rpx;
		font-weight: 600;
		margin-bottom: 8rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
	}

	.mode-desc {
		color: rgba(255, 255, 255, 0.8);
		font-size: 24rpx;
		line-height: 1.4;
	}

	/* 题目数量选择 */
	.question-selection {
		margin-bottom: 64rpx;
	}

	.question-options {
		display: flex;
		gap: 20rpx;
		justify-content: center;
		flex-wrap: wrap;
	}

	.question-option {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 24rpx;
		padding: 28rpx 32rpx;
		min-width: 140rpx;
		backdrop-filter: blur(20rpx);
		border: 2rpx solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
		cursor: pointer;
		text-align: center;
	}

	.question-option.active {
		background: rgba(255, 255, 255, 0.25);
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-2rpx);
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
	}

	.question-option.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.option-number {
		color: #ffffff;
		font-size: 40rpx;
		font-weight: 700;
		margin-bottom: 4rpx;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
	}

	.option-label {
		color: rgba(255, 255, 255, 0.8);
		font-size: 24rpx;
	}

	/* 开始按钮 */
	.start-btn {
		width: 100%;
		max-width: 480rpx;
		height: 96rpx;
		background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
		color: #ffffff;
		border: none;
		border-radius: 48rpx;
		font-size: 32rpx;
		font-weight: 700;
		letter-spacing: 2rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 122, 255, 0.4);
		transition: all 0.3s ease;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.start-btn:active {
		background: linear-gradient(135deg, #0056CC 0%, #004499 100%);
		transform: translateY(2rpx);
		box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.3);
	}

	.start-btn.disabled {
		opacity: 0.5;
		background: #cccccc;
		box-shadow: none;
	}

	/* Toast样式 */
	.toast {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.8);
		color: #ffffff;
		padding: 24rpx 48rpx;
		border-radius: 24rpx;
		font-size: 28rpx;
		z-index: 10000;
		backdrop-filter: blur(10rpx);
	}

	/* 响应式设计 */
	@media (max-width: 767rpx) {
		.mode-cards {
			flex-direction: column;
			align-items: center;
		}
		
		.mode-card {
			width: 100%;
			max-width: 560rpx;
		}
		
		.question-options {
			justify-content: center;
		}
		
		.question-option {
			flex: 1;
			max-width: 180rpx;
		}
		
		.title {
			font-size: 48rpx;
		}
		
		.selection-title {
			font-size: 32rpx;
		}
	}
</style> 