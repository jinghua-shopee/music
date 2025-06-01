Component({
  properties: {
    note: {
      type: Object,
      value: null
    }
  },

  data: {
    // 音符位置映射
    staffPositions: {
      'space4': { top: '10rpx', type: 'space' },  // C5
      'line4': { top: '30rpx', type: 'line' },    // B4
      'space3': { top: '50rpx', type: 'space' },  // A4
      'line3': { top: '70rpx', type: 'line' },    // G4
      'space2': { top: '90rpx', type: 'space' },  // F4
      'line2': { top: '110rpx', type: 'line' },   // E4
      'space1': { top: '130rpx', type: 'space' }, // D4
      'line1': { top: '150rpx', type: 'line' }    // C4
    }
  },

  methods: {
    getNoteClass(position) {
      const positionData = this.data.staffPositions[position]
      return positionData ? positionData.type : ''
    },

    getNoteStyle(position) {
      const positionData = this.data.staffPositions[position]
      return positionData ? `top: ${positionData.top}` : ''
    },

    needsLedgerLine(position) {
      // C4 和 C5 需要加线
      return position === 'line1' || position === 'space4'
    }
  }
})