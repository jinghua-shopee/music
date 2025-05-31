// pages/index/index.js
Page({
  data: {
    selectedMode: '',
    selectedCount: '',
    message: '欢迎使用五线谱简谱学习器！'
  },

  onLoad(options) {
    console.log('首页加载完成')
    this.setData({
      message: '选择学习模式开始练习'
    })
  },

  selectMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      selectedMode: mode,
      selectedCount: '',
      message: `已选择${mode === 'practice' ? '练习' : 'PK'}模式，请选择题目数量`
    })
  },

  selectCount(e) {
    const count = e.currentTarget.dataset.count
    this.setData({
      selectedCount: count,
      message: `已选择${count === 'endless' ? '无尽模式' : count + '道题'}，点击开始按钮开始学习`
    })
  },

  startLearning() {
    if (!this.data.selectedMode || !this.data.selectedCount) {
      this.setData({
        message: '请先选择模式和题目数量'
      })
      return
    }

    // 跳转到学习页面
    wx.navigateTo({
      url: `/pages/learning/learning?mode=${this.data.selectedMode}&count=${this.data.selectedCount}`,
      success: () => {
        console.log('跳转成功')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        this.setData({
          message: '页面跳转失败，请重试'
        })
      }
    })
  }
}) 