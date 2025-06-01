import Vue from 'vue'
import App from './App'
import store from './store'

// uni-app 兼容配置
Vue.config.productionTip = false

// 挂载全局方法
Vue.prototype.$store = store

App.mpType = 'app'

const app = new Vue({
  store,
  ...App
})

app.$mount() 