<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索栏 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input placeholder="请输入内容" clearable>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" style="width: 100%" border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="90"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款" width="90">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.order_pay == 1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="90"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editAddress"></el-button>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-location"
              title="物流信息"
              @click="showMessage(scope.row.order_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="orderQuery.pagenum"
        :page-sizes="[3,5,10]"
        :page-size="orderQuery.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog title="修改地址" :visible.sync="editVisible" width="50%" @close="resetDialog">
      <el-form :model="addressForm" :rules="addressRules" ref="addressForm" label-width="100px">
        <el-form-item label="省市区/县" prop="address">
          <el-cascader v-model="addressForm.address" filterable :options="cityData"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="area">
          <el-input v-model="addressForm.area" placeholder="请输入详细地址"></el-input>
        </el-form-item>
        <el-alert title="没接口" type="warning" :closable="false"></el-alert>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流信息 -->
    <el-dialog title="物流信息" :visible.sync="messageVisible" width="50%">
      <el-steps direction="vertical" :active="3">
        <el-step
          v-for="(activity, index) in messageList"
          space="100%"
          :title="activity.time"
          :key="index"
          :description="activity.context"
        ></el-step>
      </el-steps>
    </el-dialog>
  </div>
</template>
<script>
import cityData from '@/assets/js/citydata.js'
export default {
  data() {
    return {
      orderList: [],
      editVisible: false,
      messageVisible: false,
      orderQuery: {
        query: '',
        // 每页显示条数
        pagesize: 3,
        // 页码
        pagenum: 1
      },
      active: 1,
      total: 0,
      cityData,
      addressForm: {
        address: [],
        area: ''
      },
      addressRules: {
        address: [{ required: true, message: '请选择地址', trigger: 'blur' }],
        area: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      messageList: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.orderQuery
      })
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    editAddress() {
      this.editVisible = true
    },
    resetDialog() {
      this.$refs.addressForm.resetFields()
    },
    async showMessage(id) {
      const { data: res } = await this.$http.get(`/kuaidi/${11069757126 + id}`)
      this.messageList = res.data
      this.messageVisible = true
    },
    handleCurrentChange(val) {
      this.orderQuery.pagenum = val
      this.getOrderList()
    },
    handleSizeChange(val) {
      this.orderQuery.pagesize = val
      this.getOrderList()
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 300px;
}
</style>
