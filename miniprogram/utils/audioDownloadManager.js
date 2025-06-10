/**
 * 音频下载管理器 - 优化版
 * 负责从云端下载钢琴音频文件并缓存到本地
 * 
 * 主要优化：
 * 1. 智能文件检查和增量下载
 * 2. 文件完整性验证
 * 3. 存储使用情况监控
 * 4. 更好的错误处理和重试机制
 * 5. 性能优化和内存管理
 */

class AudioDownloadManager {
  constructor() {
    // 云端音频基础URL
    this.baseUrl = 'https://music-1253799806.cos.ap-guangzhou.myqcloud.com/audio/piano/'
    
    // 本地缓存目录
    this.localDir = `${wx.env.USER_DATA_PATH}/audio/piano/`
    
    // 音频文件配置
    this.audioConfigs = this.generateAudioConfigs()
    
    // 下载状态管理
    this.downloadStatus = {}
    this.isInitialized = false
    
    // 性能监控
    this.stats = {
      totalDownloads: 0,
      successDownloads: 0,
      failedDownloads: 0,
      lastCheckTime: 0,
      totalSize: 0
    }
    
    // 配置参数
    this.config = {
      maxRetries: 3,
      retryDelay: 500,
      timeout: 30000,
      minFileSize: 1000, // 最小文件大小（字节）
      maxConcurrentDownloads: 5, // 最大并发下载数
      healthCheckInterval: 60000 // 健康检查间隔（毫秒）
    }
  }

  /**
   * 生成所有音频文件的配置信息
   */
  generateAudioConfigs() {
    const configs = []
    
    // 88键钢琴音符列表（A0到C8）
    const notes = []
    
    // A0, A#0, B0
    notes.push('a0', 'a#0', 'b0')
    
    // C1-B7 (7个完整八度)
    const noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b']
    for (let octave = 1; octave <= 7; octave++) {
      noteNames.forEach(noteName => {
        notes.push(`${noteName}${octave}`)
      })
    }
    
    // C8
    notes.push('c8')
    
    // 生成每个音符的配置
    notes.forEach(noteKey => {
      const fileName = `${noteKey}.mp3`
      // 对文件名进行URL编码，处理#号
      const encodedFileName = encodeURIComponent(fileName)
      // 本地路径使用原始文件名（微信小程序本地文件系统支持#号）
      const localFileName = fileName
      
      configs.push({
        noteKey: noteKey,
        fileName: fileName,
        localFileName: localFileName,
        remoteUrl: this.baseUrl + encodedFileName,
        localPath: this.localDir + localFileName,
        key: noteKey,
        priority: this.getNotePriority(noteKey) // 添加优先级
      })
    })

    console.log(`🎵 生成音频配置: ${configs.length} 个音频文件`)
    
    // 按优先级排序，优先下载常用音符
    configs.sort((a, b) => b.priority - a.priority)
    
    return configs
  }

  /**
   * 获取音符优先级（常用音符优先下载）
   */
  getNotePriority(noteKey) {
    // 中央C区域（C4-B4）最高优先级
    if (noteKey.includes('4')) return 10
    
    // 扩展区域（C3-B5）高优先级
    if (noteKey.includes('3') || noteKey.includes('5')) return 8
    
    // 常用区域（C2-B6）中等优先级
    if (noteKey.includes('2') || noteKey.includes('6')) return 6
    
    // 其他音符低优先级
    return 4
  }

  /**
   * 智能初始化：先检查现有文件，再增量下载
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('🎵 音频管理器已初始化')
      return this.getDownloadProgress()
    }

    console.log('🚀 开始智能初始化音频管理器...')
    console.log('🌐 基础URL:', this.baseUrl)
    console.log('📁 本地缓存目录:', this.localDir)
    
    try {
      // 确保本地目录存在
      await this.ensureLocalDirectory()
      
      // 检查现有文件完整性
      const existingCount = await this.checkFilesIntegrity()
      
      // 获取存储使用情况
      const storageInfo = await this.getStorageUsage()
      console.log('💾 存储使用情况:', storageInfo)
      
      // 增量下载缺失文件
      const missingConfigs = this.audioConfigs.filter(config => 
        this.downloadStatus[config.key] !== 'success'
      )
      
      if (missingConfigs.length > 0) {
        console.log(`📥 需要下载 ${missingConfigs.length} 个缺失文件`)
        await this.downloadMissingFiles(missingConfigs)
      } else {
        console.log('✅ 所有文件已存在，无需下载')
      }
      
      this.isInitialized = true
      console.log('🎉 智能初始化完成')
      
      return this.getDownloadProgress()
      
    } catch (error) {
      console.error('❌ 音频管理器初始化失败:', error)
      throw error
    }
  }

  /**
   * 检查文件完整性
   */
  async checkFilesIntegrity() {
    console.log('🔍 检查本地文件完整性...')
    this.stats.lastCheckTime = Date.now()
    
    const checkPromises = this.audioConfigs.map(async (config) => {
      try {
        // 检查文件是否存在
        const stats = await this.getFileStats(config.localPath)
        
        if (stats.size < this.config.minFileSize) {
          console.warn(`⚠️ 文件可能损坏: ${config.fileName} (${stats.size}字节)`)
          this.downloadStatus[config.key] = 'failed'
          return false
        }
        
        this.downloadStatus[config.key] = 'success'
        this.stats.totalSize += stats.size
        return true
        
      } catch (error) {
        console.log(`📥 文件不存在: ${config.fileName}`)
        this.downloadStatus[config.key] = undefined
        return false
      }
    })
    
    const results = await Promise.allSettled(checkPromises)
    const existingCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length
    
    console.log(`📊 文件检查完成: ${existingCount}/${this.audioConfigs.length} 个文件已存在`)
    console.log(`💾 总大小: ${(this.stats.totalSize / 1024 / 1024).toFixed(2)} MB`)
    
    return existingCount
  }

  /**
   * 获取文件统计信息
   */
  async getFileStats(filePath) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().stat({
        path: filePath,
        success: (res) => resolve(res.stats),
        fail: reject
      })
    })
  }

  /**
   * 增量下载缺失文件（支持优先级和并发控制）
   */
  async downloadMissingFiles(missingConfigs) {
    console.log(`🚀 开始增量下载 ${missingConfigs.length} 个文件...`)
    
    // 按优先级分组下载
    const highPriorityFiles = missingConfigs.filter(c => c.priority >= 8)
    const mediumPriorityFiles = missingConfigs.filter(c => c.priority >= 6 && c.priority < 8)
    const lowPriorityFiles = missingConfigs.filter(c => c.priority < 6)
    
    // 优先下载高优先级文件
    if (highPriorityFiles.length > 0) {
      console.log(`⚡ 下载高优先级文件: ${highPriorityFiles.length} 个`)
      await this.downloadFilesBatch(highPriorityFiles)
    }
    
    // 然后下载中等优先级文件
    if (mediumPriorityFiles.length > 0) {
      console.log(`🔥 下载中等优先级文件: ${mediumPriorityFiles.length} 个`)
      await this.downloadFilesBatch(mediumPriorityFiles)
    }
    
    // 最后下载低优先级文件
    if (lowPriorityFiles.length > 0) {
      console.log(`📦 下载低优先级文件: ${lowPriorityFiles.length} 个`)
      await this.downloadFilesBatch(lowPriorityFiles)
    }
  }

  /**
   * 批量下载文件（支持并发控制）
   */
  async downloadFilesBatch(configs) {
    const { maxConcurrentDownloads } = this.config
    const batches = []
    
    // 分批处理，控制并发数量
    for (let i = 0; i < configs.length; i += maxConcurrentDownloads) {
      batches.push(configs.slice(i, i + maxConcurrentDownloads))
    }
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`📦 下载批次 ${i + 1}/${batches.length}: ${batch.length} 个文件`)
      
      const downloadPromises = batch.map(config => this.downloadSingleAudio(config))
      const results = await Promise.allSettled(downloadPromises)
      
      // 统计结果
      let batchSuccess = 0
      let batchFailed = 0
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          batchSuccess++
          this.stats.successDownloads++
        } else {
          batchFailed++
          this.stats.failedDownloads++
          console.error(`❌ 批次下载失败: ${batch[index].fileName}`)
        }
      })
      
      console.log(`📊 批次 ${i + 1} 完成: ✅${batchSuccess} ❌${batchFailed}`)
      
      // 批次间短暂延迟，避免请求过于密集
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
  }

  /**
   * 确保本地目录存在
   */
  async ensureLocalDirectory() {
    return new Promise((resolve, reject) => {
      const fs = wx.getFileSystemManager()
      
      fs.mkdir({
        dirPath: this.localDir,
        recursive: true,
        success: () => {
          console.log('📁 音频目录创建/确认成功:', this.localDir)
          resolve()
        },
        fail: (error) => {
          if (error.errMsg && error.errMsg.includes('already exists')) {
            console.log('📁 音频目录已存在:', this.localDir)
            resolve()
          } else {
            console.error('❌ 创建音频目录失败:', error)
            reject(error)
          }
        }
      })
    })
  }

  /**
   * 下载单个音频文件（优化版）
   */
  async downloadSingleAudio(config) {
    this.stats.totalDownloads++
    
    return new Promise((resolve, reject) => {
      // 先检查本地是否已存在
      wx.getFileSystemManager().access({
        path: config.localPath,
        success: async () => {
          // 文件存在，验证完整性
          try {
            const stats = await this.getFileStats(config.localPath)
            if (stats.size >= this.config.minFileSize) {
              console.log(`✅ 音频已存在且有效: ${config.localFileName}`)
              this.downloadStatus[config.key] = 'success'
              this.stats.successDownloads++
              resolve(config.localPath)
            } else {
              // 文件损坏，重新下载
              console.warn(`🔄 文件损坏，重新下载: ${config.fileName}`)
              this.downloadWithRequest(config).then(resolve).catch(reject)
            }
          } catch (error) {
            console.warn(`🔄 文件验证失败，重新下载: ${config.fileName}`)
            this.downloadWithRequest(config).then(resolve).catch(reject)
          }
        },
        fail: () => {
          // 文件不存在，下载
          console.log(`⏬ 开始下载音频: ${config.fileName}`)
          this.downloadWithRequest(config).then(resolve).catch(reject)
        }
      })
    })
  }

  /**
   * 使用request方法下载音频文件（优化版）
   */
  async downloadWithRequest(config, retryCount = 0) {
    const { maxRetries, timeout } = this.config
    
    return new Promise((resolve, reject) => {
      const retryInfo = retryCount > 0 ? ` (重试 ${retryCount}/${maxRetries})` : ''
      console.log(`🔄 下载音频: ${config.fileName}${retryInfo}`)
      
      wx.request({
        url: config.remoteUrl,
        method: 'GET',
        responseType: 'arraybuffer',
        timeout,
        success: (res) => {
          if (res.statusCode === 200) {
            const fileSize = res.data.byteLength
            console.log(`📦 获取音频数据: ${config.fileName} (${fileSize}字节)`)
            
            // 验证文件大小
            if (fileSize < this.config.minFileSize) {
              const error = new Error(`文件大小异常: ${fileSize}字节`)
              this.handleDownloadFailure(config, error, retryCount, maxRetries, resolve, reject)
              return
            }
            
            // 写入文件
            this.writeAudioFile(config, res.data)
              .then(() => {
                console.log(`✅ 下载成功: ${config.localFileName}`)
                this.downloadStatus[config.key] = 'success'
                this.stats.totalSize += fileSize
                resolve(config.localPath)
              })
              .catch((writeError) => {
                this.handleDownloadFailure(config, writeError, retryCount, maxRetries, resolve, reject)
              })
          } else {
            const error = new Error(`HTTP错误: ${res.statusCode}`)
            this.handleDownloadFailure(config, error, retryCount, maxRetries, resolve, reject)
          }
        },
        fail: (requestError) => {
          console.error(`❌ 网络请求失败: ${config.fileName}`, requestError)
          this.handleDownloadFailure(config, requestError, retryCount, maxRetries, resolve, reject)
        }
      })
    })
  }

  /**
   * 写入音频文件
   */
  async writeAudioFile(config, data) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().writeFile({
        filePath: config.localPath,
        data: data,
        success: resolve,
        fail: reject
      })
    })
  }

  /**
   * 处理下载失败，支持智能重试
   */
  handleDownloadFailure(config, error, retryCount, maxRetries, resolve, reject) {
    if (retryCount < maxRetries) {
      const nextRetryCount = retryCount + 1
      const delayMs = this.config.retryDelay * Math.pow(2, retryCount) // 指数退避
      
      console.warn(`⏳ ${config.fileName} 下载失败，${delayMs}ms后重试...`)
      console.warn(`   错误: ${error.errMsg || error.message || 'unknown'}`)
      
      setTimeout(async () => {
        try {
          const result = await this.downloadWithRequest(config, nextRetryCount)
          resolve(result)
        } catch (retryError) {
          reject(retryError)
        }
      }, delayMs)
    } else {
      console.error(`❌ ${config.fileName} 达到最大重试次数，下载失败`)
      this.downloadStatus[config.key] = 'failed'
      this.stats.failedDownloads++
      reject(new Error(`下载失败: ${config.fileName} - ${error.errMsg || error.message}`))
    }
  }

  /**
   * 获取本地音频文件路径（优化版）
   */
  getLocalAudioPath(noteKey) {
    console.log(`🔍 查找音频路径: ${noteKey}`)
    
    const config = this.audioConfigs.find(c => c.noteKey === noteKey)
    if (!config) {
      console.warn(`未找到音符配置: ${noteKey}`)
      console.log('📋 可用配置示例:', this.audioConfigs.slice(0, 5).map(c => c.noteKey))
      return null
    }
    
    console.log(`📄 找到配置: ${config.noteKey} -> ${config.fileName}`)
    
    // 检查下载状态
    if (this.downloadStatus[config.key] !== 'success') {
      console.warn(`音频未下载: ${config.fileName}, 状态: ${this.downloadStatus[config.key]}`)
      return null
    }
    
    // 快速验证文件存在（同步）
    try {
      wx.getFileSystemManager().accessSync(config.localPath)
      console.log(`✅ 音频文件存在: ${config.localPath}`)
      
      // 对于带#号的文件，返回经过特殊处理的路径
      return this.getSafeAudioPath(config.localPath, noteKey)
    } catch (error) {
      console.warn(`⚠️ 音频文件丢失: ${config.fileName}`)
      // 标记为需要重新下载
      this.downloadStatus[config.key] = 'failed'
      
      // 异步重新下载（不阻塞当前调用）
      this.downloadSingleAudio(config).catch(err => {
        console.error(`重新下载失败: ${config.fileName}`, err)
      })
      
      return null
    }
  }

  /**
   * 获取安全的音频文件路径（处理特殊字符）
   */
  getSafeAudioPath(originalPath, noteKey) {
    // 对于带#号的音符，微信小程序可能需要特殊处理
    if (noteKey.includes('#')) {
      console.log(`🔧 处理带#号的音符路径: ${noteKey}`)
      
      // 尝试创建一个符号链接或使用不同的访问方式
      // 但首先验证原始路径是否可以直接使用
      try {
        // 验证文件确实存在且可读
        const stats = wx.getFileSystemManager().statSync(originalPath)
        if (stats.size > 1000) { // 文件大小合理
          console.log(`✅ 带#号文件路径验证成功: ${originalPath}`)
          return originalPath
        }
      } catch (error) {
        console.error(`❌ 带#号文件路径验证失败: ${originalPath}`, error)
        
        // 尝试创建一个不带#号的副本
        return this.createSafeFileCopy(originalPath, noteKey)
      }
    }
    
    return originalPath
  }

  /**
   * 为带#号的文件创建安全的副本
   */
  createSafeFileCopy(originalPath, noteKey) {
    try {
      // 如果不是带#号的音符，直接返回原路径
      if (!noteKey.includes('#')) {
        return originalPath
      }
      
      // 创建一个不含特殊字符的文件名
      const safeName = noteKey.replace('#', 'sharp') + '.mp3'
      const safePath = this.localDir + safeName
      
      console.log(`🔄 尝试创建安全副本: ${noteKey} -> ${safeName}`)
      
      // 检查副本是否已存在且有效
      try {
        const stats = wx.getFileSystemManager().statSync(safePath)
        if (stats.size > 1000) {
          console.log(`✅ 安全副本已存在且有效: ${safePath}`)
          return safePath
        }
      } catch {
        // 副本不存在或无效，继续创建
      }
      
      // 尝试读取原始文件并创建副本
      try {
        console.log(`📋 创建音频文件安全副本: ${safePath}`)
        
        // 读取原始文件
        const data = wx.getFileSystemManager().readFileSync(originalPath)
        
        // 验证数据有效性
        if (!data || data.byteLength < 1000) {
          console.error(`❌ 原始文件数据无效: ${originalPath}`)
          return null
        }
        
        // 写入新文件
        wx.getFileSystemManager().writeFileSync(safePath, data)
        
        // 验证写入成功
        const newStats = wx.getFileSystemManager().statSync(safePath)
        if (newStats.size >= 1000) {
          console.log(`✅ 安全副本创建成功: ${safePath} (${newStats.size}字节)`)
          return safePath
        } else {
          console.error(`❌ 安全副本创建失败，文件大小异常: ${newStats.size}字节`)
          return null
        }
        
      } catch (readError) {
        console.error(`❌ 读取原始文件失败: ${originalPath}`, readError)
        return null
      }
      
    } catch (error) {
      console.error(`❌ 创建安全副本失败: ${noteKey}`, error)
      return null
    }
  }

  /**
   * 获取下载进度（增强版）
   */
  getDownloadProgress() {
    const total = this.audioConfigs.length
    const success = Object.values(this.downloadStatus).filter(status => status === 'success').length
    const failed = Object.values(this.downloadStatus).filter(status => status === 'failed').length
    const pending = total - success - failed
    
    return {
      total,
      success,
      failed,
      pending,
      percentage: Math.round((success / total) * 100),
      stats: { ...this.stats },
      storageUsage: {
        totalSizeMB: Math.round((this.stats.totalSize / 1024 / 1024) * 100) / 100,
        maxSizeMB: 200
      }
    }
  }

  /**
   * 获取存储使用情况
   */
  async getStorageUsage() {
    try {
      let totalSize = 0
      let fileCount = 0
      
      for (const config of this.audioConfigs) {
        try {
          const stats = await this.getFileStats(config.localPath)
          totalSize += stats.size
          fileCount++
        } catch {
          // 文件不存在，跳过
        }
      }
      
      return {
        totalFiles: this.audioConfigs.length,
        existingFiles: fileCount,
        totalSize: totalSize,
        sizeInMB: Math.round((totalSize / 1024 / 1024) * 100) / 100,
        maxSizeInMB: 200,
        usagePercentage: Math.round((totalSize / (200 * 1024 * 1024)) * 10000) / 100
      }
    } catch (error) {
      console.error('获取存储使用情况失败:', error)
      return null
    }
  }

  /**
   * 健康检查
   */
  async performHealthCheck() {
    console.log('🔍 执行音频文件健康检查...')
    
    const now = Date.now()
    if (now - this.stats.lastCheckTime < this.config.healthCheckInterval) {
      return this.getDownloadProgress() // 如果检查间隔未到，返回缓存的进度
    }
    
    await this.checkFilesIntegrity()
    
    const progress = this.getDownloadProgress()
    console.log('📊 健康检查完成:', progress)
    
    // 如果发现缺失文件，自动补充下载
    if (progress.failed > 0 || progress.pending > 0) {
      console.log('🔄 发现缺失文件，启动自动修复...')
      const missingConfigs = this.audioConfigs.filter(config => 
        this.downloadStatus[config.key] !== 'success'
      )
      
      // 后台修复，不阻塞主流程
      this.downloadMissingFiles(missingConfigs.slice(0, 10)) // 限制同时修复的文件数量
        .catch(error => console.error('自动修复失败:', error))
    }
    
    return progress
  }

  /**
   * 重新下载失败的文件
   */
  async retryFailedDownloads() {
    const failedConfigs = this.audioConfigs.filter(config => 
      this.downloadStatus[config.key] === 'failed'
    )
    
    if (failedConfigs.length === 0) {
      console.log('✅ 没有失败的下载需要重试')
      return
    }
    
    console.log(`🔄 重试 ${failedConfigs.length} 个失败的下载...`)
    
    // 重置失败状态
    failedConfigs.forEach(config => {
      this.downloadStatus[config.key] = undefined
    })
    
    await this.downloadMissingFiles(failedConfigs)
  }

  /**
   * 清除所有缓存文件
   */
  async clearCache() {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().rmdir({
        dirPath: this.localDir,
        recursive: true,
        success: () => {
          console.log('🧹 音频缓存清理成功')
          this.downloadStatus = {}
          this.isInitialized = false
          this.stats = {
            totalDownloads: 0,
            successDownloads: 0,
            failedDownloads: 0,
            lastCheckTime: 0,
            totalSize: 0
          }
          resolve()
        },
        fail: (error) => {
          if (error.errMsg && error.errMsg.includes('no such file')) {
            console.log('🧹 音频缓存目录不存在，清理成功')
            this.downloadStatus = {}
            this.isInitialized = false
            resolve()
          } else {
            console.error('❌ 音频缓存清理失败:', error)
            reject(error)
          }
        }
      })
    })
  }

  /**
   * 强制重新初始化
   */
  async forceReinitialize() {
    console.log('🔄 开始强制重新初始化音频管理器...')
    this.downloadStatus = {}
    this.isInitialized = false
    this.stats = {
      totalDownloads: 0,
      successDownloads: 0,
      failedDownloads: 0,
      lastCheckTime: 0,
      totalSize: 0
    }
    return await this.initialize()
  }

  /**
   * 预加载指定优先级的文件
   */
  async preloadByPriority(minPriority = 8) {
    const highPriorityConfigs = this.audioConfigs
      .filter(config => config.priority >= minPriority)
      .filter(config => this.downloadStatus[config.key] !== 'success')
    
    if (highPriorityConfigs.length === 0) {
      console.log('✅ 高优先级文件已全部下载')
      return
    }
    
    console.log(`⚡ 预加载 ${highPriorityConfigs.length} 个高优先级文件...`)
    await this.downloadFilesBatch(highPriorityConfigs)
  }

  /**
   * 获取下载统计信息
   */
  getStats() {
    const progress = this.getDownloadProgress()
    const successRate = this.stats.totalDownloads > 0 
      ? Math.round((this.stats.successDownloads / this.stats.totalDownloads) * 100) 
      : 0
    
    return {
      ...this.stats,
      successRate,
      progress,
      lastCheckTimeFormatted: new Date(this.stats.lastCheckTime).toLocaleString(),
      isHealthy: progress.percentage >= 80 && successRate >= 90
    }
  }
}

// 创建全局实例
const audioDownloadManager = new AudioDownloadManager()

module.exports = audioDownloadManager 