<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="getCategoryList">添加分类</el-button>
      <tree-table
        :data="categorieaList"
        :columns="columns"
        show-index
        border
        :selection-type="false"
        :expand-type="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="!scope.row.cat_deleted"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-if="scope.row.cat_level === 1" type="success" size="mini">二级</el-tag>
          <el-tag v-if="scope.row.cat_level === 2" type="warning" size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operate">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="cateInfo.pagenum"
        :page-sizes="[1,5,10]"
        :page-size="cateInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类 -->
    <el-dialog title="添加分类添加分类" @close="closeDialog" :visible.sync="dialogVisible" width="50%">
      <el-form label-width="80px" :model="ruleForm" :rules="rules" ref="ruleForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="ruleForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="分类名称">
          <el-cascader
            @change="changeCate"
            v-model="addCategoary"
            clearable
            :props="categoaryOpt"
            :options="categoryList"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      categoryList: [],
      dialogVisible: false,
      total: 0,
      ruleForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCategoary: [],
      categoaryOpt: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      columns: [
        {
          prop: 'cat_name',
          label: '分类名称'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          prop: 'cat_level',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate'
        }
      ],
      categorieaList: []
    }
  },
  created() {
    this.getCategorary()
  },
  methods: {
    // 获取分类列表
    async getCategorary() {
      const { data: res } = await this.$http.get('categories', {
        params: this.cateInfo
      })
      this.categorieaList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(val) {
      this.cateInfo.pagesize = val
      this.getCategorary()
    },
    handleCurrentChange(val) {
      this.cateInfo.pagenum = val
      this.getCategorary()
    },
    // 获取二级分类列表
    async getCategoryList() {
      this.dialogVisible = true
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      this.categoryList = res.data
    },
    // 父级分类选择产生变化
    changeCate(arr) {
      if (arr.length > 0) {
        this.ruleForm.cat_level = arr.length
        this.ruleForm.cat_pid = arr[arr.length - 1]
        return
      }
      this.ruleForm.cat_level = 0
      this.ruleForm.cat_pid = 0
    },
    // 添加分类
    addCategory() {
      this.$refs.ruleForm.validate(async vaild => {
        if (vaild) {
          await this.$http.post('categories', this.ruleForm)
          this.dialogVisible = false
          this.getCategorary()
        }
      })
    },
    closeDialog() {
      this.$refs.ruleForm.resetFields()
      this.ruleForm.cat_level = 0
      this.ruleForm.cat_pid = 0
      this.addCategoary = []
    }
  }
}
</script>
<style lang="less" scoped>
.el-icon-success {
  color: rgb(32, 178, 170);
}
.zk-table {
  margin-top: 20px;
}
</style>
