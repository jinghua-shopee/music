/**
 * 五线谱图片管理器
 * 负责从云端下载图片并缓存到本地
 */

class ImageManager {
  constructor() {
    // 云端图片基础URL
    this.baseUrl = 'https://music-1253799806.cos.ap-guangzhou.myqcloud.com/pic_v2/'
    
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
      '下加3间': 'space_below_3',
      '下加2线': 'ledger_below_2',
      '下加2间': 'space_below_2',
      '下加1线': 'ledger_below_1',
      '下加1间': 'space_below_1',
      '第1线': 'staff_line_1',
      '第1间': 'staff_space_1',
      '第2线': 'staff_line_2',
      '第2间': 'staff_space_2',
      '第3线': 'staff_line_3',
      '第3间': 'staff_space_3',
      '第4线': 'staff_line_4',
      '第4间': 'staff_space_4',
      '第5线': 'staff_line_5',
      '上加1间': 'space_above_1',
      '上加1线': 'ledger_above_1',
      '上加2线': 'ledger_above_2',
      '上加2间': 'space_above_2',
      '上加3线': 'ledger_above_3',
      '上加3间': 'space_above_3',
      '上加4线': 'ledger_above_4',
      '上加4间': 'space_above_4',
      '上加5线': 'ledger_above_5',
      '上加5间': 'space_above_5',
      // 低音符号附加位置
      '下加7线': 'ledger_below_7',
      '下加7间': 'space_below_7',
      '下加6线': 'ledger_below_6',
      '下加6间': 'space_below_6',
      '下加5线': 'ledger_below_5',
      '下加5间': 'space_below_5',
      '下加4线': 'ledger_below_4',
      '下加4间': 'space_below_4'
    }
    
    const safePosition = positionMap[position] || position.replace(/[^a-zA-Z0-9_]/g, '_')
    return `${clef}_${noteName}_${safePosition}.png`
  }

  /**
   * 生成所有图片的配置信息
   */
  generateImageConfigs() {
    const configs = []
    
    // 高音符号图片配置 - 按标准音高与谱表对应关系
    const trebleNotes = [
      // 下加线区域
      { name: 'F3', position: '下加3线' },
      { name: 'G3', position: '下加3间' },
      { name: 'A3', position: '下加2线' },
      { name: 'B3', position: '下加2间' },
      { name: 'C4', position: '下加1线' },     // 中央C - 标准对应
      { name: 'D4', position: '下加1间' },
      // 五线谱主体区域
      { name: 'E4', position: '第1线' },
      { name: 'F4', position: '第1间' },
      { name: 'G4', position: '第2线' },
      { name: 'A4', position: '第2间' },
      { name: 'B4', position: '第3线' },
      { name: 'C5', position: '第3间' },       // 标准对应：高音谱表第三间 = C5
      { name: 'D5', position: '第4线' },
      { name: 'E5', position: '第4间' },
      { name: 'F5', position: '第5线' },
      // 上加线区域
      { name: 'G5', position: '上加1间' },
      { name: 'A5', position: '上加1线' },
      { name: 'B5', position: '上加2间' },
      { name: 'C6', position: '上加2线' },
      { name: 'D6', position: '上加3间' },
      { name: 'E6', position: '上加3线' },
      { name: 'F6', position: '上加4间' },
      { name: 'G6', position: '上加4线' },
      { name: 'A6', position: '上加5间' },
      { name: 'B6', position: '上加5线' }
    ]

    // 低音符号图片配置 - 按标准音高与谱表对应关系
    const bassNotes = [
      // 下加线区域 - 极低音区 
      { name: 'A0', position: '下加7间' },
      { name: 'B0', position: '下加6线' }, 
      { name: 'C1', position: '下加6间' },
      { name: 'D1', position: '下加5线' },
      { name: 'E1', position: '下加5间' },
      { name: 'F1', position: '下加4线' },     // 修正：F1对应下加4线
      { name: 'G1', position: '下加4间' },     // 修正位置
      { name: 'A1', position: '下加3线' },     // A1对应下加3线
      { name: 'B1', position: '下加3间' },     
      { name: 'C2', position: '下加2线' },     // C2对应下加2线
      { name: 'D2', position: '下加2间' },     // 修正位置
      { name: 'E2', position: '下加1线' },     // E2对应下加1线（下加线）
      { name: 'F2', position: '下加1间' },     // 修正位置
      // 五线谱主体区域 (标准低音符号位置) - 从G2开始
      { name: 'G2', position: '第1线' },       // 低音谱表第1线 = G2 (用户确认)
      { name: 'A2', position: '第1间' },
      { name: 'B2', position: '第2线' },
      { name: 'C3', position: '第2间' },       // 标准：低音谱表第二间 = C3 (用户确认)
      { name: 'D3', position: '第3线' },       // 标准：低音谱表第3线 = D3 (用户确认)
      { name: 'E3', position: '第3间' },
      { name: 'F3', position: '第4线' },
      { name: 'G3', position: '第4间' },
      { name: 'A3', position: '第5线' },
      // 上加线区域
      { name: 'B3', position: '上加1间' },
      { name: 'C4', position: '上加1线' },     // 标准：低音谱表上加一线 = C4 (中央C，用户确认)
      { name: 'D4', position: '上加2间' },
      { name: 'E4', position: '上加2线' },
      { name: 'F4', position: '上加3间' },
      { name: 'G4', position: '上加3线' }
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
   * 强制重新初始化
   */
  async forceReinitialize() {
    console.log('开始强制重新初始化...')
    this.downloadStatus = {}
    this.isInitialized = false
    await this.initialize()
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
    console.log(`🚀 开始下载 ${this.imageConfigs.length} 张图片...`)
    console.log(`🌐 基础URL: ${this.baseUrl}`)
    
    // 下载所有图片
    const downloadPromises = this.imageConfigs.map(config => 
      this.downloadSingleImage(config)
    )
    
    try {
      const results = await Promise.allSettled(downloadPromises)
      
      let successCount = 0
      let failCount = 0
      const failedImages = []
      
      results.forEach((result, index) => {
        const config = this.imageConfigs[index]
        if (result.status === 'fulfilled') {
          successCount++
        } else {
          failCount++
          failedImages.push({
            fileName: config.fileName,
            url: config.remoteUrl,
            error: result.reason
          })
          console.error(`❌ 图片下载失败详情:`)
          console.error(`   文件名: ${config.fileName}`)
          console.error(`   下载地址: ${config.remoteUrl}`)
          console.error(`   错误信息:`, result.reason)
        }
      })
      
      console.log(`📊 图片下载完成统计:`)
      console.log(`   ✅ 成功: ${successCount} 张`)
      console.log(`   ❌ 失败: ${failCount} 张`)
      console.log(`   📈 成功率: ${Math.round((successCount / this.imageConfigs.length) * 100)}%`)
      
      if (failCount > 0) {
        console.warn(`⚠️ 以下 ${failCount} 张图片下载失败:`)
        failedImages.forEach((failed, index) => {
          console.warn(`   ${index + 1}. ${failed.fileName}`)
          console.warn(`      URL: ${failed.url}`)
        })
      }
    } catch (error) {
      console.error('❌ 批量下载图片失败:', error)
      throw error
    }
  }

  /**
   * 执行文件保存操作
   */
  performFileSave(res, config, resolve, reject) {
    console.log(`💾 开始保存文件: ${config.localFileName}`)
    console.log(`💾 临时文件路径: ${res.tempFilePath}`)
    console.log(`💾 目标文件路径: ${config.localPath}`)
    
    // 先确保目标目录存在
    wx.getFileSystemManager().mkdir({
      dirPath: this.localDir,
      recursive: true,
      success: () => {
        console.log(`📁 目标目录创建/确认成功: ${this.localDir}`)
        
        // 立即保存文件
        wx.getFileSystemManager().saveFile({
          tempFilePath: res.tempFilePath,
          filePath: config.localPath,
          success: () => {
            console.log(`✅ 文件保存成功: ${config.localFileName}`)
            this.downloadStatus[config.key] = 'success'
            resolve(config.localPath)
          },
          fail: (saveError) => {
            console.error(`❌ saveFile失败: ${config.localFileName}`)
            console.error('❌ 保存错误详情:', saveError)
            
            // 尝试使用 copyFile 作为替代方案
            console.log(`🔄 尝试使用 copyFile 替代方案...`)
            wx.getFileSystemManager().copyFile({
              srcPath: res.tempFilePath,
              destPath: config.localPath,
              success: () => {
                console.log(`✅ 使用 copyFile 保存成功: ${config.localFileName}`)
                this.downloadStatus[config.key] = 'success'
                resolve(config.localPath)
              },
              fail: (copyError) => {
                console.error(`❌ copyFile 也失败了:`, copyError)
                this.downloadStatus[config.key] = 'failed'
                reject(saveError)
              }
            })
          }
        })
      },
      fail: (mkdirError) => {
        if (mkdirError.errMsg.includes('already exists')) {
          console.log(`📁 目标目录已存在: ${this.localDir}`)
          
          // 目录已存在，直接保存文件
          wx.getFileSystemManager().saveFile({
            tempFilePath: res.tempFilePath,
            filePath: config.localPath,
            success: () => {
              console.log(`✅ 文件保存成功: ${config.localFileName}`)
              this.downloadStatus[config.key] = 'success'
              resolve(config.localPath)
            },
            fail: (saveError) => {
              console.error(`❌ saveFile失败: ${config.localFileName}`)
              console.error('❌ 保存错误详情:', saveError)
              
              // 尝试使用 copyFile 作为替代方案
              console.log(`🔄 尝试使用 copyFile 替代方案...`)
              wx.getFileSystemManager().copyFile({
                srcPath: res.tempFilePath,
                destPath: config.localPath,
                success: () => {
                  console.log(`✅ 使用 copyFile 保存成功: ${config.localFileName}`)
                  this.downloadStatus[config.key] = 'success'
                  resolve(config.localPath)
                },
                fail: (copyError) => {
                  console.error(`❌ copyFile 也失败了:`, copyError)
                  this.downloadStatus[config.key] = 'failed'
                  reject(saveError)
                }
              })
            }
          })
        } else {
          console.error(`❌ 创建目标目录失败:`, mkdirError)
          this.downloadStatus[config.key] = 'failed'
          reject(mkdirError)
        }
      }
    })
  }

  /**
   * 下载单张图片
   */
  async downloadSingleImage(config) {
    return new Promise((resolve, reject) => {
      // 打印下载配置信息
      // console.log('音符:', config.noteName, '谱号:', config.clef, '位置:', config.position)
      // console.log('原始文件名:', config.fileName)
      // console.log('本地文件名:', config.localFileName)
      // console.log('下载URL:', config.remoteUrl)
      // console.log('本地路径:', config.localPath)
      
      // 先检查本地是否已存在
      wx.getFileSystemManager().access({
        path: config.localPath,
        success: () => {
          // 文件已存在，直接返回
        //  console.log(`✅ 图片已存在: ${config.localFileName}`)
          this.downloadStatus[config.key] = 'success'
          resolve(config.localPath)
        },
        fail: () => {
          // 文件不存在，直接使用request方法下载
          console.log(`⏬ 开始下载图片: ${config.fileName}`)
          console.log(`⏬ 使用request方法下载: ${config.remoteUrl}`)
          
          this.downloadWithRequest(config)
            .then(resolve)
            .catch(reject)
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

  /**
   * 使用request方法的备用下载策略
   */
  async downloadWithRequest(config) {
    return new Promise((resolve, reject) => {
      console.log(`🔄 使用request方法下载: ${config.fileName}`)
      
      wx.request({
        url: config.remoteUrl,
        method: 'GET',
        responseType: 'arraybuffer', // 获取二进制数据
        success: (res) => {
          if (res.statusCode === 200) {
            console.log(`📦 获取到二进制数据，大小: ${res.data.byteLength} 字节`)
            
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
                    this.downloadStatus[config.key] = 'failed'
                    reject(writeError)
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
                      this.downloadStatus[config.key] = 'failed'
                      reject(writeError)
                    }
                  })
                } else {
                  console.error(`❌ 创建目录失败:`, mkdirError)
                  this.downloadStatus[config.key] = 'failed'
                  reject(mkdirError)
                }
              }
            })
          } else {
            const error = new Error(`request下载失败，状态码: ${res.statusCode}`)
            console.error(`❌ request下载失败: ${config.fileName}`, error)
            this.downloadStatus[config.key] = 'failed'
            reject(error)
          }
        },
        fail: (requestError) => {
          console.error(`❌ request下载失败: ${config.fileName}`, requestError)
          this.downloadStatus[config.key] = 'failed'
          reject(requestError)
        }
      })
    })
  }
}

// 创建全局实例
const imageManager = new ImageManager()

module.exports = imageManager 