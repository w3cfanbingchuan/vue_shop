<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" :closable="false" center type="info" show-icon></el-alert>
      <el-steps :space="200" align-center :active="activeIndex-0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        label-position="top"
        :model="addForm"
        :rules="rules"
        ref="addForm"
        label-width="100px"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                v-model="addForm.goods_cat"
                :options="categoryList"
                :props="cateProps"
                @change="changeGoodsCat"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in goodsCat" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  v-for="(items,index) in item.attr_vals"
                  :key="index"
                  :label="items"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item,index) in onlyGoodsCat" :key="index">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="https://www.liulongbin.top:8888/api/private/v1/upload"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
              :on-remove="handleRemove"
              :on-preview="handlePreview"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4 ">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="dialogVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      categoryList: [],
      // 商品参数
      goodsCat: [],
      // 商品属性
      onlyGoodsCat: [],
      previewPath: '',
      dialogVisible: false,
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      rules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    // 获取分类列表
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories')
      this.categoryList = res.data
    },
    changeGoodsCat() {
      console.log(this.addForm.goods_cat)
    },
    // 换左菜单之前运行的函数
    beforeLeave(activeName, oldActiveName) {
      var test
      this.$refs.addForm.validate(vaild => {
        test = vaild
        return vaild
      })
      if (oldActiveName === '0' && !test) {
        return false
      }
    },
    // 点击左菜单
    async tabClick() {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.addForm.goods_cat[2]}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.goodsCat = res.data
        console.log(this.goodsCat)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.addForm.goods_cat[2]}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        this.onlyGoodsCat = res.data
      }
    },
    // 上传图片成功操作
    handleSuccess(res) {
      const picInfo = {
        pic: res.data.tmp_path
      }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 处理移除图片操作
    handleRemove(file) {
      console.log(file.response.data.tmp_path)
      const i = this.addForm.pics.findIndex(
        x => x.pics === file.response.data.tmp_path
      )
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 图片预览
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.dialogVisible = true
    },
    async add() {
      console.log(this.goodsCat)
      console.log(this.onlyGoodsCat)

      const form = _.cloneDeep(this.addForm)
      form.goods_cat = this.addForm.goods_cat.join(',')
      // 商品属性
      this.onlyGoodsCat.forEach(item => {
        const newCat = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        form.attrs.push(newCat)
      })
      // 商品参数
      this.goodsCat.forEach(item => {
        const newCat = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        form.attrs.push(newCat)
      })
      const { data: res } = await this.$http.post('goods', form)
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg)
      }
      this.$router.push('/goods')
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0px 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
</style>
