<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-table border stripe style="width: 100%" :data="auths">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getAllAuths()
  },
  data() {
    return {
      auths: []
    }
  },
  methods: {
    async getAllAuths() {
      const { data: res } = await this.$http.get('rights/list', { type: 'list' })
      if (res.meta.status !== 200) {
        this.$message.error('获取权限列表失败')
        return
      }
      this.auths = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-bottom: 60px;
}
</style>
