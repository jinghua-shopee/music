<template>
  <view class="container">
    <!-- 标题 -->
    <view class="title">
      <text class="title-text">五线谱简谱学习器</text>
    </view>
    
    <!-- 模式选择 -->
    <view class="mode-cards">
      <view 
        class="mode-card" 
        :class="{ active: selectedMode === 'practice' }"
        @click="selectMode('practice')"
      >
        <view class="card-title">练习模式</view>
        <view class="card-desc">专注学习，稳步提升</view>
      </view>
      
      <view 
        class="mode-card" 
        :class="{ active: selectedMode === 'pk' }"
        @click="selectMode('pk')"
      >
        <view class="card-title">PK模式</view>
        <view class="card-desc">双人对战，竞技乐趣</view>
      </view>
    </view>
    
    <!-- 题目数量选择 -->
    <view class="question-count" v-if="selectedMode">
      <view class="section-title">选择题目数量</view>
      <view class="count-options">
        <view 
          v-for="option in questionOptions" 
          :key="option.value"
          class="count-option" 
          :class="{ active: selectedCount === option.value }"
          @click="selectCount(option.value)"
        >
          <text>{{ option.label }}</text>
        </view>
      </view>
    </view>
    
    <!-- 开始按钮 -->
    <view class="start-section" v-if="selectedMode && selectedCount">
      <button class="start-btn" @click="startLearning">
        开始{{ selectedMode === 'practice' ? '练习' : 'PK' }}
      </button>
    </view>
    
    <!-- 提示信息 -->
    <view class="info" v-if="message">
      <text>{{ message }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      selectedMode: '',
      selectedCount: '',
      message: '欢迎使用五线谱简谱学习器！',
      questionOptions: [
        { label: '30道题', value: '30' },
        { label: '60道题', value: '60' },
        { label: '无尽模式', value: 'endless' }
      ]
    }
  },
  onLoad() {
    console.log('页面加载完成')
    this.message = '选择学习模式开始练习'
  },
  methods: {
    selectMode(mode) {
      this.selectedMode = mode
      this.selectedCount = ''
      this.message = `已选择${mode === 'practice' ? '练习' : 'PK'}模式，请选择题目数量`
    },
    
    selectCount(count) {
      this.selectedCount = count
      this.message = `已选择${count === 'endless' ? '无尽模式' : count + '道题'}，点击开始按钮开始学习`
    },
    
    startLearning() {
      if (!this.selectedMode || !this.selectedCount) {
        this.message = '请先选择模式和题目数量'
        return
      }
      
      // 跳转到学习页面
      uni.navigateTo({
        url: `/pages/learning/learning?mode=${this.selectedMode}&count=${this.selectedCount}`,
        success: () => {
          console.log('跳转成功')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
          this.message = '页面跳转失败，请重试'
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  margin-bottom: 60rpx;
  margin-top: 40rpx;
}

.title-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
}

.mode-cards {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
  width: 100%;
  max-width: 600rpx;
  flex-direction: column;
}

.mode-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  transition: all 0.3s ease;
}

.mode-card.active {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.02);
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1D3557;
  margin-bottom: 8rpx;
}

.card-desc {
  font-size: 24rpx;
  color: #457B9D;
}

.question-count {
  width: 100%;
  max-width: 600rpx;
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  margin-bottom: 24rpx;
}

.count-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.count-option {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  font-size: 24rpx;
  color: #1D3557;
  transition: all 0.3s ease;
}

.count-option.active {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.02);
}

.start-section {
  width: 100%;
  max-width: 400rpx;
  margin-bottom: 40rpx;
}

.start-btn {
  width: 100%;
  background: #007AFF;
  color: #ffffff;
  border: none;
  border-radius: 12rpx;
  padding: 28rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.info {
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12rpx;
  color: #333;
  font-size: 24rpx;
  text-align: center;
  max-width: 600rpx;
}
</style> 