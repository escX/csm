import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'

Vue.use(Router)

const router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  next();
  const activedMenuTitle = to.meta && to.meta.activedMenuTitle;
  if (activedMenuTitle) {
    store.commit('setActiveTitle', {activedMenuTitle});
  }
})

export default router