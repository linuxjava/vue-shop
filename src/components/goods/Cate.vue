<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }" @click.native="backHome">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>


      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <tree-table class="treeTable" :data="cateList" :columns="columns" :show-index="true" :selection-type="false" border
                  :expand-type="false"
                  index-text="#" :show-row-hover="false">
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>

        <!--      size=必须设置为mini，否则会导致垂直边框线无法对齐-->
        <template slot="sort" slot-scope="scope">
          <el-tag type="success" v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="warning" v-else-if="scope.row.cat_level === 1" size="mini">二级</el-tag>
          <el-tag type="danger" v-else size="mini">三级</el-tag>
        </template>

        <template slot="opts" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" round
                     @click="showEditDialog(scope.row)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" round
                     @click="showDeleteDialog(scope.row)"></el-button>
        </template>
      </tree-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalpage"
      ></el-pagination>

      <!--添加分类-->
      <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" :close-on-click-modal="false"
                 @close="addCateDialogClosed">
        <el-form ref="addCateFormRef" :model="addCateForm" label-width="80px" :rules="addCateRules">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <div class="block">
              <el-cascader
                v-model="selectedParentCate"
                :options="parentCateList"
                :props="props"
                @change="handleCascaderChange" clearable></el-cascader>
            </div>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmAddCate">确 定</el-button>
        </span>
      </el-dialog>

      <!--修改分类-->
      <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%" :close-on-click-modal="false"
                 @close="editCateDialogClosed">
        <el-form ref="editRoleFormRef" :model="editCateForm" label-width="80px" :rules="addCateRules">
          <el-form-item label="分类ID">
            <el-input v-model="editCateForm.id" disabled></el-input>
          </el-form-item>
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmEditCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getCates()
  },
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      cateList: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opts'
        }
      ],
      // 分页相关数据
      totalpage: 0,
      // 添加分类相关数据
      addCateDialogVisible: false,
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addCateRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 级联选择器商品分类数据
      parentCateList: {},
      // 当前选择的商品分类
      selectedParentCate: [],
      props: {
        // 允许选择任意一级选项
        checkStrictly: true,
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 修改分类相关数据
      editCateDialogVisible: false,
      editCateForm: {
        id: -1,
        cat_name: ''
      }
    }
  },
  methods: {
    // 获取分类信息相关方法
    async getCates() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.totalpage = res.data.total
      this.cateList = res.data.result
    },
    // 分页相关方法
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getCates()
    },
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getCates()
    },
    // 添加分类相关方法
    async showAddCateDialog() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }

      this.parentCateList = res.data
      this.addCateDialogVisible = true
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.parentCateList = {}
      this.selectedParentCate = []
    },
    async confirmAddCate() {
      const { data: res } = await this.$http.post('categories', this.addCateForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加分类失败')
      }
      this.getCates()
      this.$message.success('添加分类成功')
      this.addCateDialogVisible = false
    },
    handleCascaderChange() {
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedParentCate.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedParentCate[this.selectedParentCate.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedParentCate.length
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 删除商品分类相关方法
    async showDeleteDialog(row) {
      const confirmResult = await this.$confirm('此操作将永久删除商品分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return
      }

      const { data: res } = await this.$http.delete(`categories/${row.cat_id}`, { id: row.cat_id })
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品分类失败')
      }

      this.getCates()
      return this.$message.error('删除商品分类成功')
    },
    // 修改分类相关方法
    showEditDialog(row) {
      this.editCateForm.id = row.cat_id
      this.editCateForm.cat_name = row.cat_name
      this.editCateDialogVisible = true
    },
    editCateDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    async confirmEditCate() {
      const { data: res } = await this.$http.put(`categories/${this.editCateForm.id}`, this.editCateForm)
      if (res.meta.status !== 200) {
        return this.$message.error('修改商品分类失败')
      }

      this.editCateForm.id = -1
      this.editCateForm.cat_name = ''
      this.getCates()
      this.$message.success('修改商品分类成功')
      this.editCateDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px !important;
}

.el-cascader {
  width: 100%;
}

.el-card {
  margin-bottom: 60px;
}
</style>
