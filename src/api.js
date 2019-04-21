import instance from './main';
import axios from 'axios';
import store from '@/store';
import {Loading, Message}from 'element-ui';
let loading = null;

axios.defaults.withCredentials = true;
if (location.hostname === 'localhost' || location.hostname === '192.168.3.27') {
  axios.defaults.baseURL = 'https://platform.wxmall.org.cn';
} else {
  axios.defaults.baseURL = location.origin;
}

axios.interceptors.request.use((config) => {
  loading = Loading.service({
    target: store.state.loadingTarget,
    lock: true
  });
  return config;
}, (error) => {
  return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
  loading.close();
  if (response.data instanceof Object && response.data.code === 401) {
    instance.$router.replace({name: 'login'});
    return false;
  }

  return response.data;
}, (error) => {
  loading.close();
  Message.error({
    message: error
  });
  return Promise.reject(error);
});

// 获取图形验证码
export const getImageCode = ({mobile}) => {
  return axios.get('/common/get_image_verify_code', {
    params: {mobile},
    responseType: 'arraybuffer'
  });
};

// 获取短信验证码
export const getSmsCode = ({mobile, imageCode}) => {
  return axios.get('/common/get_sms_verify_code', {
    params: {
      mobile,
      image_verify_code: imageCode
    }
  });
};

// 登录
export const handleLogin = ({mobile, smsCode}) => {
  return axios.get('/common/login', {
    params: {
      mobile,
      sms_verify_code: smsCode
    }
  });
};

// 退出登录
export const handleLogout = () => {
  return axios.get('/common/logout');
};

// 获取会员列表
export const getMemberList = ({keyword, member_state, page, page_size}) => {
  return axios.get('/member/list_member', {
    params: {
      keyword,
      member_state,
      page,
      page_size
    }
  });
};

// 获取会员详情
export const getMemberInfo = ({member_id}) => {
  return axios.get('/member/get_member_info', {
    params: {
      member_id
    }
  });
};

// 保存会员信息
export const saveMemberInfo = (params) => {
  return axios.post('/member/save_member', params);
};

// 获取会员导出数据
export const getMemberExport = ({keyword}) => {
  return axios.get('/member/list_export_order', {
    params: {
      keyword
    }
  });
};

// 获取最新的会员编号
export const getLastestVipNumber = () => {
  return axios.get('/vip_no/get_max_vip_no');
};

// 获取会员编号列表
export const getVipNumberList = ({keyword,state,is_publish,page,page_size}) => {
  return axios.get('/vip_no/list_vip_no', {
    params: {
      keyword,
      state,
      is_publish,
      page,
      page_size
    }
  });
};

// 批量生成会员编号
export const genrateVipNumber = ({total}) => {
  return axios.get('/vip_no/batch_genrate_vip_no', {
    params: {
      total
    }
  });
};

// 发布，取消发布会员编号
export const publishVipNumber = ({is_publish,begin_no,end_no}) => {
  return axios.get('/vip_no/publish_vip_no', {
    params: {
      is_publish,
      begin_no,
      end_no
    }
  });
};

// 获取订单列表
export const getOrderList = ({keyword,is_pay,state,page,page_size}) => {
  return axios.get('/order/list_order', {
    params: {
      keyword,
      is_pay,
      state,
      page,
      page_size
    }
  });
};

// 获取订单信息
export const getOrderInfo = ({order_id}) => {
  return axios.get('/order/get_order_info', {
    params: {
      order_id
    }
  });
};

// 保存订单信息
export const saveOrderInfo = (params) => {
  return axios.post('/order/save_order', params);
};

// 获取订单导出数据
export const getOrderExport = ({keyword, is_pay, state}) => {
  return axios.get('/order/list_export_order', {
    params: {
      keyword,
      is_pay,
      state
    }
  });
};