import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'
Vue.config.productionTip = false
Vue.prototype.$http = axios
axios.defaults.baseURL = 'https://127.0.0.1:8080/api/private/v1/'
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
