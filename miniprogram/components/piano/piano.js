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
    // 钢琴键映射
    keyMapping: {
      'c4': { name: 'C4', type: 'white' },
      'd4': { name: 'D4', type: 'white' },
      'e4': { name: 'E4', type: 'white' },
      'f4': { name: 'F4', type: 'white' },
      'g4': { name: 'G4', type: 'white' },
      'a4': { name: 'A4', type: 'white' },
      'b4': { name: 'B4', type: 'white' },
      'c5': { name: 'C5', type: 'white' },
      'cs4': { name: 'C#4', type: 'black' },
      'ds4': { name: 'D#4', type: 'black' },
      'fs4': { name: 'F#4', type: 'black' },
      'gs4': { name: 'G#4', type: 'black' },
      'as4': { name: 'A#4', type: 'black' }
    }
  },

  methods: {
    selectKey(e) {
      const key = e.currentTarget.dataset.key
      console.log('钢琴键选择:', key)
      
      // 触发选择事件
      this.triggerEvent('keyselect', {
        key: key,
        keyInfo: this.data.keyMapping[key]
      })
      
      // 触感反馈
      wx.vibrateShort({
        type: 'light'
      })
    }
  }
}) 