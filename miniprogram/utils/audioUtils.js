/**
 * 微信小程序音频工具类
 * 使用 wx.createInnerAudioContext() 播放音频
 */

const { pianoKeyMapping } = require('./pianoKeyMapping.js')

class AudioManager {
  constructor() {
    this.audioPool = new Map() // 音频对象池
    this.isAudioEnabled = true
    this.maxAudioInstances = 15 // 增加最大同时播放数量
    this.preloadLevel = 'common' // 预加载级别: essential, common, extended, full
    
    // 音符频率映射（扩展到88键）
    this.noteFrequencies = this.generateNoteFrequencies()
    
    this.init()
  }

  // 生成88键钢琴音符频率映射
  generateNoteFrequencies() {
    const frequencies = {}
    const fullRange = pianoKeyMapping.getFullRange()
    
    // A4 = 440Hz作为参考，计算其他音符频率
    const A4_FREQ = 440
    const A4_INDEX = pianoKeyMapping.getFileByNoteKey('a4').index
    
    Object.entries(fullRange).forEach(([noteKey, noteInfo]) => {
      // 计算与A4的半音距离
      const semitonesFromA4 = noteInfo.index - A4_INDEX
      // 频率公式: f = f0 * 2^(n/12)
      const frequency = A4_FREQ * Math.pow(2, semitonesFromA4 / 12)
      frequencies[noteKey] = Math.round(frequency * 100) / 100 // 保留2位小数
    })
    
    return frequencies
  }

  // 初始化音频管理器
  init() {
    console.log('🎵 音频管理器初始化 (支持88键钢琴)')
    
    // 检查音频权限
    this.checkAudioPermission()
    
    // 根据预加载级别预加载音符
    this.preloadNotesByLevel()
    
    // 延迟报告加载状态
    setTimeout(() => {
      this.reportLoadingStatus()
    }, 2000)
  }

  // 检查音频权限
  checkAudioPermission() {
    wx.getSetting({
      success: (res) => {
        console.log('音频权限检查完成')
      }
    })
  }

  // 根据级别预加载音符
  preloadNotesByLevel() {
    const suggestions = pianoKeyMapping.getPreloadSuggestions()
    let notesToPreload = []
    
    switch (this.preloadLevel) {
      case 'essential':
        notesToPreload = suggestions.essential
        console.log('🎹 预加载核心音符 (8个)')
        break
      case 'common':
        notesToPreload = Object.keys(suggestions.common)
        console.log('🎹 预加载常用音符 (36个)')
        break
      case 'extended':
        notesToPreload = Object.keys(suggestions.extended)
        console.log('🎹 预加载扩展音符 (73个)')
        break
      case 'full':
        notesToPreload = Object.keys(suggestions.full)
        console.log('🎹 预加载全部音符 (88个)')
        break
      default:
        notesToPreload = suggestions.essential
    }
    
    // 分批预加载，避免一次性加载过多
    this.batchPreload(notesToPreload)
  }

  // 分批预加载音符
  batchPreload(noteKeys, batchSize = 10, delay = 100) {
    const batches = []
    for (let i = 0; i < noteKeys.length; i += batchSize) {
      batches.push(noteKeys.slice(i, i + batchSize))
    }
    
    batches.forEach((batch, index) => {
      setTimeout(() => {
        batch.forEach(noteKey => {
          this.preloadNote(noteKey)
        })
        console.log(`🎵 预加载批次 ${index + 1}/${batches.length} 完成`)
      }, index * delay)
    })
  }

  // 预加载单个音符
  preloadNote(noteKey) {
    if (this.audioPool.has(noteKey)) {
      return
    }

    const audioUrl = this.getAudioUrl(noteKey)
    
    // 如果没有音频文件，直接标记为无音频模式
    if (!audioUrl) {
      this.audioPool.set(noteKey, null)
      console.log(`音符 ${noteKey} 使用振动模式`)
      return
    }

    // 创建音频实例
    const audio = wx.createInnerAudioContext()
    
    audio.src = audioUrl
    
    // 设置音频属性
    audio.volume = 0.8
    audio.loop = false
    audio.autoplay = false
    
    // 错误处理
    audio.onError((error) => {
      console.warn(`音频加载失败 ${noteKey}:`, error)
      // 标记为振动模式
      this.audioPool.set(noteKey, null)
    })
    
    // 音频加载完成
    audio.onCanplay(() => {
      // 只在详细模式下记录
      if (this.preloadLevel === 'essential') {
        console.log(`音频预加载完成: ${noteKey}`)
      }
    })
    
    this.audioPool.set(noteKey, audio)
  }

  // 获取音频文件URL
  getAudioUrl(noteKey) {
    // 验证音符是否在88键范围内
    const noteInfo = pianoKeyMapping.getFileByNoteKey(noteKey)
    if (!noteInfo) {
      console.warn(`无效音符: ${noteKey}`)
      return null
    }
    
    // 使用新的文件命名方式
    return `/audio/piano/${noteKey}.mp3`
  }

  // 播放音符
  playNote(noteKey, options = {}) {
    if (!this.isAudioEnabled) {
      console.log('音频已禁用')
      return
    }

    const {
      volume = 0.8,
      duration = 500,
      fadeOut = true
    } = options

    console.log(`播放音符: ${noteKey}`)

    // 获取或创建音频实例
    let audio = this.audioPool.get(noteKey)
    if (audio === undefined) {
      // 动态加载未预加载的音符
      this.preloadNote(noteKey)
      audio = this.audioPool.get(noteKey)
    }

    // 如果是null，表示使用振动模式
    if (audio === null) {
      this.playVibrateNote(noteKey)
      return
    }

    // 如果仍然没有音频实例，回退到振动
    if (!audio) {
      console.warn(`音频实例创建失败: ${noteKey}`)
      this.playVibrateNote(noteKey)
      return
    }

    try {
      // 停止之前的播放
      audio.stop()
      
      // 设置音量
      audio.volume = volume
      
      // 开始播放
      audio.play()
      
      // 如果设置了持续时间，自动停止
      if (duration > 0) {
        setTimeout(() => {
          if (fadeOut) {
            this.fadeOutAudio(audio, 100)
          } else {
            audio.stop()
          }
        }, duration)
      }
      
      // 同时提供触觉反馈
      this.playVibrateNote(noteKey)
      
    } catch (error) {
      console.error(`播放音符失败 ${noteKey}:`, error)
      this.playVibrateNote(noteKey)
    }
  }

  // 渐出效果
  fadeOutAudio(audio, duration = 200) {
    const startVolume = audio.volume
    const stepTime = 50
    const steps = duration / stepTime
    const volumeStep = startVolume / steps
    
    let currentStep = 0
    const fadeInterval = setInterval(() => {
      currentStep++
      const newVolume = Math.max(0, startVolume - (volumeStep * currentStep))
      audio.volume = newVolume
      
      if (currentStep >= steps || newVolume <= 0) {
        clearInterval(fadeInterval)
        audio.stop()
        audio.volume = startVolume // 恢复原始音量
      }
    }, stepTime)
  }

  // 使用振动模拟音符（备用方案）
  playVibrateNote(noteKey) {
    if (!noteKey) return
    
    const frequency = this.noteFrequencies[noteKey] || 440
    
    // 根据频率调整振动模式
    if (frequency < 130) {
      // 极低音 - 长振动
      wx.vibrateLong()
    } else if (frequency < 260) {
      // 低音 - 长振动
      wx.vibrateLong()
    } else if (frequency > 1000) {
      // 高音 - 短振动
      wx.vibrateShort()
    } else {
      // 中音 - 短振动
      wx.vibrateShort()
    }
  }

  // 播放和弦
  playChord(noteKeys, options = {}) {
    noteKeys.forEach((noteKey, index) => {
      setTimeout(() => {
        this.playNote(noteKey, options)
      }, index * 50) // 错开50ms播放
    })
  }

  // 播放音阶
  playScale(noteKeys, options = {}) {
    const { interval = 300 } = options
    
    noteKeys.forEach((noteKey, index) => {
      setTimeout(() => {
        this.playNote(noteKey, options)
      }, index * interval)
    })
  }

  // 设置预加载级别
  setPreloadLevel(level) {
    const validLevels = ['essential', 'common', 'extended', 'full']
    if (!validLevels.includes(level)) {
      console.warn('无效的预加载级别:', level)
      return
    }
    
    this.preloadLevel = level
    console.log(`设置预加载级别为: ${level}`)
    
    // 清理当前预加载的音频
    this.clearAudioPool()
    
    // 重新预加载
    this.preloadNotesByLevel()
  }

  // 清理音频池
  clearAudioPool() {
    this.audioPool.forEach((audio) => {
      if (audio && typeof audio.destroy === 'function') {
        audio.destroy()
      }
    })
    this.audioPool.clear()
  }

  // 停止所有音频
  stopAll() {
    this.audioPool.forEach((audio, noteKey) => {
      try {
        if (audio && typeof audio.stop === 'function') {
          audio.stop()
        }
      } catch (error) {
        console.warn(`停止音频失败 ${noteKey}:`, error)
      }
    })
  }

  // 设置全局音量
  setVolume(volume) {
    this.audioPool.forEach((audio) => {
      if (audio && typeof audio.volume !== 'undefined') {
        audio.volume = Math.max(0, Math.min(1, volume))
      }
    })
  }

  // 启用/禁用音频
  setAudioEnabled(enabled) {
    this.isAudioEnabled = enabled
    if (!enabled) {
      this.stopAll()
    }
    console.log(`音频${enabled ? '启用' : '禁用'}`)
  }

  // 销毁音频管理器
  destroy() {
    this.stopAll()
    this.clearAudioPool()
    console.log('音频管理器已销毁')
  }

  // 报告音频加载状态
  reportLoadingStatus() {
    console.log('=== 🎹 音频加载状态报告 ===')
    
    let audioCount = 0
    let vibrateCount = 0
    const suggestions = pianoKeyMapping.getPreloadSuggestions()
    
    this.audioPool.forEach((audio, noteKey) => {
      if (audio === null) {
        vibrateCount++
      } else if (audio) {
        audioCount++
      }
    })
    
    console.log(`📊 当前预加载级别: ${this.preloadLevel}`)
    console.log(`📊 音频文件: ${audioCount} 个`)
    console.log(`📊 振动模式: ${vibrateCount} 个`)
    console.log(`📊 总计预加载: ${this.audioPool.size} 个音符`)
    console.log(`📊 88键总数: ${Object.keys(suggestions.full).length} 个`)
    
    if (audioCount > 0) {
      console.log('🎉 音频文件加载成功！支持88键钢琴音效！')
    } else {
      console.log('ℹ️  当前使用振动反馈模式')
    }
    
    // 显示预加载级别说明
    console.log('\n💡 预加载级别说明:')
    console.log('- essential: 8个核心音符 (中央C区域)')
    console.log('- common: 36个常用音符 (C3-B5)')
    console.log('- extended: 73个扩展音符 (C2-C7)')
    console.log('- full: 88个完整音符 (A0-C8)')
  }

  // 获取音符信息
  getNoteInfo(noteKey) {
    return pianoKeyMapping.getFileByNoteKey(noteKey)
  }

  // 获取音符频率
  getNoteFrequency(noteKey) {
    return this.noteFrequencies[noteKey] || 440
  }
}

// 创建全局音频管理器实例
const audioManager = new AudioManager()

module.exports = {
  AudioManager,
  audioManager
} 