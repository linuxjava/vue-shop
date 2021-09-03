<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }" @click.native="backHome">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon>
      </el-alert>

      <el-row class="row-cascader">
        <span>选择商品分类：</span>
        <el-cascader
          v-model="selectedCate"
          :options="cateList"
          :props="props"
          @change="handleCascaderChange" clearable></el-cascader>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="tabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isDisableBtn" @click="showAddDialog">添加参数</el-button>

          <el-table border stripe style="width: 100%" :data="dynamicData">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" size="medium" closable
                        @close="deleteAttr(scope.row, index)">
                  {{ item }}
                </el-tag>

                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInputRef"
                  size="medium"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作" width="320px">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" round @click="showEditDialog(scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" round @click="deleteParam(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isDisableBtn" @click="showAddDialog">添加属性</el-button>

          <el-table border stripe style="width: 100%" :data="staticData">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" size="medium" closable
                        @close="deleteAttr(scope.row, index)">
                  {{ item }}
                </el-tag>

                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInputRef"
                  size="medium"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作" width="320px">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" round @click="showEditDialog(scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" round @click="deleteParam(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!--添加参数-->
      <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible"
                 width="50%" :close-on-click-modal="false"
                 @close="addDialogClosed">
        <el-form ref="addDynamicFormRef" :model="addParamForm" label-width="80px" :rules="addRules">
          <el-form-item :label="titleText" prop="addParamName">
            <el-input v-model="addParamForm.addParamName"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmAdd">确 定</el-button>
        </span>
      </el-dialog>

      <!--修改参数-->
      <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible"
                 width="50%" :close-on-click-modal="false"
                 @close="editDialogClosed">
        <el-form ref="editFormRef" :model="editParamForm" label-width="80px" :rules="editRules">
          <el-form-item :label="titleText" prop="editParamName">
            <el-input v-model="editParamForm.editParamName"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmEdit">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 级联选择器商品分类数据
      cateList: [],
      // 当前选择的商品分类
      selectedCate: [],
      props: {
        // 只允许选择最后一级
        checkStrictly: false,
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 当前选中的tab
      activeName: 'many',
      // 动态参数
      dynamicData: [],
      // 静态属性
      staticData: [],
      // 添加参数相关数据
      addDialogVisible: false,
      addParamForm: {
        addParamName: ''
      },
      addRules: {
        addParamName: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      // 编辑参数相关数据
      editDialogVisible: false,
      editParamForm: {
        editParamName: ''
      },
      editRules: {
        editParamName: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getCates()
  },
  methods: {
    // 获取商品分类
    async getCates() {
      const { data: res } = await this.$http.get('categories', { type: 3 })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    handleCascaderChange() {
      this.getParamInfo()
    },
    // 点击切换tab
    tabClick() {
      this.getParamInfo()
    },
    // 获取参数信息
    async getParamInfo() {
      // 未选择分类直接返回
      if (this.selectedCate.length !== 3) {
        return
      }

      const id = this.selectedCate[2]
      const { data: res } = await this.$http.get(`categories/${id}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }

      // 将字符串数据解析为数组
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.dynamicData = res.data
      } else {
        this.staticData = res.data
      }
    },
    // 添加属性tag相关
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }

      // 将数据添加到数组中
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      this.saveAttrVal(row)
    },
    showInput(row) {
      row.inputVisible = true
      // 自动获取焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInputRef.$refs.input.focus()
      })
    },
    async saveAttrVal(row) {
      const id = this.selectedCate[2]
      // 保存添加的参数
      const { data: res } = await this.$http.put(`categories/${id}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新参数失败')
      }

      return this.$message.success('更新参数成功')
    },
    deleteAttr(row, index) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVal(row)
    },
    // 添加参数相关方法
    showAddDialog() {
      this.addDialogVisible = true
    },
    addDialogClosed() {
      this.$refs.addDynamicFormRef.resetFields()
      this.addParamForm.addParamName = ''
    },
    confirmAdd() {
      this.$refs.addDynamicFormRef.validate(async valid => {
        if (!valid) {
          return
        }

        const id = this.selectedCate[2]
        const { data: res } = await this.$http.post(`categories/${id}/attributes`, {
          attr_name: this.addParamForm.addParamName,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 201) {
          return this.$message.error('添加参数错误')
        }

        this.getParamInfo()
        this.addDialogVisible = false
        return this.$message.success('添加参数成功')
      })
    },
    // 删除参数
    async deleteParam(row) {
      const confirmResult = await this.$confirm('此操作将永久删除商品参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return
      }

      console.log(row)
      const id = this.selectedCate[2]
      const { data: res } = await this.$http.delete(`categories/${id}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }

      this.getParamInfo()
      return this.$message.success('删除参数成功')
    },
    // 编辑参数相关方法
    showEditDialog(row) {
      this.editDialogVisible = true
      this.editParamForm.editParamName = row.attr_name
      this.editParamForm.attr_id = row.attr_id
      this.editParamForm.attr_sel = row.attr_sel
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
      this.editParamForm.editParamName = ''
    },
    confirmEdit() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }

        const id = this.selectedCate[2]
        const { data: res } = await this.$http.put(`categories/${id}/attributes/${this.editParamForm.attr_id}`, {
          attr_name: this.editParamForm.editParamName,
          attr_sel: this.editParamForm.attr_sel
        })

        if (res.meta.status !== 200) {
          return this.$message.error('修改参数错误')
        }

        this.getParamInfo()
        this.editDialogVisible = false
        return this.$message.success('修改参数成功')
      })
    }
  },
  computed: {
    isDisableBtn() {
      return !(this.selectedCate.length > 0)
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-bottom: 60px;
}

.row-cascader {
  margin-top: 15px;
}

.el-cascader {
  width: 300px;
}

.el-tabs {
  margin-top: 20px;
}

.el-tag {
  margin-right: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
