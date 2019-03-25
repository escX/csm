<template>
  <el-menu class="el-menu-vertical" :router="true">
    <el-menu-item :class="{'is-active':activedMenuTitle===item.title}" :index="item.path" v-for="(item, index) in menuList" :key="index">
      <i :class="item.iconClass"></i>
      <span slot="title">{{item.title}}</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
import {mapState} from 'vuex';

export default {
  data () {
    return {
      menuList: [
        {
          title: '会员管理',
          iconClass: 'el-icon-iconfont-huiyuanguanli',
          path: '/member/index'
        },
        {
          title: '订单管理',
          iconClass: 'el-icon-iconfont-dingdanguanli',
          path: '/order/index'
        },
        {
          title: '编号管理',
          iconClass: 'el-icon-iconfont-bianhaoguanli',
          path: '/vip_number/index'
        }
      ]
    }
  },
  computed: {
    ...mapState([
      'activedMenuTitle'
    ])
  }
}
</script>

<style lang="less" scoped>
.el-menu-vertical {
  height: 100%;
}
</style>
