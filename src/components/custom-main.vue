<template>
  <el-container>
    <el-header height="80px">
      <custon-header></custon-header>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <custom-menu></custom-menu>
      </el-aside>
      <el-main>
        <keep-alive>
          <router-view/>
        </keep-alive>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import CustomMenu from '@/components/custom-menu'
import CustomHeader from '@/components/custom-header'

export default {
  components: {
    'custom-menu': CustomMenu,
    'custon-header': CustomHeader
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
  .el-header {
    border-bottom: 1px solid #e6e6e6;
  }
}
</style>
