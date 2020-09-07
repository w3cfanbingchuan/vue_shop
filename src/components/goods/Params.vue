<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon></el-alert>
      <span>选择商品分类:</span>
      <el-cascader
        v-model="categoryArr"
        :options="categoryList"
        :props="cascaderProp"
        @change="handleChange"
      ></el-cascader>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="istrue"
            size="mini"
            @click="dialogVisible = true"
          >添加属性</el-button>
          <el-table :data="tableData" border style="width: 100%">
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="handleEdit(scope.row.attr_id)">修改</el-button>
                <el-button size="mini" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="istrue"
            size="mini"
            @click="dialogVisible = true"
          >添加参数</el-button>
          <el-table :data="tableData" border style="width: 100%">
            <el-table-column type="expand"></el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="handleEdit(scope.row.attr_id)">修改</el-button>
                <el-button size="mini" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog :title="'添加'+ diaTitle" :visible.sync="dialogVisible" width="50%" @close="removeTitle">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
        <el-form-item :label="diaTitle" prop="attr_name">
          <el-input v-model="ruleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数 -->
    <el-dialog :title="'修改'+ diaTitle" :visible.sync="editDialogVisible" width="50%" @close="resetForm">
      <el-form :model="editForm" :rules="editRules" ref="editForm">
        <el-form-item :label="diaTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      categoryList: [],
      categoryArr: [],
      activeName: 'only',
      tableData: [],
      dialogVisible: false,
      editDialogVisible: false,
      cascaderProp: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      ruleForm: {
        attr_name: '',
        attr_sel: ''
      },
      editForm: {},
      rules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    // 获取分类级联选择器内容
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories')
      this.categoryList = res.data
    },
    // 级联选择器触发选择事件
    handleChange() {
      if (this.categoryArr.length === 3) {
        this.getcateList()
        return
      }
      this.tableData = []
      this.categoryArr = []
    },
    handleClick() {
      this.getcateList()
    },
    // 获取参数/属性列表
    async getcateList() {
      if (this.categoryArr.length === 3) {
        const { data: res } = await this.$http.get(
          `categories/${this.categoryArr[2]}/attributes`,
          {
            params: {
              sel: this.activeName
            }
          }
        )
        this.tableData = res.data
      }
    },
    // 添加分类属性/参数
    async addCate() {
      const { data: res } = await this.$http.post(`categories/${this.categoryArr[2]}/attributes`, {
        attr_name: this.ruleForm.attr_name,
        attr_sel: this.activeName
      })
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.dialogVisible = false
      this.getcateList()
    },
    // 重置内容
    removeTitle() {
      this.ruleForm.attr_name = ''
    },
    // 编辑参数
    async handleEdit(id) {
      const { data: res } = await this.$http.get(`categories/${this.categoryArr[2]}/attributes/${id}`, {
        params: {
          sel: this.activeName
        }
      })
      this.editDialogVisible = true
      this.editForm = res.data
    },
    // 提交编辑
    async editCategory() {
      const { data: res } = await this.$http.put(`categories/${this.categoryArr[2]}/attributes/${this.editForm.attr_id}`, {
        attr_name: this.editForm.attr_name,
        attr_sel: this.activeName
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.editDialogVisible = false
      this.getcateList()
    },
    resetForm() {
      this.$refs.editForm.resetFields()
    }
  },
  computed: {
    istrue() {
      if (this.categoryArr.length === 3) {
        return false
      } else {
        return true
      }
    },
    diaTitle() {
      if (this.activeName === 'only') {
        return '静态属性'
      }
      return '动态参数'
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  margin-left: 15px;
}
.el-alert {
  margin-bottom: 15px;
}
</style>
