const { audioManager } = require('../../utils/audioUtils.js')

Component({
  properties: {
    selectedKey: {
      type: String,
      value: ''
    },
    highlightKey: {
      type: String,
      value: ''
    },
    showAnswer: {
      type: Boolean,
      value: false
    }
  },

  data: {
    keys: [
      // 第3八度
      { note: 'C3', key: 'c3', type: 'white', x: 0 },
      { note: 'C#3', key: 'c#3', type: 'black', x: 35 },
      { note: 'D3', key: 'd3', type: 'white', x: 50 },
      { note: 'D#3', key: 'd#3', type: 'black', x: 85 },
      { note: 'E3', key: 'e3', type: 'white', x: 100 },
      { note: 'F3', key: 'f3', type: 'white', x: 150 },
      { note: 'F#3', key: 'f#3', type: 'black', x: 185 },
      { note: 'G3', key: 'g3', type: 'white', x: 200 },
      { note: 'G#3', key: 'g#3', type: 'black', x: 235 },
      { note: 'A3', key: 'a3', type: 'white', x: 250 },
      { note: 'A#3', key: 'a#3', type: 'black', x: 285 },
      { note: 'B3', key: 'b3', type: 'white', x: 300 },
      
      // 第4八度 (中央C)
      { note: 'C4', key: 'c4', type: 'white', x: 350 },
      { note: 'C#4', key: 'c#4', type: 'black', x: 385 },
      { note: 'D4', key: 'd4', type: 'white', x: 400 },
      { note: 'D#4', key: 'd#4', type: 'black', x: 435 },
      { note: 'E4', key: 'e4', type: 'white', x: 450 },
      { note: 'F4', key: 'f4', type: 'white', x: 500 },
      { note: 'F#4', key: 'f#4', type: 'black', x: 535 },
      { note: 'G4', key: 'g4', type: 'white', x: 550 },
      { note: 'G#4', key: 'g#4', type: 'black', x: 585 },
      { note: 'A4', key: 'a4', type: 'white', x: 600 },
      { note: 'A#4', key: 'a#4', type: 'black', x: 635 },
      { note: 'B4', key: 'b4', type: 'white', x: 650 },
      
      // 第5八度
      { note: 'C5', key: 'c5', type: 'white', x: 700 },
      { note: 'C#5', key: 'c#5', type: 'black', x: 735 },
      { note: 'D5', key: 'd5', type: 'white', x: 750 },
      { note: 'D#5', key: 'd#5', type: 'black', x: 785 },
      { note: 'E5', key: 'e5', type: 'white', x: 800 },
      { note: 'F5', key: 'f5', type: 'white', x: 850 },
      { note: 'F#5', key: 'f#5', type: 'black', x: 885 },
      { note: 'G5', key: 'g5', type: 'white', x: 900 },
      { note: 'G#5', key: 'g#5', type: 'black', x: 935 },
      { note: 'A5', key: 'a5', type: 'white', x: 950 },
      { note: 'A#5', key: 'a#5', type: 'black', x: 985 },
      { note: 'B5', key: 'b5', type: 'white', x: 1000 }
    ]
  },

  lifetimes: {
    attached() {
      console.log('钢琴组件加载完成')
    },
    
    detached() {
      // 组件销毁时清理音频资源
      audioManager.stopAll()
    }
  },

  methods: {
    // 按键点击事件
    onKeyTap(e) {
      const { key, note } = e.currentTarget.dataset
      console.log('点击钢琴键:', note, key)
      
      // 播放音符
      this.playKeySound(key)
      
      // 触发选择事件
      this.triggerEvent('keyselect', {
        key: key,
        note: note
      })
    },

    // 播放按键音效
    playKeySound(key) {
      if (!key) return
      
      // 使用音频管理器播放音符
      audioManager.playNote(key, {
        volume: 0.8,
        duration: 800,
        fadeOut: true
      })
      
      console.log(`播放钢琴音符: ${key}`)
    }
  }
}) 