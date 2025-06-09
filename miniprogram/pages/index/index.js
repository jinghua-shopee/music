const app = getApp()

Page({
  data: {
    selectedMode: '',
    selectedCount: null,
    showToast: false,
    toastMessage: '',
    canStart: false,
    // 图片下载状态
    imageDownloadStatus: {
      isDownloading: true,
      isCompleted: false,
      progress: 0,
      error: null
    },
    // 音频下载状态
    audioDownloadStatus: {
      isDownloading: true,
      isCompleted: false,
      progress: 0,
      error: null
    }
  },

  onLoad() {
    console.log('首页加载')
    
    // 获取当前图片和音频下载状态
    this.setData({
      imageDownloadStatus: app.globalData.imageDownloadStatus,
      audioDownloadStatus: app.globalData.audioDownloadStatus
    })
    
    // 如果还在下载中，开始轮询进度
    if (this.data.imageDownloadStatus.isDownloading || this.data.audioDownloadStatus.isDownloading) {
      this.startProgressPolling()
    }
  },

  onShow() {
    console.log('首页显示')
    
    // 更新图片和音频下载状态
    this.setData({
      imageDownloadStatus: app.globalData.imageDownloadStatus,
      audioDownloadStatus: app.globalData.audioDownloadStatus
    })
  },

  /**
   * 图片下载完成回调（由app.js调用）
   */
  onImageDownloadComplete(status) {
    console.log('首页收到图片下载完成通知:', status)
    
    this.setData({
      imageDownloadStatus: status
    })
    
    if (status.isCompleted && !status.error) {
      wx.showToast({
        title: '五线谱图片加载完成',
        icon: 'success',
        duration: 2000
      })
    } else if (status.error) {
      wx.showToast({
        title: '五线谱图片加载失败',
        icon: 'error',
        duration: 3000
      })
    }
  },

  /**
   * 音频下载完成回调（由app.js调用）
   */
  onAudioDownloadComplete(status) {
    console.log('首页收到音频下载完成通知:', status)
    
    this.setData({
      audioDownloadStatus: status
    })
    
    if (status.isCompleted && !status.error) {
      wx.showToast({
        title: '钢琴音频加载完成',
        icon: 'success',
        duration: 2000
      })
    } else if (status.error) {
      wx.showToast({
        title: '钢琴音频加载失败',
        icon: 'none',
        duration: 3000
      })
    }
  },

  /**
   * 开始轮询下载进度
   */
  startProgressPolling() {
    const timer = setInterval(() => {
      // 获取图片下载进度
      const imageProgress = app.getImageDownloadProgress()
      const audioProgress = app.getAudioDownloadProgress()
      
      this.setData({
        'imageDownloadStatus.progress': imageProgress.percentage,
        'audioDownloadStatus.progress': audioProgress.percentage
      })
      
      console.log('图片下载进度:', imageProgress)
      console.log('音频下载进度:', audioProgress)
      
      // 如果都下载完成或出错，停止轮询
      if (!app.globalData.imageDownloadStatus.isDownloading && 
          !app.globalData.audioDownloadStatus.isDownloading) {
        clearInterval(timer)
      }
    }, 1000)
  },

  /**
   * 重新下载图片
   */
  async retryImageDownload() {
    console.log('重新下载图片')
    
    wx.showLoading({
      title: '正在重新下载五线谱...',
      mask: true
    })
    
    try {
      await app.initializeImages()
      
      wx.hideLoading()
      
      wx.showToast({
        title: '五线谱重新下载完成',
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      
      wx.showToast({
        title: '五线谱重新下载失败',
        icon: 'error'
      })
      
      console.error('重新下载图片失败:', error)
    }
  },

  /**
   * 重新下载音频
   */
  async retryAudioDownload() {
    console.log('重新下载音频')
    
    wx.showLoading({
      title: '正在重新下载音频...',
      mask: true
    })
    
    try {
      await app.initializeAudio()
      
      wx.hideLoading()
      
      wx.showToast({
        title: '音频重新下载完成',
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      
      wx.showToast({
        title: '音频重新下载失败',
        icon: 'error'
      })
      
      console.error('重新下载音频失败:', error)
    }
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

    // 检查图片是否已下载完成
    if (!this.data.imageDownloadStatus.isCompleted) {
      wx.showToast({
        title: '五线谱图片尚未加载完成',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 音频下载失败不阻塞游戏开始，但给出提示
    if (!this.data.audioDownloadStatus.isCompleted) {
      wx.showToast({
        title: '音频尚未加载完成，将使用振动反馈',
        icon: 'none',
        duration: 3000
      })
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