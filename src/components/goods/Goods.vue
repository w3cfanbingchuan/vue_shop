<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索栏 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="goodsInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoods">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表 -->
      <el-table :data="goodsList">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="goodsInfo.pagenum"
        :page-sizes="[1,3,5,10]"
        :page-size="goodsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      goodsList: [],
      goodsInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页显示的条数
        pagesize: 10
      },
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.goodsInfo
      })
      console.log(res.data)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(val) {
      this.goodsInfo.pagesize = val
      this.getGoodsList()
    },
    handleCurrentChange(val) {
      this.goodsInfo.pagenum = val
      this.getGoodsList()
    },
    goAddGoods() {
      this.$router.push('./addGoods')
    }
  }
}
</script>
<style lang="less" scoped>
</style>
