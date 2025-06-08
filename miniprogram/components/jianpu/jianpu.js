Component({
  properties: {
    note: {
      type: Object,
      value: null
    },
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    parsedJianpu: {
      number: '',
      highDots: 0,
      lowDots: 0
    }
  },

  observers: {
    'note.jianpu': function(jianpu) {
      if (jianpu) {
        this.parseJianpu(jianpu)
      }
    }
  },

  methods: {
    /**
     * 解析简谱字符串，分离数字、高音点、低音点
     */
    parseJianpu(jianpuStr) {
      if (!jianpuStr) {
        this.setData({
          parsedJianpu: { number: '', highDots: 0, lowDots: 0 }
        })
        return
      }

      // 获取基本数字（第一个字符）
      const number = jianpuStr.charAt(0)
      
      // 计算高音点数量（U+0307 ̇）
      const highDots = (jianpuStr.match(/̇/g) || []).length
      
      // 计算低音点数量（U+0323 ̣）
      const lowDots = (jianpuStr.match(/̣/g) || []).length
      
      console.log('解析简谱:', jianpuStr, '-> 数字:', number, '高音点:', highDots, '低音点:', lowDots)
      
      this.setData({
        parsedJianpu: {
          number: number,
          highDots: highDots,
          lowDots: lowDots
        }
      })
    }
  }
})