import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    activedMenuTitle: '会员管理',
    loadingTarget: document.body
  },
  mutations: {
    setActiveTitle(state, {activedMenuTitle}) {
      state.activedMenuTitle = activedMenuTitle;
    },
    setLoadingTarget(state, {loadingTarget}) {
      state.loadingTarget = loadingTarget;
    }
  },
  actions: {

  },
  modules: {

  }
});
