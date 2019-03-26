<template>
  <div id="nodeMemberTable">
    <div id="tableHeader">
      <el-input v-model.trim="keyword" placeholder="输入关键字搜索" clearable @keyup.enter.native="search" @clear="search" prefix-icon="el-icon-search"></el-input>
    </div>
    <el-table border stripe :data="list[pageIndex]" :height="tableHeight" :row-class-name="getRowClassName" row-key="member_id" :expand-row-keys="expandKeys" @expand-change="handleExpand" @filter-change="handleFilter">
      <el-table-column type="expand" width="50">
        <template slot-scope="props">
          <el-form inline label-width="100px">
            <el-form-item label="姓名" prop="name">
              <el-input v-model.trim="props.row.detail.name"></el-input>
            </el-form-item>
            <el-form-item label="性别" prop="sex">
              <el-input v-model.trim="props.row.detail.sex"></el-input>
            </el-form-item>
            <el-form-item label="出生日期" prop="birthday">
              <el-input v-model.trim="props.row.detail.birthday"></el-input>
            </el-form-item>
            <el-form-item label="省份" prop="province">
              <el-input v-model.trim="props.row.detail.province"></el-input>
            </el-form-item>
            <el-form-item label="城市" prop="city">
              <el-input v-model.trim="props.row.detail.city"></el-input>
            </el-form-item>
            <el-form-item label="区县" prop="area">
              <el-input v-model.trim="props.row.detail.area"></el-input>
            </el-form-item>
            <el-form-item label="详细地址" prop="address">
              <el-input v-model.trim="props.row.detail.address"></el-input>
            </el-form-item>
            <el-form-item label="手机号码" prop="mobile">
              <el-input v-model.trim="props.row.detail.mobile"></el-input>
            </el-form-item>
            <el-form-item label="QQ" prop="qq">
              <el-input v-model.trim="props.row.detail.qq"></el-input>
            </el-form-item>
            <el-form-item label="电子邮箱" prop="mail">
              <el-input v-model.trim="props.row.detail.mail"></el-input>
            </el-form-item>
            <el-form-item label="汽车型号" prop="car_type">
              <el-input v-model.trim="props.row.detail.car_type"></el-input>
            </el-form-item>
            <el-form-item label="汽车颜色" prop="car_color">
              <el-input v-model.trim="props.row.detail.car_color"></el-input>
            </el-form-item>
            <el-form-item label="提车日期" prop="car_buy_date">
              <el-input v-model.trim="props.row.detail.car_buy_date"></el-input>
            </el-form-item>
            <el-form-item label="提车4S店" prop="car_4s_shop">
              <el-input v-model.trim="props.row.detail.car_4s_shop"></el-input>
            </el-form-item>
            <el-form-item label="车牌" prop="car_number">
              <el-input v-model.trim="props.row.detail.car_number"></el-input>
            </el-form-item>
            <el-form-item label="汽车之家昵称" prop="car_home_nick">
              <el-input v-model.trim="props.row.detail.car_home_nick"></el-input>
            </el-form-item>
            <el-form-item label="已加入车友会" prop="car_club_name">
              <el-input v-model.trim="props.row.detail.car_club_name"></el-input>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="updateMember" class="updataBtn">更新</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="100" align="center"></el-table-column>
      <el-table-column prop="vip_no" label="会员编号" width="100" align="center"></el-table-column>
      <el-table-column prop="sex" label="性别" width="50" align="center"></el-table-column>
      <el-table-column prop="mobile" label="手机号码" width="120" align="center"></el-table-column>
      <el-table-column prop="province" label="省份" align="center"></el-table-column>
      <el-table-column prop="city" label="城市" align="center"></el-table-column>
      <el-table-column prop="member_state" label="会员状态" width="100" align="center" :filters="memberState" :filter-multiple="false" column-key="member_state">
        <template slot-scope="scope">
          <el-tag size="mini" :type="memberState.find(i=>i.value===scope.row.member_state).tagType">
            {{scope.row.member_state}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="注册时间" width="150" align="center"></el-table-column>
    </el-table>
    <el-pagination
    v-show="pagination.total/pagination.pageSize>1"
    background
    layout="prev, pager, next"
    :total="pagination.total"
    :page-size="pagination.pageSize"
    :current-page.sync="pagination.page"
    @current-change="changePage">
    </el-pagination>
  </div>
</template>

<script>
import {getMemberList, getMemberInfo, saveMemberInfo} from '@/api';
import {appId} from '@/utils';

export default {
  data () {
    return {
      tableHeight: document.getElementById(appId).clientHeight - 120 - 50 - 50,
      list: [],
      pagination: {
        total: 0,
        pageSize: 20,
        page: 1
      },
      memberState: [
        {text:'未申请', value:'未申请', tagType: 'warning'},
        {text:'已申请', value:'已申请', tagType: 'info'},
        {text:'正式会员', value:'正式会员', tagType: 'success'}
      ],
      keyword: '',
      selectedMemberState: '',
      getRowClassName({row}) {
        return `row-id-${row.member_id}`;
      },
      expandKeys: [],
      expandId: '',
      updateExclude: ['create_by','head_image_url','member_id','member_key','modify_by','modify_time','openid','vip_no','member_state','create_time']
    }
  },
  computed: {
    pageIndex() {
      return this.pagination.page - 1;
    }
  },
  created() {
    this.getMemberList();
  },
  methods: {
    getMemberList() {
      this.$setLoadingTarget('#nodeMemberTable');
      getMemberList({
        keyword: this.keyword,
        member_state: this.selectedMemberState,
        page: this.pagination.page,
        page_size: this.pagination.pageSize
      }).then(data => {
        if (data.code === 1) {
          this.list[this.pageIndex] = data.data.items.map(item => {
            return {
              ...item,
              detail: {}
            }
          });
          this.pagination.total = Number(data.data.total);
          this.$forceUpdate();
        }
      });
    },
    changePage() {
      if (this.list[this.pageIndex] === undefined) {
        this.getMemberList();
      }
    },
    handleFilter(filters) {
      this.selectedMemberState = '';
      if (filters.member_state instanceof Array && filters.member_state[0] !== undefined) {
        this.selectedMemberState = filters.member_state[0];
      }
      this.resetTable();
      this.getMemberList();
    },
    search() {
      this.resetTable();
      this.getMemberList();
    },
    resetTable() {
      this.pagination.total = 0;
      this.pagination.page = 1;
      this.list = [];
    },
    handleExpand(row, expandedRows) {
      this.expandKeys = [];
      this.expandId = '';
      const expandIds = expandedRows.map(item => {
        return item.member_id;
      });
      if (expandIds.includes(row.member_id)) {
        this.expandId = row.member_id;
        this.expandKeys.push(row.member_id);
        this.$nextTick(() => {
          document.querySelector(`.row-id-${row.member_id}`).scrollIntoView();
        });
        if (row.detail.member_id === undefined) {
          this.getMemberDetail(row);
        }
      }
    },
    getMemberDetail(row) {
      this.$setLoadingTarget('#nodeMemberTable');
      getMemberInfo({
        member_id: row.member_id
      }).then(data => {
        if (data.code === 1) {
          row.detail = {
            ...data.data
          };
        } else {
          this.$message({
            type: 'error',
            message: data.msg
          });
        }
      });
    },
    updateMember() {
      this.$confirm('更新数据后不能复原，确定要更新？').then(() => {
        const expandRow = this.list[this.pageIndex].find(item => item.member_id === this.expandId);
        if (!(expandRow instanceof Object && expandRow.detail.member_id !== undefined)) {
          this.$message({
            message: '没有可以更新的数据',
            type: 'warning'
          });
          return false;
        }
        const params = {...expandRow.detail};
        this.updateExclude.forEach(item => {
          delete params[item];
        })
        this.$setLoadingTarget('#nodeMemberTable');
        saveMemberInfo(params).then(data => {
          let message = data.msg;
          let type = 'error';
          if (data.code === 1) {
            message = '更新数据成功';
            type = 'success';
            for (let i in params) {
              expandRow[i] = params[i];
            }
          }
          this.$message({message, type});
        });
      }).catch(()=>{});
    }
  }
}
</script>

<style lang="less" scoped>
#tableHeader {
  height: 40px;
  margin-bottom: 10px;
  .el-input {
    float: right;
    width: 200px;
  }
}

.updataBtn {
  margin: 0 auto;
  display: block;
}

.el-pagination {
  text-align: center;
  margin-top: 18px;
}
</style>
