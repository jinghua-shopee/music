// pages/learning/learning.js
// 音符数据
const notes = [
  { id: 'C4', name: 'C', octave: 4, abc: 'C', frequency: 261.63, jianpu: '1', isMiddleC: true },
  { id: 'D4', name: 'D', octave: 4, abc: 'D', frequency: 293.66, jianpu: '2', isMiddleC: false },
  { id: 'E4', name: 'E', octave: 4, abc: 'E', frequency: 329.63, jianpu: '3', isMiddleC: false },
  { id: 'F4', name: 'F', octave: 4, abc: 'F', frequency: 349.23, jianpu: '4', isMiddleC: false },
  { id: 'G4', name: 'G', octave: 4, abc: 'G', frequency: 392.00, jianpu: '5', isMiddleC: false },
  { id: 'A4', name: 'A', octave: 4, abc: 'A', frequency: 440.00, jianpu: '6', isMiddleC: false },
  { id: 'B4', name: 'B', octave: 4, abc: 'B', frequency: 493.88, jianpu: '7', isMiddleC: false },
  { id: 'C5', name: 'C', octave: 5, abc: 'c', frequency: 523.25, jianpu: '1̇', isMiddleC: false }
]

// 生成简化的钢琴键盘
function generateSimplePianoKeys() {
  return notes.map((note, index) => ({
    note: note.id,
    name: note.name,
    octave: note.octave,
    isBlack: false,
    isMiddleC: note.isMiddleC,
    position: index
  }))
}

Page({
  data: {
    gameMode: '',
    questionCount: 0,
    currentQuestionIndex: 0,
    currentNote: null,
    selectedKey: null,
    hasShownJianpu: false,
    isPaused: false,
    
    totalQuestions: 0,
    correctAnswers: 0,
    
    showEndDialog: false,
    
    pianoKeys: []
  },

  onLoad(options) {
    this.setData({
      gameMode: options.mode || 'practice',
      questionCount: options.count || '30',
      pianoKeys: generateSimplePianoKeys()
    })
    
    console.log('学习页面加载完成', this.data)
    
    // 开始第一题
    this.startNewQuestion()
  },

  // 开始新题目
  startNewQuestion() {
    const randomNote = notes[Math.floor(Math.random() * notes.length)]
    this.setData({
      currentNote: randomNote,
      selectedKey: null,
      hasShownJianpu: false
    })
    console.log('新题目:', randomNote)
  },

  // 选择钢琴键
  selectPianoKey(e) {
    if (this.data.isPaused) return
    
    const keyData = e.currentTarget.dataset.key
    console.log('选择了音符:', keyData)
    
    this.setData({
      selectedKey: keyData.note,
      hasShownJianpu: true
    })
    
    // 检查答案
    const isCorrect = keyData.note === this.data.currentNote.id
    
    // 更新统计
    this.setData({
      totalQuestions: this.data.totalQuestions + 1,
      correctAnswers: this.data.correctAnswers + (isCorrect ? 1 : 0)
    })
    
    // 播放提示音（微信小程序可以使用音频API）
    if (isCorrect) {
      wx.showToast({
        title: '正确！',
        icon: 'success',
        duration: 1000
      })
    } else {
      wx.showToast({
        title: '继续加油！',
        icon: 'none',
        duration: 1000
      })
    }
  },

  // 下一题
  nextQuestion() {
    if (!this.data.hasShownJianpu) return
    
    const nextIndex = this.data.currentQuestionIndex + 1
    this.setData({
      currentQuestionIndex: nextIndex
    })
    
    // 检查是否结束
    if (this.data.questionCount !== 'endless' && 
        nextIndex >= parseInt(this.data.questionCount)) {
      this.endLearning()
      return
    }
    
    this.startNewQuestion()
  },

  // 暂停/继续
  pauseResume() {
    this.setData({
      isPaused: !this.data.isPaused
    })
    
    wx.showToast({
      title: this.data.isPaused ? '已暂停' : '继续学习',
      icon: 'none',
      duration: 1000
    })
  },

  // 显示结束确认
  showEndConfirm() {
    this.setData({
      showEndDialog: true
    })
  },

  // 隐藏结束确认
  hideEndConfirm() {
    this.setData({
      showEndDialog: false
    })
  },

  // 结束学习
  endLearning() {
    this.setData({
      showEndDialog: false
    })
    
    const accuracyRate = this.data.totalQuestions > 0 ? 
      Math.round((this.data.correctAnswers / this.data.totalQuestions) * 100) : 0
    
    // 显示结果
    wx.showModal({
      title: '学习完成',
      content: `总题数: ${this.data.totalQuestions}\n正确数: ${this.data.correctAnswers}\n准确率: ${accuracyRate}%`,
      confirmText: '返回首页',
      showCancel: false,
      success: () => {
        wx.navigateBack()
      }
    })
  },

  // 计算准确率
  get accuracyRate() {
    return this.data.totalQuestions > 0 ? 
      Math.round((this.data.correctAnswers / this.data.totalQuestions) * 100) : 0
  }
}) 