<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoles">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['border_bottom',index === 0 ? 'border_top' : '']"
              v-for="(item,index) in scope.row.children"
              :key="item.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeById(scope.row,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二三级权限区域 -->
              <el-col :span="19">
                <el-row
                  :class="[index1 !== 0 ? 'border_top' : '']"
                  v-for="(item1,index1) in item.children"
                  :key="item1.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeById(scope.row,item1.id)"
                      type="success"
                    >{{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item2 in item1.children"
                      :key="item2.id"
                      closable
                      @close="removeById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button
              size="mini"
              @click="showRightAllList(scope.row)"
              type="warning"
              icon="el-icon-setting"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 权限对话框 -->
    <el-dialog title="配置权限列表" :visible.sync="dialogVisible" @close="resetDefaultKdy" width="50%">
      <el-tree
        :data="rightsAllList"
        show-checkbox
        ref="checkedTree"
        default-expand-all
        :default-checked-keys="defaultKey"
        node-key="id"
        :props="defaultProps"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="getCheckTreeList">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolesList: [],
      dialogVisible: false,
      rightsAllList: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      defaultKey: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取权限列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      this.rolesList = res.data
    },
    // 删除权限
    async removeById(role, rightId) {
      const confirmMes = await this.$confirm(
        '此操作将删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(result => result)
      if (confirmMes === 'confirm') {
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        this.$message.success('操作成功')
        role.children = res.data
      }
    },
    // 展开分配权限列表
    async showRightAllList(node) {
      this.roleId = node.id
      const { data: res } = await this.$http.get('rights/tree')
      this.getLeafKeys(node, this.defaultKey)
      this.dialogVisible = true
      this.rightsAllList = res.data
    },
    // 获取选中权限
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(element => {
        this.getLeafKeys(element, arr)
      })
    },
    // 重置选中的权限
    resetDefaultKdy() {
      this.defaultKey = []
    },
    // 提交选中权限console.log()
    async getCheckTreeList() {
      const checkedTreeArr = [
        ...this.$refs.checkedTree.getCheckedKeys(),
        ...this.$refs.checkedTree.getHalfCheckedKeys()
      ]
      await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: checkedTreeArr.join(',')
      })
      this.dialogVisible = false
      this.getRolesList()
    },
    // 添加角色
    async addRoles() {}
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.border_top {
  border-top: 1px solid #eeeeee;
}
.border_bottom {
  border-bottom: 1px solid #eeeeee;
}
</style>
