<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <div>
        <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>

        <el-table border stripe style="width: 100%" :data="roles">
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
                      v-for="(item1, index1) in scope.row.children" :key="item1.id">
                <el-col :span="5">
                  <el-tag closable :disable-transitions="false" @close="deleteAuth(scope.row, item1.id)">
                    {{ item1.authName }}
                  </el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <el-row :class="index2 === 0 ? '' : 'bdtop'" v-for="(item2, index2) in item1.children"
                          :key="item2.id">
                    <el-col :span="6" style="display: flex; align-items: center">
                      <el-tag closable :disable-transitions="false" type="success"
                              @close="deleteAuth(scope.row, item2.id)">
                        {{ item2.authName }}
                      </el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag closable :disable-transitions="false" v-for="(item3, index3) in item2.children"
                              :key="item3.id" type="warning" @close="deleteAuth(scope.row, item3.id)">
                        {{ item3.authName }}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="roleName" label="角色名称"></el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
          <el-table-column label="操作" width="320px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" round @click="showEditRoleDialog(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" round @click="showDeleteRoleDialog(scope.row)">
                删除
              </el-button>
              <el-button type="warning" icon="el-icon-setting" size="mini" round @click="showAddAuthDialog(scope.row)">
                分配权限
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!--分配权限-->
    <el-dialog title="分配权限" :visible.sync="addAuthDialogVisible" width="50%" @close="closeAddAuthDialog">
      <el-tree ref="treeRef" :props="treeProps" :data="auths" show-checkbox default-expand-all node-key="id"
               :default-checked-keys="checkedKeys">
      </el-tree>
      <span slot="footer">
        <el-button @click="addAuthDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAuth()">确 定</el-button>
      </span>
    </el-dialog>

    <!--添加角色-->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" :close-on-click-modal="false"
               @close="addRoleDialogClosed">
      <el-form ref="addRoleForm" :model="addRoleForm" label-width="80px" :rules="addRoleRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmAddRole">确 定</el-button>
        </span>
    </el-dialog>

    <!--修改角色-->
    <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="50%" :close-on-click-modal="false"
               @close="editRoleDialogClosed">
      <el-form ref="editRoleForm" :model="editRoleForm" label-width="80px" :rules="editRoleRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmEditRole">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getAllRoles()
  },
  data() {
    return {
      roles: [],
      addAuthDialogVisible: false,
      // tree数据映射
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 点击按钮分配权限时获取的权限数据
      auths: [],
      // 选中数据
      checkedKeys: [],
      // 当前分配权限的角色id
      roleId: '',
      addRoleDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          }
        ]
      },
      editRoleDialogVisible: false,
      editRoleForm: {},
      editRoleRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    async getAllRoles() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表失败')
        return
      }
      console.log(res)
      this.roles = res.data
    },
    async deleteAuth(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return
      }

      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`, {
        roleId: role.id,
        rightId: rightId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败!')
      }

      role.children = res.data
    },
    // 显示分配权限对话框
    async showAddAuthDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree', { type: 'tree' })
      if (res.meta.status !== 200) {
        this.$message.error('获取权限列表失败')
        return
      }
      this.auths = res.data
      this.getAllCheckedAuth(role)
      this.addAuthDialogVisible = true
    },
    // 获取角色下所有已选中的权限
    getAllCheckedAuth(node) {
      if (!node.children) {
        this.checkedKeys.push(node.id)
        return
      }

      node.children.forEach(item => this.getAllCheckedAuth(item))
    },
    // 关闭添加权限对话框
    closeAddAuthDialog() {
      // 关闭权限对话框时清空绑定的数据
      this.checkedKeys = []
    },
    // 确定分配权限
    async addAuth() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const keyStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        roleId: this.roleId,
        rids: keyStr
      })
      if (res.meta.status !== 200) {
        this.$message.error('分配权限失败')
        return
      }
      this.getAllRoles()
      this.addAuthDialogVisible = false
      this.$message.success('分配权限成功')
    },
    // 删除角色
    async showDeleteRoleDialog(role) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return
      }

      const { data: res } = await this.$http.delete(`roles/${role.id}`, { id: role.id })
      if (res.meta.status !== 200) {
        this.$message.error('删除角色失败')
        return
      }

      this.getAllRoles()
      this.$message.success('删除角色成功')
    },
    showAddRoleDialog() {
      this.addRoleDialogVisible = true
    },
    // 添加角色dialog关闭
    addRoleDialogClosed() {
      this.$refs.addRoleForm.resetFields()
    },
    // 确定添加角色
    confirmAddRole() {
      this.$refs.addRoleForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败')
          return
        }

        this.getAllRoles()
        this.$message.error('添加角色成功')
        this.addRoleDialogVisible = false
      })
    },
    async showEditRoleDialog(role) {
      const { data: res } = await this.$http.get(`roles/${role.id}`, { id: role.id })
      if (res.meta.status !== 200) {
        this.$message.error('获取角色信息失败')
        return
      }
      this.editRoleDialogVisible = true
      this.editRoleForm = res.data
    },
    editRoleDialogClosed() {
      this.$refs.editRoleForm.resetFields()
      this.editRoleForm = {}
      this.editRoleDialogVisible = false
    },
    async confirmEditRole() {
      const { data: res } = await this.$http.put(`roles/${this.editRoleForm.roleId}`, {
        id: this.editRoleForm.roleId,
        roleName: this.editRoleForm.roleName,
        roleDesc: this.editRoleForm.roleDesc
      })

      if (res.meta.status !== 200) {
        this.$message.error('修改角色失败')
        return
      }

      this.editRoleDialogVisible = false
      this.getAllRoles()
      this.$message.success('修改角色成功')
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-bottom: 60px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.el-tag {
  margin: 7px;
  margin-left: 0;
}

.vcenter {
  display: flex;
  align-items: center;
}

.el-table__expanded-cell[class*=cell] {
  padding: 0 !important;
}
</style>


