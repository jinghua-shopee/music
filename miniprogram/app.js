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
    }
  },

  onLaunch() {
    console.log('小程序启动')
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
    // 生成随机音符
    const notes = [
      { name: 'C4', pianoKey: 'c4', staffPosition: 'line1', jianpu: '1' },
      { name: 'D4', pianoKey: 'd4', staffPosition: 'space1', jianpu: '2' },
      { name: 'E4', pianoKey: 'e4', staffPosition: 'line2', jianpu: '3' },
      { name: 'F4', pianoKey: 'f4', staffPosition: 'space2', jianpu: '4' },
      { name: 'G4', pianoKey: 'g4', staffPosition: 'line3', jianpu: '5' },
      { name: 'A4', pianoKey: 'a4', staffPosition: 'space3', jianpu: '6' },
      { name: 'B4', pianoKey: 'b4', staffPosition: 'line4', jianpu: '7' },
      { name: 'C5', pianoKey: 'c5', staffPosition: 'space4', jianpu: '1̇' }
    ]
    
    const randomIndex = Math.floor(Math.random() * notes.length)
    this.globalData.currentNote = notes[randomIndex]
    this.globalData.selectedKey = null
    this.globalData.hasShownJianpu = false
    this.globalData.questionStartTime = Date.now()
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