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
    showPlaceholder: true,
    isImageLoading: false
  },

  observers: {
    'note': function(note) {
      console.log('=== 五线谱组件音符变化 ===')
      console.log('接收到的音符对象:', note)
      console.log('音符是否有效:', note && note.name)
      
      if (note && note.name) {
        console.log('开始处理音符:', note.name)
        this.loadStaffImage(note)
      } else {
        console.log('音符无效，显示占位符')
        this.setData({
          staffImageSrc: '',
          showPlaceholder: true,
          isImageLoading: false
        })
      }
      console.log('=== 五线谱组件处理完成 ===')
    }
  },

  methods: {
    /**
     * 加载五线谱图片
     */
    async loadStaffImage(note) {
      this.setData({
        isImageLoading: true,
        showPlaceholder: true
      })

      try {
        // 获取图片管理器
        const app = getApp()
        const imageManager = app.getImageManager()
        
        // 从note.name中提取音符名称和八度
        const noteName = note.name.replace(/[#b]/g, '') // 移除升降号
        const clef = this.data.clef
        
        console.log('=== 五线谱组件图片加载 ===')
        console.log('处理音符:', noteName, '谱号:', clef)
        console.log('原始音符对象:', note)
        
        // 检查图片管理器是否已初始化
        if (!imageManager.isInitialized) {
          console.warn('图片管理器尚未初始化，等待初始化完成...')
          this.setData({
            staffImageSrc: '',
            showPlaceholder: true,
            isImageLoading: false
          })
          return
        }
        
        // 获取本地缓存的图片路径
        const localImagePath = imageManager.getLocalImagePath(noteName, clef)
        
        if (localImagePath) {
          console.log('找到缓存图片路径:', localImagePath)
          
          // 验证文件是否真的存在
          wx.getFileSystemManager().access({
            path: localImagePath,
            success: () => {
              console.log('本地图片文件验证成功')
              this.setData({
                staffImageSrc: localImagePath,
                showPlaceholder: false,
                isImageLoading: false
              })
            },
            fail: (error) => {
              console.error('本地图片文件不存在:', error)
              this.useFallbackImage(note)
            }
          })
        } else {
          console.warn('未找到缓存图片，使用远程图片作为备选:', noteName)
          this.useFallbackImage(note)
        }
        
      } catch (error) {
        console.error('加载五线谱图片失败:', error)
        this.useFallbackImage(note)
      }
    },

    /**
     * 使用备用图片（远程图片或占位符）
     */
    useFallbackImage(note) {
      const fallbackImageSrc = this.getFallbackImagePath(note)
      
      if (fallbackImageSrc) {
        console.log('使用远程备用图片:', fallbackImageSrc)
        this.setData({
          staffImageSrc: fallbackImageSrc,
          showPlaceholder: false,
          isImageLoading: false
        })
      } else {
        console.log('无法获取备用图片，显示占位符')
        this.setData({
          staffImageSrc: '',
          showPlaceholder: true,
          isImageLoading: false
        })
      }
    },

    /**
     * 获取备用图片路径（远程URL）
     */
    getFallbackImagePath(note) {
      try {
        // 从note.name中提取音符名称和八度
        const noteName = note.name.replace(/[#b]/g, '') // 移除升降号
        const clef = this.data.clef
        
        // 构建音符位置描述
        const positionDesc = this.getPositionDescription(noteName, clef)
        
        if (!positionDesc) {
          console.warn('无法获取音符位置描述:', noteName)
          return ''
        }
        
        // 构建远程图片URL
        const fileName = `${clef}_${noteName}_${positionDesc}.png`
        const remoteUrl = `https://music-1253799806.cos.ap-guangzhou.myqcloud.com/pic/${encodeURIComponent(fileName)}`
        
        console.log('使用远程备用图片:', remoteUrl)
        return remoteUrl
        
      } catch (error) {
        console.error('获取备用图片路径失败:', error)
        return ''
      }
    },

    /**
     * 根据音符信息获取对应的五线谱图片路径（已废弃，保留用于兼容）
     */
    getStaffImagePath(note) {
      // 这个方法现在由 loadStaffImage 替代，保留用于向后兼容
      return this.getFallbackImagePath(note)
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
      
      // 如果是本地缓存图片失败，尝试使用远程图片
      if (this.data.staffImageSrc && this.data.staffImageSrc.includes('staff_images')) {
        console.log('本地缓存图片失败，尝试使用远程图片')
        
        // 重新获取当前音符信息
        const note = this.properties.note
        if (note && note.name) {
          const fallbackImageSrc = this.getFallbackImagePath(note)
          if (fallbackImageSrc && fallbackImageSrc !== this.data.staffImageSrc) {
            this.setData({
              staffImageSrc: fallbackImageSrc
            })
            return
          }
        }
      }
      
      // 最终失败，显示占位符
      this.setData({
        showPlaceholder: true,
        staffImageSrc: '',
        isImageLoading: false
      })
    },

    /**
     * 图片加载成功处理
     */
    onImageLoad(e) {
      console.log('五线谱图片加载成功')
      this.setData({
        isImageLoading: false
      })
    }
  }
}) 