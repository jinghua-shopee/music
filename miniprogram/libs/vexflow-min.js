/**
 * VexFlow 简化版 - 微信小程序适配
 * 基于 VexFlow 4.0，专门为小程序优化
 */

// 简化的 VexFlow 实现
class VexFlow {
  constructor() {
    this.version = '4.0-miniprogram'
  }

  // 工厂函数
  static Factory = {
    Renderer: function(canvas, backend) {
      return new VexRenderer(canvas, backend)
    },
    
    Stave: function(x, y, width) {
      return new VexStave(x, y, width)
    },
    
    StaveNote: function(noteSpec) {
      return new VexStaveNote(noteSpec)
    },
    
    Voice: function(timeSignature) {
      return new VexVoice(timeSignature)
    },
    
    Formatter: function() {
      return new VexFormatter()
    }
  }
}

// 渲染器
class VexRenderer {
  constructor(canvas, backend = 'canvas') {
    this.canvas = canvas
    this.backend = backend
    this.ctx = null
    this.width = 0
    this.height = 0
  }

  resize(width, height) {
    this.width = width
    this.height = height
    if (this.canvas) {
      this.canvas.width = width
      this.canvas.height = height
    }
    return this
  }

  getContext() {
    if (!this.ctx && this.canvas) {
      this.ctx = this.canvas.getContext('2d')
    }
    return this.ctx
  }
}

// 五线谱
class VexStave {
  constructor(x, y, width) {
    this.x = x
    this.y = y
    this.width = width
    this.options = {
      spacing_between_lines_px: 10,
      line_thickness: 1
    }
  }

  addClef(clef) {
    this.clef = clef
    return this
  }

  addTimeSignature(timeSignature) {
    this.timeSignature = timeSignature
    return this
  }

  setContext(ctx) {
    this.context = ctx
    return this
  }

  draw() {
    if (!this.context) return

    const ctx = this.context
    const spacing = this.options.spacing_between_lines_px
    
    // 绘制五线谱线条
    ctx.strokeStyle = '#000'
    ctx.lineWidth = this.options.line_thickness
    
    for (let i = 0; i < 5; i++) {
      const y = this.y + (i * spacing)
      ctx.beginPath()
      ctx.moveTo(this.x, y)
      ctx.lineTo(this.x + this.width, y)
      ctx.stroke()
    }

    // 绘制高音谱号
    if (this.clef === 'treble') {
      ctx.font = '40px serif'
      ctx.fillStyle = '#000'
      ctx.fillText('𝄞', this.x + 10, this.y + 35)
    }

    // 绘制拍号
    if (this.timeSignature) {
      ctx.font = '20px Arial'
      ctx.fillStyle = '#000'
      ctx.fillText(this.timeSignature, this.x + 60, this.y + 15)
      ctx.fillText('4', this.x + 60, this.y + 35)
    }
  }
}

// 音符
class VexStaveNote {
  constructor(noteSpec) {
    this.keys = noteSpec.keys || []
    this.duration = noteSpec.duration || 'q'
    this.x = 0
    this.y = 0
    this.stave = null
  }

  setStave(stave) {
    this.stave = stave
    return this
  }

  setContext(ctx) {
    this.context = ctx
    return this
  }

  // 获取音符在五线谱上的Y位置
  getNoteY(noteKey) {
    if (!this.stave) return 0
    
    const notePositions = {
      'c/5': -10,  // C5 - 第五线上方
      'b/4': 0,    // B4 - 第五线
      'a/4': 5,    // A4 - 第四间
      'g/4': 10,   // G4 - 第四线
      'f/4': 15,   // F4 - 第三间
      'e/4': 20,   // E4 - 第三线
      'd/4': 25,   // D4 - 第二间
      'c/4': 30    // C4 - 第二线下方
    }
    
    return this.stave.y + (notePositions[noteKey] || 20)
  }

  draw() {
    if (!this.context || !this.stave) return

    const ctx = this.context
    
    this.keys.forEach((key, index) => {
      const noteY = this.getNoteY(key)
      const noteX = this.x + (index * 20)
      
      // 绘制音符头
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.ellipse(noteX, noteY, 6, 4, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      // 绘制符干
      if (this.duration !== 'w') { // 全音符不需要符干
        ctx.beginPath()
        ctx.moveTo(noteX + 6, noteY)
        ctx.lineTo(noteX + 6, noteY - 25)
        ctx.lineWidth = 1
        ctx.stroke()
      }
      
      // 绘制加线（如果需要）
      if (key === 'c/4' || key === 'c/5') {
        ctx.beginPath()
        ctx.moveTo(noteX - 8, noteY)
        ctx.lineTo(noteX + 8, noteY)
        ctx.stroke()
      }
    })
  }
}

// 声部
class VexVoice {
  constructor(timeSignature) {
    this.timeSignature = timeSignature
    this.notes = []
  }

  addTickables(notes) {
    this.notes = this.notes.concat(notes)
    return this
  }

  draw(ctx, stave) {
    this.notes.forEach((note, index) => {
      note.setContext(ctx)
      note.setStave(stave)
      note.x = stave.x + 100 + (index * 50) // 音符间距
      note.draw()
    })
  }
}

// 格式化器
class VexFormatter {
  format(voices, width) {
    // 简单的格式化逻辑
    voices.forEach(voice => {
      voice.notes.forEach((note, index) => {
        note.x = 100 + (index * 50)
      })
    })
    return this
  }

  joinVoices(voices) {
    return this
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VexFlow }
} else if (typeof global !== 'undefined') {
  global.VexFlow = VexFlow
} 