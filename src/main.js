import Vue from 'vue'
import '@/base.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/icons/iconfont.css'
import App from '@/App'
import router from '@/router'
import store from '@/store'

Vue.use(ElementUI)

Vue.config.productionTip = false

Vue.prototype.$setLoadingTarget = loadingTarget => {
  store.commit('setLoadingTarget', {loadingTarget});
};

export default new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
