<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/heima.png" alt>
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-box" @click="toggleCollapse">
          |||
        </div>
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" :unique-opened="true"
          :collapse="isCollapse" :collapse-transition="false" :router="true">
          <!-- :index接收一个字符串，而item.id是一个数字，因此要转为字符串 -->
          <el-submenu :index="'/' + item.path" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconList[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item :index="'/' + child.path" v-for="child in item.children" :key="child.id">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{child.authName}}</span>
                </template>
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data(){
    return {
      menuList: [],
      iconList: {
        125 : 'iconfont icon-user',
        103 : 'iconfont icon-tijikongjian',
        101 : 'iconfont icon-shangpin',
        102 : 'iconfont icon-danju',
        145 : 'iconfont icon-baobiao'
      },
      isCollapse: false
    }
  },
  created(){
    this.getMenus()
  },
  methods: {
    logout() {
      window.sessionStorage.removeItem('token')
      this.$router.push('/login')
    },
    async getMenus(){
      const {data: res} = await this.$http.get('menus')
      if(res.meta.status !== 200){
        this.$message.error(res.meta.msg)
        return
      }
      this.menuList = res.data
    },
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  color: white;
  padding-left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;

  > div {
    display: flex;
    align-items: center;
    > span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;

  .iconfont{
    margin-right: 10px;
  }
  
  .toggle-box{
    color: white;
    letter-spacing: 0.2;
    background-color: #4a5064;
    font-size: 10px;
    line-height: 25px;
    text-align: center;
    cursor: pointer;
  }

  // el-menu有一个右边框线，导致UI效果不好，去掉
  .el-menu{
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
</style>


