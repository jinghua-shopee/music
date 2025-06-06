Component({
  properties: {
    note: {
      type: Object,
      value: null
    },
    clef: {
      type: String,
      value: 'treble' // 'treble' 或 'bass'
    }
  },

  data: {
    staffImageSrc: '',
    showPlaceholder: true
  },

  observers: {
    'note': function(note) {
      console.log('=== 五线谱组件音符变化 ===')
      console.log('接收到的音符对象:', note)
      console.log('音符是否有效:', note && note.name)
      
      if (note && note.name) {
        console.log('开始处理音符:', note.name)
        const imageSrc = this.getStaffImagePath(note)
        console.log('生成的图片路径:', imageSrc)
        
        this.setData({
          staffImageSrc: imageSrc,
          showPlaceholder: !imageSrc
        })
        
        console.log('组件状态更新完成, showPlaceholder:', !imageSrc)
      } else {
        console.log('音符无效，显示占位符')
        this.setData({
          staffImageSrc: '',
          showPlaceholder: true
        })
      }
      console.log('=== 五线谱组件处理完成 ===')
    }
  },

  methods: {
    /**
     * 根据音符信息获取对应的五线谱图片路径
     */
    getStaffImagePath(note) {
      try {
        // 从note.name中提取音符名称和八度
        const noteName = note.name.replace(/[#b]/g, '') // 移除升降号
        const clef = this.data.clef
        
        console.log('处理音符:', noteName, '谱号:', clef)
        
        // 构建音符位置描述
        const positionDesc = this.getPositionDescription(noteName, clef)
        
        if (!positionDesc) {
          console.warn('无法获取音符位置描述:', noteName)
          return ''
        }
        
        console.log('位置描述:', positionDesc)
        
        // 构建图片文件名: {clef}_{noteName}_{position}.png
        const fileName = `${clef}_${noteName}_${positionDesc}.png`
        
        // 在小程序中，静态资源应该使用相对于项目根目录的路径
        const imagePath = `/五线谱/${fileName}`
        
        console.log('生成图片路径:', imagePath)
        console.log('完整文件名:', fileName)
        return imagePath
        
      } catch (error) {
        console.error('获取五线谱图片路径失败:', error)
        return ''
      }
    },

    /**
     * 获取音符的位置描述
     * 根据音符名称和谱号返回对应的位置描述
     */
    getPositionDescription(noteName, clef) {
      if (clef === 'treble') {
        // 高音符号位置映射
        const treblePositions = {
          'A2': '下加3线',
          'B2': '下加3线间', 
          'C3': '下加2线',
          'D3': '下加2线间',
          'E3': '下加1线',
          'F3': '下加1线间',
          'G3': '第1线',
          'A3': '第1间',
          'B3': '第2线', 
          'C4': '第2间',
          'D4': '第3线',
          'E4': '第3间',
          'F4': '第4线',
          'G4': '第4间',
          'A4': '第5线',
          'B4': '上加1线间',
          'C5': '上加1线',
          'D5': '上加1线间',
          'E5': '上加2线',
          'F5': '上加2线间',
          'G5': '上加3线',
          'A5': '上加3线间',
          'B5': '上加4线',
          'C6': '上加4线间',
          'D6': '上加5线'
        }
        return treblePositions[noteName]
      } else if (clef === 'bass') {
        // 低音符号位置映射
        const bassPositions = {
          'C1': '下加7线',
          'D1': '下加7线间',
          'E1': '下加6线',
          'F1': '下加6线间',
          'G1': '下加5线',
          'A1': '下加5线间',
          'B1': '下加4线',
          'C2': '下加4线间',
          'D2': '下加3线',
          'E2': '下加3线间',
          'F2': '下加2线',
          'G2': '下加2线间',
          'A2': '下加1线',
          'B2': '下加1线间',
          'C3': '第1线',
          'D3': '第1间',
          'E3': '第2线',
          'F3': '第2间',
          'G3': '第3线',
          'A3': '第3间',
          'B3': '第4线',
          'C4': '第4间',
          'D4': '第5线',
          'E4': '上加1线间',
          'F4': '上加1线',
          'G4': '上加1线间',
          'A4': '上加2线',
          'B4': '上加2线间',
          'C5': '上加3线'
        }
        return bassPositions[noteName]
      }
      
      return null
    },

    /**
     * 图片加载失败处理
     */
    onImageError(e) {
      console.error('五线谱图片加载失败:', e)
      console.error('失败的图片路径:', this.data.staffImageSrc)
      this.setData({
        showPlaceholder: true,
        staffImageSrc: ''
      })
    },

    /**
     * 图片加载成功处理
     */
    onImageLoad(e) {
      console.log('五线谱图片加载成功')
    }
  }
}) 