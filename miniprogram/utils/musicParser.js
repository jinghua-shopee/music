/**
 * 音乐格式解析器
 * 支持 MusicXML 和 ABC 格式转换为内部音符格式
 */

class MusicParser {
  constructor() {
    this.noteMap = {
      // 音符名称映射
      'C': 'c', 'D': 'd', 'E': 'e', 'F': 'f',
      'G': 'g', 'A': 'a', 'B': 'b'
    }
  }

  /**
   * 解析 ABC 格式
   * 例: "C D E F G A B c" -> 音符数组
   */
  parseABC(abcString) {
    try {
      const notes = []
      const tokens = abcString.trim().split(/\s+/)
      
      tokens.forEach(token => {
        const note = this.parseABCNote(token)
        if (note) {
          notes.push(note)
        }
      })
      
      return {
        success: true,
        notes: notes,
        format: 'ABC'
      }
    } catch (error) {
      console.error('ABC解析错误:', error)
      return {
        success: false,
        error: error.message,
        notes: []
      }
    }
  }

  /**
   * 解析单个ABC音符
   */
  parseABCNote(token) {
    if (!token) return null
    
    // 移除装饰符号
    let cleanToken = token.replace(/[|:]/g, '')
    if (!cleanToken) return null
    
    // 解析音符名称
    let noteName = cleanToken[0].toUpperCase()
    let octave = 4 // 默认第4八度
    let accidental = '' // 升降号
    
    // 检查升降号
    if (cleanToken.includes('#')) {
      accidental = '#'
      cleanToken = cleanToken.replace('#', '')
    } else if (cleanToken.includes('b')) {
      accidental = 'b'
      cleanToken = cleanToken.replace('b', '')
    }
    
    // 检查八度
    if (cleanToken.length > 1) {
      const rest = cleanToken.slice(1)
      if (rest.match(/^[',]*$/)) {
        // 计算八度：每个逗号降低一八度，每个撇号提高一八度
        const commas = (rest.match(/,/g) || []).length
        const apostrophes = (rest.match(/'/g) || []).length
        octave = 4 - commas + apostrophes
      }
    }
    
    // 检查大小写（ABC记谱法中大写是低八度）
    if (token[0] === token[0].toUpperCase() && token[0] !== token[0].toLowerCase()) {
      octave = 3
    }
    
    return this.createNoteObject(noteName, octave, accidental)
  }

  /**
   * 解析简化的 MusicXML 格式
   */
  parseMusicXML(xmlString) {
    try {
      const notes = []
      
      // 简化的XML解析（实际项目中应使用专业的XML解析器）
      const noteMatches = xmlString.match(/<note>[\s\S]*?<\/note>/g) || []
      
      noteMatches.forEach(noteXml => {
        const note = this.parseMusicXMLNote(noteXml)
        if (note) {
          notes.push(note)
        }
      })
      
      return {
        success: true,
        notes: notes,
        format: 'MusicXML'
      }
    } catch (error) {
      console.error('MusicXML解析错误:', error)
      return {
        success: false,
        error: error.message,
        notes: []
      }
    }
  }

  /**
   * 解析单个MusicXML音符
   */
  parseMusicXMLNote(noteXml) {
    try {
      // 提取音高信息
      const stepMatch = noteXml.match(/<step>([A-G])<\/step>/)
      const octaveMatch = noteXml.match(/<octave>(\d)<\/octave>/)
      const alterMatch = noteXml.match(/<alter>([^<]+)<\/alter>/)
      
      if (!stepMatch || !octaveMatch) return null
      
      const noteName = stepMatch[1]
      const octave = parseInt(octaveMatch[1])
      let accidental = ''
      
      if (alterMatch) {
        const alter = parseInt(alterMatch[1])
        if (alter === 1) accidental = '#'
        else if (alter === -1) accidental = 'b'
      }
      
      return this.createNoteObject(noteName, octave, accidental)
    } catch (error) {
      console.warn('解析MusicXML音符失败:', error)
      return null
    }
  }

  /**
   * 创建标准音符对象
   */
  createNoteObject(noteName, octave, accidental = '') {
    const fullName = `${noteName}${accidental}${octave}`
    const pianoKey = `${noteName.toLowerCase()}${accidental}${octave}`
    const staffPosition = this.getNoteStaffPosition(noteName, octave)
    const jianpu = this.getNoteJianpu(noteName, octave)
    
    return {
      name: fullName,
      pianoKey: pianoKey,
      staffPosition: staffPosition,
      jianpu: jianpu,
      frequency: this.getNoteFrequency(noteName, octave, accidental)
    }
  }

  /**
   * 获取音符在五线谱上的位置
   */
  getNoteStaffPosition(noteName, octave) {
    const positions = {
      'C4': 'line1', 'D4': 'space1', 'E4': 'line2', 'F4': 'space2',
      'G4': 'line3', 'A4': 'space3', 'B4': 'line4', 'C5': 'space4'
    }
    
    return positions[`${noteName}${octave}`] || 'line2'
  }

  /**
   * 获取简谱记号
   */
  getNoteJianpu(noteName, octave) {
    const jianpuMap = {
      'C': '1', 'D': '2', 'E': '3', 'F': '4',
      'G': '5', 'A': '6', 'B': '7'
    }
    
    let jianpu = jianpuMap[noteName] || '1'
    
    // 高八度用点
    if (octave >= 5) {
      jianpu += '̇'
    }
    
    return jianpu
  }

  /**
   * 获取音符频率
   */
  getNoteFrequency(noteName, octave, accidental = '') {
    const baseFrequencies = {
      'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23,
      'G': 392.00, 'A': 440.00, 'B': 493.88
    }
    
    let frequency = baseFrequencies[noteName] || 440
    
    // 调整八度
    const octaveMultiplier = Math.pow(2, octave - 4)
    frequency *= octaveMultiplier
    
    // 调整升降号
    if (accidental === '#') {
      frequency *= Math.pow(2, 1/12) // 升高半音
    } else if (accidental === 'b') {
      frequency *= Math.pow(2, -1/12) // 降低半音
    }
    
    return Math.round(frequency * 100) / 100
  }

  /**
   * 预设的练习曲目
   */
  getPresetSongs() {
    return {
      'simple_scale': {
        name: '简单音阶',
        format: 'ABC',
        data: 'C D E F G A B c',
        description: 'C大调音阶练习'
      },
      'twinkle_star': {
        name: '小星星',
        format: 'ABC', 
        data: 'C C G G A A G F F E E D D C',
        description: '经典儿歌《小星星》'
      },
      'happy_birthday': {
        name: '生日快乐',
        format: 'ABC',
        data: 'C C D C F E C C D C G F',
        description: '生日快乐歌片段'
      }
    }
  }

  /**
   * 随机生成练习音符
   */
  generateRandomNotes(count = 1, range = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']) {
    const notes = []
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * range.length)
      const noteString = range[randomIndex]
      const note = this.parseABCNote(noteString)
      if (note) {
        notes.push(note)
      }
    }
    
    return notes
  }
}

// 创建全局解析器实例
const musicParser = new MusicParser()

module.exports = {
  MusicParser,
  musicParser
} 