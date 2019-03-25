<template>
  <div id="nodeOrderTable">
    <div id="tableHeader">
      <el-input v-model.trim="keyword" placeholder="输入关键字搜索" clearable @keyup.enter.native="search" @clear="search"></el-input>
    </div>
    <el-table border stripe :data="list[pageIndex]" :height="tableHeight" :row-class-name="getRowClassName" row-key="order_id" :expand-row-keys="expandKeys" @expand-change="handleExpand" @filter-change="handleFilter">
      <el-table-column type="expand" width="50">
        <template slot-scope="props">
          <el-form inline label-width="100px">
            <el-form-item label="收件人" prop="receive_by">
              <el-input v-model.trim="props.row.detail.receive_by"></el-input>
            </el-form-item>
            <el-form-item label="联系电话" prop="mobile">
              <el-input v-model.trim="props.row.detail.mobile"></el-input>
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
            <el-form-item label="物流公司" prop="express_company">
              <el-input v-model.trim="props.row.detail.express_company"></el-input>
            </el-form-item>
            <el-form-item label="快递单号" prop="express_no">
              <el-input v-model.trim="props.row.detail.express_no"></el-input>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="updateOrder" class="updataBtn">更新</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="order_no" label="订单编号" width="100" align="center"></el-table-column>
      <el-table-column prop="trade_no" label="交易流水号" width="120" align="center"></el-table-column>
      <el-table-column prop="vip_no" label="会员编号" width="100" align="center"></el-table-column>
      <el-table-column prop="total_fee" label="订单金额" width="100" align="center"></el-table-column>
      <el-table-column prop="is_pay" label="支付状态" width="100" align="center" column-key="is_pay" :filters="payState" :filter-multiple="false">
        <template slot-scope="scope">
          <el-tag size="mini" :type="payState.find(i=>i.value==scope.row.is_pay).tagType">
            {{payState.find(i=>i.value==scope.row.is_pay).text}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="state" label="订单状态" width="100" align="center" column-key="state" :filters="orderState" :filter-multiple="false">
        <template slot-scope="scope">
          <el-tag size="mini" :type="orderState.find(i=>i.value===scope.row.state).tagType">
            {{scope.row.state}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="receive_by" label="收件人" width="100" align="center"></el-table-column>
      <el-table-column prop="mobile" label="联系电话" width="120" align="center"></el-table-column>
      <el-table-column prop="buyer_msg" label="买家留言" align="center"></el-table-column>
      <el-table-column prop="create_time" label="下单时间" width="100" align="center"></el-table-column>
      <el-table-column fixed="right" label="操作" width="50" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.state==='待发货'" @click="handleOperate(scope.row.order_id)" type="text">发货</el-button>
        </template>
      </el-table-column>
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
import {getOrderList, getOrderInfo, saveOrderInfo} from '@/api';
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
      orderState: [
        {text:'待付款', value:'待付款', tagType:'danger'},
        {text:'待发货', value:'待发货', tagType:'warning'},
        {text:'待签收', value:'待签收', tagType:'info'},
        {text:'已签收', value:'已签收', tagType:'success'}
      ],
      payState: [
        {text:'未支付', value:'0', tagType:'danger'},
        {text:'已支付', value:'1', tagType:'success'}
      ],
      keyword: '',
      selectedOrderState: '',
      selectedPayState: '',
      getRowClassName({row}) {
        return `row-id-${row.order_id}`;
      },
      expandKeys: [],
      expandId: '',
      updateExclude: ['create_by','create_time','member_id','modify_by','modify_time','order_id','order_no','trade_no','vip_no','total_fee','is_pay','state','pay_time','buyer_msg']
    }
  },
  computed: {
    pageIndex() {
      return this.pagination.page - 1;
    }
  },
  created() {
    this.getOrderList();
  },
  methods: {
    getOrderList() {
      this.$setLoadingTarget('#nodeOrderTable');
      getOrderList({
        keyword: this.keyword,
        is_pay: this.selectedPayState,
        state: this.selectedOrderState,
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
        this.getOrderList();
      }
    },
    handleFilter(filters) {
      if (filters.state instanceof Array) {
        if (filters.state[0] !== undefined) {
          this.selectedOrderState = filters.state[0];
        } else {
          this.selectedOrderState = '';
        }
      }

      if (filters.is_pay instanceof Array) {
        if (filters.is_pay[0] !== undefined) {
          this.selectedPayState = filters.is_pay[0];
        } else {
          this.selectedPayState = '';
        }
      }

      this.resetTable();
      this.getOrderList();
    },
    search() {
      this.resetTable();
      this.getOrderList();
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
        return item.order_id;
      });
      if (expandIds.includes(row.order_id)) {
        this.expandId = row.order_id;
        this.expandKeys.push(row.order_id);
        this.$nextTick(() => {
          document.querySelector(`.row-id-${row.order_id}`).scrollIntoView();
        });
        if (row.detail.order_id === undefined) {
          this.getOrderDetail(row);
        }
      }
    },
    handleOperate(order_id) {
      saveOrderInfo({
        state: '待签收'
      }).then(data => {
        if (data.code === 1) {
          const row = this.list[this.pageIndex].find(item => item.order_id === order_id);
          if (row instanceof Object) {
            row.state = '待签收';
            row.detail.state = '待签收';
          }
          this.$message({
            message: '发货成功'
          });
        }
      });
    },
    getOrderDetail(row) {
      this.$setLoadingTarget('#nodeOrderTable');
      getOrderInfo({
        order_id: row.order_id
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
    updateOrder() {
      this.$confirm('更新数据后不能复原，确定要更新？').then(() => {
        const expandRow = this.list[this.pageIndex].find(item => item.order_id === this.expandId);
        if (!(expandRow instanceof Object && expandRow.detail.order_id === undefined)) {
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
        this.$setLoadingTarget('#nodeOrderTable');
        saveOrderInfo(params).then(data => {
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
