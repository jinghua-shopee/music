const app = getApp()

Page({
  data: {
    selectedMode: '',
    selectedCount: null,
    showToast: false,
    toastMessage: '',
    canStart: false
  },

  onLoad() {
    console.log('首页加载')
  },

  // 选择模式
  selectMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      selectedMode: mode
    })
    
    // 如果选择PK模式，自动取消无尽模式
    if (mode === 'pk' && this.data.selectedCount === 'endless') {
      this.setData({
        selectedCount: null
      })
    }
    
    this.updateCanStart()
    console.log('选择模式:', mode)
  },

  // 选择题目数量
  selectCount(e) {
    const count = e.currentTarget.dataset.count
    
    // PK模式不允许选择无尽模式
    if (this.data.selectedMode === 'pk' && count === 'endless') {
      this.showToastMessage('PK模式不支持无尽模式')
      return
    }
    
    this.setData({
      selectedCount: count === 'endless' ? 'endless' : parseInt(count)
    })
    
    this.updateCanStart()
    console.log('选择题目数量:', count)
  },

  // 更新是否可以开始
  updateCanStart() {
    this.setData({
      canStart: this.data.selectedMode && this.data.selectedCount !== null
    })
  },

  // 开始学习
  startLearning() {
    if (!this.data.canStart) {
      this.showToastMessage('请先选择学习模式和题目数量')
      return
    }
    
    console.log('开始学习:', {
      mode: this.data.selectedMode,
      count: this.data.selectedCount
    })
    
    // 准备游戏数据
    const gameData = {
      mode: this.data.selectedMode,
      maxQuestions: this.data.selectedCount === 'endless' ? Infinity : this.data.selectedCount
    }
    
    // 初始化游戏状态
    app.startGame(gameData)
    
    // 跳转到学习页面
    wx.navigateTo({
      url: '/pages/learning/learning'
    })
  },

  // 显示提示信息
  showToastMessage(message) {
    this.setData({
      toastMessage: message,
      showToast: true
    })
    
    setTimeout(() => {
      this.setData({
        showToast: false
      })
    }, 2000)
  }
}) 