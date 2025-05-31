<template>
  <view class="app">
    <!-- 这里是应用的根组件，所有页面都会包含在这里 -->
  </view>
</template>

<script>
export default {
  name: 'App',
  onLaunch: function() {
    console.log('App Launch')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style>
/* 全局样式 */
.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 重置默认样式 */
* {
  box-sizing: border-box;
}

page {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

/* uni-app特有的页面样式 */
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style> 