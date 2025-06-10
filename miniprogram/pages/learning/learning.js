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
    maxQuestions: 15,
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
    countdownNumber: 5,

    // 音频下载状态
    audioDownloadStatus: {
      isDownloading: false,
      isCompleted: false,
      progress: 0,
      error: null
    },

    // 音频系统健康状态
    audioSystemHealth: {
      isHealthy: true,
      lastCheck: null,
      issues: []
    },

    // 音频预加载相关状态
    audioPreloadStartTime: null,
    isAudioPreloading: false
  },

  onLoad() {
    console.log('学习页面加载')
    this.initPageData()
    this.checkAudioDownloadStatus()
    
    // 启动音频健康监控
    this.initAudioHealthMonitoring()
    
    // 快速预加载核心音频
    this.quickPreloadAudio()
  },

  onShow() {
    console.log('学习页面显示')
    
    // 确保有音符数据
    if (!app.globalData.currentNote) {
      console.log('onShow时没有音符，重新生成')
      app.generateNewNote()
    }
    
    // 检查音频系统健康状态
    this.checkAudioSystemHealthOnShow()
    
    // 确保音频系统准备就绪
    this.ensureAudioReady()
    
    this.updateData()
  },

  onHide() {
    console.log('学习页面隐藏')
    // 记录隐藏时间，用于判断是否需要重新检查音频
    this.hideTime = Date.now()
  },

  onUnload() {
    // 清理定时器
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
    }
  },

  /**
   * 初始化音频健康监控
   */
  initAudioHealthMonitoring() {
    console.log('🎵 启动学习页面音频健康监控')
    
    // 立即检查一次
    this.performAudioHealthCheck()
    
    // 定期检查（每2分钟）
    this.healthCheckTimer = setInterval(() => {
      this.performAudioHealthCheck()
    }, 120000)
  },

  /**
   * 页面显示时检查音频系统
   */
  async checkAudioSystemHealthOnShow() {
    const now = Date.now()
    
    // 如果距离上次隐藏超过30秒，执行全面健康检查
    if (this.hideTime && (now - this.hideTime) > 30000) {
      console.log('🔍 长时间切换后检查音频系统健康...')
      
      try {
        await this.performComprehensiveHealthCheck()
        
        // 测试播放一个音符来验证音频是否正常
        await this.testAudioPlayback()
        
      } catch (error) {
        console.error('音频系统健康检查失败:', error)
        this.handleAudioSystemFailure()
      }
    }
  },

  /**
   * 执行全面的音频健康检查
   */
  async performComprehensiveHealthCheck() {
    console.log('🔍 执行全面音频健康检查...')
    
    try {
      // 1. 检查音频工具健康状态
      const healthCheck = await audioManager.performHealthCheck()
      
      // 2. 检查下载管理器状态
      const audioDownloadManager = require('../../utils/audioDownloadManager')
      const downloadProgress = await audioDownloadManager.performHealthCheck()
      
      // 3. 更新健康状态 - 只有在严重问题时才显示给用户
      const isHealthy = healthCheck.audioContextActive && 
                       downloadProgress.percentage > 30 &&  // 降低阈值，只有严重问题才显示
                       healthCheck.audioPoolStatus.healthScore > 20
      
      this.setData({
        audioSystemHealth: {
          isHealthy: isHealthy,
          lastCheck: new Date().toLocaleTimeString(),
          issues: isHealthy ? [] : ['音频暂时不可用，正在自动修复...']
        }
      })
      
      // 4. 如果不健康，自动修复
      if (!isHealthy) {
        console.log('🔧 音频系统存在严重问题，启动自动修复...')
        await this.autoRepairAudioSystem()
      }
      
      return isHealthy
      
    } catch (error) {
      console.error('全面健康检查失败:', error)
      throw error
    }
  },

  /**
   * 定期音频健康检查
   */
  async performAudioHealthCheck() {
    try {
      const audioDownloadManager = require('../../utils/audioDownloadManager')
      const progress = audioDownloadManager.getDownloadProgress()
      
      const isHealthy = progress.percentage > 70 && audioManager.isAudioEnabled
      
      this.setData({
        'audioSystemHealth.isHealthy': isHealthy,
        'audioSystemHealth.lastCheck': new Date().toLocaleTimeString()
      })
      
      // 如果不健康，记录问题
      if (!isHealthy) {
        const issues = []
        if (progress.percentage < 70) issues.push('音频文件不完整')
        if (!audioManager.isAudioEnabled) issues.push('音频上下文未激活')
        
        this.setData({
          'audioSystemHealth.issues': issues
        })
      }
      
    } catch (error) {
      console.error('定期健康检查失败:', error)
    }
  },

  /**
   * 测试音频播放
   */
  async testAudioPlayback() {
    return new Promise((resolve, reject) => {
      console.log('🎵 测试音频播放...')
      
      try {
        // 测试播放当前音符或默认音符
        const testNoteKey = this.data.currentNote?.pianoKey || 'c4'
        
        // 设置测试超时
        const testTimeout = setTimeout(() => {
          console.warn('音频播放测试超时')
          reject(new Error('音频播放测试超时'))
        }, 3000)
        
        // 尝试播放音符
        audioManager.playNote(testNoteKey, {
          volume: 0.1, // 低音量测试
          duration: 100 // 短时间播放
        })
        
        // 播放成功
        clearTimeout(testTimeout)
        console.log('✅ 音频播放测试成功')
        resolve()
        
      } catch (error) {
        console.error('音频播放测试失败:', error)
        reject(error)
      }
    })
  },

  /**
   * 自动修复音频系统
   */
  async autoRepairAudioSystem() {
    console.log('🔧 开始自动修复音频系统...')
    
    try {
      // 1. 重新激活音频上下文
      audioManager.reactivateAudioContext()
      
      // 2. 执行音频管理器的自动优化
      const result = await audioManager.autoOptimize()
      
      if (result.success) {
        console.log('✅ 音频系统自动修复成功:', result.optimizations)
        
        // 显示修复成功提示
        wx.showToast({
          title: '音频系统已修复',
          icon: 'success',
          duration: 2000
        })
        
        // 更新健康状态
        this.setData({
          'audioSystemHealth.isHealthy': true,
          'audioSystemHealth.issues': []
        })
        
      } else {
        console.error('音频系统自动修复失败:', result.error)
        this.handleAudioSystemFailure()
      }
      
    } catch (error) {
      console.error('自动修复过程出错:', error)
      this.handleAudioSystemFailure()
    }
  },

  /**
   * 处理音频系统故障
   */
  handleAudioSystemFailure() {
    console.warn('⚠️ 音频系统故障，切换到振动模式')
    
    this.setData({
      'audioSystemHealth.isHealthy': false,
      'audioSystemHealth.issues': ['音频系统不可用，使用振动反馈']
    })
    
    // 显示提示
    wx.showToast({
      title: '音频不可用，将使用振动反馈',
      icon: 'none',
      duration: 3000
    })
  },

  /**
   * 手动修复音频系统
   */
  async manualRepairAudio() {
    wx.showLoading({
      title: '正在修复音频系统...',
      mask: true
    })
    
    try {
      await this.autoRepairAudioSystem()
      
      // 测试播放
      await this.testAudioPlayback()
      
      wx.hideLoading()
      wx.showToast({
        title: '音频系统修复成功',
        icon: 'success'
      })
      
    } catch (error) {
      wx.hideLoading()
      wx.showModal({
        title: '修复失败',
        content: '音频系统修复失败，将继续使用振动反馈。您可以尝试重新进入页面。',
        showCancel: false
      })
    }
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
  },

  /**
   * 检查音频下载状态
   */
  checkAudioDownloadStatus() {
    const audioDownloadStatus = app.globalData.audioDownloadStatus
    this.setData({
      audioDownloadStatus: audioDownloadStatus
    })
    
    console.log('音频下载状态:', audioDownloadStatus)
    
    if (audioDownloadStatus.isCompleted) {
      console.log('🎵 音频文件已下载完成，可以使用远程音频文件')
    } else if (audioDownloadStatus.isDownloading) {
      console.log('🔄 音频文件正在下载中...')
    } else if (audioDownloadStatus.error) {
      console.warn('❌ 音频下载失败:', audioDownloadStatus.error)
    }
  },

  /**
   * 音频下载完成回调
   */
  onAudioDownloadComplete(status) {
    console.log('音频下载完成回调:', status)
    this.setData({
      audioDownloadStatus: status
    })
    
    if (status.isCompleted && !status.error) {
      wx.showToast({
        title: '音频文件下载完成',
        icon: 'success',
        duration: 2000
      })
      console.log('🎉 音频文件下载完成，现在可以享受高质量的钢琴音效！')
    } else if (status.error) {
      wx.showToast({
        title: '音频下载失败',
        icon: 'none',
        duration: 3000
      })
    }
  },

  /**
   * 快速预加载核心音频（在页面加载时立即执行）
   */
  async quickPreloadAudio() {
    console.log('🚀 快速预加载核心音频...')
    
    try {
      // 检查音频下载管理器是否已初始化
      const audioDownloadManager = require('../../utils/audioDownloadManager')
      if (!audioDownloadManager.isInitialized) {
        console.log('⏳ 等待音频下载管理器初始化...')
        // 等待最多3秒
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 100))
          if (audioDownloadManager.isInitialized) {
            console.log('✅ 音频下载管理器已就绪')
            break
          }
        }
      }
      
      // 立即预加载最常用的几个音符
      const coreNotes = ['c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5']
      console.log('🎹 立即预加载核心音符:', coreNotes)
      
      coreNotes.forEach((noteKey, index) => {
        setTimeout(() => {
          audioManager.preloadNote(noteKey)
        }, index * 50) // 错开50ms预加载
      })
      
      // 标记音频预加载状态
      this.audioPreloadStartTime = Date.now()
      this.isAudioPreloading = true
      
      // 2秒后标记为完成
      setTimeout(() => {
        this.isAudioPreloading = false
        console.log('✅ 核心音频预加载完成')
      }, 2000)
      
    } catch (error) {
      console.error('快速预加载音频失败:', error)
    }
  },

  /**
   * 确保音频系统准备就绪
   */
  async ensureAudioReady() {
    console.log('🔍 检查音频系统就绪状态...')
    
    try {
      // 1. 检查音频管理器状态
      if (!audioManager.isAudioEnabled) {
        console.log('🔄 重新激活音频上下文...')
        audioManager.reactivateAudioContext()
      }
      
      // 2. 如果还在预加载中，等待一下
      if (this.isAudioPreloading) {
        const waitTime = Date.now() - (this.audioPreloadStartTime || 0)
        if (waitTime < 2000) {
          console.log('⏳ 等待音频预加载完成...')
          await new Promise(resolve => setTimeout(resolve, Math.max(500, 2000 - waitTime)))
        }
      }
      
      // 3. 检查核心音符是否已预加载
      const coreNote = 'c4'
      const audio = audioManager.audioPool.get(coreNote)
      
      if (!audio) {
        console.log('🎵 立即预加载测试音符...')
        audioManager.preloadNote(coreNote)
        
        // 等待500ms确保音频加载
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      console.log('✅ 音频系统就绪检查完成')
      
    } catch (error) {
      console.error('音频系统就绪检查失败:', error)
    }
  }
}) 