<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
  #app{
    /* 去掉app页面滚动条，只保留主内容区自身的滚动条 */
    overflow: hidden;
  }
</style>
