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
    
    // 启动后台音频健康监控（静默）
    this.startBackgroundAudioMonitoring()
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

  /**
   * 手动优化音频系统
   */
  async manualOptimizeAudio() {
    wx.showLoading({
      title: '正在优化音频系统...',
      mask: true
    })
    
    try {
      // 安全检查audioUtils模块
      const audioUtils = require('../../utils/audioUtils.js')
      if (!audioUtils || !audioUtils.audioManager) {
        wx.hideLoading()
        wx.showModal({
          title: '优化失败',
          content: 'audioManager 未就绪，请稍后重试',
          showCancel: false,
          confirmText: '确定'
        })
        return
      }
      
      const { audioManager } = audioUtils
      
      // 检查优化方法是否存在
      if (typeof audioManager.autoOptimize !== 'function') {
        wx.hideLoading()
        wx.showModal({
          title: '优化失败',
          content: '优化功能不可用',
          showCancel: false,
          confirmText: '确定'
        })
        return
      }
      
      const result = await audioManager.autoOptimize()
      
      wx.hideLoading()
      
      if (result.success) {
        const optimizations = result.optimizations.join(', ')
        wx.showModal({
          title: '优化完成',
          content: `已执行优化操作：${optimizations}`,
          showCancel: false,
          confirmText: '确定'
        })
      } else {
        wx.showModal({
          title: '优化失败',
          content: result.error || '未知错误',
          showCancel: false,
          confirmText: '确定'
        })
      }
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '优化失败',
        icon: 'error'
      })
      console.error('手动优化失败:', error)
    }
  },

  /**
   * 清理音频缓存
   */
  async clearAudioCache() {
    wx.showModal({
      title: '确认清理',
      content: '是否清理所有音频缓存？清理后需要重新下载。',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在清理缓存...',
            mask: true
          })
          
          try {
            const audioDownloadManager = require('../../utils/audioDownloadManager')
            await audioDownloadManager.clearCache()
            
            wx.hideLoading()
            wx.showToast({
              title: '缓存已清理',
              icon: 'success'
            })
            
            // 刷新状态
            this.setData({
              audioDownloadStatus: {
                isDownloading: false,
                isCompleted: false,
                progress: 0,
                error: null
              }
            })
          } catch (error) {
            wx.hideLoading()
            wx.showToast({
              title: '清理失败',
              icon: 'error'
            })
            console.error('清理缓存失败:', error)
          }
        }
      }
    })
  },

  /**
   * 启动后台音频健康监控（静默）
   */
  startBackgroundAudioMonitoring() {
    console.log('🔊 启动后台音频健康监控（静默模式）')
    
    // 延迟开始，避免与初始化冲突
    setTimeout(() => {
      // 检查audioUtils模块是否可用
      try {
        const audioUtils = require('../../utils/audioUtils.js')
        if (!audioUtils || !audioUtils.audioManager) {
          console.log('⚠️ audioManager 未就绪，延迟启动后台监控')
          // 再次延迟重试
          setTimeout(() => {
            this.startBackgroundAudioMonitoring()
          }, 30000) // 30秒后重试
          return
        }
        
        console.log('✅ audioManager 已就绪，启动后台监控')
        this.performBackgroundHealthCheck()
        
        // 定期检查（每2分钟）
        this.backgroundHealthTimer = setInterval(() => {
          this.performBackgroundHealthCheck()
        }, 120000)
        
      } catch (error) {
        console.error('启动后台监控失败:', error)
        // 静默失败，不影响用户体验
      }
    }, 10000)
  },

  /**
   * 后台音频健康检查（不干扰用户）
   */
  async performBackgroundHealthCheck() {
    try {
      // 检查audioUtils模块是否可用
      const audioUtils = require('../../utils/audioUtils.js')
      if (!audioUtils || !audioUtils.audioManager) {
        console.log('⚠️ audioManager 未就绪，跳过后台健康检查')
        return
      }
      
      const { audioManager } = audioUtils
      
      // 检查健康检查方法是否存在
      if (typeof audioManager.performHealthCheck !== 'function') {
        console.log('⚠️ performHealthCheck 方法不存在，跳过检查')
        return
      }
      
      const healthCheck = await audioManager.performHealthCheck()
      
      const healthScore = healthCheck.downloadManagerHealth?.percentage || 0
      console.log(`🔊 后台音频健康检查: ${healthScore}%`)
      
      // 如果健康度很低，静默自动优化
      if (healthScore < 50) {
        console.log('⚡ 音频健康度低，启动静默优化...')
        this.performSilentOptimization()
      }
      
    } catch (error) {
      console.error('后台音频健康检查失败:', error)
      // 静默失败，不影响用户体验
    }
  },

  /**
   * 静默音频优化（不显示任何提示）
   */
  async performSilentOptimization() {
    try {
      const audioUtils = require('../../utils/audioUtils.js')
      if (!audioUtils || !audioUtils.audioManager) {
        console.log('⚠️ audioManager 未就绪，跳过静默优化')
        return
      }
      
      const { audioManager } = audioUtils
      
      // 检查自动优化方法是否存在
      if (typeof audioManager.autoOptimize !== 'function') {
        console.log('⚠️ autoOptimize 方法不存在，跳过优化')
        return
      }
      
      const result = await audioManager.autoOptimize()
      
      if (result.success) {
        console.log('✅ 静默音频优化成功:', result.optimizations)
      } else {
        console.log('❌ 静默音频优化失败:', result.error)
      }
      
    } catch (error) {
      console.error('静默音频优化出错:', error)
      // 静默失败，不影响用户体验
    }
  },

  /**
   * 页面卸载时清理定时器
   */
  onUnload() {
    if (this.backgroundHealthTimer) {
      clearInterval(this.backgroundHealthTimer)
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
  },
}) 