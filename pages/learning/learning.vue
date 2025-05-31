<template>
  <view class="learning-container" :class="{ portrait: isPortrait }">
    <!-- 玩家切换过渡页面 (仅PK模式) -->
    <view v-if="showPlayerSwitch" class="player-switch-overlay">
      <view class="switch-content">
        <view class="player-avatar" :class="`player${currentPlayer}`">
          <text class="avatar-text">P{{ currentPlayer }}</text>
        </view>
        <view class="switch-title">玩家 {{ currentPlayer }} 回合</view>
        <view class="countdown">{{ switchCountdown }}</view>
      </view>
    </view>
    
    <!-- 主学习界面 -->
    <view v-show="!showPlayerSwitch" class="main-content">
      <!-- 第一排：五线谱和简谱显示区域 -->
      <view class="first-row">
        <!-- 五线谱区域 -->
        <view class="staff-section">
          <view class="section-title">五线谱</view>
          <view class="section-content">
            <view v-if="currentNote" id="staff-notation" class="notation-display"></view>
            <view v-else class="placeholder">点击开始学习</view>
          </view>
        </view>
        
        <!-- 简谱区域 -->
        <view class="jianpu-section">
          <view class="section-title">简谱</view>
          <view class="section-content">
            <view v-if="hasShownJianpu && currentNote" class="jianpu-display">
              {{ currentNote.jianpu }}
            </view>
            <view v-else class="placeholder">{{ hasShownJianpu ? '点击开始学习' : '请先选择答案' }}</view>
          </view>
        </view>
      </view>
      
      <!-- 第二排：控制按钮 -->
      <view class="second-row">
        <view class="buttons-section">
          <button v-if="gameMode === 'practice'" class="control-btn" @click="pauseResume">
            {{ isPaused ? '继续' : '暂停' }}
          </button>
          <button v-else class="control-btn" @click="pauseResume">
            {{ isPaused ? '继续' : '暂停' }}
          </button>
          
          <button 
            class="control-btn next-btn" 
            :disabled="!hasShownJianpu"
            @click="nextQuestion"
          >
            {{ hasShownJianpu ? '下一道' : '请先答题' }}
          </button>
          
          <button class="control-btn end-btn" @click="showEndConfirm">
            结束
          </button>
        </view>
      </view>
      
      <!-- 第三排：钢琴键盘 -->
      <view class="third-row">
        <scroll-view class="piano-container" scroll-x>
          <view class="piano-keyboard">
            <!-- 白键 -->
            <view v-for="key in pianoKeys.filter(k => !k.isBlack)" 
                  :key="`white-${key.note}`"
                  class="piano-key white-key"
                  :class="{ 
                    active: selectedKey === key.note,
                    'middle-c': key.isMiddleC
                  }"
                  :style="{ left: key.position * 40 + 'rpx' }"
                  @click="selectPianoKey(key)">
              <text v-if="key.isMiddleC" class="key-label">C4</text>
            </view>
            
            <!-- 黑键 -->
            <view v-for="key in pianoKeys.filter(k => k.isBlack)" 
                  :key="`black-${key.note}`"
                  class="piano-key black-key"
                  :class="{ active: selectedKey === key.note }"
                  :style="{ left: (key.position * 40 + key.blackKeyOffset) + 'rpx' }"
                  @click="selectPianoKey(key)">
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 结束确认弹窗 -->
    <view v-if="showEndDialog" class="modal-overlay" @click.self="hideEndConfirm">
      <view class="end-dialog">
        <view class="dialog-title">确认结束</view>
        <view class="dialog-content">
          确定要结束当前{{ gameMode === 'practice' ? '练习' : 'PK' }}吗？
        </view>
        <view class="dialog-buttons">
          <button class="dialog-btn cancel-btn" @click="hideEndConfirm">取消</button>
          <button class="dialog-btn confirm-btn" @click="endLearning">确定</button>
        </view>
      </view>
    </view>
    
    <!-- 统计弹窗 -->
    <view v-if="showStatsDialog" class="modal-overlay stats-overlay">
      <view class="stats-dialog" :class="{ show: showStatsDialog }">
        <!-- 练习模式统计 -->
        <view v-if="gameMode === 'practice'" class="practice-stats">
          <view class="stats-header">
            <view class="plant-animation">🌱</view>
            <view class="stats-title">练习完成</view>
          </view>
          
          <view class="stats-content">
            <view class="stat-item">
              <text class="stat-label">总题数：</text>
              <text class="stat-value">{{ totalQuestions }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">正确数：</text>
              <text class="stat-value">{{ correctAnswers }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">准确率：</text>
              <text class="stat-value">{{ accuracyRate }}%</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">平均反应时间：</text>
              <text class="stat-value">{{ avgReactionTime }}ms</text>
            </view>
          </view>
          
          <button class="stats-btn" @click="backToHome">返回首页</button>
        </view>
        
        <!-- PK模式统计 -->
        <view v-else class="pk-stats">
          <view class="stats-header">
            <view class="stats-title">PK结果</view>
          </view>
          
          <view class="pk-comparison">
            <view class="player-stats">
              <view class="player-header">
                <text class="player-name">玩家1</text>
                <text v-if="winner.total === 1" class="crown">👑</text>
              </view>
              <view class="player-data">
                <view class="stat-row">
                  <text class="stat-label">总题数</text>
                  <text v-if="winner.total === 1" class="crown-small">👑</text>
                  <text class="stat-value">{{ player1Stats.total }}</text>
                </view>
                <view class="stat-row">
                  <text class="stat-label">正确数</text>
                  <text v-if="winner.correct === 1" class="crown-small">👑</text>
                  <text class="stat-value">{{ player1Stats.correct }}</text>
                </view>
                <view class="stat-row">
                  <text class="stat-label">准确率</text>
                  <text v-if="winner.accuracy === 1" class="crown-small">👑</text>
                  <text class="stat-value">{{ player1AccuracyRate }}%</text>
                </view>
                <view class="stat-row">
                  <text class="stat-label">反应时间</text>
                  <text v-if="winner.reaction === 1" class="crown-small">👑</text>
                  <text class="stat-value">{{ player1AvgReaction }}ms</text>
                </view>
              </view>
            </view>
            
            <view class="vs-divider">VS</view>
            
            <view class="player-stats">
              <view class="player-header">
                <text class="player-name">玩家2</text>
                <text v-if="winner.total === 2" class="crown">👑</text>
              </view>
              <view class="player-data">
                <view class="stat-row">
                  <text class="stat-label">总题数</text>
                  <text v-if="winner.total === 2" class="crown-small">👑</text>
                  <text class="stat-value">{{ player2Stats.total }}</text>
                </view>
                <view class="stat-row">
                  <text class="stat-label">正确数</text>
                  <text v-if="winner.correct === 2" class="crown-small">👑</text>
                  <text class="stat-value">{{ player2Stats.correct }}</text>
                </view>
                <view class="stat-row">
                  <text class="stat-label">准确率</text>
                  <text v-if="winner.accuracy === 2" class="crown-small">👑</text>
                  <text class="stat-value">{{ player2AccuracyRate }}%</text>
                </view>
                <view class="stat-row">
                  <text class="stat-label">反应时间</text>
                  <text v-if="winner.reaction === 2" class="crown-small">👑</text>
                  <text class="stat-value">{{ player2AvgReaction }}ms</text>
                </view>
              </view>
            </view>
          </view>
          
          <button class="stats-btn" @click="backToHome">返回首页</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getRandomNote, 
  generateABCNotation, 
  generatePianoKeys,
  playNoteByName,
  calculateReactionStats,
  formatTime 
} from '@/utils/music.js'
import { 
  createLearningSession, 
  recordQuestion, 
  completeLearningSession,
  recordPKBattle 
} from '@/utils/database.js'

export default {
  name: 'LearningPage',
  data() {
    return {
      // 基础状态
      gameMode: '',
      questionCount: 0,
      maxQuestions: 0,
      currentQuestionIndex: 0,
      currentNote: null,
      selectedKey: null,
      hasShownJianpu: false,
      isPaused: false,
      isPortrait: false,
      
      // 时间相关
      questionStartTime: null,
      pauseStartTime: null,
      totalPauseTime: 0,
      sessionStartTime: null,
      
      // 统计数据
      totalQuestions: 0,
      correctAnswers: 0,
      reactionTimes: [],
      
      // PK模式
      currentPlayer: 1,
      player1Stats: { total: 0, correct: 0, reactionTimes: [] },
      player2Stats: { total: 0, correct: 0, reactionTimes: [] },
      showPlayerSwitch: false,
      switchCountdown: 3,
      switchCountdownTimer: null,
      
      // UI状态
      showEndDialog: false,
      showStatsDialog: false,
      
      // 钢琴键盘
      pianoKeys: [],
      
      // ABCJS
      abcjs: null
    }
  },
  computed: {
    accuracyRate() {
      return this.totalQuestions > 0 ? 
        Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0
    },
    
    avgReactionTime() {
      const stats = calculateReactionStats(this.reactionTimes)
      return stats.average
    },
    
    player1AccuracyRate() {
      return this.player1Stats.total > 0 ? 
        Math.round((this.player1Stats.correct / this.player1Stats.total) * 100) : 0
    },
    
    player2AccuracyRate() {
      return this.player2Stats.total > 0 ? 
        Math.round((this.player2Stats.correct / this.player2Stats.total) * 100) : 0
    },
    
    player1AvgReaction() {
      const stats = calculateReactionStats(this.player1Stats.reactionTimes)
      return stats.average
    },
    
    player2AvgReaction() {
      const stats = calculateReactionStats(this.player2Stats.reactionTimes)
      return stats.average
    },
    
    // 计算各项获胜者
    winner() {
      const winner = { total: 0, correct: 0, accuracy: 0, reaction: 0 }
      
      // 总题数比较
      if (this.player1Stats.total > this.player2Stats.total) winner.total = 1
      else if (this.player2Stats.total > this.player1Stats.total) winner.total = 2
      
      // 正确数比较
      if (this.player1Stats.correct > this.player2Stats.correct) winner.correct = 1
      else if (this.player2Stats.correct > this.player1Stats.correct) winner.correct = 2
      
      // 准确率比较
      if (this.player1AccuracyRate > this.player2AccuracyRate) winner.accuracy = 1
      else if (this.player2AccuracyRate > this.player1AccuracyRate) winner.accuracy = 2
      
      // 反应时间比较（越小越好）
      if (this.player1AvgReaction > 0 && this.player2AvgReaction > 0) {
        if (this.player1AvgReaction < this.player2AvgReaction) winner.reaction = 1
        else if (this.player2AvgReaction < this.player1AvgReaction) winner.reaction = 2
      } else if (this.player1AvgReaction > 0) {
        winner.reaction = 1
      } else if (this.player2AvgReaction > 0) {
        winner.reaction = 2
      }
      
      return winner
    }
  },
  async onLoad(options) {
    // 从路由参数获取模式和题目数量
    this.gameMode = options.mode || 'practice'
    this.questionCount = options.count || '30'
    
    if (this.questionCount !== 'endless') {
      this.maxQuestions = parseInt(this.questionCount)
    }
    
    await this.initializePage()
  },
  onUnload() {
    this.cleanup()
  },
  methods: {
    async initializePage() {
      // 初始化钢琴键盘
      this.pianoKeys = generatePianoKeys()
      
      // 检查屏幕方向
      this.checkOrientation()
      
      // 加载ABCJS库
      await this.loadABCJS()
      
      // 创建学习会话
      this.sessionStartTime = Date.now()
      await createLearningSession(this.gameMode, this.questionCount)
      
      // 开始第一题
      this.startNewQuestion()
    },
    
    async loadABCJS() {
      // 在H5环境加载ABCJS
      // #ifdef H5
      if (window.ABCJS) {
        this.abcjs = window.ABCJS
        return
      }
      
      try {
        const script = document.createElement('script')
        script.src = '/static/js/abcjs-basic-min.js'
        document.head.appendChild(script)
        
        await new Promise((resolve, reject) => {
          script.onload = () => {
            this.abcjs = window.ABCJS
            resolve()
          }
          script.onerror = reject
        })
      } catch (error) {
        console.error('加载ABCJS失败:', error)
      }
      // #endif
      
      // #ifdef MP-WEIXIN
      // 小程序环境可能需要其他处理方式
      console.log('小程序环境暂不支持ABCJS')
      // #endif
    },
    
    checkOrientation() {
      const systemInfo = uni.getSystemInfoSync()
      this.isPortrait = systemInfo.windowHeight > systemInfo.windowWidth
    },
    
    startNewQuestion() {
      this.currentNote = getRandomNote()
      this.selectedKey = null
      this.hasShownJianpu = false
      this.questionStartTime = Date.now()
      this.totalPauseTime = 0
      
      this.renderStaffNotation()
    },
    
    renderStaffNotation() {
      if (!this.abcjs || !this.currentNote) return
      
      // #ifdef H5
      this.$nextTick(() => {
        try {
          const notation = generateABCNotation(this.currentNote)
          const element = document.getElementById('staff-notation')
          if (element) {
            this.abcjs.renderAbc(element, notation, {
              scale: 1.5,
              staffwidth: 200,
              paddingleft: 10,
              paddingright: 10
            })
          }
        } catch (error) {
          console.error('渲染五线谱失败:', error)
        }
      })
      // #endif
    },
    
    selectPianoKey(key) {
      if (this.isPaused) return
      
      this.selectedKey = key.note
      
      // 播放音符
      playNoteByName(key.note)
      
      // 显示简谱答案
      this.hasShownJianpu = true
      
      // 计算反应时间
      const reactionTime = this.calculateReactionTime()
      
      // 检查答案正确性
      const isCorrect = key.note === this.currentNote.id
      
      // 记录答题数据
      this.recordAnswer(key.note, isCorrect, reactionTime)
    },
    
    calculateReactionTime() {
      if (!this.questionStartTime) return 0
      
      const endTime = Date.now()
      const totalTime = endTime - this.questionStartTime
      const reactionTime = totalTime - this.totalPauseTime
      
      return Math.max(reactionTime, 0)
    },
    
    async recordAnswer(userAnswer, isCorrect, reactionTime) {
      // 更新统计
      this.totalQuestions++
      if (isCorrect) this.correctAnswers++
      this.reactionTimes.push(reactionTime)
      
      // PK模式更新当前玩家统计
      if (this.gameMode === 'pk') {
        const currentPlayerStats = this.currentPlayer === 1 ? this.player1Stats : this.player2Stats
        currentPlayerStats.total++
        if (isCorrect) currentPlayerStats.correct++
        currentPlayerStats.reactionTimes.push(reactionTime)
      }
      
      // 记录到数据库
      await recordQuestion({
        noteName: this.currentNote.name,
        noteOctave: this.currentNote.octave,
        userAnswer: userAnswer,
        isCorrect: isCorrect,
        reactionTime: reactionTime,
        pauseDuration: this.totalPauseTime
      })
    },
    
    nextQuestion() {
      if (!this.hasShownJianpu) return
      
      this.currentQuestionIndex++
      
      // 检查是否需要切换玩家或结束
      if (this.gameMode === 'pk') {
        // PK模式：检查是否达到题目数量
        if (this.currentQuestionIndex >= this.maxQuestions) {
          if (this.currentPlayer === 1) {
            // 切换到玩家2
            this.switchToPlayer2()
            return
          } else {
            // 两个玩家都完成，结束游戏
            this.endLearning()
            return
          }
        }
      } else if (this.questionCount !== 'endless' && this.currentQuestionIndex >= this.maxQuestions) {
        // 练习模式达到题目数量
        this.endLearning()
        return
      }
      
      this.startNewQuestion()
    },
    
    switchToPlayer2() {
      this.currentPlayer = 2
      this.currentQuestionIndex = 0 // 重置题目索引
      this.showPlayerSwitch = true
      this.switchCountdown = 3
      
      // 倒计时
      this.switchCountdownTimer = setInterval(() => {
        this.switchCountdown--
        if (this.switchCountdown <= 0) {
          clearInterval(this.switchCountdownTimer)
          this.showPlayerSwitch = false
          this.startNewQuestion()
        }
      }, 1000)
    },
    
    pauseResume() {
      if (this.isPaused) {
        // 恢复
        if (this.pauseStartTime) {
          this.totalPauseTime += Date.now() - this.pauseStartTime
          this.pauseStartTime = null
        }
        this.isPaused = false
      } else {
        // 暂停
        this.pauseStartTime = Date.now()
        this.isPaused = true
      }
    },
    
    showEndConfirm() {
      this.showEndDialog = true
    },
    
    hideEndConfirm() {
      this.showEndDialog = false
    },
    
    async endLearning() {
      this.hideEndConfirm()
      
      if (this.gameMode === 'pk' && this.currentPlayer === 1) {
        // PK模式玩家1点击结束，切换到玩家2
        this.switchToPlayer2()
        return
      }
      
      // 完成学习会话
      const sessionData = {
        totalQuestions: this.totalQuestions,
        correctAnswers: this.correctAnswers,
        accuracyRate: this.accuracyRate,
        avgReactionTime: this.avgReactionTime,
        isCompleted: true
      }
      
      await completeLearningSession(sessionData)
      
      // PK模式记录对战数据
      if (this.gameMode === 'pk') {
        await recordPKBattle({
          player1Stats: {
            total: this.player1Stats.total,
            correct: this.player1Stats.correct,
            avgReaction: this.player1AvgReaction
          },
          player2Stats: {
            total: this.player2Stats.total,
            correct: this.player2Stats.correct,
            avgReaction: this.player2AvgReaction
          }
        })
      }
      
      this.showStatsDialog = true
    },
    
    backToHome() {
      uni.navigateBack()
    },
    
    cleanup() {
      if (this.switchCountdownTimer) {
        clearInterval(this.switchCountdownTimer)
      }
    }
  }
}
</script>

<style scoped>
.learning-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  padding: 32rpx;
  box-sizing: border-box;
  gap: 24rpx;
}

.learning-container.portrait {
  overflow-y: auto;
  height: auto;
  min-height: 100vh;
}

/* 玩家切换过渡页面 */
.player-switch-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.switch-content {
  text-align: center;
  color: white;
}

.player-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40rpx;
  animation: flyIn 0.8s ease-out;
}

.player-avatar.player1 {
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
}

.player-avatar.player2 {
  background: linear-gradient(135deg, #4ECDC4, #44A08D);
}

@keyframes flyIn {
  0% {
    transform: translateX(-200rpx) scale(0.5);
    opacity: 0;
  }
  50% {
    transform: translateX(20rpx) scale(1.1);
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

.avatar-text {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
}

.switch-title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
}

.countdown {
  font-size: 120rpx;
  font-weight: bold;
  color: #FFD700;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 第一排：五线谱和简谱 */
.first-row {
  display: flex;
  height: calc(60vh - 48rpx);
  gap: 32rpx;
  flex-shrink: 0;
}

.learning-container.portrait .first-row {
  flex-direction: column;
  height: auto;
}

.staff-section, .jianpu-section {
  flex: 1;
  border-radius: 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

.learning-container.portrait .staff-section,
.learning-container.portrait .jianpu-section {
  min-height: 300rpx;
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
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40rpx;
  padding: 20rpx;
}

.notation-display {
  max-width: 100%;
  overflow: hidden;
}

.jianpu-display {
  font-size: 120rpx;
  font-weight: bold;
  color: #1D3557;
  text-shadow: 0 4rpx 8rpx rgba(255, 255, 255, 0.8);
}

.placeholder {
  font-size: 32rpx;
  color: rgba(29, 53, 87, 0.6);
  text-align: center;
}

/* 第二排：控制按钮 */
.second-row {
  height: calc(10vh - 24rpx);
  flex-shrink: 0;
  min-height: 100rpx;
}

.buttons-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24rpx;
  width: 100%;
  height: 100%;
}

.learning-container.portrait .buttons-section {
  grid-template-columns: 1fr;
  gap: 16rpx;
}

.control-btn {
  font-size: 30rpx;
  font-weight: 600;
  background: #007AFF;
  color: #ffffff;
  border: none;
  border-radius: 24rpx;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8rpx 32rpx rgba(0, 122, 255, 0.3);
  letter-spacing: -0.48rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.control-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.control-btn:hover::before {
  left: 100%;
}

.control-btn:hover {
  background: #0056CC;
  transform: translateY(-2rpx);
  box-shadow: 0 12rpx 40rpx rgba(0, 122, 255, 0.4);
}

.control-btn:active {
  background: #004499;
  transform: translateY(0);
}

.next-btn {
  background: #34C759;
  box-shadow: 0 8rpx 32rpx rgba(52, 199, 89, 0.3);
}

.next-btn:hover {
  background: #28A745;
  box-shadow: 0 12rpx 40rpx rgba(52, 199, 89, 0.4);
}

.next-btn:active {
  background: #1E7E34;
}

.next-btn:disabled {
  background: #999;
  box-shadow: none;
  opacity: 0.6;
}

.end-btn {
  background: #FF3B30;
  box-shadow: 0 8rpx 32rpx rgba(255, 59, 48, 0.3);
}

.end-btn:hover {
  background: #D70015;
  box-shadow: 0 12rpx 40rpx rgba(255, 59, 48, 0.4);
}

.end-btn:active {
  background: #A50E15;
}

/* 第三排：钢琴键盘 */
.third-row {
  height: calc(30vh - 24rpx);
  flex-shrink: 0;
  min-height: 300rpx;
}

.learning-container.portrait .third-row {
  height: 300rpx;
}

.piano-container {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 40rpx;
  overflow-x: auto;
  box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20rpx);
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.piano-keyboard {
  position: relative;
  height: 100%;
  width: 3360rpx; /* 8个八度 * 7个白键 * 60rpx */
  padding: 20rpx;
  box-sizing: border-box;
}

.piano-key {
  position: absolute;
  border-radius: 0 0 12rpx 12rpx;
  transition: all 0.15s ease;
  border: 1rpx solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 16rpx;
  user-select: none;
}

.white-key {
  width: 76rpx;
  height: calc(100% - 40rpx);
  background: linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%);
  z-index: 1;
  border: 2rpx solid #ddd;
}

.black-key {
  width: 44rpx;
  height: calc(60% - 24rpx);
  background: linear-gradient(to bottom, #333 0%, #000 100%);
  z-index: 2;
  border: 2rpx solid #000;
}

.piano-key.active {
  transform: scale(0.95);
  box-shadow: inset 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
}

.white-key.active {
  background: linear-gradient(to bottom, #e6f3ff 0%, #cce7ff 100%);
  border-color: #007AFF;
}

.black-key.active {
  background: linear-gradient(to bottom, #555 0%, #333 100%);
}

.white-key.middle-c {
  border-color: #FF3B30;
  border-width: 3rpx;
}

.key-label {
  font-size: 20rpx;
  color: #333;
  font-weight: bold;
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
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* 结束确认弹窗 */
.end-dialog {
  background: white;
  border-radius: 32rpx;
  padding: 60rpx 40rpx 40rpx;
  margin: 40rpx;
  max-width: 600rpx;
  width: 100%;
  box-shadow: 0 24rpx 80rpx rgba(0, 0, 0, 0.15);
}

.dialog-title {
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 32rpx;
  color: #1D3557;
}

.dialog-content {
  font-size: 32rpx;
  text-align: center;
  margin-bottom: 60rpx;
  color: #666;
  line-height: 1.5;
}

.dialog-buttons {
  display: flex;
  gap: 24rpx;
}

.dialog-btn {
  flex: 1;
  padding: 32rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.confirm-btn {
  background: #FF3B30;
  color: white;
}

.confirm-btn:hover {
  background: #D70015;
}

/* 统计弹窗 */
.stats-overlay {
  backdrop-filter: blur(10rpx);
}

.stats-dialog {
  background: white;
  border-radius: 40rpx;
  margin: 40rpx;
  max-width: 800rpx;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 32rpx 100rpx rgba(0, 0, 0, 0.2);
  transform: translateY(100rpx);
  opacity: 0;
  transition: all 0.3s ease;
}

.stats-dialog.show {
  transform: translateY(0);
  opacity: 1;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 练习模式统计 */
.practice-stats {
  padding: 60rpx 40rpx 40rpx;
}

.stats-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.plant-animation {
  font-size: 120rpx;
  animation: grow 2s ease-in-out infinite alternate;
  margin-bottom: 24rpx;
}

@keyframes grow {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

.stats-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #1D3557;
}

.stats-content {
  margin-bottom: 60rpx;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #eee;
  font-size: 32rpx;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #666;
  font-weight: 500;
}

.stat-value {
  color: #1D3557;
  font-weight: bold;
}

/* PK模式统计 */
.pk-stats {
  padding: 60rpx 40rpx 40rpx;
}

.pk-comparison {
  display: flex;
  gap: 32rpx;
  margin-bottom: 60rpx;
  align-items: center;
}

.player-stats {
  flex: 1;
  background: #f8f9fa;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
}

.player-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  gap: 16rpx;
}

.player-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #1D3557;
}

.crown {
  font-size: 48rpx;
  animation: rotate3d 2s ease-in-out infinite;
}

@keyframes rotate3d {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
  100% { transform: rotateY(360deg); }
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  position: relative;
}

.stat-row .stat-label {
  flex: 1;
  text-align: left;
  width: 120rpx;
  color: #666;
}

.crown-small {
  font-size: 32rpx;
  margin: 0 8rpx;
  animation: rotate3d 1.5s ease-in-out infinite;
}

.stat-row .stat-value {
  flex: 1;
  text-align: right;
  color: #1D3557;
  font-weight: bold;
}

.vs-divider {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF3B30;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.stats-btn {
  width: 100%;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 32rpx;
  font-size: 32rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stats-btn:hover {
  background: #0056CC;
  transform: translateY(-2rpx);
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .pk-comparison {
    flex-direction: column;
    gap: 24rpx;
  }
  
  .vs-divider {
    font-size: 36rpx;
  }
  
  .piano-keyboard {
    width: 2800rpx; /* 适当减少宽度 */
  }
  
  .white-key {
    width: 64rpx;
  }
  
  .black-key {
    width: 36rpx;
  }
}
</style> 