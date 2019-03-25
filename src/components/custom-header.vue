<template>
  <div class="header_box">
    <div class="header_left"></div>
    <div class="header_right">
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          {{loginName}}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import {getLoginName} from '@/utils';
import {handleLogout} from '@/api';

export default {
  data() {
    return {
      loginName: getLoginName()
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        this.handleLogout();
      }
    },
    handleLogout() {
      handleLogout().then(data => {
        if (data.code === 1) {
          this.$router.replace({name: 'login'});
        } else {
          this.$message({
            message: data.msg,
            type: 'error'
          });
        }
      });
    }
  }
}
</script>

<style lang="less" scoped>
.header_box {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  border-bottom: 1px solid #eaecef;
  .header_left {
    flex: auto;
    height: 100%;
    background: url(../assets/images/logo.png) no-repeat center left / contain;
  }
  .header_right {
    flex: none;
    display: flex;
    align-items: center;
    .el-dropdown-link {
      cursor: pointer;
    }
    .el-icon-arrow-down {
      font-size: 12px;
    }
  }
}
</style>
