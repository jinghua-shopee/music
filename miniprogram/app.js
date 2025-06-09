const imageManager = require('./utils/imageManager')
const audioDownloadManager = require('./utils/audioDownloadManager')

App({
  globalData: {
    // 游戏基本状态
    gameMode: '', // 'practice' | 'pk'
    maxQuestions: 15,
    currentQuestionIndex: 0,
    
    // 当前题目状态
    currentNote: null,
    selectedKey: null,
    hasShownJianpu: false,
    questionStartTime: null,
    
    // 统计数据
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    reactionTimes: [],
    
    // PK模式状态
    currentPlayer: 1, // 1 or 2
    pkPhase: 'player1', // 'player1' | 'player2' | 'completed'
    player1Stats: {
      correct: 0,
      wrong: 0,
      reactionTimes: []
    },
    player2Stats: {
      correct: 0,
      wrong: 0,
      reactionTimes: []
    },

    // 图片下载状态
    imageDownloadStatus: {
      isDownloading: false,
      isCompleted: false,
      progress: 0,
      error: null
    },

    // 音频下载状态
    audioDownloadStatus: {
      isDownloading: false,
      isCompleted: false,
      progress: 0,
      error: null
    }
  },

  async onLaunch() {
    console.log('小程序启动')
    
    // 并行初始化图片和音频
    await Promise.all([
      this.initializeImages(),
      this.initializeAudio()
    ])
  },

  /**
   * 初始化图片下载
   */
  async initializeImages() {
    console.log('开始初始化五线谱图片...')
    
    this.globalData.imageDownloadStatus.isDownloading = true
    this.globalData.imageDownloadStatus.error = null
    
    try {
      // 初始化图片管理器
      await imageManager.initialize()
      
      // 更新下载状态
      this.globalData.imageDownloadStatus.isDownloading = false
      this.globalData.imageDownloadStatus.isCompleted = true
      this.globalData.imageDownloadStatus.progress = 100
      
      console.log('五线谱图片初始化完成')
      
      // 触发全局事件，通知页面图片下载完成
      this.notifyImageDownloadComplete()
      
    } catch (error) {
      console.error('五线谱图片初始化失败:', error)
      
      this.globalData.imageDownloadStatus.isDownloading = false
      this.globalData.imageDownloadStatus.error = error.message || '图片下载失败'
      
      // 即使下载失败，也要通知页面，让用户知道状态
      this.notifyImageDownloadComplete()
    }
  },

  /**
   * 初始化音频下载
   */
  async initializeAudio() {
    console.log('开始初始化钢琴音频...')
    
    this.globalData.audioDownloadStatus.isDownloading = true
    this.globalData.audioDownloadStatus.error = null
    
    try {
      // 初始化音频下载管理器
      await audioDownloadManager.initialize()
      
      // 更新下载状态
      this.globalData.audioDownloadStatus.isDownloading = false
      this.globalData.audioDownloadStatus.isCompleted = true
      this.globalData.audioDownloadStatus.progress = 100
      
      console.log('钢琴音频初始化完成')
      
      // 下载完成后删除本地audio/piano目录
      await this.cleanupLocalAudioDirectory()
      
      // 触发全局事件，通知页面音频下载完成
      this.notifyAudioDownloadComplete()
      
    } catch (error) {
      console.error('钢琴音频初始化失败:', error)
      
      this.globalData.audioDownloadStatus.isDownloading = false
      this.globalData.audioDownloadStatus.error = error.message || '音频下载失败'
      
      // 即使下载失败，也要通知页面，让用户知道状态
      this.notifyAudioDownloadComplete()
    }
  },

  /**
   * 清理本地audio/piano目录
   */
  async cleanupLocalAudioDirectory() {
    try {
      console.log('开始清理本地audio/piano目录...')
      
      const fs = wx.getFileSystemManager()
      
      // 检查目录是否存在
      const exists = await new Promise((resolve) => {
        fs.access({
          path: 'audio/piano',
          success: () => resolve(true),
          fail: () => resolve(false)
        })
      })
      
      if (exists) {
        // 删除目录及其内容
        await new Promise((resolve, reject) => {
          fs.rmdir({
            dirPath: 'audio/piano',
            recursive: true,
            success: () => {
              console.log('本地audio/piano目录删除成功')
              resolve()
            },
            fail: (error) => {
              console.warn('删除本地audio/piano目录失败:', error)
              // 不阻塞程序运行，只记录警告
              resolve()
            }
          })
        })
      } else {
        console.log('本地audio/piano目录不存在，无需删除')
      }
      
    } catch (error) {
      console.warn('清理本地audio/piano目录时出错:', error)
      // 不抛出错误，避免影响主流程
    }
  },

  /**
   * 通知页面图片下载完成
   */
  notifyImageDownloadComplete() {
    // 获取当前页面栈
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      
      // 如果当前页面有图片下载完成回调，则调用
      if (typeof currentPage.onImageDownloadComplete === 'function') {
        currentPage.onImageDownloadComplete(this.globalData.imageDownloadStatus)
      }
    }
  },

  /**
   * 通知页面音频下载完成
   */
  notifyAudioDownloadComplete() {
    // 获取当前页面栈
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      
      // 如果当前页面有音频下载完成回调，则调用
      if (typeof currentPage.onAudioDownloadComplete === 'function') {
        currentPage.onAudioDownloadComplete(this.globalData.audioDownloadStatus)
      }
    }
  },

  /**
   * 获取图片管理器实例
   */
  getImageManager() {
    return imageManager
  },

  /**
   * 获取音频下载管理器实例
   */
  getAudioDownloadManager() {
    return audioDownloadManager
  },

  /**
   * 获取图片下载进度
   */
  getImageDownloadProgress() {
    const progress = imageManager.getDownloadProgress()
    this.globalData.imageDownloadStatus.progress = progress.percentage
    return progress
  },

  /**
   * 获取音频下载进度
   */
  getAudioDownloadProgress() {
    const progress = audioDownloadManager.getDownloadProgress()
    this.globalData.audioDownloadStatus.progress = progress.percentage
    return progress
  },

  // 游戏相关方法
  startGame(gameData) {
    this.globalData.gameMode = gameData.mode
    this.globalData.maxQuestions = gameData.maxQuestions
    this.globalData.currentQuestionIndex = 0
    this.globalData.totalQuestions = 0
    this.globalData.correctAnswers = 0
    this.globalData.wrongAnswers = 0
    this.globalData.reactionTimes = []
    
    // 重置PK模式数据
    if (gameData.mode === 'pk') {
      this.globalData.currentPlayer = 1
      this.globalData.pkPhase = 'player1'
      this.globalData.player1Stats = { correct: 0, wrong: 0, reactionTimes: [] }
      this.globalData.player2Stats = { correct: 0, wrong: 0, reactionTimes: [] }
    }
    
    this.generateNewNote()
  },

  generateNewNote() {
    try {
      // 从图片管理器获取所有音符配置
      const allNoteConfigs = imageManager.imageConfigs
      
      if (!allNoteConfigs || allNoteConfigs.length === 0) {
        console.warn('图片管理器尚未初始化或没有音符配置，使用默认音符')
        this.generateDefaultNote()
        return
      }
      
      // 随机选择一个音符配置
      const randomIndex = Math.floor(Math.random() * allNoteConfigs.length)
      const selectedConfig = allNoteConfigs[randomIndex]
      
      console.log('生成新音符:', selectedConfig.noteName, selectedConfig.clef, selectedConfig.position)
      
      // 生成学习页面使用的音符对象
      this.globalData.currentNote = {
        name: selectedConfig.noteName,
        clef: selectedConfig.clef,
        position: selectedConfig.position,
        pianoKey: this.convertToPianoKey(selectedConfig.noteName),
        staffPosition: selectedConfig.position,
        jianpu: this.getJianpuForNote(selectedConfig.noteName)
      }
      
      this.globalData.selectedKey = null
      this.globalData.hasShownJianpu = false
      this.globalData.questionStartTime = Date.now()
      
      console.log('生成的音符对象:', this.globalData.currentNote)
      
    } catch (error) {
      console.error('生成新音符失败:', error)
      this.generateDefaultNote()
    }
  },

  /**
   * 生成默认音符（当图片管理器不可用时的备选方案）
   */
  generateDefaultNote() {
    console.log('使用默认音符配置')
    
    const notes = [
      { name: 'C4', clef: 'treble', position: '第2间', pianoKey: 'c4', staffPosition: '第2间', jianpu: '1' },
      { name: 'D4', clef: 'treble', position: '第3线', pianoKey: 'd4', staffPosition: '第3线', jianpu: '2' },
      { name: 'E4', clef: 'treble', position: '第3间', pianoKey: 'e4', staffPosition: '第3间', jianpu: '3' },
      { name: 'F4', clef: 'treble', position: '第4线', pianoKey: 'f4', staffPosition: '第4线', jianpu: '4' },
      { name: 'G4', clef: 'treble', position: '第4间', pianoKey: 'g4', staffPosition: '第4间', jianpu: '5' },
      { name: 'A4', clef: 'treble', position: '第5线', pianoKey: 'a4', staffPosition: '第5线', jianpu: '6' },
      { name: 'B4', clef: 'treble', position: '上加1间', pianoKey: 'b4', staffPosition: '上加1间', jianpu: '7' },
      { name: 'C5', clef: 'treble', position: '上加1线', pianoKey: 'c5', staffPosition: '上加1线', jianpu: '1̇' }
    ]
    
    const randomIndex = Math.floor(Math.random() * notes.length)
    this.globalData.currentNote = notes[randomIndex]
    this.globalData.selectedKey = null
    this.globalData.hasShownJianpu = false
    this.globalData.questionStartTime = Date.now()
  },

  /**
   * 将音符名称转换为钢琴键名
   */
  convertToPianoKey(noteName) {
    // 将音符名称转换为小写，去除升降号处理
    const baseNote = noteName.charAt(0).toLowerCase()
    const octave = noteName.substring(1)
    
    // 构建钢琴键名
    return `${baseNote}${octave}`
  },

  /**
   * 获取音符对应的简谱
   */
  getJianpuForNote(noteName) {
    const baseNote = noteName.charAt(0)
    const octave = parseInt(noteName.substring(1))
    
    const jianpuMap = {
      'C': '1',
      'D': '2', 
      'E': '3',
      'F': '4',
      'G': '5',
      'A': '6',
      'B': '7'
    }
    
    let jianpu = jianpuMap[baseNote] || '?'
    
    // 以第4八度为基准（中央C所在的八度，无点）
    if (octave > 4) {
      // 高音区：第5八度=一个高音点，第6八度=两个高音点
      jianpu += '̇'.repeat(octave - 4)
    } else if (octave < 4) {
      // 低音区：第3八度=一个低音点，第2八度=两个低音点，第1八度=三个低音点
      jianpu += '̣'.repeat(4 - octave)
    }
    // octave = 4 时无点（中音区）
    
    console.log(`简谱转换: ${noteName} (第${octave}八度) -> ${jianpu}`)
    
    return jianpu
  },

  recordAnswer(isCorrect) {
    const reactionTime = Date.now() - this.globalData.questionStartTime
    
    this.globalData.totalQuestions++
    this.globalData.hasShownJianpu = true
    
    if (isCorrect) {
      this.globalData.correctAnswers++
    } else {
      this.globalData.wrongAnswers++
    }
    
    this.globalData.reactionTimes.push(reactionTime)
    
    // PK模式记录当前玩家数据
    if (this.globalData.gameMode === 'pk') {
      const playerStats = this.globalData.currentPlayer === 1 ? 
        this.globalData.player1Stats : this.globalData.player2Stats
      if (isCorrect) {
        playerStats.correct++
      } else {
        playerStats.wrong++
      }
      playerStats.reactionTimes.push(reactionTime)
    }
  },

  nextQuestion() {
    this.globalData.currentQuestionIndex++
    this.generateNewNote()
  },

  // 计算统计数据
  getAccuracyRate() {
    if (this.globalData.totalQuestions === 0) return 0
    return Math.round((this.globalData.correctAnswers / this.globalData.totalQuestions) * 100)
  },

  getAverageReactionTime() {
    if (this.globalData.reactionTimes.length === 0) return 0
    const sum = this.globalData.reactionTimes.reduce((a, b) => a + b, 0)
    return Math.round((sum / this.globalData.reactionTimes.length) / 1000 * 100) / 100
  },

  getPlayerAccuracyRate(player) {
    const stats = player === 1 ? this.globalData.player1Stats : this.globalData.player2Stats
    const total = stats.correct + stats.wrong
    if (total === 0) return 0
    return Math.round((stats.correct / total) * 100)
  },

  getPlayerAverageReactionTime(player) {
    const stats = player === 1 ? this.globalData.player1Stats : this.globalData.player2Stats
    if (stats.reactionTimes.length === 0) return 0
    const sum = stats.reactionTimes.reduce((a, b) => a + b, 0)
    return Math.round((sum / stats.reactionTimes.length) / 1000 * 100) / 100
  }
}) 