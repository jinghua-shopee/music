import Vue from 'vue'
import App from './App'
import store from './store'

Vue.config.productionTip = false

console.log('Main.js loaded')

const app = new Vue({
    store,
    render: h => h(App)
})

console.log('Vue app created, mounting...')

app.$mount('#app')

console.log('Vue app mounted!') 