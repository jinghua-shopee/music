import Vue from 'vue'
import App from './App'
import store from './store'

Vue.config.productionTip = false

// uni-app全局配置
Vue.prototype.$store = store

App.mpType = 'app'

const app = new Vue({
    store,
    ...App
})
app.$mount() 