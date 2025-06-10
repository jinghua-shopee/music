/**
 * 88键钢琴音符映射工具
 * 将数字索引(0-87)映射到标准钢琴音符名称
 */

class PianoKeyMapping {
  constructor() {
    // 88键钢琴音符映射 (A0 = 0, C8 = 87)
    this.keyMapping = this.generateKeyMapping()
    this.reverseMapping = this.generateReverseMapping()
  }

  // 生成完整的88键映射
  generateKeyMapping() {
    const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
    const mapping = {}
    
    let currentIndex = 0
    
    // A0, A#0, B0 (键盘最低的3个键)
    mapping[0] = { note: 'A0', key: 'a0', file: 'a0.mp3' }
    mapping[1] = { note: 'A#0', key: 'a#0', file: 'a#0.mp3' }
    mapping[2] = { note: 'B0', key: 'b0', file: 'b0.mp3' }
    currentIndex = 3
    
    // C1 到 B7 (7个完整八度)
    for (let octave = 1; octave <= 7; octave++) {
      // 每个八度包含12个音符：C, C#, D, D#, E, F, F#, G, G#, A, A#, B
      const octaveNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      
      octaveNotes.forEach(noteName => {
        const noteKey = noteName.toLowerCase().replace('#', '#') + octave
        mapping[currentIndex] = {
          note: noteName + octave,
          key: noteKey,
          file: `${noteKey}.mp3`
        }
        currentIndex++
      })
    }
    
    // C8 (最高键)
    mapping[87] = { note: 'C8', key: 'c8', file: 'c8.mp3' }
    
    console.log(`🎹 生成88键映射完成，共 ${Object.keys(mapping).length} 个音符`)
    
    // 验证映射正确性
    this.validateMapping(mapping)
    
    return mapping
  }

  // 验证映射正确性
  validateMapping(mapping) {
    const invalidKeys = []
    Object.entries(mapping).forEach(([index, info]) => {
      // 检查键名格式是否正确
      if (!info.key.match(/^[a-g]#?[0-8]$/)) {
        invalidKeys.push({ index, key: info.key, note: info.note })
      }
    })
    
    if (invalidKeys.length > 0) {
      console.error('❌ 发现无效的音符键名:', invalidKeys)
    } else {
      console.log('✅ 音符映射验证通过')
    }
  }

  // 生成反向映射 (音符名称 -> 索引)
  generateReverseMapping() {
    const reverse = {}
    Object.entries(this.keyMapping).forEach(([index, info]) => {
      reverse[info.key] = {
        index: parseInt(index),
        note: info.note,
        file: info.file
      }
    })
    return reverse
  }

  // 根据索引获取音符信息
  getNoteByIndex(index) {
    return this.keyMapping[index] || null
  }

  // 根据音符键名获取文件信息
  getFileByNoteKey(noteKey) {
    return this.reverseMapping[noteKey] || null
  }

  // 获取指定范围的音符 (通用方法)
  getNoteRange(startNote, endNote) {
    const usedNotes = {}
    const startInfo = this.getFileByNoteKey(startNote)
    const endInfo = this.getFileByNoteKey(endNote)
    
    if (!startInfo || !endInfo) {
      console.error('音符范围无效:', startNote, endNote)
      return {}
    }
    
    const startIndex = startInfo.index
    const endIndex = endInfo.index
    
    for (let i = startIndex; i <= endIndex; i++) {
      const noteInfo = this.getNoteByIndex(i)
      if (noteInfo) {
        usedNotes[noteInfo.key] = {
          index: i,
          note: noteInfo.note,
          file: noteInfo.file
        }
      }
    }
    
    return usedNotes
  }

  // 获取我们小程序中使用的音符范围 (C3-B5) - 保持向后兼容
  getUsedNoteRange() {
    return this.getNoteRange('c3', 'b5')
  }

  // 获取完整的88键范围
  getFullRange() {
    return this.getNoteRange('a0', 'c8')
  }

  // 获取常用范围 (C2-C7，5个八度)
  getCommonRange() {
    return this.getNoteRange('c2', 'c7')
  }

  // 获取特定八度的音符
  getOctaveRange(octave) {
    if (octave === 0) {
      // 第0八度只有A0, A#0, B0
      return this.getNoteRange('a0', 'b0')
    } else if (octave === 8) {
      // 第8八度只有C8
      return this.getNoteRange('c8', 'c8')
    } else {
      // 完整八度 C到B
      return this.getNoteRange(`c${octave}`, `b${octave}`)
    }
  }

  // 获取预加载建议 - 根据使用频率推荐预加载的音符
  getPreloadSuggestions() {
    return {
      essential: ['c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5'], // 最常用的中央C区域
      common: this.getUsedNoteRange(), // 当前小程序使用范围
      extended: this.getCommonRange(), // 扩展范围
      full: this.getFullRange() // 完整范围
    }
  }

  // 生成音符到文件的映射表（用于复制文件）
  generateCopyMapping(startNote = 'a0', endNote = 'c8') {
    const noteRange = this.getNoteRange(startNote, endNote)
    const copyCommands = []
    
    Object.entries(noteRange).forEach(([noteKey, fileInfo]) => {
      const sourceFile = `music_file/${fileInfo.index}.mp3`
      const targetFile = `miniprogram/audio/piano/${noteKey}.mp3`
      copyCommands.push({
        source: sourceFile,
        target: targetFile,
        note: fileInfo.note,
        index: fileInfo.index
      })
    })
    
    return copyCommands
  }
}

// 创建映射实例
const pianoKeyMapping = new PianoKeyMapping()

module.exports = {
  PianoKeyMapping,
  pianoKeyMapping
} 