<template>
	<view class="learning-page" :class="{ paused: isPaused }">
		<!-- 暂停提示 -->
		<view v-if="isPaused" class="pause-overlay">
			<view class="pause-icon">⏸️</view>
			<view class="pause-text">已暂停</view>
		</view>
		
		<!-- 主要内容区域 -->
		<view class="content-area" @tap="handlePageTap">
			<!-- 五线谱和简谱区域 -->
			<view class="notation-area">
				<!-- 五线谱区域 -->
				<view class="staff-section">
					<view class="section-title">五线谱</view>
					<view class="section-content">
						<Staff :note="currentNote" />
					</view>
				</view>
				
				<!-- 简谱区域 -->
				<view class="jianpu-section">
					<view class="section-title">简谱</view>
					<view class="section-content">
						<Jianpu :note="currentNote" :show="hasShownJianpu" />
					</view>
				</view>
			</view>
			
			<!-- 控制按钮区域 -->
			<view class="control-area">
				<button 
					class="control-btn confirm-btn" 
					:disabled="isPaused || hasShownJianpu"
					@tap="confirmAnswer"
				>
					确认
				</button>
				<button 
					class="control-btn next-btn" 
					:disabled="isPaused"
					@tap="nextQuestion"
				>
					下一道
				</button>
				<button 
					class="control-btn end-btn" 
					:disabled="isPaused"
					@tap="showEndConfirm"
				>
					结束
				</button>
			</view>
			
			<!-- 钢琴键盘区域 -->
			<view class="piano-area">
				<Piano 
					:selectedKey="selectedKey" 
					:highlightKey="currentNote ? currentNote.pianoKey : null"
					@key-select="selectKey"
				/>
			</view>
		</view>
		
		<!-- 结束确认弹窗 -->
		<view v-if="showEndModal" class="modal-overlay" @tap="closeEndModal">
			<view class="modal-content" @tap.stop>
				<view class="modal-title">{{ endModalTitle }}</view>
				<view class="modal-text">{{ endModalText }}</view>
				<view class="modal-buttons">
					<button class="modal-btn cancel-btn" @tap="closeEndModal">取消</button>
					<button class="modal-btn confirm-btn" @tap="confirmEnd">{{ endConfirmText }}</button>
				</view>
			</view>
		</view>
		
		<!-- 统计结果弹窗 -->
		<view v-if="showStatsModal" class="modal-overlay">
			<view class="stats-modal-content">
				<view class="stats-header">
					<view class="stats-title">{{ statsTitle }}</view>
					<view class="stats-icon">🎉</view>
				</view>
				<view class="stats-details">
					<view class="stats-row">
						<text class="stats-label">总题数</text>
						<text class="stats-value">{{ totalQuestions }}</text>
					</view>
					<view class="stats-row">
						<text class="stats-label">正确数</text>
						<text class="stats-value">{{ correctAnswers }}</text>
					</view>
					<view class="stats-row">
						<text class="stats-label">准确率</text>
						<text class="stats-value">{{ accuracyRate }}%</text>
					</view>
					<view class="stats-row">
						<text class="stats-label">平均反应时间</text>
						<text class="stats-value">{{ averageReactionTime }}s</text>
					</view>
				</view>
				<button class="stats-home-btn" @tap="returnHome">
					<text class="btn-icon">🌱</text>
					返回主页
				</button>
			</view>
		</view>
		
		<!-- PK模式玩家切换页面 -->
		<view v-if="showPlayerSwitch" class="player-switch-page">
			<view class="switch-content">
				<view class="player-avatars">
					<view class="player-avatar left">👤</view>
					<view class="vs-icon">VS</view>
					<view class="player-avatar right">👤</view>
				</view>
				<view class="switch-title">玩家2准备中...</view>
				<view class="countdown">{{ countdown }}</view>
				<button class="skip-btn" @tap="skipCountdown">跳过</button>
			</view>
		</view>
		
		<!-- PK模式结算页面 -->
		<view v-if="showPkResult" class="pk-result-page">
			<view class="pk-result-content">
				<view class="pk-title">对战结果</view>
				<view class="players-comparison">
					<view class="player-result">
						<view class="player-name">玩家1</view>
						<view class="player-stats">
							<view class="stat-item">
								<text class="stat-label">总题数</text>
								<text class="stat-value">{{ player1Stats.total }}</text>
								<text v-if="player1Stats.total >= player2Stats.total" class="crown">👑</text>
							</view>
							<view class="stat-item">
								<text class="stat-label">正确数</text>
								<text class="stat-value">{{ player1Stats.correct }}</text>
								<text v-if="player1Stats.correct >= player2Stats.correct" class="crown">👑</text>
							</view>
							<view class="stat-item">
								<text class="stat-label">准确率</text>
								<text class="stat-value">{{ player1Stats.accuracyRate }}%</text>
								<text v-if="player1Stats.accuracyRate >= player2Stats.accuracyRate" class="crown">👑</text>
							</view>
							<view class="stat-item">
								<text class="stat-label">平均反应</text>
								<text class="stat-value">{{ player1Stats.avgReactionTime }}s</text>
								<text v-if="parseFloat(player1Stats.avgReactionTime) <= parseFloat(player2Stats.avgReactionTime)" class="crown">👑</text>
							</view>
						</view>
					</view>
					<view class="player-result">
						<view class="player-name">玩家2</view>
						<view class="player-stats">
							<view class="stat-item">
								<text class="stat-label">总题数</text>
								<text class="stat-value">{{ player2Stats.total }}</text>
								<text v-if="player2Stats.total >= player1Stats.total" class="crown">👑</text>
							</view>
							<view class="stat-item">
								<text class="stat-label">正确数</text>
								<text class="stat-value">{{ player2Stats.correct }}</text>
								<text v-if="player2Stats.correct >= player1Stats.correct" class="crown">👑</text>
							</view>
							<view class="stat-item">
								<text class="stat-label">准确率</text>
								<text class="stat-value">{{ player2Stats.accuracyRate }}%</text>
								<text v-if="player2Stats.accuracyRate >= player1Stats.accuracyRate" class="crown">👑</text>
							</view>
							<view class="stat-item">
								<text class="stat-label">平均反应</text>
								<text class="stat-value">{{ player2Stats.avgReactionTime }}s</text>
								<text v-if="parseFloat(player2Stats.avgReactionTime) <= parseFloat(player1Stats.avgReactionTime)" class="crown">👑</text>
							</view>
						</view>
					</view>
				</view>
				<button class="pk-home-btn" @tap="returnHome">
					<text class="btn-icon">🌱</text>
					返回主页
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapActions, mapGetters } from 'vuex'
	import Staff from '@/components/Staff/Staff.vue'
	import Jianpu from '@/components/Jianpu/Jianpu.vue'
	import Piano from '@/components/Piano/Piano.vue'
	
	export default {
		components: {
			Staff,
			Jianpu,
			Piano
		},
		
		data() {
			return {
				// 音符数据
				notesList: [
					{ abc: 'X:1\nL:1/4\nK:C\nC', jianpu: '1', octave: 4, pianoKey: 'C4' },
					{ abc: 'X:1\nL:1/4\nK:C\nD', jianpu: '2', octave: 4, pianoKey: 'D4' },
					{ abc: 'X:1\nL:1/4\nK:C\nE', jianpu: '3', octave: 4, pianoKey: 'E4' },
					{ abc: 'X:1\nL:1/4\nK:C\nF', jianpu: '4', octave: 4, pianoKey: 'F4' },
					{ abc: 'X:1\nL:1/4\nK:C\nG', jianpu: '5', octave: 4, pianoKey: 'G4' },
					{ abc: 'X:1\nL:1/4\nK:C\nA', jianpu: '6', octave: 4, pianoKey: 'A4' },
					{ abc: 'X:1\nL:1/4\nK:C\nB', jianpu: '7', octave: 4, pianoKey: 'B4' },
					{ abc: 'X:1\nL:1/4\nK:C\nc', jianpu: '1', octave: 5, pianoKey: 'C5' }
				],
				
				// 弹窗状态
				showEndModal: false,
				showStatsModal: false,
				showPlayerSwitch: false,
				showPkResult: false,
				
				// 倒计时
				countdown: 3,
				countdownTimer: null,
				
				// 自动下一题定时器
				autoNextTimer: null
			}
		},
		
		computed: {
			...mapState([
				'gameMode', 'maxQuestions', 'currentQuestionIndex', 'currentNote', 'selectedKey',
				'hasShownJianpu', 'isPaused', 'totalQuestions', 'correctAnswers', 'reactionTimes',
				'currentPlayer', 'player1Stats', 'player2Stats', 'questionStartTime', 'pauseStartTime', 'totalPauseTime'
			]),
			
			...mapGetters(['accuracyRate', 'averageReactionTime', 'getPlayerStats']),
			
			// 获取玩家1统计数据
			player1Stats() {
				return this.getPlayerStats(1)
			},
			
			// 获取玩家2统计数据  
			player2Stats() {
				return this.getPlayerStats(2)
			},
			
			// 弹窗文本
			endModalTitle() {
				return this.gameMode === 'pk' && this.currentPlayer === 1 ? '提前结束练习？' : '提前结束练习？'
			},
			
			endModalText() {
				const progress = this.maxQuestions === Infinity ? '∞' : this.maxQuestions
				return `已完成 ${this.currentQuestionIndex}/${progress}，确认将丢失未答题进度`
			},
			
			endConfirmText() {
				return this.gameMode === 'pk' && this.currentPlayer === 1 ? '切换玩家' : '确认结束'
			},
			
			statsTitle() {
				return this.gameMode === 'pk' ? 'PK完成！' : '练习完成！'
			}
		},
		
		mounted() {
			this.startNewNote()
		},
		
		beforeDestroy() {
			this.clearTimers()
		},
		
		methods: {
			...mapActions(['confirmAnswer', 'nextQuestion', 'switchToPlayer2']),
			
			// 开始新题目
			startNewNote() {
				// 随机选择一个音符
				const randomIndex = Math.floor(Math.random() * this.notesList.length)
				const note = this.notesList[randomIndex]
				
				this.$store.commit('SET_CURRENT_NOTE', note)
				this.$store.commit('SET_SELECTED_KEY', null)
				this.$store.commit('SET_HAS_SHOWN_JIANPU', false)
				this.$store.commit('SET_TIME', { 
					questionStartTime: Date.now(),
					pauseStartTime: null,
					totalPauseTime: 0
				})
			},
			
			// 选择钢琴键
			selectKey(key) {
				if (this.isPaused) return
				this.$store.commit('SET_SELECTED_KEY', key)
			},
			
			// 确认答案
			async confirmAnswer() {
				if (this.isPaused || this.hasShownJianpu) return
				
				const reactionTime = this.calculateReactionTime()
				const isCorrect = this.checkAnswer()
				
				// 提交答案
				await this.$store.dispatch('confirmAnswer', { isCorrect, reactionTime })
				
				// 检查是否完成
				if (this.currentQuestionIndex >= this.maxQuestions) {
					this.handleGameComplete()
				} else if (isCorrect) {
					// 正确答案自动跳下一题
					this.autoNextTimer = setTimeout(() => {
						if (!this.isPaused) {
							this.nextQuestion()
						}
					}, 1000)
				}
			},
			
			// 下一题
			async nextQuestion() {
				if (this.isPaused) return
				this.clearTimers()
				
				if (!this.hasShownJianpu) {
					// 用户直接点击下一道
					const reactionTime = this.calculateReactionTime()
					await this.$store.dispatch('nextQuestion', { 
						hasShownJianpu: false, 
						reactionTime 
					})
				}
				
				// 检查是否完成
				if (this.currentQuestionIndex >= this.maxQuestions) {
					this.handleGameComplete()
				} else {
					setTimeout(() => {
						this.startNewNote()
					}, 1000)
				}
			},
			
			// 检查答案
			checkAnswer() {
				if (!this.selectedKey || !this.currentNote) return false
				return this.selectedKey === this.currentNote.pianoKey
			},
			
			// 计算反应时间
			calculateReactionTime() {
				if (!this.questionStartTime) return 0
				return Date.now() - this.questionStartTime - this.totalPauseTime
			},
			
			// 处理游戏完成
			handleGameComplete() {
				if (this.gameMode === 'pk' && this.currentPlayer === 1) {
					// PK模式玩家1完成，切换到玩家2
					this.showPlayerSwitchScreen()
				} else {
					// 显示统计
					this.showStatsScreen()
				}
			},
			
			// 显示玩家切换屏幕
			showPlayerSwitchScreen() {
				this.showPlayerSwitch = true
				this.countdown = 3
				this.startCountdown()
			},
			
			// 开始倒计时
			startCountdown() {
				this.countdownTimer = setInterval(() => {
					this.countdown--
					if (this.countdown <= 0) {
						this.switchPlayer()
					}
				}, 1000)
			},
			
			// 跳过倒计时
			skipCountdown() {
				this.switchPlayer()
			},
			
			// 切换玩家
			switchPlayer() {
				this.clearTimers()
				this.showPlayerSwitch = false
				this.$store.dispatch('switchToPlayer2')
				this.$store.commit('SET_CURRENT_NOTE', null)
				this.startNewNote()
			},
			
			// 显示统计屏幕
			showStatsScreen() {
				if (this.gameMode === 'pk') {
					this.showPkResult = true
				} else {
					this.showStatsModal = true
				}
			},
			
			// 显示结束确认弹窗
			showEndConfirm() {
				if (this.isPaused) return
				this.showEndModal = true
			},
			
			// 关闭结束确认弹窗
			closeEndModal() {
				this.showEndModal = false
			},
			
			// 确认结束
			confirmEnd() {
				this.closeEndModal()
				
				if (this.gameMode === 'pk' && this.currentPlayer === 1) {
					// PK模式玩家1结束，切换到玩家2
					this.showPlayerSwitchScreen()
				} else {
					// 显示统计
					this.showStatsScreen()
				}
			},
			
			// 返回主页
			returnHome() {
				this.clearTimers()
				uni.navigateBack()
			},
			
			// 处理页面点击（暂停/继续）
			handlePageTap(e) {
				// 检查是否点击了按钮或钢琴键
				const target = e.target
				if (target.classList && (
					target.classList.contains('control-btn') ||
					target.classList.contains('piano-key') ||
					target.closest('.control-btn') ||
					target.closest('.piano-key')
				)) {
					return
				}
				
				this.togglePause()
			},
			
			// 切换暂停状态
			togglePause() {
				const newPaused = !this.isPaused
				this.$store.commit('SET_PAUSED', newPaused)
				
				if (newPaused) {
					// 暂停
					this.$store.commit('SET_TIME', { pauseStartTime: Date.now() })
					this.clearTimers()
				} else {
					// 继续
					const pauseDuration = Date.now() - this.pauseStartTime
					this.$store.commit('SET_TIME', { 
						pauseStartTime: null,
						totalPauseTime: this.totalPauseTime + pauseDuration
					})
				}
			},
			
			// 清理定时器
			clearTimers() {
				if (this.autoNextTimer) {
					clearTimeout(this.autoNextTimer)
					this.autoNextTimer = null
				}
				if (this.countdownTimer) {
					clearInterval(this.countdownTimer)
					this.countdownTimer = null
				}
			}
		}
	}
</script>

<style scoped>
	.learning-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
	}
	
	.learning-page.paused {
		/* 暂停时的样式 */
	}
	
	/* 暂停遮罩 */
	.pause-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(10rpx);
	}
	
	.pause-icon {
		font-size: 120rpx;
		margin-bottom: 24rpx;
	}
	
	.pause-text {
		color: #ffffff;
		font-size: 48rpx;
		font-weight: 600;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
	}
	
	/* 主要内容区域 */
	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 32rpx;
		gap: 24rpx;
		box-sizing: border-box;
	}
	
	/* 乐谱显示区域 */
	.notation-area {
		flex: 3;
		display: flex;
		gap: 32rpx;
		min-height: 400rpx;
	}
	
	.staff-section,
	.jianpu-section {
		flex: 1;
		border-radius: 40rpx;
		display: flex;
		flex-direction: column;
		position: relative;
		box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(20rpx);
		border: 2rpx solid rgba(255, 255, 255, 0.3);
	}
	
	.staff-section {
		background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FECFEF 100%);
	}
	
	.jianpu-section {
		background: linear-gradient(135deg, #A8EDEA 0%, #FED6E3 50%, #D299C2 100%);
	}
	
	.section-title {
		position: absolute;
		top: 24rpx;
		left: 50%;
		transform: translateX(-50%);
		font-size: 36rpx;
		font-weight: 700;
		color: #1D3557;
		text-shadow: 0 2rpx 6rpx rgba(255, 255, 255, 0.8);
		letter-spacing: 1rpx;
		z-index: 10;
		background: rgba(255, 255, 255, 0.85);
		padding: 16rpx 40rpx;
		border-radius: 50rpx;
		backdrop-filter: blur(20rpx);
		border: 4rpx solid rgba(255, 255, 255, 0.6);
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
	}
	
	.section-content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 80rpx;
		padding: 20rpx;
	}
	
	/* 控制按钮区域 */
	.control-area {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 24rpx;
		height: 100rpx;
	}
	
	.control-btn {
		font-size: 30rpx;
		font-weight: 600;
		color: #ffffff;
		border: none;
		border-radius: 24rpx;
		transition: all 0.2s ease;
		box-shadow: 0 8rpx 32rpx rgba(0, 122, 255, 0.3);
		letter-spacing: -0.48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.confirm-btn {
		background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
	}
	
	.next-btn {
		background: linear-gradient(135deg, #34C759 0%, #28A745 100%);
		box-shadow: 0 8rpx 32rpx rgba(52, 199, 89, 0.3);
	}
	
	.end-btn {
		background: linear-gradient(135deg, #FF3B30 0%, #D70015 100%);
		box-shadow: 0 8rpx 32rpx rgba(255, 59, 48, 0.3);
	}
	
	.control-btn:active {
		transform: translateY(4rpx);
	}
	
	.control-btn:disabled {
		opacity: 0.5;
		transform: none;
	}
	
	/* 钢琴区域 */
	.piano-area {
		flex: 2;
		min-height: 300rpx;
	}
	
	/* 弹窗样式 */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
		backdrop-filter: blur(10rpx);
	}
	
	.modal-content {
		background: #ffffff;
		border-radius: 32rpx;
		padding: 64rpx;
		margin: 40rpx;
		max-width: 600rpx;
		width: 100%;
		box-shadow: 0 40rpx 120rpx rgba(0, 0, 0, 0.4);
	}
	
	.modal-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #1D1D1F;
		margin-bottom: 16rpx;
		text-align: center;
	}
	
	.modal-text {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 48rpx;
		line-height: 1.4;
		text-align: center;
	}
	
	.modal-buttons {
		display: flex;
		gap: 24rpx;
	}
	
	.modal-btn {
		flex: 1;
		padding: 24rpx 40rpx;
		border: none;
		border-radius: 24rpx;
		font-size: 30rpx;
		font-weight: 600;
		transition: all 0.2s ease;
	}
	
	.cancel-btn {
		background: #F2F2F7;
		color: #1D1D1F;
		flex: 3;
	}
	
	.modal-btn.confirm-btn {
		background: #FF3B30;
		color: #ffffff;
		flex: 7;
	}
	
	/* 统计弹窗样式 */
	.stats-modal-content {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 48rpx;
		padding: 80rpx;
		max-width: 900rpx;
		width: 90%;
		text-align: center;
		box-shadow: 0 40rpx 120rpx rgba(0, 0, 0, 0.4);
	}
	
	.stats-header {
		margin-bottom: 64rpx;
	}
	
	.stats-title {
		font-size: 48rpx;
		font-weight: 700;
		color: #ffffff;
		margin-bottom: 16rpx;
		text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
	}
	
	.stats-icon {
		font-size: 96rpx;
	}
	
	.stats-details {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 32rpx;
		padding: 48rpx;
		margin-bottom: 48rpx;
	}
	
	.stats-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
		border-bottom: 2rpx solid #F2F2F7;
	}
	
	.stats-row:last-child {
		border-bottom: none;
	}
	
	.stats-label {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
	}
	
	.stats-value {
		font-size: 36rpx;
		font-weight: 700;
		color: #1D1D1F;
	}
	
	.stats-home-btn,
	.pk-home-btn {
		background: linear-gradient(135deg, #34C759 0%, #28A745 100%);
		color: #ffffff;
		border: none;
		border-radius: 32rpx;
		padding: 32rpx 64rpx;
		font-size: 32rpx;
		font-weight: 600;
		box-shadow: 0 8rpx 32rpx rgba(52, 199, 89, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		margin: 0 auto;
	}
	
	.btn-icon {
		font-size: 36rpx;
		animation: grow 2s ease-in-out infinite;
	}
	
	@keyframes grow {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.2); }
	}
	
	/* PK模式样式 */
	.player-switch-page {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9998;
	}
	
	.switch-content {
		text-align: center;
		color: #ffffff;
	}
	
	.player-avatars {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 80rpx;
		margin-bottom: 64rpx;
	}
	
	.player-avatar {
		width: 160rpx;
		height: 160rpx;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 80rpx;
	}
	
	.vs-icon {
		font-size: 48rpx;
		font-weight: 700;
		color: #ffffff;
		text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
	}
	
	.switch-title {
		font-size: 56rpx;
		font-weight: 700;
		margin-bottom: 48rpx;
		text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
	}
	
	.countdown {
		font-size: 144rpx;
		font-weight: 700;
		margin-bottom: 48rpx;
		text-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.3);
		animation: pulse 1s ease-in-out infinite;
	}
	
	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}
	
	.skip-btn {
		background: rgba(255, 255, 255, 0.2);
		color: #ffffff;
		border: 4rpx solid rgba(255, 255, 255, 0.3);
		border-radius: 24rpx;
		padding: 24rpx 48rpx;
		font-size: 28rpx;
		font-weight: 600;
		backdrop-filter: blur(20rpx);
	}
	
	/* PK结算页面 */
	.pk-result-page {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9997;
		padding: 40rpx;
		box-sizing: border-box;
		backdrop-filter: blur(10rpx);
	}
	
	.pk-result-content {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 48rpx;
		padding: 64rpx;
		max-width: 1200rpx;
		width: 100%;
		text-align: center;
		box-shadow: 0 40rpx 120rpx rgba(0, 0, 0, 0.4);
	}
	
	.pk-title {
		font-size: 48rpx;
		font-weight: 700;
		color: #ffffff;
		margin-bottom: 48rpx;
		text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
	}
	
	.players-comparison {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 32rpx;
		padding: 40rpx;
		margin-bottom: 48rpx;
		display: flex;
		gap: 40rpx;
	}
	
	.player-result {
		flex: 1;
		background: #F8F9FA;
		border-radius: 24rpx;
		padding: 32rpx;
	}
	
	.player-name {
		font-size: 32rpx;
		font-weight: 700;
		color: #1D1D1F;
		margin-bottom: 32rpx;
	}
	
	.stat-item {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 2rpx solid #E9ECEF;
		position: relative;
		padding-right: 70rpx;
		gap: 24rpx;
	}
	
	.stat-item:last-child {
		border-bottom: none;
	}
	
	.stat-item .stat-label {
		font-size: 24rpx;
		color: #666;
		font-weight: 500;
		width: 140rpx;
		text-align: left;
		flex-shrink: 0;
	}
	
	.stat-item .stat-value {
		font-size: 28rpx;
		font-weight: 700;
		color: #1D1D1F;
		margin-right: 12rpx;
		flex: 1;
		text-align: right;
	}
	
	.crown {
		position: absolute;
		right: 12rpx;
		top: 50%;
		transform: translateY(-50%);
		font-size: 32rpx;
		animation: rotate 2s linear infinite;
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	@keyframes rotate {
		from { transform: translateY(-50%) rotateY(0deg); }
		to { transform: translateY(-50%) rotateY(360deg); }
	}
	
	/* 响应式设计 */
	@media (orientation: portrait) {
		.notation-area {
			flex-direction: column;
			gap: 20rpx;
		}
		
		.players-comparison {
			flex-direction: column;
			gap: 24rpx;
		}
		
		.stat-item .stat-label {
			width: 120rpx;
			font-size: 22rpx;
		}
		
		.stat-item .stat-value {
			font-size: 26rpx;
		}
		
		.crown {
			font-size: 28rpx;
			width: 36rpx;
			height: 36rpx;
		}
	}
</style> 