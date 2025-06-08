/**
 * 五线谱图片管理器
 * 负责从云端下载图片并缓存到本地
 */

class ImageManager {
  constructor() {
    // 云端图片基础URL
    this.baseUrl = 'https://music-1253799806.cos.ap-guangzhou.myqcloud.com/pic/'
    
    // 本地缓存目录
    this.localDir = `${wx.env.USER_DATA_PATH}/staff_images/`
    
    // 图片配置
    this.imageConfigs = this.generateImageConfigs()
    
    // 下载状态
    this.downloadStatus = {}
    this.isInitialized = false
  }

  /**
   * 生成安全的本地文件名（不包含中文字符）
   */
  generateSafeFileName(clef, noteName, position) {
    // 将中文位置描述转换为安全的英文标识
    const positionMap = {
      // 高音符号位置映射
      '下加3线': 'ledger_below_3',
      '下加3线间': 'space_below_3',
      '下加2线': 'ledger_below_2',
      '下加2线间': 'space_below_2',
      '下加1线': 'ledger_below_1',
      '下加1线间': 'space_below_1',
      '第1线': 'staff_line_1',
      '第1间': 'staff_space_1',
      '第2线': 'staff_line_2',
      '第2间': 'staff_space_2',
      '第3线': 'staff_line_3',
      '第3间': 'staff_space_3',
      '第4线': 'staff_line_4',
      '第4间': 'staff_space_4',
      '第5线': 'staff_line_5',
      '上加1线间': 'space_above_1',
      '上加1线': 'ledger_above_1',
      '上加2线': 'ledger_above_2',
      '上加2线间': 'space_above_2',
      '上加3线': 'ledger_above_3',
      '上加3线间': 'space_above_3',
      '上加4线': 'ledger_above_4',
      '上加4线间': 'space_above_4',
      '上加5线': 'ledger_above_5',
      // 低音符号附加位置
      '下加7线': 'ledger_below_7',
      '下加7线间': 'space_below_7',
      '下加6线': 'ledger_below_6',
      '下加6线间': 'space_below_6',
      '下加5线': 'ledger_below_5',
      '下加5线间': 'space_below_5',
      '下加4线': 'ledger_below_4',
      '下加4线间': 'space_below_4'
    }
    
    const safePosition = positionMap[position] || position.replace(/[^a-zA-Z0-9_]/g, '_')
    return `${clef}_${noteName}_${safePosition}.png`
  }

  /**
   * 生成所有图片的配置信息
   */
  generateImageConfigs() {
    const configs = []
    
    // 高音符号图片配置
    const trebleNotes = [
      { name: 'A3', position: '下加3线' },
      { name: 'B3', position: '下加3线间' },
      { name: 'C4', position: '下加2线' },
      { name: 'D4', position: '下加2线间' },
      { name: 'E4', position: '下加1线' },
      { name: 'F4', position: '下加1线间' },
      { name: 'G4', position: '第1线' },
      { name: 'A4', position: '第1间' },
      { name: 'B4', position: '第2线' },
      { name: 'C5', position: '第2间' },
      { name: 'D5', position: '第3线' },
      { name: 'E5', position: '第3间' },
      { name: 'F5', position: '第4线' },
      { name: 'G5', position: '第4间' },
      { name: 'A5', position: '第5线' },
      { name: 'B5', position: '上加1线间' },
      { name: 'C6', position: '上加1线' },
      { name: 'D6', position: '上加2线间' },
      { name: 'E6', position: '上加2线' },
      { name: 'F6', position: '上加3线间' },
      { name: 'G6', position: '上加3线' },
      { name: 'A6', position: '上加4线' },
      { name: 'B6', position: '上加4线间' },
      { name: 'C7', position: '上加5线' },
      { name: 'D7', position: '上加5线间' }
    ]

    // 低音符号图片配置
    const bassNotes = [
      { name: 'C1', position: '下加7线' },
      { name: 'D1', position: '下加7线间' },
      { name: 'E1', position: '下加6线' },
      { name: 'F1', position: '下加6线间' },
      { name: 'G1', position: '下加5线' },
      { name: 'A1', position: '下加5线间' },
      { name: 'B1', position: '下加4线' },
      { name: 'C2', position: '下加4线间' },
      { name: 'D2', position: '下加3线' },
      { name: 'E2', position: '下加3线间' },
      { name: 'F2', position: '下加2线' },
      { name: 'G2', position: '下加2线间' },
      { name: 'A2', position: '下加1线' },
      { name: 'B2', position: '下加1线间' },
      { name: 'C3', position: '第1线' },
      { name: 'D3', position: '第1间' },
      { name: 'E3', position: '第2线' },
      { name: 'F3', position: '第2间' },
      { name: 'G3', position: '第3线' },
      { name: 'A3', position: '第3间' },
      { name: 'B3', position: '第4线' },
      { name: 'C4', position: '第4间' },
      { name: 'D4', position: '第5线' },
      { name: 'E4', position: '上加1线间' },
      { name: 'F4', position: '上加1线' },
      { name: 'G4', position: '上加2线间' },
      { name: 'A4', position: '上加2线' },
      { name: 'B4', position: '上加3线间' },
      { name: 'C5', position: '上加3线' }
    ]

    // 生成高音符号配置
    trebleNotes.forEach(note => {
      const remoteFileName = `treble_${note.name}_${note.position}.png`
      const localFileName = this.generateSafeFileName('treble', note.name, note.position)
      
      configs.push({
        clef: 'treble',
        noteName: note.name,
        position: note.position,
        fileName: remoteFileName,
        localFileName: localFileName,
        remoteUrl: this.baseUrl + encodeURIComponent(remoteFileName),
        localPath: this.localDir + localFileName,
        key: `treble_${note.name}`
      })
    })

    // 生成低音符号配置
    bassNotes.forEach(note => {
      const remoteFileName = `bass_${note.name}_${note.position}.png`
      const localFileName = this.generateSafeFileName('bass', note.name, note.position)
      
      configs.push({
        clef: 'bass',
        noteName: note.name,
        position: note.position,
        fileName: remoteFileName,
        localFileName: localFileName,
        remoteUrl: this.baseUrl + encodeURIComponent(remoteFileName),
        localPath: this.localDir + localFileName,
        key: `bass_${note.name}`
      })
    })

    return configs
  }

  /**
   * 初始化图片管理器，下载所有需要的图片
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('图片管理器已初始化')
      return
    }

    console.log('开始初始化图片管理器...')
    console.log('本地缓存目录:', this.localDir)
    
    try {
      // 确保本地目录存在
      await this.ensureLocalDirectory()
      
      // 下载所有图片
      await this.downloadAllImages()
      
      this.isInitialized = true
      console.log('图片管理器初始化完成')
    } catch (error) {
      console.error('图片管理器初始化失败:', error)
      throw error
    }
  }

  /**
   * 确保本地目录存在
   */
  async ensureLocalDirectory() {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().mkdir({
        dirPath: this.localDir,
        recursive: true,
        success: () => {
          console.log('本地缓存目录创建成功:', this.localDir)
          resolve()
        },
        fail: (error) => {
          if (error.errMsg.includes('already exists')) {
            console.log('本地缓存目录已存在')
            resolve()
          } else {
            console.error('创建本地缓存目录失败:', error)
            reject(error)
          }
        }
      })
    })
  }

  /**
   * 下载所有图片
   */
  async downloadAllImages() {
    console.log(`开始下载 ${this.imageConfigs.length} 张图片...`)
    
    const downloadPromises = this.imageConfigs.map(config => 
      this.downloadSingleImage(config)
    )
    
    try {
      const results = await Promise.allSettled(downloadPromises)
      
      let successCount = 0
      let failCount = 0
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++
        } else {
          failCount++
          console.error(`图片下载失败: ${this.imageConfigs[index].fileName}`, result.reason)
        }
      })
      
      console.log(`图片下载完成: 成功 ${successCount} 张, 失败 ${failCount} 张`)
      
      if (failCount > 0) {
        console.warn('部分图片下载失败，可能影响显示效果')
      }
    } catch (error) {
      console.error('批量下载图片失败:', error)
      throw error
    }
  }

  /**
   * 下载单张图片
   */
  async downloadSingleImage(config) {
    return new Promise((resolve, reject) => {
      // 先检查本地是否已存在
      wx.getFileSystemManager().access({
        path: config.localPath,
        success: () => {
          // 文件已存在，直接返回
          console.log(`图片已存在: ${config.localFileName}`)
          this.downloadStatus[config.key] = 'success'
          resolve(config.localPath)
        },
        fail: () => {
          // 文件不存在，开始下载
          console.log(`开始下载图片: ${config.fileName} -> ${config.localFileName}`)
          
          wx.downloadFile({
            url: config.remoteUrl,
            success: (res) => {
              if (res.statusCode === 200) {
                // 保存到本地缓存
                wx.getFileSystemManager().saveFile({
                  tempFilePath: res.tempFilePath,
                  filePath: config.localPath,
                  success: () => {
                    console.log(`图片下载并保存成功: ${config.localFileName}`)
                    this.downloadStatus[config.key] = 'success'
                    resolve(config.localPath)
                  },
                  fail: (saveError) => {
                    console.error(`保存图片失败: ${config.localFileName}`, saveError)
                    this.downloadStatus[config.key] = 'failed'
                    reject(saveError)
                  }
                })
              } else {
                const error = new Error(`下载失败，状态码: ${res.statusCode}`)
                console.error(`图片下载失败: ${config.fileName}`, error)
                this.downloadStatus[config.key] = 'failed'
                reject(error)
              }
            },
            fail: (downloadError) => {
              console.error(`图片下载失败: ${config.fileName}`, downloadError)
              this.downloadStatus[config.key] = 'failed'
              reject(downloadError)
            }
          })
        }
      })
    })
  }

  /**
   * 获取指定音符的本地图片路径
   */
  getLocalImagePath(noteName, clef = 'treble') {
    const key = `${clef}_${noteName}`
    const config = this.imageConfigs.find(c => c.key === key)
    
    if (!config) {
      console.warn(`未找到音符图片配置: ${key}`)
      return null
    }
    
    console.log(`查询图片: ${key}, 下载状态: ${this.downloadStatus[key]}, 路径: ${config.localPath}`)
    
    // 检查下载状态
    if (this.downloadStatus[key] === 'success') {
      return config.localPath
    } else {
      console.warn(`图片未下载或下载失败: ${config.fileName}, 状态: ${this.downloadStatus[key]}`)
      return null
    }
  }

  /**
   * 清理所有缓存图片
   */
  async clearCache() {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().rmdir({
        dirPath: this.localDir,
        recursive: true,
        success: () => {
          console.log('缓存清理成功')
          this.downloadStatus = {}
          this.isInitialized = false
          resolve()
        },
        fail: (error) => {
          console.error('缓存清理失败:', error)
          reject(error)
        }
      })
    })
  }

  /**
   * 获取下载进度信息
   */
  getDownloadProgress() {
    const total = this.imageConfigs.length
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
}

// 创建全局实例
const imageManager = new ImageManager()

module.exports = imageManager 