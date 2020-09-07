<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="手机号"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="editRow(scope.row.id)"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRow(scope.row.id)"
            ></el-button>
            <el-tooltip content="分配角色" placement="top">
              <el-button
                @click="showRowList(scope.row)"
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
      <el-form ref="addRef" label-width="80px" :model="addForm" :rules="addRules">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item prop="mobile" label="手机号">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户 -->
    <el-dialog title="编辑用户" :visible.sync="editDialog" width="50%">
      <el-form
        ref="editRef"
        label-width="80px"
        :model="editForm"
        :rules="addRules"
        @close="closeEdit"
      >
        <el-form-item prop="username" label="用户名">
          <el-input v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="mobile" label="手机号">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="subEditForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="userRowVisible" width="50%">
      <p>当前用户：{{userRowList.username}}</p>
      <p>当前角色：{{userRowList.role_name}}</p>
      <p>
        分配新角色：
        <el-select v-model="selectRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userRowVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 验证邮箱
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法邮箱'))
    }
    // 验证手机号
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[3456789]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法手机号'))
    }
    return {
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页显示的条数
        pagesize: 10
      },
      userList: [],
      total: 0,
      dialogVisible: false,
      addForm: {
        username: '',
        password: '',
        mobile: '',
        email: ''
      },
      editForm: {
        username: '',
        password: '',
        mobile: '',
        email: ''
      },
      addRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 4, max: 15, message: '长度在 4 到 15 个字符', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ]
      },
      editDialog: false,
      userRowVisible: false,
      userRowList: {},
      rolesList: [],
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // pagesize 改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // pagenum 改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听状态
    async changeState(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}/`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新失败')
      }
      this.$message.success('更新成功')
    },
    // 对话框关闭
    addDialogClosed() {
      this.$refs.addRef.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('/users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.dialogVisible = false
        this.getUserList()
      })
    },
    // 编辑用户
    async editRow(id) {
      const { data: res } = await this.$http.get('users/' + id)
      this.editDialog = true
      if (res.meta.status !== 200) {
        this.$message.error('查询失败')
      }
      this.editForm = res.data
    },
    // 重置编辑表单
    closeEdit() {
      this.$refs.editRef.resetFields()
    },
    // 提交编辑数据
    subEditForm() {
      this.$refs.editRef.validate(async validate => {
        this.editDialog = false
        await this.$http.put('users/' + this.editForm.id, this.editForm)
        this.closeEdit()
        this.getUserList()
      })
    },
    // 删除用户
    async deleteRow(id) {
      const confirmMes = await this.$confirm(
        '此操作将删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(result => result)
      console.log(confirmMes)
      if (confirmMes === 'confirm') {
        await this.$http.delete('users/' + id)
        this.$message.success('操作成功')
        this.getUserList()
      }
    },
    // 角色分配
    async showRowList(userRow) {
      this.userRowList = userRow
      const { data: res } = await this.$http.get('roles')
      this.rolesList = res.data
      this.userRowVisible = true
    },
    async saveRole() {
      if (!this.selectRoleId) {
        this.$message.error('请选择要分配的角色')
      }
      await this.$http.put(`users/${this.userRowList.id}/role`, {
        rid: this.selectRoleId
      })
      this.userRowVisible = false
      this.getUserList()
    }
  }
}
</script>
<style lang="less" scoped>
</style>
