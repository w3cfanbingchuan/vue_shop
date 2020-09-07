import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'
import treeTable from 'vue-table-with-tree-grid'
// 导入富文本编译器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编译器样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
Vue.config.productionTip = false
Vue.prototype.$http = axios
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
// axios 请求拦截器 为headers的Authorization添加 token
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  return `${y}-${m}-${d}`
})
Vue.component('tree-table', treeTable)
// 将富文本编辑器注册为全局组件
Vue.use(VueQuillEditor)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
