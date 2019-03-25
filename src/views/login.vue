<template>
  <div class="login_container">
    <div class="login_box">
      <div class="login_header">欢迎登录</div>
      <div class="login_form" id="nodeLogin">
        <el-form ref="loginForm" :model="loginForm" :rules="rules">
          <el-form-item prop="mobile">
            <el-input placeholder="请输入手机号码" v-model.trim="loginForm.mobile">
              <i slot="prepend" class="el-icon-iconfont-mobile"></i>
            </el-input>
          </el-form-item>
          <el-form-item prop="smsCode">
            <el-input placeholder="请输入短信验证码" v-model.trim="loginForm.smsCode">
              <i slot="prepend" class="el-icon-iconfont-smscode"></i>
              <el-button slot="append" @click="handleSmsCode">验证码</el-button>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button class="login_button" type="primary" @click="handleSubmit">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-dialog id="imageCodeDialog" title="请输入图形验证码" width="400px" :visible.sync="dialogVisible">
      <el-form @submit.native.prevent>
        <el-form-item>
          <el-input placeholder="请输入图形验证码" v-model.trim="imageCode">
            <img slot="append" :src="imageCodeUrl">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="sendSmsCode">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getImageCode, getSmsCode, handleLogin} from '@/api';
import {mobilePattern, transformArrayBufferToBase64, getLoginName, setLoginName} from '@/utils';

export default {
  data() {
    return {
      dialogVisible: false,
      loginForm: {
        mobile: getLoginName(),
        smsCode: ''
      },
      imageCode: '',
      imageCodeUrl: '',
      rules: {
        mobile: [
          {required: true, message: '请输入手机号码', trigger: 'blur'},
          {pattern: mobilePattern, message: '请输入正确的手机号码', trigger: 'blur'}
        ],
        smsCode: [
          {required: true, message: '请输入短信验证码', trigger: 'blur'}
        ]
      }
    }
  },
  watch: {
    dialogVisible(newValue) {
      if (!newValue) {
        this.imageCode = '';
      }
    }
  },
  methods: {
    handleSmsCode() {
      if (!mobilePattern.test(this.loginForm.mobile)) {
        this.$message({
          type: 'error',
          message: '请输入正确的手机号码'
        })
        return false;
      }
      this.$setLoadingTarget('#nodeLogin');
      getImageCode({
        mobile: this.loginForm.mobile
      }).then(data => {
        this.imageCodeUrl = `data:image/jpg;base64,${transformArrayBufferToBase64(data)}`;
        this.dialogVisible = true;
      });
    },
    sendSmsCode() {
      if (this.imageCode === '') {
        this.$message({
          type: 'error',
          message: '请输入图形验证码'
        });
        return false;
      }
      this.$setLoadingTarget('#imageCodeDialog .el-dialog');
      getSmsCode({
        mobile: this.loginForm.mobile,
        imageCode: this.imageCode
      }).then(data => {
        let messageType = 'error';
        if (data.code === 1) {
          messageType = 'success';
          this.dialogVisible = false;
        }
        this.$message({
          type: messageType,
          message: data.msg
        });
      });
    },
    handleSubmit() {
      this.$refs.loginForm.validate((valid) => {
        if (!valid) return;
        this.$setLoadingTarget('#nodeLogin');
        handleLogin(this.loginForm).then(data => {
          if (data.code === 1) {
            setLoginName(this.loginForm.mobile);
            this.$router.replace({name: 'home'});
          } else {
            this.$message({
              type: 'error',
              message: data.msg
            });
          }
        });
      });
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  width: 100%;
  height: 100%;
  background: url(../assets/images/login_bg.jpg) center / cover;
  position: relative;
  .login_box {
    width: 333px;
    position: absolute;
    right: 160px;
    top: 50%;
    transform: translateY(-60%);
    background-color: #fff;
    border-radius: 4px;
    .login_header {
      border-bottom: 1px solid #E4E7ED;
      padding: 14px 16px;
      line-height: 1;
      color: #303133;
      font-weight: bold;
    }
    .login_form {
      padding: 22px 16px 0;
      .login_button {
        width: 100%;
      }
    }
  }
  #imageCodeDialog /deep/ .el-input-group__append {
    padding: 0;
    img {
      display: block;
      width: 140px;
      height: 38px;
    }
  }
}
</style>