<template>
  <div id="nodeOrderTable">
    <div id="tableHeader">
      <el-button class="rightButton" type="primary" @click="exportData">导出数据</el-button>
      <el-input v-model.trim="keyword" placeholder="输入关键字搜索" clearable @keyup.enter.native="search" @clear="search" prefix-icon="el-icon-search"></el-input>
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
              <el-select v-model="props.row.detail.express_company" placeholder="请选择">
                <el-option
                  v-for="item in computed_express_options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="快递单号" prop="express_no">
              <el-input v-model.trim="props.row.detail.express_no"></el-input>
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="updateOrder" class="updataBtn">更新</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="order_no" label="订单编号" width="90" align="center"></el-table-column>
      <el-table-column prop="trade_no" label="交易流水号" width="110" align="center"></el-table-column>
      <el-table-column prop="vip_no" label="会员编号" width="85" align="center"></el-table-column>
      <el-table-column prop="order_info" label="订单信息" width="290" align="center">
        <template slot-scope="scope">
          <div v-for="(item, index) in scope.row.package_info" :key="index" class="package_inner">
            <div class="package_left">{{item.package_name}}：</div>
            <div class="package_right">
              <div v-for="(jtem, jndex) in item.product_list" :key="jndex" class="product_inner">
                <div class="product_left">{{jtem.product_name}}</div>
                <div class="product_right">*{{jtem.qty}}</div>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="total_fee" label="订单金额" width="85" align="center"></el-table-column>
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
      <el-table-column prop="mobile" label="联系电话" width="115" align="center"></el-table-column>
      <el-table-column prop="buyer_msg" label="买家留言" width="100" align="center"></el-table-column>
      <el-table-column prop="create_time" label="下单时间" width="100" align="center"></el-table-column>
      <el-table-column fixed="right" label="操作" width="50" align="center">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.state==='待发货'"
            @click="handleOperate(scope.row.order_id,scope.row.order_no,scope.row.express_company,scope.row.express_no)"
            type="text">
            发货
          </el-button>
          <el-button
            v-if="scope.row.state==='待签收' || scope.row.state==='已签收'"
            @click="showExpress(scope.row.order_id)"
            type="text">
            物流
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
    background
    layout="sizes, prev, pager, next"
    :page-sizes="pagination.pageSizes"
    :total="pagination.total"
    :page-size="pagination.pageSize"
    :current-page.sync="pagination.page"
    @current-change="changePage"
    @size-change="changeSize">
    </el-pagination>

    <el-dialog id="deliveryDialog" width="400px" :visible.sync="deliveryDialogVisible">
      <div>
        <el-form label-width="100px" label-position="left">
          <el-form-item label="快递公司">
            <el-select v-model="selectedExpressCompany" placeholder="请选择">
              <el-option
                v-for="item in computed_express_options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="快递单号">
            <el-input v-model="selectedExpressNo" type="number"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deliveryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDelivery">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog id="expressDialog" width="600px" :visible.sync="expressDialogVisible">
      <div v-if="expressInfo">
        <p>物流公司：{{expressInfo.express_company}}</p>
        <p>物流单号：{{expressInfo.express_no}}</p>
        <div v-if="expressInfo.express_traces.length">
          <p>物流信息：</p>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in expressInfo.express_traces"
              :key="index"
              :timestamp="item.AcceptStation">
              {{item.AcceptTime}}
            </el-timeline-item>
          </el-timeline>
        </div>
        <p v-else>暂无物流信息</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="expressDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getOrderList, getOrderInfo, saveOrderInfo, getOrderExport, getExpressCompany, sendExpress} from '@/api';
import {appId, exportXLSX, getStamp} from '@/utils';

const tableHeadName = {
  receive_by: '收件人',
  mobile: '收件人手机号码',
  province: '省份',
  city: '城市',
  area: '区县',
  address: '详细地址',
  express_company: '快递公司名称',
  express_no: '快递单号',
  order_no: '订单编号',
  trade_no: '交易流水号',
  vip_no: '会员编号',
  package_info: '订单信息',
  total_fee: '订单金额',
  is_pay: '支付状态',
  state: '订单状态',
  buyer_msg: '买家留言',
  order_time: '下单时间',
  member_name: '会员姓名',
  pay_time: '支付时间'
};

export default {
  data () {
    return {
      tableHeight: document.getElementById(appId).clientHeight - 120 - 50 - 50,
      deliveryDialogVisible: false,
      expressDialogVisible: false,
      expressInfo: null,
      selectedOrderId: '',
      selectedOrderNo: '',
      selectedExpressCompany: '',
      selectedExpressNo: '',
      express_options: [],
      list: [],
      pagination: {
        total: 0,
        pageSizes: [20, 50, 100, 200],
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
      updateExclude: ['create_by','create_time','member_id','modify_by','modify_time','order_no','trade_no','vip_no','total_fee','is_pay','state','pay_time','buyer_msg', 'is_subscribe_push', 'subscribe_time', 'express_traces', 'confirm_receipt_time', 'confirm_receipt_by', 'package_info']
    }
  },
  computed: {
    pageIndex() {
      return this.pagination.page - 1;
    },
    computed_express_options() {
      return this.express_options.map(item => {
        return {
          value: item,
          label: item
        }
      });
    }
  },
  created() {
    this.getExpressCompany();
    this.getOrderList();
  },
  methods: {
    getExpressCompany() {
      this.$setLoadingTarget(document.body);
      getExpressCompany().then(data => {
        this.express_options = ['中通速递', '韵达快递'].concat(data.data.filter(i => i !== '中通速递' && i !== '韵达快递'));
      });
    },
    getOrderList() {
      this.$setLoadingTarget(document.body);
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
    changeSize(size) {
      this.pagination.pageSize = size;
      this.resetTable();
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
    },
    search() {
      this.resetTable();
    },
    resetTable() {
      this.pagination.total = 0;
      this.pagination.page = 1;
      this.list = [];
      this.getOrderList();
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
    handleOperate(order_id, order_no, express_company, express_no) {
      this.selectedOrderId = order_id;
      this.selectedOrderNo = order_no;
      this.selectedExpressCompany = express_company;
      this.selectedExpressNo = express_no;
      this.deliveryDialogVisible = true;
    },
    confirmDelivery() {
      this.$setLoadingTarget('#deliveryDialog .el-dialog');
      sendExpress({
        express_company: this.selectedExpressCompany,
        express_no: this.selectedExpressNo,
        order_id: this.selectedOrderId,
        order_no: this.selectedOrderNo
      }).then(data => {
        if (data.code === 1) {
          const row = this.list[this.pageIndex].find(item => item.order_id === this.selectedOrderId);
          if (row instanceof Object) {
            row.state = '待签收';
            row.express_company = this.selectedExpressCompany;
            row.express_no = this.selectedExpressNo;
            row.detail.state = '待签收';
            row.detail.express_company = this.selectedExpressCompany;
            row.detail.express_no = this.selectedExpressNo;
          }
          this.deliveryDialogVisible = false;
          this.$message({
            message: '发货成功'
          });
        } else {
          this.$message({
            message: data.msg,
            type: 'error'
          })
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
    showExpress(order_id) {
      this.expressDialogVisible = true;
      this.$setLoadingTarget('#expressDialog')
      getOrderInfo({
        order_id
      }).then(data => {
        if (data.code === 1) {
          this.expressInfo = data.data;
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
    },
    exportData() {
      this.$setLoadingTarget('#nodeOrderTable');
      getOrderExport({
        keyword: this.keyword,
        is_pay: this.selectedPayState,
        state: this.selectedOrderState
      }).then(data => {
        if (data.code === 1) {
          if (data.data.length === 0) {
            this.$message({
              type: 'error',
              message: '没有可以导出的数据'
            });
            return false;
          }

          const filedata = data.data.map(item => {
            const newItem = Object.create(null);
            for (let i in item) {
              const key = tableHeadName[i];
              if (i === 'package_info') {
                let package_info_data = '';
                item[i].forEach(x => {
                  let product_info_data = '';
                  x.product_list.forEach(y => {
                    product_info_data += `${y.product_name}*${y.qty} `;
                  });

                  package_info_data += `${x.package_name}（${product_info_data}）；`;
                });

                newItem[key] = package_info_data;
              } else {
                if (key !== undefined) {
                  newItem[key] = item[i];
                } else {
                  newItem[i] = item[i];
                }
              }
            }
            return newItem;
          });

          exportXLSX({
            filename: `订单${getStamp()}`,
            filedata: JSON.parse(JSON.stringify(filedata))
          });
        } else {
          this.$message({
            type: 'error',
            message: data.msg
          });
        }
      });
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
  .rightButton {
    float: right;
    margin-left: 20px;
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

.el-form--inline {
  /deep/ .el-form-item__content {
    width: 200px;
  }
}

.el-dialog .el-select {
  width: 100%;
}

.el-timeline {
  padding-inline-start: 10px;
  margin-top: 20px;
  /deep/ .el-timeline-item__timestamp {
    line-height: 1.4;
  }
}

#expressDialog {
  /deep/ .el-dialog__body {
    max-height: 40vh;
    overflow: auto;
  }
}

.package_inner {
  display: flex;
  .package_left {
    flex: none;
  }
  .package_right {
    flex: auto;
    .product_inner {
      display: flex;
      align-items: center;
      .product_left {
        flex: auto;
      }
      .product_right {
        padding-left: 20px;
        text-align: right;
        flex: none;
      }
    }
  }
  & + .package_inner {
    margin-top: 10px;
  }
}
</style>
