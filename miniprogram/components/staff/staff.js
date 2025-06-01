Component({
  properties: {
    note: {
      type: Object,
      value: null
    }
  },

  data: {
    // 音符位置映射 - 相对于五线谱的位置
    staffPositions: {
      'space4': { top: '0rpx', type: 'space' },    // C5 - 第五线上方间
      'line4': { top: '10rpx', type: 'line' },     // B4 - 第五线
      'space3': { top: '20rpx', type: 'space' },   // A4 - 第四间
      'line3': { top: '30rpx', type: 'line' },     // G4 - 第四线
      'space2': { top: '40rpx', type: 'space' },   // F4 - 第三间
      'line2': { top: '50rpx', type: 'line' },     // E4 - 第三线
      'space1': { top: '60rpx', type: 'space' },   // D4 - 第二间
      'line1': { top: '70rpx', type: 'line' }      // C4 - 第二线
    },
    noteClass: '',
    noteStyle: '',
    needsLedgerLine: false
  },

  observers: {
    'note': function(note) {
      if (note && note.staffPosition) {
        const positionData = this.data.staffPositions[note.staffPosition]
        if (positionData) {
          this.setData({
            noteClass: positionData.type,
            noteStyle: `top: ${positionData.top}`,
            needsLedgerLine: note.staffPosition === 'line1' || note.staffPosition === 'space4'
          })
        }
      } else {
        this.setData({
          noteClass: '',
          noteStyle: '',
          needsLedgerLine: false
        })
      }
    }
  },

  methods: {
    // 保留这些方法作为备用
    getNoteClass(position) {
      const positionData = this.data.staffPositions[position]
      return positionData ? positionData.type : ''
    },

    getNoteStyle(position) {
      const positionData = this.data.staffPositions[position]
      if (!positionData) return ''
      
      // 调整位置以匹配五线谱
      return `top: ${positionData.top}`
    },

    needsLedgerLine(position) {
      // C4 (line1) 和 C5 (space4) 需要加线
      return position === 'line1' || position === 'space4'
    }
  }
})