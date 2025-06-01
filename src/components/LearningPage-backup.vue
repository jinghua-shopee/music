<template>
	<div class="learning-page">
		<div class="learning-content">
			<h1 class="title">🎹 {{ pageTitle }}</h1>
			
			<div class="game-info">
				<div class="mode-info">
					<span class="label">模式:</span>
					<span class="value">{{ gameModeText }}</span>
				</div>
				<div class="progress-info">
					<span class="label">进度:</span>
					<span class="value">{{ progressText }}</span>
				</div>
				<div v-if="gameMode === 'pk'" class="player-info">
					<span class="label">当前玩家:</span>
					<span class="value">玩家{{ currentPlayer }}</span>
				</div>
			</div>
			
			<div class="note-display">
				<div class="staff-area">
					<h3>五线谱</h3>
					<div class="staff-placeholder">
						<Staff :note="currentNote" />
					</div>
				</div>
				
				<div class="jianpu-area">
					<h3>简谱</h3>
					<div class="jianpu-placeholder">
						<Jianpu :note="currentNote" :show="hasShownJianpu" />
					</div>
				</div>
			</div>
			
			<div class="controls">
				<button 
					v-if="!hasShownJianpu"
					class="control-btn primary-btn staff-width" 
					:disabled="!selectedKey"
					@click="confirmAnswer"
				>
					确认答案
				</button>
				<button 
					v-if="hasShownJianpu && !isGameCompleted"
					class="control-btn primary-btn staff-width" 
					@click="nextQuestion"
				>
					下一题
				</button>
				<button 
					v-if="isGameCompleted"
					class="control-btn complete-btn staff-width" 
					@click="showSummary"
				>
					查看总结
				</button>
				<button class="control-btn danger-btn jianpu-width" @click="handleEndGame">{{ endButtonText }}</button>
			</div>
			
			<div class="piano-area">
				<Piano 
					:selectedKey="selectedKey" 
					:highlightKey="currentNote ? currentNote.pianoKey : null"
					:showAnswer="hasShownJianpu"
					@key-select="selectKey"
				/>
			</div>
		</div>
		
		<!-- 学习总结弹窗 -->
		<div v-if="showSummaryModal" class="summary-modal">
			<div class="summary-content">
				<div class="summary-header">
					<div class="summary-icon">🎉</div>
					<h2>{{ gameMode === 'pk' ? 'PK对战总结' : '学习总结' }}</h2>
				</div>
				
				<div v-if="gameMode !== 'pk'" class="summary-stats">
					<div class="stat-item">
						<div class="stat-icon">📊</div>
						<div class="stat-label">总题数</div>
						<div class="stat-value">{{ totalQuestions }}</div>
					</div>
					<div class="stat-item">
						<div class="stat-icon">✅</div>
						<div class="stat-label">正确数</div>
						<div class="stat-value correct">{{ correctAnswers }}</div>
					</div>
					<div class="stat-item">
						<div class="stat-icon">❌</div>
						<div class="stat-label">错误数</div>
						<div class="stat-value wrong">{{ wrongAnswers }}</div>
					</div>
					<div class="stat-item">
						<div class="stat-icon">🎯</div>
						<div class="stat-label">正确率</div>
						<div class="stat-value">{{ accuracyRate }}%</div>
					</div>
					<div class="stat-item">
						<div class="stat-icon">⏱️</div>
						<div class="stat-label">平均反应时间</div>
						<div class="stat-value">{{ averageReactionTime }}秒</div>
					</div>
				</div>
				
				<!-- PK模式对比 -->
				<div v-if="gameMode === 'pk'" class="pk-comparison">
					<div class="pk-stats-grid">
						<div class="pk-stat-row">
							<div class="stat-header">正确率</div>
							<div class="player-stat">
								<span class="crown rotating-crown" v-if="player1AccuracyRate > player2AccuracyRate">👑</span>
								{{ player1AccuracyRate }}%
							</div>
							<div class="vs-divider">VS</div>
							<div class="player-stat">
								<span class="crown rotating-crown" v-if="player2AccuracyRate > player1AccuracyRate">👑</span>
								{{ player2AccuracyRate }}%
							</div>
						</div>
						
						<div class="pk-stat-row">
							<div class="stat-header">平均时间</div>
							<div class="player-stat">
								<span class="crown rotating-crown" v-if="player1AverageReactionTime < player2AverageReactionTime && player1AverageReactionTime > 0 && player2AverageReactionTime > 0">👑</span>
								{{ player1AverageReactionTime }}秒
							</div>
							<div class="vs-divider">VS</div>
							<div class="player-stat">
								<span class="crown rotating-crown" v-if="player2AverageReactionTime < player1AverageReactionTime && player2AverageReactionTime > 0 && player1AverageReactionTime > 0">👑</span>
								{{ player2AverageReactionTime }}秒
							</div>
						</div>
					</div>
					
					<div class="final-winner">
						{{ getWinner() }}
					</div>
				</div>
				
				<div class="summary-actions">
					<button class="control-btn restart-btn" @click="restartGame">再来一次</button>
					<button class="control-btn danger-btn" @click="closeSummaryAndGoBack">返回首页</button>
				</div>
			</div>
		</div>
		
		<!-- 确认退出弹窗 -->
		<div v-if="showExitConfirm" class="exit-confirm-modal">
			<div class="exit-confirm-content">
				<div class="exit-header">
					<div class="exit-icon">🤔</div>
					<h2>{{ gameMode === 'pk' ? '确认退出PK？' : '确认退出学习' }}</h2>
				</div>
				<div class="exit-progress">
					<div class="progress-circle">
						<div class="progress-number">{{ totalQuestions }}</div>
						<div class="progress-label">已完成题数</div>
					</div>
				</div>
				<p class="exit-message">您已经完成了 <strong>{{ totalQuestions }}</strong> 道题，是否要退出并查看学习报告？</p>
				<div class="exit-actions">
					<button class="control-btn primary-btn" @click="exitWithReport">查看报告并退出</button>
					<button class="control-btn outline-btn" @click="cancelExit">{{ gameMode === 'pk' ? '继续PK' : '继续学习' }}</button>
					<button class="control-btn danger-btn" @click="exitDirectly">直接退出</button>
				</div>
			</div>
		</div>
		
		<!-- PK模式切换玩家提示 -->
		<div v-if="showPKSwitch" class="pk-switch-modal">
			<div class="pk-switch-content">
				<div class="pk-switch-header">
					<div class="pk-switch-icon">🔄</div>
					<h2>是否切换到玩家2？</h2>
				</div>
				<div class="pk-switch-message">
					<p>当前游戏正在进行中，您可以选择：</p>
				</div>
				<div class="pk-switch-actions">
					<button class="control-btn primary-btn" @click="switchToPlayer2">切换到玩家2</button>
					<button class="control-btn outline-btn" @click="cancelPKSwitch">继续当前游戏</button>
				</div>
			</div>
		</div>
		
		<!-- PK模式切换玩家提示 -->
		<div v-if="showPlayerSwitch" class="player-switch-modal">
			<div class="switch-content">
				<h2>玩家{{ currentPlayer === 1 ? 2 : 1 }}完成！</h2>
				<p>请玩家{{ currentPlayer }}准备开始答题</p>
				<div class="pk-progress">
					<div v-if="currentPlayer === 1">
						<p>玩家1成绩: {{ player1Stats.correct }}/{{ maxQuestions }} 正确</p>
					</div>
				</div>
				<button class="control-btn primary-btn" @click="confirmPlayerSwitch">开始答题</button>
			</div>
		</div>
		
		<!-- 玩家2动画页面 -->
		<div v-if="showPlayer2Animation" class="player2-animation-modal">
			<div class="player2-animation-content">
				<div class="player-avatar">
					<div class="avatar-circle player2-avatar">
						<span class="player-number">2</span>
					</div>
				</div>
				<h1 class="player-title">玩家2 开始答题！</h1>
				<div class="countdown-display">{{ countdown }}</div>
				<div class="motivation-text">准备好挑战玩家1了吗？</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapState, mapGetters, mapActions } from 'vuex'
	import Staff from '@/components/Staff/Staff.vue'
	import Jianpu from '@/components/Jianpu/Jianpu.vue'
	import Piano from '@/components/Piano/Piano.vue'
	
	export default {
		name: 'LearningPage',
		
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
					{ abc: 'X:1\nL:1/4\nK:C\nc', jianpu: '1', octave: 5, pianoKey: 'C5' },
					{ abc: 'X:1\nL:1/4\nK:C\nC,', jianpu: '1', octave: 3, pianoKey: 'C3' },
					{ abc: 'X:1\nL:1/4\nK:C\nD,', jianpu: '2', octave: 3, pianoKey: 'D3' },
					{ abc: 'X:1\nL:1/4\nK:C\nE,', jianpu: '3', octave: 3, pianoKey: 'E3' }
				],
				
				questionStartTime: null,
				showSummaryModal: false,
				showPlayerSwitch: false,
				showExitConfirm: false,
				showPKSwitch: false,
				showPlayer2Animation: false,
				countdown: 3
			}
		},
		
		computed: {
			...mapState([
				'gameMode', 'maxQuestions', 'currentQuestionIndex', 'currentNote', 
				'selectedKey', 'hasShownJianpu', 'totalQuestions', 'correctAnswers', 'wrongAnswers',
				'currentPlayer', 'player1Stats', 'player2Stats', 'pkPhase'
			]),
			...mapGetters([
				'accuracyRate', 'averageReactionTime', 'player1AccuracyRate', 'player2AccuracyRate',
				'player1AverageReactionTime', 'player2AverageReactionTime', 'hasCompletedQuestions',
				'currentPlayerCompleted', 'pkGameCompleted'
			]),
			
			pageTitle() {
				if (this.gameMode === 'pk') {
					if (this.pkPhase === 'player1') {
						return `PK对战 - 玩家1`
					} else if (this.pkPhase === 'player2') {
						return `PK对战 - 玩家2`
					} else {
						return `PK对战已结束`
					}
				}
				return '学习中...'
			},
			
			gameModeText() {
				return this.gameMode === 'practice' ? '练习模式' : 'PK模式'
			},
			
			progressText() {
				if (this.gameMode === 'pk') {
					const playerStats = this.currentPlayer === 1 ? this.player1Stats : this.player2Stats
					const playerTotal = playerStats.correct + playerStats.wrong
					if (this.maxQuestions === Infinity) {
						return `第 ${playerTotal + 1} 题 (无尽模式)`
					}
					return `${playerTotal} / ${this.maxQuestions}`
				} else {
					if (this.maxQuestions === Infinity) {
						return `第 ${this.totalQuestions + 1} 题 (无尽模式)`
					}
					return `${this.totalQuestions} / ${this.maxQuestions}`
				}
			},
			
			isGameCompleted() {
				if (this.gameMode === 'pk') {
					return this.pkGameCompleted
				} else {
					return this.totalQuestions >= this.maxQuestions
				}
			},
			
			endButtonText() {
				if (this.isGameCompleted) {
					return '查看总结'
				}
				return '结束'
			}
		},
		
		mounted() {
			console.log('Learning page mounted')
			console.log('Game mode:', this.gameMode)
			console.log('Max questions:', this.maxQuestions)
			this.startNewNote()
		},
		
		methods: {
			...mapActions(['confirmAnswer', 'nextQuestion', 'startGame', 'switchPKPlayer']),
			
			// 开始新题目
			startNewNote() {
				// 随机选择一个音符
				const randomIndex = Math.floor(Math.random() * this.notesList.length)
				const note = this.notesList[randomIndex]
				
				this.$store.commit('SET_CURRENT_NOTE', note)
				this.$store.commit('SET_SELECTED_KEY', null)
				this.$store.commit('SET_HAS_SHOWN_JIANPU', false)
				this.questionStartTime = Date.now()
				
				console.log('New question:', note)
			},
			
			// 选择钢琴键
			selectKey(key) {
				this.$store.commit('SET_SELECTED_KEY', key)
				console.log('Selected key:', key)
			},
			
			// 确认答案
			async confirmAnswer() {
				if (this.hasShownJianpu) return
				
				const reactionTime = Date.now() - this.questionStartTime
				const isCorrect = this.checkAnswer()
				
				console.log('Answer:', {
					selected: this.selectedKey,
					correct: this.currentNote.pianoKey,
					isCorrect,
					reactionTime
				})
				
				// 提交答案
				await this.$store.dispatch('confirmAnswer', { isCorrect, reactionTime })
				
				// 播放正确答案的声音
				if (this.currentNote && this.currentNote.pianoKey) {
					setTimeout(() => {
						this.playCorrectAnswerSound(this.currentNote.pianoKey)
					}, 500)
				}
			},
			
			// 播放正确答案的声音
			playCorrectAnswerSound(keyId) {
				try {
					// 使用Web Audio API播放简单的音调
					if (window.AudioContext || window.webkitAudioContext) {
						const audioContext = new (window.AudioContext || window.webkitAudioContext)()
						const oscillator = audioContext.createOscillator()
						const gainNode = audioContext.createGain()
						
						// 根据音符计算频率
						const frequency = this.getFrequency(keyId)
						oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
						oscillator.type = 'sine'
						
						// 设置音量和时长
						gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
						gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0)
						
						oscillator.connect(gainNode)
						gainNode.connect(audioContext.destination)
						
						oscillator.start(audioContext.currentTime)
						oscillator.stop(audioContext.currentTime + 1.0)
					}
				} catch (error) {
					console.warn('Cannot play correct answer audio:', error)
				}
			},
			
			// 获取音符频率
			getFrequency(keyId) {
				// 基础频率映射 (C4 = 261.63 Hz)
				const frequencies = {
					'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
					'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
					'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
				}
				return frequencies[keyId] || 440.00
			},
			
			// 下一题
			async nextQuestion() {
				const wasCurrentPlayerCompleted = this.currentPlayerCompleted
				
				if (!this.hasShownJianpu) {
					// 用户直接点击下一题而没有确认答案，记录为错误
					const reactionTime = Date.now() - this.questionStartTime
					await this.$store.dispatch('nextQuestion', { 
						hasShownJianpu: false, 
						reactionTime 
					})
				} else {
					// 正常下一题
					await this.$store.dispatch('nextQuestion')
				}
				
				// 检查是否需要切换玩家或完成
				if (this.gameMode === 'pk') {
					if (wasCurrentPlayerCompleted && !this.pkGameCompleted) {
						// 当前玩家刚刚完成，显示切换动画
						if (this.currentPlayer === 2) {
							// 现在是玩家2，说明刚从玩家1切换过来
							this.showPlayer2AnimationPage()
							return
						} else if (this.currentPlayer === 1 && this.pkGameCompleted) {
							// 游戏完全结束
							console.log('PK Game completed!')
							return
						}
					} else if (this.pkGameCompleted) {
						// 两个玩家都完成了
						console.log('PK Game completed!')
						return
					}
				}
				
				// 检查是否完成
				if (this.isGameCompleted) {
					console.log('Game completed!')
				} else {
					setTimeout(() => {
						this.startNewNote()
					}, 500)
				}
			},
			
			// 确认玩家切换
			confirmPlayerSwitch() {
				this.showPlayerSwitch = false
				if (this.currentPlayer === 1) {
					// 切换到玩家2，显示动画
					this.showPlayer2AnimationPage()
				} else {
					this.$store.dispatch('switchPKPlayer')
					setTimeout(() => {
						this.startNewNote()
					}, 500)
				}
			},
			
			// 处理结束游戏
			handleEndGame() {
				if (this.isGameCompleted) {
					// 游戏已完成，直接显示总结
					this.showSummary()
				} else if (this.gameMode === 'pk' && this.currentPlayer === 1) {
					// PK模式下玩家1点击结束，提示切换玩家2
					this.showPKSwitch = true
				} else if (this.hasCompletedQuestions) {
					// 有完成的题目，需要确认
					this.showExitConfirm = true
				} else {
					// 没有完成任何题目，直接退出
					this.goBack()
				}
			},
			
			// 退出并显示报告
			exitWithReport() {
				this.showExitConfirm = false
				this.showSummary()
			},
			
			// 直接退出
			exitDirectly() {
				this.showExitConfirm = false
				this.goBack()
			},
			
			// 取消退出
			cancelExit() {
				this.showExitConfirm = false
			},
			
			// 检查答案
			checkAnswer() {
				if (!this.selectedKey || !this.currentNote) return false
				return this.selectedKey === this.currentNote.pianoKey
			},
			
			// 显示学习总结
			showSummary() {
				this.showSummaryModal = true
			},
			
			// 获取PK模式获胜者
			getWinner() {
				if (this.gameMode !== 'pk') return ''
				
				const player1Score = this.player1Stats.correct
				const player2Score = this.player2Stats.correct
				
				if (player1Score > player2Score) {
					return '🏆 玩家1获胜！'
				} else if (player2Score > player1Score) {
					return '🏆 玩家2获胜！'
				} else {
					return '🤝 平局！'
				}
			},
			
			// 重新开始游戏
			restartGame() {
				this.showSummaryModal = false
				const gameData = {
					mode: this.gameMode,
					maxQuestions: this.maxQuestions
				}
				this.startGame(gameData)
				this.startNewNote()
			},
			
			// 关闭总结并返回首页
			closeSummaryAndGoBack() {
				this.showSummaryModal = false
				this.goBack()
			},
			
			goBack() {
				uni.navigateBack({
					delta: 1
				})
			},
			
			switchToPlayer2() {
				this.showPKSwitch = false
				this.showPlayer2AnimationPage()
			},
			
			cancelPKSwitch() {
				this.showPKSwitch = false
			},
			
			showPlayer2AnimationPage() {
				this.showPlayer2Animation = true
				this.countdown = 3
				const timer = setInterval(() => {
					this.countdown--
					if (this.countdown <= 0) {
						clearInterval(timer)
						this.showPlayer2Animation = false
						this.$store.dispatch('switchPKPlayer')
						setTimeout(() => {
							this.startNewNote()
						}, 500)
					}
				}, 1000)
			}
		}
	}
</script>

<style scoped>
	.learning-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
		box-sizing: border-box;
	}
	
	.learning-content {
		max-width: 1000px;
		margin: 0 auto;
		color: white;
	}
	
	.title {
		text-align: center;
		font-size: 32px;
		margin-bottom: 30px;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	
	.game-info {
		display: flex;
		justify-content: space-between;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 15px 20px;
		margin-bottom: 30px;
		backdrop-filter: blur(10px);
		flex-wrap: wrap;
		gap: 10px;
	}
	
	.game-info .label {
		font-weight: 600;
		margin-right: 8px;
	}
	
	.game-info .value {
		color: #FFD60A;
		font-weight: 700;
	}
	
	.player-info {
		color: #FF6B6B;
		font-weight: 700;
	}
	
	.note-display {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		margin-bottom: 30px;
	}
	
	.staff-area,
	.jianpu-area {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 16px;
		padding: 20px;
		text-align: center;
		color: #333;
		min-height: 220px;
		display: flex;
		flex-direction: column;
	}
	
	.staff-area h3,
	.jianpu-area h3 {
		margin: 0 0 20px 0;
		color: #1D3557;
		font-size: 20px;
		font-weight: 700;
	}
	
	.staff-placeholder,
	.jianpu-placeholder {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.controls {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		margin-bottom: 30px;
		max-width: 100%;
	}
	
	.staff-width {
		grid-column: 1;
		width: 100%;
	}
	
	.jianpu-width {
		grid-column: 2;
		width: 100%;
	}
	
	.control-btn {
		border: none;
		border-radius: 12px;
		padding: 12px 24px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		min-width: 120px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	}
	
	.main-btn {
		background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
		color: white;
	}
	
	.main-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
	}
	
	.complete-btn {
		background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
		color: white;
	}
	
	.complete-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(17, 153, 142, 0.4);
	}
	
	.primary-btn {
		background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
		color: white;
	}
	
	.primary-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
	}
	
	.restart-btn {
		background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
		color: white;
	}
	
	.restart-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(116, 185, 255, 0.4);
	}
	
	.danger-btn {
		background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
		color: white;
	}
	
	.danger-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(253, 121, 168, 0.4);
	}
	
	.outline-btn {
		background: transparent;
		border: 2px solid #667eea;
		color: #667eea;
	}
	
	.outline-btn:hover {
		background: #667eea;
		color: white;
		transform: translateY(-2px);
	}
	
	.control-btn:active {
		transform: translateY(0);
	}
	
	.control-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}
	
	.piano-area {
		padding: 0;
		height: 160px;
	}
	
	/* 学习总结弹窗 */
	.summary-modal,
	.player-switch-modal,
	.exit-confirm-modal,
	.pk-switch-modal,
	.player2-animation-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(10px);
	}
	
	.summary-content,
	.switch-content,
	.exit-confirm-content,
	.pk-switch-content {
		background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
		border-radius: 24px;
		padding: 40px;
		max-width: 600px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		color: #333;
		text-align: center;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}
	
	.summary-header,
	.exit-header {
		margin-bottom: 30px;
	}
	
	.summary-icon,
	.exit-icon {
		font-size: 48px;
		margin-bottom: 16px;
		display: block;
	}
	
	.summary-header h2,
	.exit-header h2 {
		margin: 0;
		font-size: 28px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.summary-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 20px;
		margin: 30px 0;
	}
	
	.stat-item {
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 16px;
		padding: 20px;
		text-align: center;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}
	
	.stat-icon {
		font-size: 24px;
		margin-bottom: 8px;
		display: block;
	}
	
	.stat-label {
		font-size: 14px;
		color: #6c757d;
		margin-bottom: 8px;
		font-weight: 500;
	}
	
	.stat-value {
		font-size: 28px;
		font-weight: 700;
		color: #495057;
	}
	
	.stat-value.correct {
		color: #28a745;
	}
	
	.stat-value.wrong {
		color: #dc3545;
	}
	
	/* PK对比样式 */
	.pk-comparison {
		margin: 30px 0;
		padding: 30px;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 20px;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	}
	
	.pk-stats-grid {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	
	.pk-stat-row {
		display: grid;
		grid-template-columns: 1fr 2fr 80px 2fr;
		align-items: center;
		gap: 20px;
		padding: 15px 20px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	}
	
	.stat-header {
		font-weight: 700;
		color: #495057;
		font-size: 16px;
	}
	
	.player-stat {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		font-size: 18px;
		font-weight: 600;
		color: #495057;
		padding: 10px;
		background: linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%);
		border-radius: 8px;
	}
	
	.vs-divider {
		text-align: center;
		font-weight: 700;
		color: #dc3545;
		font-size: 20px;
	}
	
	.crown {
		font-size: 20px;
		margin-right: 5px;
	}
	
	.rotating-crown {
		animation: rotateCrown 2s infinite linear;
	}
	
	@keyframes rotateCrown {
		0% {
			transform: rotateY(0deg) scale(1);
		}
		25% {
			transform: rotateY(90deg) scale(1.1);
		}
		50% {
			transform: rotateY(180deg) scale(1);
		}
		75% {
			transform: rotateY(270deg) scale(1.1);
		}
		100% {
			transform: rotateY(360deg) scale(1);
		}
	}
	
	.final-winner {
		font-size: 24px;
		font-weight: 700;
		margin-top: 30px;
		padding: 20px;
		background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
		border-radius: 16px;
		color: #2d3436;
	}
	
	/* 退出确认弹窗 */
	.exit-progress {
		margin: 30px 0;
		display: flex;
		justify-content: center;
	}
	
	.progress-circle {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
	}
	
	.progress-number {
		font-size: 32px;
		font-weight: 700;
		line-height: 1;
	}
	
	.progress-label {
		font-size: 12px;
		margin-top: 5px;
	}
	
	.exit-message {
		font-size: 16px;
		color: #495057;
		margin: 20px 0;
		line-height: 1.5;
	}
	
	.exit-message strong {
		color: #667eea;
		font-weight: 700;
	}
	
	.summary-actions,
	.exit-actions {
		display: flex;
		gap: 15px;
		justify-content: center;
		margin-top: 30px;
		flex-wrap: wrap;
	}
	
	.pk-progress {
		margin: 20px 0;
		padding: 20px;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-radius: 12px;
	}
	
	/* PK切换模态框样式 */
	.pk-switch-header {
		margin-bottom: 30px;
	}
	
	.pk-switch-icon {
		font-size: 48px;
		margin-bottom: 16px;
		display: block;
		animation: rotate 2s infinite linear;
	}
	
	@keyframes rotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
	
	.pk-switch-header h2 {
		margin: 0;
		font-size: 28px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	.pk-switch-message p {
		font-size: 16px;
		color: #495057;
		margin: 20px 0;
	}
	
	.pk-switch-actions {
		display: flex;
		gap: 15px;
		justify-content: center;
		margin-top: 30px;
		flex-wrap: wrap;
	}
	
	/* 玩家2动画页面样式 */
	.player2-animation-content {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 24px;
		padding: 60px 40px;
		max-width: 500px;
		width: 90%;
		color: white;
		text-align: center;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.2);
		animation: slideIn 0.5s ease-out;
	}
	
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-50px) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	
	.player-avatar {
		margin-bottom: 30px;
	}
	
	.avatar-circle {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		font-size: 48px;
		font-weight: 700;
		background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
		box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
		animation: pulse 2s infinite;
	}
	
	.player2-avatar {
		background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
		box-shadow: 0 10px 30px rgba(116, 185, 255, 0.4);
	}
	
	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}
	
	.player-number {
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	
	.player-title {
		font-size: 36px;
		margin: 20px 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		animation: bounce 1s ease-out;
	}
	
	@keyframes bounce {
		0%, 60%, 75%, 90%, 100% {
			animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
		}
		0% {
			opacity: 0;
			transform: translate3d(0, -200px, 0);
		}
		60% {
			opacity: 1;
			transform: translate3d(0, 25px, 0);
		}
		75% {
			transform: translate3d(0, -10px, 0);
		}
		90% {
			transform: translate3d(0, 5px, 0);
		}
		100% {
			transform: none;
		}
	}
	
	.countdown-display {
		font-size: 72px;
		font-weight: 700;
		margin: 30px 0;
		color: #FFD60A;
		text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
		animation: countdownPulse 1s infinite;
	}
	
	@keyframes countdownPulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}
	
	.motivation-text {
		font-size: 18px;
		margin-top: 20px;
		opacity: 0.9;
		animation: fadeInUp 1s ease-out 0.5s both;
	}
	
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 0.9;
			transform: translateY(0);
		}
	}
	
	/* 响应式设计 */
	@media (max-width: 768px) {
		.note-display {
			grid-template-columns: 1fr;
			gap: 15px;
		}
		
		.game-info {
			flex-direction: column;
			gap: 10px;
			text-align: center;
		}
		
		.controls {
			grid-template-columns: 1fr;
			gap: 15px;
		}
		
		.staff-width,
		.jianpu-width {
			grid-column: 1;
			width: 100%;
		}
		
		.control-btn {
			width: 100%;
		}
		
		.title {
			font-size: 24px;
		}
		
		.piano-area {
			padding: 0;
			height: 160px;
		}
		
		.summary-stats {
			grid-template-columns: repeat(2, 1fr);
		}
		
		.pk-stat-row {
			grid-template-columns: 1fr;
			gap: 10px;
			text-align: center;
		}
		
		.vs-divider {
			order: 2;
		}
		
		.stat-header {
			order: 1;
			font-size: 14px;
			margin-bottom: 10px;
		}
		
		.exit-actions,
		.pk-switch-actions {
			flex-direction: column;
			align-items: center;
		}
		
		.summary-content,
		.exit-confirm-content,
		.pk-switch-content,
		.player2-animation-content {
			padding: 30px 20px;
		}
		
		.player-title {
			font-size: 28px;
		}
		
		.countdown-display {
			font-size: 56px;
		}
	}
</style> 