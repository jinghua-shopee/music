Page({
  data: {
    testNotes: [
      { name: 'C4', pianoKey: 'c4', staffPosition: 'line1', jianpu: '1' },
      { name: 'D4', pianoKey: 'd4', staffPosition: 'space1', jianpu: '2' },
      { name: 'E4', pianoKey: 'e4', staffPosition: 'line2', jianpu: '3' },
      { name: 'F4', pianoKey: 'f4', staffPosition: 'space2', jianpu: '4' },
      { name: 'G4', pianoKey: 'g4', staffPosition: 'line3', jianpu: '5' },
      { name: 'A4', pianoKey: 'a4', staffPosition: 'space3', jianpu: '6' },
      { name: 'B4', pianoKey: 'b4', staffPosition: 'line4', jianpu: '7' },
      { name: 'C5', pianoKey: 'c5', staffPosition: 'space4', jianpu: '1̇' }
    ],
    currentNoteIndex: 0,
    currentNote: null,
    testImagePath: '/五线谱/treble_C4_第2间.png'
  },

  onLoad() {
    this.setData({
      currentNote: this.data.testNotes[0]
    })
    console.log('测试页面加载，当前音符:', this.data.testNotes[0])
    console.log('直接图片路径测试:', this.data.testImagePath)
  },

  nextNote() {
    const nextIndex = (this.data.currentNoteIndex + 1) % this.data.testNotes.length
    this.setData({
      currentNoteIndex: nextIndex,
      currentNote: this.data.testNotes[nextIndex]
    })
    console.log('切换到音符:', this.data.testNotes[nextIndex])
  },

  prevNote() {
    const prevIndex = this.data.currentNoteIndex === 0 ? 
      this.data.testNotes.length - 1 : this.data.currentNoteIndex - 1
    this.setData({
      currentNoteIndex: prevIndex,
      currentNote: this.data.testNotes[prevIndex]
    })
    console.log('切换到音符:', this.data.testNotes[prevIndex])
  },

  onImageError() {
    console.error('直接图片加载失败')
  },

  onImageLoad() {
    console.log('直接图片加载成功')
  }
}) 