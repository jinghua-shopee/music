Page({
  data: {
    testNotes: [], // 将从图片管理器动态获取
    currentNoteIndex: 0,
    currentNote: null,
    testImagePath: '',
    currentClef: 'treble', // 添加当前谱号
    // 预计算的统计数据
    trebleCount: 0,
    bassCount: 0,
    totalCount: 0,
    // 当前显示的音符列表
    filteredNotes: [],
    // 图片下载状态
    imageDownloadStatus: {
      isDownloading: false,
      isCompleted: false,
      progress: 0,
      error: null
    }
  },

  onLoad() {
    console.log('测试页面加载')
    
    // 获取应用实例和图片下载状态
    const app = getApp()
    this.setData({
      imageDownloadStatus: app.globalData.imageDownloadStatus
    })
    
    // 初始化测试音符列表
    this.initializeTestNotes()
    
    // 添加调试信息
    this.debugImageManager()
    
    console.log('测试页面加载完成')
    console.log('图片下载状态:', this.data.imageDownloadStatus)
  },

  /**
   * 初始化测试音符列表（从图片管理器获取）
   */
  initializeTestNotes() {
    const app = getApp()
    const imageManager = app.getImageManager()
    
    // 获取所有图片配置
    const allConfigs = imageManager.imageConfigs
    
    // 转换为测试用的音符格式
    const testNotes = allConfigs.map((config, index) => ({
      name: config.noteName,
      clef: config.clef,
      position: config.position,
      fileName: config.fileName,
      pianoKey: config.noteName.toLowerCase(),
      staffPosition: config.position,
      jianpu: this.getJianpuForNote(config.noteName),
      originalIndex: index // 添加原始索引
    }))
    
    // 按谱号和音符名称排序
    testNotes.sort((a, b) => {
      if (a.clef !== b.clef) {
        return a.clef === 'treble' ? -1 : 1 // treble 在前
      }
      return a.name.localeCompare(b.name)
    })
    
    // 更新排序后的索引
    testNotes.forEach((note, index) => {
      note.sortedIndex = index
    })
    
    // 计算统计数据
    const trebleCount = testNotes.filter(note => note.clef === 'treble').length
    const bassCount = testNotes.filter(note => note.clef === 'bass').length
    
    this.setData({
      testNotes: testNotes,
      currentNote: testNotes[0] || null,
      trebleCount: trebleCount,
      bassCount: bassCount,
      totalCount: testNotes.length
    })
    
    // 更新过滤后的音符列表
    this.updateFilteredNotes()
    
    // 更新测试图片路径
    this.updateTestImagePath()
    
    console.log('初始化测试音符列表完成，共', testNotes.length, '个音符')
    console.log('高音符号:', trebleCount, '低音符号:', bassCount)
  },

  /**
   * 更新过滤后的音符列表
   */
  updateFilteredNotes() {
    let filteredNotes = []
    
    if (this.data.currentClef === 'all') {
      filteredNotes = this.data.testNotes
    } else {
      filteredNotes = this.data.testNotes.filter(note => note.clef === this.data.currentClef)
    }
    
    // 为过滤后的音符添加选择索引
    filteredNotes.forEach(note => {
      note.selectIndex = this.data.testNotes.findIndex(item => item.fileName === note.fileName)
    })
    
    this.setData({
      filteredNotes: filteredNotes
    })
    
    console.log('过滤后的音符数量:', filteredNotes.length)
  },

  /**
   * 获取音符对应的简谱
   */
  getJianpuForNote(noteName) {
    const baseNote = noteName.charAt(0)
    const jianpuMap = {
      'C': '1',
      'D': '2', 
      'E': '3',
      'F': '4',
      'G': '5',
      'A': '6',
      'B': '7'
    }
    return jianpuMap[baseNote] || '?'
  },

  onShow() {
    // 更新图片下载状态
    const app = getApp()
    this.setData({
      imageDownloadStatus: app.globalData.imageDownloadStatus
    })
  },

  /**
   * 图片下载完成回调（由app.js调用）
   */
  onImageDownloadComplete(status) {
    console.log('测试页面收到图片下载完成通知:', status)
    
    this.setData({
      imageDownloadStatus: status
    })
    
    // 重新初始化音符列表
    this.initializeTestNotes()
    
    // 重新更新测试图片路径
    this.updateTestImagePath()
  },

  /**
   * 更新测试图片路径
   */
  updateTestImagePath() {
    const app = getApp()
    const imageManager = app.getImageManager()
    
    if (this.data.currentNote) {
      // 尝试获取本地缓存图片路径
      const localImagePath = imageManager.getLocalImagePath(this.data.currentNote.name, this.data.currentNote.clef)
      
      if (localImagePath) {
        this.setData({
          testImagePath: localImagePath
        })
        console.log('使用本地缓存图片:', localImagePath)
      } else {
        // 使用远程图片作为备选
        const remoteImagePath = this.getRemoteImagePath(this.data.currentNote)
        this.setData({
          testImagePath: remoteImagePath
        })
        console.log('使用远程图片:', remoteImagePath)
      }
    }
  },

  /**
   * 获取远程图片路径
   */
  getRemoteImagePath(note) {
    if (note && note.position) {
      const fileName = `${note.clef}_${note.name}_${note.position}.png`
      return `https://music-1253799806.cos.ap-guangzhou.myqcloud.com/pic/${encodeURIComponent(fileName)}`
    }
    return ''
  },

  /**
   * 下一个音符
   */
  nextNote() {
    const nextIndex = (this.data.currentNoteIndex + 1) % this.data.testNotes.length
    this.setData({
      currentNoteIndex: nextIndex,
      currentNote: this.data.testNotes[nextIndex]
    })
    this.updateTestImagePath()
    console.log('切换到音符:', this.data.testNotes[nextIndex])
  },

  /**
   * 上一个音符
   */
  prevNote() {
    const prevIndex = this.data.currentNoteIndex === 0 ? 
      this.data.testNotes.length - 1 : this.data.currentNoteIndex - 1
    this.setData({
      currentNoteIndex: prevIndex,
      currentNote: this.data.testNotes[prevIndex]
    })
    this.updateTestImagePath()
    console.log('切换到音符:', this.data.testNotes[prevIndex])
  },

  /**
   * 选择音符
   */
  selectNote(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentNoteIndex: index,
      currentNote: this.data.testNotes[index]
    })
    this.updateTestImagePath()
    console.log('选择音符:', this.data.testNotes[index])
  },

  /**
   * 切换谱号过滤
   */
  switchClef(e) {
    const clef = e.currentTarget.dataset.clef
    this.setData({
      currentClef: clef
    })
    
    // 更新过滤后的音符列表
    this.updateFilteredNotes()
    
    console.log('切换到谱号:', clef)
  },

  /**
   * 直接图片加载错误
   */
  onImageError(e) {
    console.error('直接图片加载失败:', e)
    console.error('失败的图片路径:', this.data.testImagePath)
  },

  /**
   * 直接图片加载成功
   */
  onImageLoad(e) {
    console.log('直接图片加载成功:', this.data.testImagePath)
  },

  /**
   * 调试图片管理器状态
   */
  debugImageManager() {
    const app = getApp()
    const imageManager = app.getImageManager()
    
    console.log('=== 图片管理器调试信息 ===')
    console.log('是否已初始化:', imageManager.isInitialized)
    console.log('本地缓存目录:', imageManager.localDir)
    console.log('图片配置数量:', imageManager.imageConfigs.length)
    console.log('下载状态:', imageManager.downloadStatus)
    
    // 检查几个示例图片的路径
    const testNotes = ['A5', 'C4', 'B4']
    const testClefs = ['treble', 'bass']
    
    testClefs.forEach(clef => {
      testNotes.forEach(noteName => {
        const config = imageManager.imageConfigs.find(c => c.key === `${clef}_${noteName}`)
        if (config) {
          console.log(`${clef}_${noteName}:`)
          console.log('  远程文件名:', config.fileName)
          console.log('  本地文件名:', config.localFileName)
          console.log('  远程URL:', config.remoteUrl)
          console.log('  本地路径:', config.localPath)
          console.log('  下载状态:', imageManager.downloadStatus[config.key])
        }
      })
    })
  },

  /**
   * 检查当前图片状态
   */
  checkCurrentImage() {
    if (!this.data.currentNote) {
      console.log('没有当前音符')
      return
    }

    const app = getApp()
    const imageManager = app.getImageManager()
    const note = this.data.currentNote
    
    console.log('=== 当前图片检查 ===')
    console.log('当前音符:', note)
    console.log('音符名称:', note.name)
    console.log('谱号:', note.clef)
    
    const key = `${note.clef}_${note.name}`
    const config = imageManager.imageConfigs.find(c => c.key === key)
    
    if (config) {
      console.log('图片配置:', config)
      console.log('下载状态:', imageManager.downloadStatus[key])
      console.log('测试图片路径:', this.data.testImagePath)
      
      // 检查本地文件是否存在
      if (config.localPath) {
        wx.getFileSystemManager().access({
          path: config.localPath,
          success: () => {
            console.log('✅ 本地文件存在:', config.localPath)
          },
          fail: (error) => {
            console.log('❌ 本地文件不存在:', config.localPath, error)
          }
        })
      }
    } else {
      console.log('❌ 未找到图片配置')
    }
  }
}) 