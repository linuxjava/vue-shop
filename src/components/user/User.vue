<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }" @click.native="backHome">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="userQuery.query" clearable @clear="getUsers">
            <el-button slot="append" icon="el-icon-search" @click="getUsers"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addUser">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" round
                         @click="clickEditUser(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" round
                         @click="clickDelUser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" round
                         @click="showAllotAuthDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userQuery.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="userQuery.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalpage"
      ></el-pagination>

      <!--      添加用户-->
      <el-dialog title="添加用户" :visible.sync="addUserDialogVisible" width="50%" :close-on-click-modal="false"
                 @close="addDialogClosed">
        <el-form ref="addUserForm" :model="addUserForm" label-width="80px" class="addUserForm" :rules="addUserRules">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUserForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addUserDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmAddUser">确 定</el-button>
        </span>
      </el-dialog>

      <!--      编辑用户-->
      <el-dialog title="编辑用户" :visible.sync="editUserDialogVisible" width="50%" :close-on-click-modal="false"
                 @close="editDialogClosed">
        <el-form ref="editUserForm" :model="editUserForm" label-width="80px" :rules="editUserRules">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editUserForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="editUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editUserDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmEditUser">确 定</el-button>
        </span>
      </el-dialog>

      <!--      分配权限-->
      <el-dialog title="分配权限" :visible.sync="allotAuthDialogVisible" width="50%" :close-on-click-modal="false"
                 @close="allotAuthClosed">
        <div>
          <p>当前用户: {{ currentAllotAuthUser.username }}</p>
          <p>当前角色: {{ currentAllotAuthUser.role_name }}</p>
          <p>选择角色:
            <el-select v-model="selectedRole" size="mini" placeholder="请选择角色">
              <el-option
                v-for="item in optionRoles"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>

        <span slot="footer" class="dialog-footer">
          <el-button @click="allotAuthDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmAllotAuth">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getUsers()
  },
  data() {
    var validateEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return callback()
      }

      return callback(new Error('请输入合法的邮箱'))
    }

    var validatePhone = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }

      return callback(new Error('请输入合法的手机号'))
    }

    return {
      userQuery: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      totalpage: 0,
      addUserDialogVisible: false,
      addUserForm: {
        username: '',
        password: '',
        mobile: '',
        email: ''
      },
      addUserRules: {
        // 验证用户名是否合法
        username: [
          {
            required: true,
            message: '请输入用户名称',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        // 验证密码是否合法
        password: [
          {
            required: true,
            message: '请输入登录密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: validateEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: validatePhone,
            trigger: 'blur'
          }
        ]
      },
      editUserDialogVisible: false,
      editUserForm: {},
      editUserRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: validateEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: validatePhone,
            trigger: 'blur'
          }
        ]
      },
      // 分配权限对话框
      allotAuthDialogVisible: false,
      currentAllotAuthUser: {},
      // 选择的角色信息
      selectedRole: '',
      optionRoles: {}
    }
  },
  methods: {
    backHome() {
    },
    async getUsers() {
      var { data: res } = await this.$http.get('users', {
        params: this.userQuery
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }

      const totalTemp = this.userQuery.pagenum * this.userQuery.pagesize
      if (totalTemp > res.data.total && ((totalTemp - res.data.total) / this.userQuery.pagesize) === 1) {
        // 处理如下两种情况: 自己删除或其它管理员删除用户时，页数改变了
        this.userQuery.pagenum = this.userQuery.pagenum === 1 ? 1 : (this.userQuery.pagenum - 1)
        this.getUsers()
      } else {
        this.userList = res.data.users
        this.totalpage = res.data.total
      }
    },
    // 页大小发生变化
    handleSizeChange(newPageSize) {
      this.userQuery.pagesize = newPageSize
      this.getUsers()
    },
    // 当前页发生改变
    handleCurrentChange(newPageNum) {
      this.userQuery.pagenum = newPageNum
      this.getUsers()
    },
    // 用户状态修改
    async userStateChanged(row) {
      var { data: res } = await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
      if (res.meta.status !== 200) {
        this.$message.error('更新用户状态失败！')
        return
      }

      this.$message.success('更新用户状态成功！')
    },
    // 添加用户按钮
    addUser() {
      this.addUserDialogVisible = true
    },
    // 关闭添加用户对话框
    addDialogClosed() {
      this.$refs.addUserForm.resetFields()
    },
    // 确定添加用户
    confirmAddUser() {
      this.$refs.addUserForm.validate(async valid => {
        if (!valid) return

        const { data: res } = await this.$http.post('users', this.addUserForm)
        console.log(res)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户异常!')
          return
        }
        this.addUserDialogVisible = false
        this.$refs.addUserForm.resetFields()
        this.getUsers()
      })
    },
    // 点击编辑用户
    clickEditUser(userInfo) {
      this.editUserForm = userInfo
      this.editUserDialogVisible = true
    },
    // 关闭编辑用户对话框
    editDialogClosed() {
      this.$refs.editUserForm.resetFields()
    },
    // 确定修改用户
    confirmEditUser() {
      this.$refs.editUserForm.validate(async valid => {
        if (!valid) {
          return
        }

        var { data: res } = await this.$http.put(`users/${this.editUserForm.id}`, {
          id: this.editUserForm.id,
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile
        })
        if (res.meta.status !== 200) {
          this.$message.error('修改用户失败')
          return
        }

        this.$refs.editUserForm.resetFields()
        this.editUserDialogVisible = false
        this.getUsers()
        this.$message.success('修改用户成功')
      })
    },
    // 删除用户
    async clickDelUser(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return
      }

      const { data: res } = await this.$http.delete(`users/${id}`, { id: id })
      if (res.meta.status !== 200) {
        this.$message.error('删除用户失败')
        return
      }
      this.getUsers()
      this.$message.success('删除用户成功')
    },
    // 分配角色
    async showAllotAuthDialog(user) {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.optionRoles = res.data
      this.currentAllotAuthUser = user
      this.allotAuthDialogVisible = true
    },
    // 分配角色dialog关闭
    allotAuthClosed() {
      this.selectedRole = ''
      this.allotAuthDialogVisible = false
    },
    // 确认分配角色
    async confirmAllotAuth() {
      if (!this.selectedRole) {
        return this.$message.info('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.currentAllotAuthUser.id}/role`, {
        id: this.currentAllotAuthUser.id,
        rid: this.selectedRole
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }

      this.getUsers()
      this.allotAuthDialogVisible = false
      return this.$message.success('分配角色成功')
    }
  }
}
</script>

<style lang="less" scoped>
.el-form {
  margin-right: 40px !important;
}

.el-card {
  margin-bottom: 60px;
}
</style>


