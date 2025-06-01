const { VexFlow } = require('../../libs/vexflow-min.js')

Component({
  properties: {
    note: {
      type: Object,
      value: null
    },
    showDebugInfo: {
      type: Boolean,
      value: false
    }
  },

  data: {
    canvasWidth: 300,
    canvasHeight: 150,
    vexRenderer: null,
    vexStave: null,
    canvasContext: null
  },

  lifetimes: {
    attached() {
      this.initCanvas()
    },

    ready() {
      this.drawStaff()
    }
  },

  observers: {
    'note': function(newNote) {
      if (newNote) {
        this.drawNoteOnStaff(newNote)
      } else {
        this.drawStaff()
      }
    }
  },

  methods: {
    // 初始化Canvas
    initCanvas() {
      // 获取系统信息来设置Canvas尺寸
      wx.getSystemInfo({
        success: (res) => {
          const canvasWidth = Math.min(res.windowWidth - 40, 300)
          const canvasHeight = 150
          
          this.setData({
            canvasWidth,
            canvasHeight
          })
          
          // 创建Canvas上下文
          setTimeout(() => {
            this.createCanvasContext()
          }, 100)
        }
      })
    },

    // 创建Canvas上下文
    createCanvasContext() {
      const ctx = wx.createCanvasContext('vex-staff-canvas', this)
      this.canvasContext = ctx
      
      // 设置Canvas属性
      ctx.setFillStyle('#ffffff')
      ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)
      
      console.log('Canvas上下文创建完成')
      this.drawStaff()
    },

    // 绘制五线谱
    drawStaff() {
      if (!this.canvasContext) {
        console.warn('Canvas上下文未就绪')
        return
      }

      const ctx = this.canvasContext
      const width = this.data.canvasWidth
      const height = this.data.canvasHeight

      // 清空画布
      ctx.setFillStyle('#ffffff')
      ctx.fillRect(0, 0, width, height)

      // 使用简化的绘制方法
      this.drawSimpleStaff(ctx, width, height)
      
      ctx.draw()
    },

    // 简化的五线谱绘制
    drawSimpleStaff(ctx, width, height) {
      const staffY = 40
      const staffWidth = width - 80
      const lineSpacing = 12
      
      // 绘制五线谱线条
      ctx.setStrokeStyle('#000000')
      ctx.setLineWidth(1)
      
      for (let i = 0; i < 5; i++) {
        const y = staffY + (i * lineSpacing)
        ctx.beginPath()
        ctx.moveTo(40, y)
        ctx.lineTo(40 + staffWidth, y)
        ctx.stroke()
      }

      // 绘制高音谱号
      ctx.setFillStyle('#000000')
      ctx.setFontSize(32)
      ctx.fillText('𝄞', 45, staffY + 30)

      // 绘制拍号
      ctx.setFontSize(16)
      ctx.fillText('4', 85, staffY + 15)
      ctx.fillText('4', 85, staffY + 35)
    },

    // 在五线谱上绘制音符
    drawNoteOnStaff(note) {
      if (!this.canvasContext || !note) return

      const ctx = this.canvasContext
      const width = this.data.canvasWidth
      const height = this.data.canvasHeight

      // 清空画布
      ctx.setFillStyle('#ffffff')
      ctx.fillRect(0, 0, width, height)

      // 绘制五线谱
      this.drawSimpleStaff(ctx, width, height)

      // 绘制音符
      const noteX = 120 // 音符X位置
      const noteY = this.getNoteYPosition(note.staffPosition)
      this.drawNote(ctx, noteX, noteY, note)
      
      // 统一调用draw()
      ctx.draw()
    },

    // 根据音符位置获取Y坐标
    getNoteYPosition(staffPosition) {
      const staffY = 40
      const lineSpacing = 12
      
      const positions = {
        'space4': staffY - 6,    // C5 - 第五线上方间
        'line4': staffY + 0,     // B4 - 第五线
        'space3': staffY + 6,    // A4 - 第四间
        'line3': staffY + 12,    // G4 - 第四线
        'space2': staffY + 18,   // F4 - 第三间
        'line2': staffY + 24,    // E4 - 第三线
        'space1': staffY + 30,   // D4 - 第二间
        'line1': staffY + 36     // C4 - 第一线下方
      }
      
      return positions[staffPosition] || staffY + 24
    },

    // 绘制音符
    drawNote(ctx, x, y, note) {
      ctx.setFillStyle('#000000')
      
      // 绘制音符头（椭圆形）
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fill()
      
      // 绘制符干
      ctx.setStrokeStyle('#000000')
      ctx.setLineWidth(1.5)
      ctx.beginPath()
      ctx.moveTo(x + 6, y)
      ctx.lineTo(x + 6, y - 24)
      ctx.stroke()
      
      // 绘制加线（如果需要）
      if (note.staffPosition === 'line1' || note.staffPosition === 'space4') {
        ctx.beginPath()
        ctx.moveTo(x - 10, y)
        ctx.lineTo(x + 10, y)
        ctx.stroke()
      }
    },

    // Canvas触摸事件
    onCanvasTouch(e) {
      console.log('Canvas触摸事件:', e)
      // 可以在这里添加交互逻辑
    }
  }
}) 