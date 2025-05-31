// 音乐相关工具函数

// 音符数据
const notes = [
  // 高音谱号 - 低八度
  { id: 'G3', name: 'G', octave: 3, abc: 'G,', frequency: 196.00, jianpu: '5', clef: 'treble', isLedger: true, position: -1 },
  { id: 'A3', name: 'A', octave: 3, abc: 'A,', frequency: 220.00, jianpu: '6', clef: 'treble', isLedger: true, position: -0.5 },
  { id: 'B3', name: 'B', octave: 3, abc: 'B,', frequency: 246.94, jianpu: '7', clef: 'treble', isLedger: true, position: 0 },
  
  // 高音谱号 - 标准音域
  { id: 'C4', name: 'C', octave: 4, abc: 'C', frequency: 261.63, jianpu: '1', clef: 'treble', isLedger: true, position: 0.5 },
  { id: 'D4', name: 'D', octave: 4, abc: 'D', frequency: 293.66, jianpu: '2', clef: 'treble', isLedger: false, position: 1 },
  { id: 'E4', name: 'E', octave: 4, abc: 'E', frequency: 329.63, jianpu: '3', clef: 'treble', isLedger: false, position: 1.5 },
  { id: 'F4', name: 'F', octave: 4, abc: 'F', frequency: 349.23, jianpu: '4', clef: 'treble', isLedger: false, position: 2 },
  { id: 'G4', name: 'G', octave: 4, abc: 'G', frequency: 392.00, jianpu: '5', clef: 'treble', isLedger: false, position: 2.5 },
  { id: 'A4', name: 'A', octave: 4, abc: 'A', frequency: 440.00, jianpu: '6', clef: 'treble', isLedger: false, position: 3 },
  { id: 'B4', name: 'B', octave: 4, abc: 'B', frequency: 493.88, jianpu: '7', clef: 'treble', isLedger: false, position: 3.5 },
  
  // 高音谱号 - 高八度
  { id: 'C5', name: 'C', octave: 5, abc: 'c', frequency: 523.25, jianpu: '1̇', clef: 'treble', isLedger: false, position: 4 },
  { id: 'D5', name: 'D', octave: 5, abc: 'd', frequency: 587.33, jianpu: '2̇', clef: 'treble', isLedger: false, position: 4.5 },
  { id: 'E5', name: 'E', octave: 5, abc: 'e', frequency: 659.25, jianpu: '3̇', clef: 'treble', isLedger: false, position: 5 },
  { id: 'F5', name: 'F', octave: 5, abc: 'f', frequency: 698.46, jianpu: '4̇', clef: 'treble', isLedger: false, position: 5.5 },
  { id: 'G5', name: 'G', octave: 5, abc: 'g', frequency: 783.99, jianpu: '5̇', clef: 'treble', isLedger: false, position: 6 },
  { id: 'A5', name: 'A', octave: 5, abc: 'a', frequency: 880.00, jianpu: '6̇', clef: 'treble', isLedger: true, position: 6.5 },
  { id: 'B5', name: 'B', octave: 5, abc: 'b', frequency: 987.77, jianpu: '7̇', clef: 'treble', isLedger: true, position: 7 },
  { id: 'C6', name: 'C', octave: 6, abc: 'c\'', frequency: 1046.50, jianpu: '1̈', clef: 'treble', isLedger: true, position: 7.5 }
]

// 生成随机音符
function getRandomNote() {
  const randomIndex = Math.floor(Math.random() * notes.length)
  return notes[randomIndex]
}

// 根据音符名称和八度获取音符
function getNoteByNameAndOctave(name, octave) {
  return notes.find(note => note.name === name && note.octave === octave)
}

// 根据简谱获取音符
function getNoteByJianpu(jianpu) {
  return notes.find(note => note.jianpu === jianpu)
}

// 生成ABC记谱法字符串
function generateABCNotation(note) {
  return `X: 1
T: 
M: 4/4
L: 1/4
K: C
${note.abc} |]`
}

// 生成钢琴键盘数据
function generatePianoKeys() {
  const keys = []
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  
  let whiteKeyPosition = 0
  
  for (let octave = 1; octave <= 8; octave++) {
    for (let i = 0; i < noteNames.length; i++) {
      const noteName = noteNames[i]
      const fullNote = `${noteName}${octave}`
      const isBlack = noteName.includes('#')
      const isWhite = whiteNotes.includes(noteName)
      const isMiddleC = fullNote === 'C4'
      
      if (isWhite) {
        keys.push({
          note: fullNote,
          name: noteName,
          octave: octave,
          isBlack: false,
          isMiddleC: isMiddleC,
          position: whiteKeyPosition,
          blackKeyOffset: null
        })
        whiteKeyPosition++
      } else {
        const blackKeyOffset = getBlackKeyOffset(noteName)
        keys.push({
          note: fullNote,
          name: noteName,
          octave: octave,
          isBlack: true,
          isMiddleC: false,
          position: whiteKeyPosition - 1,
          blackKeyOffset: blackKeyOffset
        })
      }
    }
  }
  
  return keys
}

// 获取黑键偏移量
function getBlackKeyOffset(noteName) {
  const offsets = {
    'C#': 20,  // C和D之间
    'D#': 60,  // D和E之间
    'F#': 20,  // F和G之间
    'G#': 40,  // G和A之间
    'A#': 60   // A和B之间
  }
  return offsets[noteName] || 0
}

// Web Audio API 音频播放
let audioContext = null

function initAudioContext() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    return true
  } catch (error) {
    console.warn('Web Audio API not supported:', error)
    return false
  }
}

function playNote(frequency, duration = 0.3) {
  if (!audioContext) {
    if (!initAudioContext()) return
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  
  try {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.type = 'triangle' // 使用三角波，听起来更像钢琴
    
    // 音量包络
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  } catch (error) {
    console.warn('播放音符失败:', error)
  }
}

function playNoteByName(noteName) {
  const note = notes.find(n => n.id === noteName)
  if (note) {
    playNote(note.frequency)
    return true
  }
  return false
}

// 计算反应时间统计
function calculateReactionStats(reactionTimes) {
  if (!reactionTimes || reactionTimes.length === 0) {
    return { average: 0, min: 0, max: 0 }
  }
  
  const validTimes = reactionTimes.filter(time => time > 0)
  if (validTimes.length === 0) {
    return { average: 0, min: 0, max: 0 }
  }
  
  const sum = validTimes.reduce((acc, time) => acc + time, 0)
  const average = sum / validTimes.length
  const min = Math.min(...validTimes)
  const max = Math.max(...validTimes)
  
  return {
    average: Math.round(average),
    min: Math.round(min),
    max: Math.round(max)
  }
}

// 格式化时间显示
function formatTime(milliseconds) {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`
  } else {
    return `${(milliseconds / 1000).toFixed(1)}s`
  }
}

export {
  notes,
  getRandomNote,
  getNoteByNameAndOctave,
  getNoteByJianpu,
  generateABCNotation,
  generatePianoKeys,
  getBlackKeyOffset,
  initAudioContext,
  playNote,
  playNoteByName,
  calculateReactionStats,
  formatTime
} 