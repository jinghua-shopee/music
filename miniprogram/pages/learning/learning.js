const app = getApp()
const { musicParser } = require('../../utils/musicParser.js')
const { audioManager } = require('../../utils/audioUtils.js')

Page({
  data: {
    // 页面状态
    pageTitle: '',
    gameModeText: '',
    progressText: '',
    endButtonText: '结束学习',
    
    // 游戏状态
    gameMode: '',
    currentPlayer: 1,
    currentNote: null,
    selectedKey: null,
    hasShownJianpu: false,
    isGameCompleted: false,
    
    // 统计数据
    totalQuestions: 0,
    maxQuestions: 2,
    correctAnswers: 0,
    wrongAnswers: 0,
    accuracyRate: 0,
    averageReactionTime: 0,
    
    // 显示相关
    progressNumberText: '',
    
    // PK模式数据
    player1AccuracyRate: 0,
    player2AccuracyRate: 0,
    player1AverageReactionTime: 0,
    player2AverageReactionTime: 0,
    winnerText: '',
    
    // 弹窗状态
    showSummaryModal: false,
    showExitConfirm: false,
    
    // 玩家切换相关状态（简化版）
    showPlayerSwitch: false,
    countdownNumber: 5
  },

  onLoad() {
    console.log('学习页面加载')
    this.initPageData()
  },

  onShow() {
    console.log('学习页面显示')
    
    // 确保有音符数据
    if (!app.globalData.currentNote) {
      console.log('onShow时没有音符，重新生成')
      app.generateNewNote()
    }
    
    this.updateData()
  },

  // 初始化页面数据
  initPageData() {
    const globalData = app.globalData
    
    console.log('初始化页面数据，当前音符:', globalData.currentNote)
    
    // 如果没有当前音符，说明没有通过正常流程启动游戏，自动启动练习模式
    if (!globalData.currentNote) {
      console.log('没有音符，自动启动练习模式')
      app.startGame({
        mode: 'practice',
        maxQuestions: Infinity // 无尽模式
      })
    }
    
    this.setData({
      gameMode: globalData.gameMode || 'practice',
      currentPlayer: globalData.currentPlayer,
      currentNote: globalData.currentNote,
      selectedKey: globalData.selectedKey,
      hasShownJianpu: globalData.hasShownJianpu
    })
    
    console.log('设置的音符数据:', globalData.currentNote)
    this.updateDisplayData()
  },

  // 更新数据
  updateData() {
    const globalData = app.globalData
    
    console.log('更新数据，当前音符:', globalData.currentNote)
    
    // 计算进度显示文本
    let progressNumberText = ''
    if (globalData.maxQuestions === Infinity) {
      progressNumberText = globalData.totalQuestions.toString()
    } else {
      progressNumberText = `${globalData.totalQuestions}/${globalData.maxQuestions}`
    }
    
    this.setData({
      currentNote: globalData.currentNote,
      selectedKey: globalData.selectedKey,
      hasShownJianpu: globalData.hasShownJianpu,
      totalQuestions: globalData.totalQuestions,
      correctAnswers: globalData.correctAnswers,
      wrongAnswers: globalData.wrongAnswers,
      maxQuestions: globalData.maxQuestions,
      progressNumberText: progressNumberText
    })
    
    console.log('更新后的页面音符数据:', this.data.currentNote)
    this.updateDisplayData()
  },

  // 更新显示数据
  updateDisplayData() {
    const globalData = app.globalData
    
    // 更新模式文本
    const gameModeText = globalData.gameMode === 'practice' ? '练习模式' : 'PK模式'
    
    // 更新进度文本
    let progressText = ''
    if (globalData.gameMode === 'pk') {
      // PK模式：显示当前玩家的进度
      const currentPlayerStats = globalData.currentPlayer === 1 ? 
        globalData.player1Stats : globalData.player2Stats
      const currentPlayerTotal = currentPlayerStats.correct + currentPlayerStats.wrong
      const remaining = Math.max(0, globalData.maxQuestions - currentPlayerTotal)
      progressText = `玩家${globalData.currentPlayer}: ${currentPlayerTotal}/${globalData.maxQuestions} (剩余 ${remaining} 题)`
    } else if (globalData.maxQuestions === Infinity) {
      progressText = `${globalData.totalQuestions} 题 (无尽模式)`
    } else {
      const remaining = Math.max(0, globalData.maxQuestions - globalData.totalQuestions)
      progressText = `${globalData.totalQuestions}/${globalData.maxQuestions} (剩余 ${remaining} 题)`
    }
    
    // 更新结束按钮文本
    const endButtonText = globalData.gameMode === 'pk' ? '退出PK' : '结束学习'
    
    // 检查游戏是否完成
    let isGameCompleted = false
    if (globalData.gameMode === 'pk') {
      // PK模式：只有当两个玩家都完成各自的题目数量后才算游戏完成
      const player1Total = globalData.player1Stats.correct + globalData.player1Stats.wrong
      const player2Total = globalData.player2Stats.correct + globalData.player2Stats.wrong
      isGameCompleted = player1Total >= globalData.maxQuestions && player2Total >= globalData.maxQuestions
    } else {
      // 练习模式：达到题目数量限制即完成
      isGameCompleted = globalData.maxQuestions !== Infinity && 
        globalData.totalQuestions >= globalData.maxQuestions
    }
    
    // 计算统计数据
    const accuracyRate = app.getAccuracyRate()
    const averageReactionTime = app.getAverageReactionTime()
    
    // PK模式数据
    const player1AccuracyRate = app.getPlayerAccuracyRate(1)
    const player2AccuracyRate = app.getPlayerAccuracyRate(2)
    const player1AverageReactionTime = app.getPlayerAverageReactionTime(1)
    const player2AverageReactionTime = app.getPlayerAverageReactionTime(2)
    
    this.setData({
      gameModeText,
      progressText,
      endButtonText,
      isGameCompleted,
      accuracyRate,
      averageReactionTime,
      player1AccuracyRate,
      player2AccuracyRate,
      player1AverageReactionTime,
      player2AverageReactionTime,
      currentPlayer: globalData.currentPlayer
    })
  },

  // 选择钢琴键
  selectKey(e) {
    const key = e.detail.key
    app.globalData.selectedKey = key
    this.setData({
      selectedKey: key
    })
    console.log('选择钢琴键:', key)
  },

  // 确认答案
  confirmAnswer() {
    const globalData = app.globalData
    if (!globalData.selectedKey) {
      wx.showToast({
        title: '请先选择钢琴键',
        icon: 'none'
      })
      return
    }
    
    const isCorrect = globalData.selectedKey === globalData.currentNote.pianoKey
    app.recordAnswer(isCorrect)
    
    this.updateData()
    
    // 播放音效反馈
    if (isCorrect) {
      wx.vibrateShort()
    }
  },

  // 下一题
  nextQuestion() {
    const globalData = app.globalData
    
    // PK模式处理
    if (globalData.gameMode === 'pk') {
      const currentPlayerStats = globalData.currentPlayer === 1 ? 
        globalData.player1Stats : globalData.player2Stats
      const currentPlayerTotal = currentPlayerStats.correct + currentPlayerStats.wrong
      
      if (currentPlayerTotal >= globalData.maxQuestions) {
        // 当前玩家完成，切换到下一个玩家或结束游戏
        if (globalData.currentPlayer === 1) {
          // 启动玩家切换流程
          this.startPlayerSwitchProcess()
          return
        } else {
          // 两个玩家都完成
          this.setData({
            isGameCompleted: true
          })
          return
        }
      }
    } else {
      // 练习模式：检查是否达到题目数量限制
      if (globalData.maxQuestions !== Infinity && 
          globalData.totalQuestions >= globalData.maxQuestions) {
        this.setData({
          isGameCompleted: true
        })
        return
      }
    }
    
    app.nextQuestion()
    this.updateData()
  },

  // 处理结束游戏
  handleEndGame() {
    if (app.globalData.totalQuestions > 0) {
      this.setData({
        showExitConfirm: true
      })
    } else {
      this.exitDirectly()
    }
  },

  // 显示总结
  showSummary() {
    // 计算PK模式获胜者
    if (app.globalData.gameMode === 'pk') {
      const p1Rate = app.getPlayerAccuracyRate(1)
      const p2Rate = app.getPlayerAccuracyRate(2)
      const p1Time = app.getPlayerAverageReactionTime(1)
      const p2Time = app.getPlayerAverageReactionTime(2)
      
      let winnerText = ''
      if (p1Rate > p2Rate) {
        winnerText = '🎉 玩家1获胜！'
      } else if (p2Rate > p1Rate) {
        winnerText = '🎉 玩家2获胜！'
      } else if (p1Time < p2Time && p1Time > 0) {
        winnerText = '🎉 玩家1获胜！(用时更短)'
      } else if (p2Time < p1Time && p2Time > 0) {
        winnerText = '🎉 玩家2获胜！(用时更短)'
      } else {
        winnerText = '🤝 平局！'
      }
      
      this.setData({
        winnerText
      })
    }
    
    this.setData({
      showSummaryModal: true
    })
  },

  // 重新开始游戏
  restartGame() {
    const gameData = {
      mode: app.globalData.gameMode,
      maxQuestions: app.globalData.maxQuestions
    }
    
    app.startGame(gameData)
    
    this.setData({
      showSummaryModal: false
    })
    
    this.updateData()
  },

  // 关闭总结并返回首页
  closeSummaryAndGoBack() {
    this.setData({
      showSummaryModal: false
    })
    
    wx.navigateBack()
  },

  // 带报告退出
  exitWithReport() {
    this.setData({
      showExitConfirm: false
    })
    this.showSummary()
  },

  // 取消退出
  cancelExit() {
    this.setData({
      showExitConfirm: false
    })
  },

  // 直接退出
  exitDirectly() {
    this.setData({
      showExitConfirm: false
    })
    wx.navigateBack()
  },

  // ==================== 玩家切换增强体验 ====================
  
  // 启动玩家切换流程
  startPlayerSwitchProcess() {
    this.setData({
      showPlayerSwitch: true,
      countdownNumber: 5
    })
    
    // 直接开始倒计时
    this.startCountdown()
  },
  
  // 开始倒计时
  startCountdown() {
    // 倒计时动画
    const countdownInterval = setInterval(() => {
      if (this.data.countdownNumber > 1) {
        this.setData({
          countdownNumber: this.data.countdownNumber - 1
        })
      } else {
        clearInterval(countdownInterval)
        // 倒计时结束，正式切换到玩家2
        this.finishPlayerSwitch()
      }
    }, 1000)
  },
  
  // 完成玩家切换
  finishPlayerSwitch() {
    const globalData = app.globalData
    
    // 切换到玩家2
    globalData.currentPlayer = 2
    
    // 生成新题目
    app.nextQuestion()
    
    // 关闭切换界面，更新数据
    this.setData({
      showPlayerSwitch: false,
      currentPlayer: 2
    })
    
    this.updateData()
    
    // 振动反馈
    wx.vibrateShort()
  },
  
  // 手动跳过切换流程（点击跳过按钮）
  skipSwitchProcess() {
    this.finishPlayerSwitch()
  }
}) 