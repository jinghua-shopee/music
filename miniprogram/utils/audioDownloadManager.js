/**
 * 音频下载管理器
 * 负责从云端下载钢琴音频文件并缓存到本地
 * 参考图片管理器的实现方式，使用更稳定的下载策略
 */

class AudioDownloadManager {
  constructor() {
    // 云端音频基础URL
    this.baseUrl = 'https://music-1253799806.cos.ap-guangzhou.myqcloud.com/audio/piano/'
    
    // 本地缓存目录
    this.localDir = `${wx.env.USER_DATA_PATH}/audio/piano/`
    
    // 音频文件配置
    this.audioConfigs = this.generateAudioConfigs()
    
    // 下载状态
    this.downloadStatus = {}
    this.isInitialized = false
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
      
      configs.push({
        noteKey: noteKey,
        fileName: fileName,
        localFileName: fileName, // 本地文件名和远程文件名相同
        remoteUrl: this.baseUrl + encodeURIComponent(fileName),
        localPath: this.localDir + fileName,
        key: noteKey
      })
    })

    console.log(`🎵 生成音频配置: ${configs.length} 个音频文件`)
    
    // 打印一些示例配置用于调试
    const specialCases = configs.filter(c => c.fileName.includes('#'))
    if (specialCases.length > 0) {
      console.log(`🔍 特殊字符文件示例:`)
      specialCases.slice(0, 3).forEach(config => {
        console.log(`   ${config.noteKey}: ${config.fileName} -> ${config.remoteUrl}`)
      })
    }
    
    return configs
  }

  /**
   * 初始化音频管理器，下载所有需要的音频文件
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('🎵 音频管理器已初始化')
      return
    }

    console.log('🚀 开始初始化音频管理器...')
    console.log('🌐 基础URL:', this.baseUrl)
    console.log('📁 本地缓存目录:', this.localDir)
    
    try {
      // 确保本地目录存在
      await this.ensureLocalDirectory()
      
      // 下载所有音频文件
      await this.downloadAllAudio()
      
      this.isInitialized = true
      console.log('🎉 音频管理器初始化完成')
      
    } catch (error) {
      console.error('❌ 音频管理器初始化失败:', error)
      throw error
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
   * 下载所有音频文件
   */
  async downloadAllAudio() {
    console.log(`🚀 开始下载 ${this.audioConfigs.length} 个音频文件...`)
    
    // 下载所有音频文件
    const downloadPromises = this.audioConfigs.map(config => 
      this.downloadSingleAudio(config)
    )
    
    try {
      const results = await Promise.allSettled(downloadPromises)
      
      let successCount = 0
      let failCount = 0
      const failedAudios = []
      
      results.forEach((result, index) => {
        const config = this.audioConfigs[index]
        if (result.status === 'fulfilled') {
          successCount++
        } else {
          failCount++
          failedAudios.push({
            fileName: config.fileName,
            url: config.remoteUrl,
            error: result.reason
          })
          console.error(`❌ 音频下载失败详情:`)
          console.error(`   文件名: ${config.fileName}`)
          console.error(`   下载地址: ${config.remoteUrl}`)
          console.error(`   错误信息:`, result.reason)
        }
      })
      
      console.log(`📊 音频下载完成统计:`)
      console.log(`   ✅ 成功: ${successCount} 个`)
      console.log(`   ❌ 失败: ${failCount} 个`)
      console.log(`   📈 成功率: ${Math.round((successCount / this.audioConfigs.length) * 100)}%`)
      
      if (failCount > 0) {
        console.warn(`⚠️ 以下 ${failCount} 个音频下载失败:`)
        failedAudios.forEach((failed, index) => {
          console.warn(`   ${index + 1}. ${failed.fileName}`)
          console.warn(`      URL: ${failed.url}`)
        })
      }
    } catch (error) {
      console.error('❌ 批量下载音频失败:', error)
      throw error
    }
  }

  /**
   * 下载单个音频文件
   */
  async downloadSingleAudio(config) {
    return new Promise((resolve, reject) => {
      // 先检查本地是否已存在
      wx.getFileSystemManager().access({
        path: config.localPath,
        success: () => {
          // 文件已存在，直接返回
          console.log(`✅ 音频已存在: ${config.localFileName}`)
          this.downloadStatus[config.key] = 'success'
          resolve(config.localPath)
        },
        fail: () => {
          // 文件不存在，使用request方法下载
          console.log(`⏬ 开始下载音频: ${config.fileName}`)
          console.log(`⏬ 使用request方法下载: ${config.remoteUrl}`)
          
          this.downloadWithRequest(config)
            .then(resolve)
            .catch(reject)
        }
      })
    })
  }

  /**
   * 使用request方法下载音频文件
   */
  async downloadWithRequest(config, retryCount = 0) {
    const maxRetries = 3 // 最大重试次数
    
    return new Promise((resolve, reject) => {
      console.log(`🔄 使用request方法下载: ${config.fileName}${retryCount > 0 ? ` (重试 ${retryCount}/${maxRetries})` : ''}`)
      
      wx.request({
        url: config.remoteUrl,
        method: 'GET',
        responseType: 'arraybuffer', // 获取二进制数据
        timeout: 30000, // 30秒超时
        success: (res) => {
          if (res.statusCode === 200) {
            console.log(`📦 获取到音频二进制数据，大小: ${res.data.byteLength} 字节`)
            
            // 确保目录存在
            wx.getFileSystemManager().mkdir({
              dirPath: this.localDir,
              recursive: true,
              success: () => {
                // 直接写入文件
                wx.getFileSystemManager().writeFile({
                  filePath: config.localPath,
                  data: res.data,
                  success: () => {
                    console.log(`✅ request方法保存成功: ${config.localFileName}`)
                    this.downloadStatus[config.key] = 'success'
                    resolve(config.localPath)
                  },
                  fail: (writeError) => {
                    console.error(`❌ request方法写入失败:`, writeError)
                    this.handleDownloadFailure(config, writeError, retryCount, maxRetries, resolve, reject)
                  }
                })
              },
              fail: (mkdirError) => {
                if (mkdirError.errMsg.includes('already exists')) {
                  // 目录已存在，直接写入文件
                  wx.getFileSystemManager().writeFile({
                    filePath: config.localPath,
                    data: res.data,
                    success: () => {
                      console.log(`✅ request方法保存成功: ${config.localFileName}`)
                      this.downloadStatus[config.key] = 'success'
                      resolve(config.localPath)
                    },
                    fail: (writeError) => {
                      console.error(`❌ request方法写入失败:`, writeError)
                      this.handleDownloadFailure(config, writeError, retryCount, maxRetries, resolve, reject)
                    }
                  })
                } else {
                  console.error(`❌ 创建目录失败:`, mkdirError)
                  this.handleDownloadFailure(config, mkdirError, retryCount, maxRetries, resolve, reject)
                }
              }
            })
          } else {
            const error = new Error(`request下载失败，状态码: ${res.statusCode}`)
            console.error(`❌ request下载失败: ${config.fileName}`, error)
            this.handleDownloadFailure(config, error, retryCount, maxRetries, resolve, reject)
          }
        },
        fail: (requestError) => {
          console.error(`❌ request下载失败: ${config.fileName}`)
          console.error(`   URL: ${config.remoteUrl}`)
          console.error(`   错误详情:`, requestError)
          console.error(`   错误类型: ${requestError.errMsg || 'unknown'}`)
          
          this.handleDownloadFailure(config, requestError, retryCount, maxRetries, resolve, reject)
        }
      })
    })
  }

  /**
   * 处理下载失败，支持重试
   */
  handleDownloadFailure(config, error, retryCount, maxRetries, resolve, reject) {
    if (retryCount < maxRetries) {
      const nextRetryCount = retryCount + 1
      const delayMs = 500 // 固定500ms延迟，快速重试
      
      console.warn(`⏳ ${config.fileName} 下载失败，${delayMs}ms后进行第${nextRetryCount}次重试...`)
      console.warn(`   错误原因: ${error.errMsg || error.message || 'unknown'}`)
      
      setTimeout(async () => {
        try {
          const result = await this.downloadWithRequest(config, nextRetryCount)
          resolve(result)
        } catch (retryError) {
          reject(retryError)
        }
      }, delayMs)
    } else {
      console.error(`❌ ${config.fileName} 达到最大重试次数(${maxRetries})，下载失败`)
      this.downloadStatus[config.key] = 'failed'
      reject(new Error(`下载失败: ${config.fileName} - ${error.errMsg || error.message || 'unknown error'} (已重试${maxRetries}次)`))
    }
  }

  /**
   * 获取本地音频文件路径
   */
  getLocalAudioPath(noteKey) {
    const config = this.audioConfigs.find(c => c.noteKey === noteKey)
    if (!config) {
      console.warn(`未找到音符配置: ${noteKey}`)
      return null
    }
    
    // 检查下载状态
    if (this.downloadStatus[config.key] !== 'success') {
      console.warn(`音频未下载或下载失败: ${config.fileName}, 状态: ${this.downloadStatus[config.key]}`)
      return null
    }
    
    // 验证文件是否真实存在（同步检查）
    try {
      wx.getFileSystemManager().accessSync(config.localPath)
      console.log(`✅ 音频文件验证成功: ${noteKey} -> ${config.localPath}`)
      return config.localPath
    } catch (error) {
      console.warn(`⚠️ 音频文件不存在: ${config.fileName}, 路径: ${config.localPath}`)
      console.warn(`   错误信息:`, error)
      // 更新状态为失败
      this.downloadStatus[config.key] = 'failed'
      return null
    }
  }

  /**
   * 获取下载进度
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
      percentage: Math.round((success / total) * 100)
    }
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
    await this.initialize()
  }
}

// 创建全局实例
const audioDownloadManager = new AudioDownloadManager()

module.exports = audioDownloadManager 