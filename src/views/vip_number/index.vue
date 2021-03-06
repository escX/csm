<template>
  <div id="nodeVipNumberTable">
    <div id="tableHeader">
      <el-button-group class="rightButton">
        <el-button type="primary" @click="genrateNumber">生成会员编号</el-button>
        <el-button type="primary" @click="publishDialogVisible = true">批量发布 / 取消发布</el-button>
      </el-button-group>
      <el-input v-model.trim="keyword" placeholder="输入关键字搜索" clearable @keyup.enter.native="search" @clear="search" prefix-icon="el-icon-search"></el-input>
    </div>
    <el-table border stripe ref="filterTable" :data="list[pageIndex]" :height="tableHeight" @filter-change="handleFilter">
      <el-table-column prop="vip_no" label="会员编号" width="100" align="center"></el-table-column>
      <el-table-column prop="state" label="状态" width="100" align="center" :filters="state" :filter-multiple="false" column-key="state">
        <template slot-scope="scope">
          <el-tag size="mini" :type="state.find(i=>i.value===scope.row.state).tagType">
            {{scope.row.state}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="book_user" label="预订者" width="170" align="center"></el-table-column>
      <el-table-column prop="book_time" label="预订时间" align="center"></el-table-column>
      <el-table-column prop="purchase_user" label="购买者" width="170" align="center"></el-table-column>
      <el-table-column prop="is_publish" label="发布状态" width="100" align="center" :filters="publishState" :filter-multiple="false" column-key="is_publish">
        <template slot-scope="scope">
          <el-tag size="mini" :type="publishState.find(i=>i.value===scope.row.is_publish).tagType">
            {{publishState.find(i=>i.value===scope.row.is_publish).text}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="publish_time" label="发布时间" align="center"></el-table-column>
      <el-table-column fixed="right" label="操作" width="100" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.state==='待申请'">
            <el-button v-if="scope.row.is_publish==0" @click="handlePublish('1',scope.row.vip_no)" type="text">发布</el-button>
            <el-button v-else @click="handlePublish('0',scope.row.vip_no)" type="text">取消发布</el-button>
          </div>
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

    <el-dialog id="genrateDialog" width="400px" title="生成会员编号" :visible.sync="genrateDialogVisible">
      <div>
        <p style="margin-top:0;margin-bottom:20px;">当前最新的会员编号：{{lastestNumber}}</p>
        <el-form label-width="100px" label-position="left">
          <el-form-item label="生成编号数量">
            <el-input v-model="numberCount" type="number"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="genrateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmGenrate">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog id="publishDialog" width="400px" title="批量发布 / 取消发布" :visible.sync="publishDialogVisible">
      <div>
        <p style="margin-top:0;margin-bottom:20px;">请输入批量发布的起止编号，最多500条</p>
        <el-form label-width="100px" label-position="left">
          <el-form-item label="起始编号">
            <el-input v-model="begin_no" type="number"></el-input>
          </el-form-item>
          <el-form-item label="结束编号">
            <el-input v-model="end_no" type="number"></el-input>
          </el-form-item>
          <el-form-item>
            <el-radio v-model="is_publish" label="1">发布</el-radio>
            <el-radio v-model="is_publish" label="0">取消发布</el-radio>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="publishDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmPublish">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getLastestVipNumber, getVipNumberList, genrateVipNumber, publishVipNumber} from '@/api';
import {appId} from '@/utils';

export default {
  data () {
    return {
      tableHeight: document.getElementById(appId).clientHeight - 120 - 50 - 50,
      list: [],
      pagination: {
        total: 0,
        pageSizes: [20, 50, 100, 200],
        pageSize: 20,
        page: 1
      },
      keyword: '',
      state: [
        {text:'待申请', value:'待申请', tagType:'warning'},
        {text:'已预订', value:'已预订', tagType:'info'},
        {text:'已售出', value:'已售出', tagType:'success'}
      ],
      publishState: [
        {text:'未发布', value:'0', tagType:'warning'},
        {text:'已发布', value:'1', tagType:'success'}
      ],
      selectedState: '',
      selectedPublishState: '',
      publishDialogVisible: false,
      genrateDialogVisible: false,
      numberCount: 100,
      lastestNumber: '',
      begin_no: '',
      end_no: '',
      is_publish: ''
    }
  },
  computed: {
    pageIndex() {
      return this.pagination.page - 1;
    }
  },
  created() {
    this.getVipNumberList();
  },
  methods: {
    getVipNumberList() {
      this.$setLoadingTarget('#nodeVipNumberTable');
      getVipNumberList({
        keyword: this.keyword,
        state: this.selectedState,
        is_publish: this.selectedPublishState,
        page: this.pagination.page,
        page_size: this.pagination.pageSize
      }).then(data => {
        if (data.code === 1) {
          this.list[this.pageIndex] = data.data.items;
          this.pagination.total = Number(data.data.total);
          this.$forceUpdate();
        }
      });
    },
    changePage() {
      if (this.list[this.pageIndex] === undefined) {
        this.getVipNumberList();
      }
    },
    changeSize(size) {
      this.pagination.pageSize = size;
      this.resetTable();
    },
    handleFilter(filters) {
      if (filters.state instanceof Array) {
        if (filters.state[0] !== undefined) {
          this.selectedState = filters.state[0];
        } else {
          this.selectedState = '';
        }
      }

      if (filters.is_publish instanceof Array) {
        if (filters.is_publish[0] !== undefined) {
          this.selectedPublishState = filters.is_publish[0];
        } else {
          this.selectedPublishState = '';
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
      this.getVipNumberList();
    },
    handlePublish(is_publish, vip_no) {
      this.$setLoadingTarget('#nodeVipNumberTable');
      publishVipNumber({
        is_publish,
        begin_no: vip_no,
        end_no: vip_no
      }).then(data => {
        if (data.code === 1) {
          this.$message({
            message: is_publish==1 ? '发布成功' : '取消发布成功',
            type: 'success'
          });
          this.getVipNumberList();
        } else {
          this.$message({
            message: data.msg,
            type: 'error'
          });
        }
      });
    },
    genrateNumber() {
      this.$setLoadingTarget('#nodeVipNumberTable');
      getLastestVipNumber().then(data => {
        if (data.code === 1) {
          this.lastestNumber = data.data;
          this.genrateDialogVisible = true;
        } else {
          this.$message({
            message: data.msg,
            type: 'error'
          })
        }
      })
    },
    confirmGenrate() {
      this.$setLoadingTarget('#genrateDialog .el-dialog');
      genrateVipNumber({
        total: this.numberCount
      }).then(data => {
        if (data.code === 1) {
          this.genrateDialogVisible = false;
          this.keyword = '';
          this.selectedState = '';
          this.selectedPublishState = '';
          this.$refs.filterTable.clearFilter();
          this.resetTable();
        } else {
          this.$message({
            message: data.msg,
            type: 'error'
          })
        }
      });
    },
    confirmPublish() {
      if (this.is_publish === '') {
        this.$message({
          message: '请选择发布或者取消发布',
          type: 'error'
        });
        return false;
      }
      this.$setLoadingTarget('#publishDialog .el-dialog');
      publishVipNumber({
        is_publish: this.is_publish,
        begin_no: this.begin_no,
        end_no: this.end_no
      }).then(data => {
        if (data.code === 1) {
          this.$message({
            message: this.is_publish==1 ? '批量发布成功' : '批量取消发布成功',
            type: 'success'
          });
          this.publishDialogVisible = false;
          this.keyword = '';
          this.selectedState = '';
          this.selectedPublishState = '';
          this.$refs.filterTable.clearFilter();
          this.resetTable();
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

.el-pagination {
  text-align: center;
  margin-top: 18px;
}
</style>
