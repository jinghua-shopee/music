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
      // 第0八度（最低音）- 只有A0, A#0, B0
      { note: 'A0', key: 'a0', type: 'white', x: -700 },
      { note: 'A#0', key: 'a#0', type: 'black', x: -665 },
      { note: 'B0', key: 'b0', type: 'white', x: -650 },
      
      // 第1八度（极低音）
      { note: 'C1', key: 'c1', type: 'white', x: -600 },
      { note: 'C#1', key: 'c#1', type: 'black', x: -565 },
      { note: 'D1', key: 'd1', type: 'white', x: -550 },
      { note: 'D#1', key: 'd#1', type: 'black', x: -515 },
      { note: 'E1', key: 'e1', type: 'white', x: -500 },
      { note: 'F1', key: 'f1', type: 'white', x: -450 },
      { note: 'F#1', key: 'f#1', type: 'black', x: -415 },
      { note: 'G1', key: 'g1', type: 'white', x: -400 },
      { note: 'G#1', key: 'g#1', type: 'black', x: -365 },
      { note: 'A1', key: 'a1', type: 'white', x: -350 },
      { note: 'A#1', key: 'a#1', type: 'black', x: -315 },
      { note: 'B1', key: 'b1', type: 'white', x: -300 },
      
      // 第2八度（低音）
      { note: 'C2', key: 'c2', type: 'white', x: -250 },
      { note: 'C#2', key: 'c#2', type: 'black', x: -215 },
      { note: 'D2', key: 'd2', type: 'white', x: -200 },
      { note: 'D#2', key: 'd#2', type: 'black', x: -165 },
      { note: 'E2', key: 'e2', type: 'white', x: -150 },
      { note: 'F2', key: 'f2', type: 'white', x: -100 },
      { note: 'F#2', key: 'f#2', type: 'black', x: -65 },
      { note: 'G2', key: 'g2', type: 'white', x: -50 },
      { note: 'G#2', key: 'g#2', type: 'black', x: -15 },
      { note: 'A2', key: 'a2', type: 'white', x: 0 },
      { note: 'A#2', key: 'a#2', type: 'black', x: 35 },
      { note: 'B2', key: 'b2', type: 'white', x: 50 },
      
      // 第3八度
      { note: 'C3', key: 'c3', type: 'white', x: 100 },
      { note: 'C#3', key: 'c#3', type: 'black', x: 135 },
      { note: 'D3', key: 'd3', type: 'white', x: 150 },
      { note: 'D#3', key: 'd#3', type: 'black', x: 185 },
      { note: 'E3', key: 'e3', type: 'white', x: 200 },
      { note: 'F3', key: 'f3', type: 'white', x: 250 },
      { note: 'F#3', key: 'f#3', type: 'black', x: 285 },
      { note: 'G3', key: 'g3', type: 'white', x: 300 },
      { note: 'G#3', key: 'g#3', type: 'black', x: 335 },
      { note: 'A3', key: 'a3', type: 'white', x: 350 },
      { note: 'A#3', key: 'a#3', type: 'black', x: 385 },
      { note: 'B3', key: 'b3', type: 'white', x: 400 },
      
      // 第4八度 (中央C)
      { note: 'C4', key: 'c4', type: 'white', x: 450 },
      { note: 'C#4', key: 'c#4', type: 'black', x: 485 },
      { note: 'D4', key: 'd4', type: 'white', x: 500 },
      { note: 'D#4', key: 'd#4', type: 'black', x: 535 },
      { note: 'E4', key: 'e4', type: 'white', x: 550 },
      { note: 'F4', key: 'f4', type: 'white', x: 600 },
      { note: 'F#4', key: 'f#4', type: 'black', x: 635 },
      { note: 'G4', key: 'g4', type: 'white', x: 650 },
      { note: 'G#4', key: 'g#4', type: 'black', x: 685 },
      { note: 'A4', key: 'a4', type: 'white', x: 700 },
      { note: 'A#4', key: 'a#4', type: 'black', x: 735 },
      { note: 'B4', key: 'b4', type: 'white', x: 750 },
      
      // 第5八度
      { note: 'C5', key: 'c5', type: 'white', x: 800 },
      { note: 'C#5', key: 'c#5', type: 'black', x: 835 },
      { note: 'D5', key: 'd5', type: 'white', x: 850 },
      { note: 'D#5', key: 'd#5', type: 'black', x: 885 },
      { note: 'E5', key: 'e5', type: 'white', x: 900 },
      { note: 'F5', key: 'f5', type: 'white', x: 950 },
      { note: 'F#5', key: 'f#5', type: 'black', x: 985 },
      { note: 'G5', key: 'g5', type: 'white', x: 1000 },
      { note: 'G#5', key: 'g#5', type: 'black', x: 1035 },
      { note: 'A5', key: 'a5', type: 'white', x: 1050 },
      { note: 'A#5', key: 'a#5', type: 'black', x: 1085 },
      { note: 'B5', key: 'b5', type: 'white', x: 1100 },
      
      // 第6八度（高音）
      { note: 'C6', key: 'c6', type: 'white', x: 1150 },
      { note: 'C#6', key: 'c#6', type: 'black', x: 1185 },
      { note: 'D6', key: 'd6', type: 'white', x: 1200 }
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